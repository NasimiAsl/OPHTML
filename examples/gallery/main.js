import OPHTML from '../../dyHTML/ophtml.js';
import { samples } from './samples.js';

const _dy = OPHTML.html;
_dy.root = new URL('./components/', import.meta.url).pathname;

// Palette and utility classes are both installed through OPHTML's style API.
_dy.style.live('gallery-palette', `
  :root{--canvas:#f7f8f5;--surface:#fff;--preview:#fbfcfa;--code:#f2f5f0;--ink:#202b29;--muted:#708079;--line:#e2e8e1;--accent:#28765a;--soft:#eaf3eb;--focus:#559c7e;--danger:#b74444;color-scheme:light}
  :root[data-theme="dark"]{--canvas:#111a18;--surface:#192421;--preview:#15201d;--code:#111b17;--ink:#e5eee7;--muted:#9eafa6;--line:#2e3d35;--accent:#79c9a0;--soft:#233c30;--focus:#8fd8b4;--danger:#ffaaaa;color-scheme:dark}
`);
_dy.style.use({
  colors: { brand: 'var(--accent)', surface: 'var(--surface)', ink: 'var(--ink)', muted: 'var(--muted)', soft: 'var(--soft)' },
  sizes: { compact: '10px' }, textSizes: { tiny: '11px' }, radius: { tile: '9px' }
});

const themeButton = document.querySelector('#theme-toggle');
let theme;
try { theme = localStorage.getItem('ophtml-gallery-theme'); } catch { /* Storage may be unavailable. */ }
function setTheme(next) {
  document.documentElement.dataset.theme = next;
  themeButton.setAttribute('aria-label', 'Switch to ' + (next === 'dark' ? 'light' : 'dark') + ' mode');
  themeButton.querySelector('span').textContent = next === 'dark' ? 'Light mode' : 'Dark mode';
  try { localStorage.setItem('ophtml-gallery-theme', next); } catch { /* Keep the active session theme. */ }
}
setTheme(theme === 'light' || theme === 'dark' ? theme : matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
themeButton.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

const gallery = document.querySelector('#gallery');
const contexts = new Map();
let noticeTimer;
function notify(message) {
  const notice = document.querySelector('#notice');
  clearTimeout(noticeTimer); notice.textContent = message; notice.hidden = false;
  noticeTimer = setTimeout(() => { notice.hidden = true; }, 2000);
}
const getSource = async name => {
  const response = await fetch(new URL('./components/' + name + '.htm', import.meta.url));
  if (!response.ok) throw new Error('Could not load source: ' + name);
  return response.text();
};

gallery.innerHTML = await _dy.render('gallery', {
  samples: samples.map((sample, index) => ({ sampleId: sample.id, sampleTitle: sample.title, sampleCategory: sample.category,
    sampleDescription: sample.description, ordinal: String(index + 1).padStart(2, '0') }))
});
// The gallery shell is itself a repeater. Wait for its image hook before mounting demos.
await new Promise(resolve => {
  const ready = () => gallery.querySelectorAll('[data-sample]').length === samples.length;
  if (ready()) return resolve();
  const observer = new MutationObserver(() => { if (ready()) { observer.disconnect(); resolve(); } });
  observer.observe(gallery, { childList: true, subtree: true });
});

await Promise.all(samples.map(async sample => {
  const card = gallery.querySelector(`[data-sample="${sample.id}"]`);
  const preview = card.querySelector('[data-preview]');
  const data = structuredClone(sample.data);
  let version = 0;
  const context = {
    data, root: preview, notify, setTheme,
    async render() {
      const current = ++version;
      const html = await _dy.render(sample.id, data);
      if (current === version) preview.innerHTML = html;
    }
  };
  contexts.set(sample.id, context);
  try {
    const [template] = await Promise.all([getSource(sample.id), context.render()]);
    const dependencies = await Promise.all((sample.dependencies || []).map(async name =>
      `<!-- components/${name}.htm -->\n${await getSource(name)}`));
    const events = Object.entries(sample.events || {}).map(([event, handler]) => `${event}: ${handler.toString()}`).join('\n\n');
    card.sources = {
      template: `<!-- components/${sample.id}.htm -->\n${template}` + (dependencies.length ? '\n\n' + dependencies.join('\n\n') : ''),
      data: `await _dy.render('${sample.id}', ${JSON.stringify(sample.data, null, 2)});`,
      behavior: events || '// No extra JavaScript is needed for this sample.'
    };
    card.querySelector('[data-code]').textContent = card.sources.template;
    card.dataset.ready = 'true';
  } catch (error) {
    preview.textContent = error.message; preview.classList.add('sample-error'); card.dataset.ready = 'error';
  }
}));
gallery.setAttribute('aria-busy', 'false');
gallery.dataset.ready = 'true';

let category = 'All';
function filter() {
  const query = document.querySelector('#search').value.trim().toLowerCase();
  let count = 0;
  for (const sample of samples) {
    const visible = (category === 'All' || category === sample.category) &&
      [sample.title, sample.description, sample.id, sample.category].join(' ').toLowerCase().includes(query);
    gallery.querySelector(`[data-sample="${sample.id}"]`).hidden = !visible;
    if (visible) count++;
  }
  document.querySelector('#result-count').textContent = `${count} of ${samples.length} examples`;
  document.querySelector('#no-results').hidden = count !== 0;
}
document.querySelector('#search').addEventListener('input', filter);
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
  category = button.dataset.category;
  document.querySelectorAll('[data-category]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  filter();
}));
filter();

for (const type of ['click', 'input', 'change', 'submit', 'pointermove', 'keydown']) {
  gallery.addEventListener(type, async event => {
    const card = event.target.closest('[data-sample]');
    if (!card) return;
    if (event.target.closest('.source-panel')) {
      if (type !== 'click') return;
      const tab = event.target.closest('[data-source-tab]');
      if (tab) {
        card.dataset.sourceTab = tab.dataset.sourceTab;
        card.querySelector('[data-code]').textContent = card.sources[tab.dataset.sourceTab];
        card.querySelectorAll('[data-source-tab]').forEach(button => button.setAttribute('aria-pressed', String(button === tab)));
      }
      if (event.target.closest('.copy-source')) {
        try { await navigator.clipboard.writeText(card.sources[card.dataset.sourceTab || 'template']); notify('Source copied'); }
        catch { notify('Select the source text to copy it.'); }
      }
      return;
    }
    const sample = samples.find(item => item.id === card.dataset.sample);
    const handler = sample.events?.[type];
    if (handler) {
      try { await handler(contexts.get(sample.id), event); }
      catch (error) { notify(error.message); }
    }
  });
}
