import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir, platform, arch, cpus } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

// Browser applications use the original production files, without a build step.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.OPHTML_PLAYWRIGHT_MODULE || 'playwright');
const vendorDir = process.env.BENCH_VENDOR_DIR || join(tmpdir(), 'ophtml-benchmark-vendor');
const output = process.env.BENCH_OUTPUT || join(tmpdir(), 'ophtml-benchmark-results.json');
const rounds = Number(process.env.BENCH_ROUNDS || 25);
const warmups = Number(process.env.BENCH_WARMUPS ?? 3);
const grid = process.env.BENCH_SCENARIO === 'grid';
const bulk = process.env.BENCH_SCENARIO === 'bulk';
const vendors = grid ? {} : {
  'vue.js': 'https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.prod.js',
  'alpine.js': 'https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js',
  'react.js': 'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js',
  'react-dom.js': 'https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js',
};
await mkdir(vendorDir, { recursive: true });
const files = {};
for (const [name, url] of Object.entries(vendors)) {
  try { files['/' + name] = await readFile(join(vendorDir, name)); }
  catch {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    files['/' + name] = Buffer.from(await response.arrayBuffer());
    await writeFile(join(vendorDir, name), files['/' + name]);
  }
}
files['/ophtml.js'] = await readFile(new URL('../dyHTML/ophtml.js', import.meta.url));
if (process.env.BENCH_BASELINE) files['/baseline.js'] = await readFile(process.env.BENCH_BASELINE);
const template = grid || bulk
  ? '<section><repeater params="$$rows"><div data-row="$$id">' + Array.from({ length: 10 }, (_, i) => `<span>$$c${i}</span>`).join('') + '</div></repeater></section>'
  : '<section><repeater params="$$rows"><div data-row="$$id"><span>$$label</span><button>select</button></div></repeater></section>';
files['/components/rows.htm'] = Buffer.from(template);
files['/bench.js'] = await readFile(new URL(bulk ? './bulk-browser.js' : grid ? './grid-browser.js' : './browser.js', import.meta.url));
if (bulk) files['/bulk-data.js'] = await readFile(new URL('./bulk-data.js', import.meta.url));
if (bulk && process.env.BENCH_FIXTURE) {
  await import('./bulk-data.js');
  const fixture = globalThis.makeBulkFixture();
  const html = fixture.serialize(fixture.rows);
  if (Buffer.byteLength(html) !== fixture.targetBytes) throw new Error('Invalid bulk fixture size');
  await writeFile(process.env.BENCH_FIXTURE, html);
}
const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  res.setHeader('Cache-Control', 'no-store');
  if (path === '/') {
    res.setHeader('Content-Type', 'text/html');
    const css = grid || bulk ? '[data-row]{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));height:24px}[data-row]>span{border:1px solid #ddd;padding:2px;overflow:hidden;white-space:nowrap}' : '[data-row]{display:flex;gap:8px;height:24px}button{font:inherit}';
    res.end('<!doctype html><meta charset="utf-8"><style>' + css + '</style><main id="app"></main>' + (bulk ? '<script src="/bulk-data.js"></script>' : '') + '<script src="/bench.js"></script>');
  } else if (files[path]) {
    res.setHeader('Content-Type', path.endsWith('.js') ? 'text/javascript' : 'text/html');
    res.end(files[path]);
  } else { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.OPHTML_BROWSER_PATH ? { executablePath: process.env.OPHTML_BROWSER_PATH } : {}) });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const opNames = ['ophtml-rerender', 'ophtml-dom', 'ophtml-legacy-rerender', 'ophtml-legacy-dom'];
  if (process.env.BENCH_BASELINE) opNames.push('ophtml-baseline-rerender', 'ophtml-baseline-dom');
  const available = grid ? ['vanilla', ...opNames] : ['vanilla', ...opNames, 'vue', 'alpine', 'react'];
  const names = process.env.BENCH_NAMES ? process.env.BENCH_NAMES.split(',') : available;
  if (!names.length || names.some(name => !available.includes(name))) throw new Error('Unknown BENCH_NAMES implementation');
  const samples = Object.fromEntries(names.map(name => [name, []]));
  const origin = `http://127.0.0.1:${server.address().port}`;
  // Rotate execution order to reduce bias from heat, background activity, and JIT caches.
  for (let round = -warmups; round < rounds; round++) {
    const offset = (round + warmups) % names.length;
    for (const name of [...names.slice(offset), ...names.slice(0, offset)]) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(origin);
      let profiler;
      if (process.env.BENCH_PROFILE && round === -warmups && name === 'ophtml-rerender') {
        profiler = await context.newCDPSession(page);
        await profiler.send('Profiler.enable');
        await profiler.send('Profiler.setSamplingInterval', { interval: 100 });
        await profiler.send('Profiler.start');
      }
      const result = await page.evaluate(name => window.runBenchmark(name), name);
      if (profiler) {
        const { profile } = await profiler.send('Profiler.stop');
        await writeFile(process.env.BENCH_PROFILE, JSON.stringify(profile));
        await profiler.detach();
      }
      if (errors.length) throw new Error(`${name}: ${errors.join('; ')}`);
      if (round >= 0) samples[name].push(result);
      await page.close();
    }
    console.log(`${round < 0 ? 'warmup' : 'sample'} ${round + 1}/${rounds}`);
  }
  const percentile = (xs, p) => [...xs].sort((a, b) => a - b)[Math.ceil(xs.length * p) - 1];
  const summary = Object.fromEntries(names.map(name => [name, Object.fromEntries(Object.keys(samples[name][0]).map(metric => {
    const values = samples[name].map(sample => sample[metric]);
    return [metric, { median: percentile(values, .5), p95: percentile(values, .95) }];
  }))]));
  const report = {
    timestamp: new Date().toISOString(), browser: await browser.version(), platform: platform(), arch: arch(), cpu: cpus()[0]?.model,
    rounds, warmups, scenario: bulk ? 'bulk' : grid ? 'grid' : 'list', rows: bulk ? 10000 : grid ? 200 : 1000,
    ...(bulk ? { columns: 10, cells: 100000, htmlBytes: 4194304, changedCells: 100000 } : grid ? { columns: 10, changedCells: 100 } : { changedRows: 100 }),
    versions: { ophtml: JSON.parse(await readFile(new URL('../package.json', import.meta.url))).version, vue: '3.5.13', alpine: '3.14.8', react: '18.3.1' },
    assets: Object.fromEntries(Object.entries(files).filter(([name]) => name.endsWith('.js')).map(([name, data]) => [name, { bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') }])),
    summary, samples,
  };
  await writeFile(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ output, summary }, null, 2));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
