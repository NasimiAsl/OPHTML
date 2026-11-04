window.runBenchmark = async function (name) {
  const host = document.querySelector('#app');
  const { rows: initial, serialize, targetBytes, rowCount } = makeBulkFixture();
  const replacement = makeBulkFixture('S').rows;
  if (new TextEncoder().encode(serialize(initial)).length !== targetBytes) throw new Error('Fixture must be exactly 4 MiB');
  const load = src => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src; script.onload = resolve; script.onerror = reject;
    document.head.append(script);
  });
  const complete = rows => new Promise((resolve, reject) => {
    const valid = () => {
      const nodes = host.firstElementChild?.querySelectorAll(':scope > [data-row]');
      return nodes?.length === rows.length && (!rows.length || nodes[nodes.length - 1].lastElementChild?.textContent === rows[rows.length - 1].c9);
    };
    if (valid()) return resolve();
    const timer = setTimeout(() => { observer.disconnect(); reject(new Error(`${name}: bulk DOM timeout`)); }, 120000);
    const observer = new MutationObserver(() => {
      if (valid()) { observer.disconnect(); clearTimeout(timer); resolve(); }
    });
    observer.observe(host, { subtree: true, childList: true, characterData: true });
  });
  function validate(rows) {
    const nodes = host.firstElementChild.querySelectorAll(':scope > [data-row]');
    if (nodes.length !== rows.length) throw new Error('Wrong bulk row count');
    rows.forEach((row, i) => {
      const cells = nodes[i].children;
      if (nodes[i].dataset.row !== row.id || cells.length !== 10) throw new Error('Wrong row identity/columns');
      for (let c = 0; c < 10; c++) if (cells[c].textContent !== row[`c${c}`]) throw new Error('Wrong cell value');
    });
  }
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
    Vue.createApp({ setup: () => state, template: '<section><div v-for="row in rows" :key="row.id" :data-row="row.id">' + Array.from({ length: 10 }, (_, c) => `<span>{{row.c${c}}}</span>`).join('') + '</div></section>' }).mount(host);
    setRows = async rows => { state.rows = rows; await Vue.nextTick(); };
  } else if (name === 'alpine') {
    document.addEventListener('alpine:init', () => Alpine.data('bench', () => ({ rows: [] })), { once: true });
    host.innerHTML = '<section x-data="bench"><template x-for="row in rows" :key="row.id"><div :data-row="row.id">' + Array.from({ length: 10 }, (_, c) => `<span x-text="row.c${c}"></span>`).join('') + '</div></template></section>';
    const initialized = new Promise(resolve => document.addEventListener('alpine:initialized', resolve, { once: true }));
    await load('/alpine.js'); await initialized;
    const state = Alpine.$data(host.firstElementChild);
    setRows = async rows => { state.rows = rows; };
  } else if (name === 'react') {
    await load('/react.js'); await load('/react-dom.js');
    const root = ReactDOM.createRoot(host);
    setRows = async rows => root.render(React.createElement('section', null, rows.map(row => React.createElement('div', { key: row.id, 'data-row': row.id }, ...Array.from({ length: 10 }, (_, c) => React.createElement('span', { key: c }, row[`c${c}`]))))));
  } else {
    setRows = async rows => { host.innerHTML = serialize(rows); };
  }
  await setRows(initial); await complete(initial); void host.offsetHeight;
  const startup = performance.now() - start;
  validate(initial);
  async function measure(rows) {
    const t = performance.now();
    await setRows(rows); await complete(rows); void host.offsetHeight;
    const duration = performance.now() - t;
    validate(rows); // Exhaustive checks are outside the timer for this large workload.
    return duration;
  }
  await measure([]);
  const create = await measure(initial);
  const updateAll = await measure(replacement);
  const clear = await measure([]);
  return { startup, create, updateAll, clear };
};
