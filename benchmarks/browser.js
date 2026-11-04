window.runBenchmark = async function (name) {
  const host = document.querySelector('#app');
  const makeRows = (count, suffix = '') => Array.from({ length: count }, (_, id) => ({ id, label: `Row ${id}${suffix}` }));
  const load = src => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src; script.onload = resolve; script.onerror = reject;
    document.head.append(script);
  });
  // Observe actual inserted DOM: OPHTML render() resolves before repeater hooks.
  const complete = rows => new Promise((resolve, reject) => {
    const valid = () => {
      const nodes = host.querySelectorAll('[data-row]');
      return nodes.length === rows.length && rows.every((row, i) => nodes[i].dataset.row === String(row.id) && nodes[i].querySelector('span').textContent === row.label);
    };
    if (valid()) return resolve();
    const timer = setTimeout(() => { observer.disconnect(); reject(new Error(`${name}: DOM mismatch`)); }, 10000);
    const observer = new MutationObserver(() => {
      if (valid()) { observer.disconnect(); clearTimeout(timer); resolve(); }
    });
    observer.observe(host, { subtree: true, childList: true, characterData: true, attributes: true });
  });
  let setRows;
  const start = performance.now();
  if (name.startsWith('ophtml')) {
    const { default: OPHTML } = await import(name.includes('baseline') ? '/baseline.js' : '/ophtml.js');
    OPHTML.html.hookMode = name.includes('legacy') ? 'legacy' : 'elements';
    OPHTML.html.root = '/components/';
    setRows = async rows => { host.innerHTML = await OPHTML.html.render('rows', { rows }); };
  } else if (name === 'vue') {
    await load('/vue.js');
    const state = Vue.reactive({ rows: [] });
    Vue.createApp({ setup: () => state, template: '<section><div v-for="row in rows" :key="row.id" :data-row="row.id"><span>{{row.label}}</span><button>select</button></div></section>' }).mount(host);
    setRows = async rows => { state.rows = rows; await Vue.nextTick(); };
  } else if (name === 'alpine') {
    // Script auto-start occurs after load. Register data synchronously via alpine:init.
    document.addEventListener('alpine:init', () => Alpine.data('bench', () => ({ rows: [] })), { once: true });
    host.innerHTML = '<section x-data="bench"><template x-for="row in rows" :key="row.id"><div :data-row="row.id"><span x-text="row.label"></span><button>select</button></div></template></section>';
    const initialized = new Promise(resolve => document.addEventListener('alpine:initialized', resolve, { once: true }));
    await load('/alpine.js'); await initialized;
    const state = Alpine.$data(host.firstElementChild);
    setRows = async rows => { state.rows = rows; };
  } else if (name === 'react') {
    await load('/react.js'); await load('/react-dom.js');
    const root = ReactDOM.createRoot(host);
    setRows = async rows => {
      root.render(React.createElement('section', null, rows.map(row => React.createElement('div', { key: row.id, 'data-row': row.id }, React.createElement('span', null, row.label), React.createElement('button', null, 'select')))));
    };
  } else {
    setRows = async rows => { host.innerHTML = '<section>' + rows.map(row => `<div data-row="${row.id}"><span>${row.label}</span><button>select</button></div>`).join('') + '</section>'; };
  }
  async function measure(action, expected) {
    const t = performance.now();
    await action();
    await complete(expected);
    // Include style/layout; paint/compositing and human-perceived latency are excluded.
    void host.offsetHeight;
    return performance.now() - t;
  }
  const initial = makeRows(1000);
  await setRows(initial); await complete(initial); void host.offsetHeight;
  const startup = performance.now() - start;
  await setRows([]); await complete([]); void host.offsetHeight;
  const create = await measure(() => setRows(initial), initial);
  const changed = initial.map(row => row.id % 10 === 0 ? { ...row, label: row.label + ' updated' } : row);
  const update = await measure(() => {
    if (name === 'vanilla' || name.endsWith('-dom')) {
      const nodes = host.querySelectorAll('[data-row] span');
      for (let i = 0; i < changed.length; i += 10) nodes[i].textContent = changed[i].label;
    } else return setRows(changed);
  }, changed);
  const replacement = makeRows(1000, ' replaced').map(row => ({ ...row, id: row.id + 1000 }));
  const replace = await measure(() => setRows(replacement), replacement);
  const clear = await measure(() => setRows([]), []);
  return { startup, create, update, replace, clear };
};
