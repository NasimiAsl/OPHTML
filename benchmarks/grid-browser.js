window.runBenchmark = async function (name) {
  const host = document.querySelector('#app');
  const makeRows = (suffix = '', offset = 0) => Array.from({ length: 200 }, (_, index) => {
    const id = index + offset;
    return Object.assign({ id }, Object.fromEntries(Array.from({ length: 10 }, (_, c) => [`c${c}`, `R${id} C${c}${suffix}`])));
  });
  const complete = rows => new Promise((resolve, reject) => {
    const valid = () => {
      const nodes = host.querySelectorAll('[data-row]');
      return nodes.length === rows.length && rows.every((row, i) => {
        const cells = nodes[i].children;
        return nodes[i].dataset.row === String(row.id) && cells.length === 10 && Array.from(cells).every((cell, c) => cell.textContent === row[`c${c}`]);
      });
    };
    if (valid()) return resolve();
    const timer = setTimeout(() => { observer.disconnect(); reject(new Error(`${name}: grid DOM mismatch`)); }, 10000);
    const observer = new MutationObserver(() => {
      if (valid()) { observer.disconnect(); clearTimeout(timer); resolve(); }
    });
    observer.observe(host, { subtree: true, childList: true, characterData: true });
  });
  let setRows;
  const start = performance.now();
  if (name.startsWith('ophtml')) {
    const { default: OPHTML } = await import(name.includes('baseline') ? '/baseline.js' : '/ophtml.js');
    OPHTML.html.hookMode = name.includes('legacy') ? 'legacy' : 'elements';
    OPHTML.html.root = '/components/';
    setRows = async (rows, noCache = false) => {
      host.innerHTML = await OPHTML.html.render('rows', { rows, noCache });
    };
  } else {
    setRows = async rows => {
      host.innerHTML = '<section>' + rows.map(row => `<div data-row="${row.id}">` + Array.from({ length: 10 }, (_, c) => `<span>${row[`c${c}`]}</span>`).join('') + '</div>').join('') + '</section>';
    };
  }
  async function measure(action, expected) {
    const t = performance.now();
    await action(); await complete(expected); void host.offsetHeight;
    return performance.now() - t;
  }
  const initial = makeRows();
  await setRows(initial); await complete(initial); void host.offsetHeight;
  const startup = performance.now() - start;
  await setRows([]); await complete([]); void host.offsetHeight;
  const create = await measure(() => setRows(initial), initial);
  const changed = initial.map((row, i) => i % 2 === 0 ? { ...row, c0: row.c0 + ' updated' } : row);
  const update = await measure(() => {
    if (name.endsWith('-rerender')) return setRows(changed);
    const nodes = host.querySelectorAll('[data-row]');
    for (let i = 0; i < changed.length; i += 2) nodes[i].firstElementChild.textContent = changed[i].c0;
  }, changed);
  const replacement = makeRows(' replaced', 200);
  const replace = await measure(() => setRows(replacement), replacement);
  const clear = await measure(() => setRows([]), []);
  // Library remains loaded, but OPHTML must fetch the component again.
  const uncachedCreate = await measure(() => setRows(initial, true), initial);
  return { startup, create, update, replace, clear, uncachedCreate };
};
