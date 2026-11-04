import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { after, before, beforeEach, test } from 'node:test';

// npm install --no-save playwright; npx playwright install chromium
// Or point OPHTML_PLAYWRIGHT_MODULE at an existing Playwright package.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.OPHTML_PLAYWRIGHT_MODULE || 'playwright');
const source = await readFile(new URL('../dyHTML/ophtml.js', import.meta.url), 'utf8');
const legacy = await readFile(new URL('../dyHTML/dyhtmlv2.0.01.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('../dyHTML/dystyle.js', import.meta.url), 'utf8');
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
const readmeHtml = [...readme.matchAll(/```html\n([\s\S]*?)```/g)].map(match => match[1]);
const templateDocs = await readFile(new URL('../docs/templates.md', import.meta.url), 'utf8');
const documentedCounter = /```html\n(<script>[\s\S]*?Clicks: 0<\/button>)\n```/.exec(templateDocs)?.[1];
const fixtures = {
  '/templates/simple.htm': '<h1>$$heading</h1><p>$$headingLong</p>',
  '/templates/group/card.htm': '<p>$$name</p>',
  '/dyhtml/components/default.htm': '<p>default</p>',
  '/templates/header.htm': `<script>
    await Promise.resolve(); item.title = 'From header';
    </script>/// header
    #is value "$$title" == "From header" #then<h1>$$title</h1>#else WRONG #end`,
  '/templates/tasks.htm': `<h1>$$heading</h1><section><repeater params="$$tasks">
    <p data-key="$$repeaterKey">$$label:
    #_is value $$done #_then done #_else pending #_end
    <button onclick="window.selected = $$repeaterItem">Inspect</button></p>
    </repeater></section>`,
  '/templates/lifecycle.htm': `<script>
    await new Promise(resolve => setTimeout(resolve, 5));
    $$_initCount = ($$_initCount || 0) + 1;
    </script>/// main content
    <section><dy "{name:'Ada'}"><b>$$name</b></dy></section>
    /// background script<script>
    window.backgroundCount = (window.backgroundCount || 0) + 1;
    $$_hasController = !!$$_ctrl;
    </script>`,
  '/templates/dynamic.htm': `<section><content params="{name:'Ada'}" oncreate="content += '<b>$$name</b>';">Hello </content></section>`,
  '/templates/element.htm': `<section><dyc "{name:'Ada'}" oncreate="content += '<b>$$name</b>';">Hello </dyc></section>`,
  '/templates/switch.htm': `<section><switcher><b>First</b>$$next-case<b>Second</b></switcher></section>`,
  '/templates/loader.htm': `<script>
    $$_model = {page:'group.card', path:'/templates/', profile:{name:'Ada'}};
    </script>/// main content
    <section><loader page="$$_model.page" path="$$_model.path" params="$$_model.profile"></loader></section>`,
  '/templates/error.htm': '#is value ( #then invalid #end',
  '/templates/documented-counter.htm': documentedCounter,
};
let server, browser, page, origin;
const requests = [];

before(async () => {
  server = createServer(async (req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    requests.push(req.url);
    if (path === '/ophtml.js' || path === '/dyHTML/ophtml.js' || path === '/docs-quickstart/dyHTML/ophtml.js' || path === '/legacy.js' || path === '/dystyle.js') {
      res.setHeader('Content-Type', 'text/javascript');
      res.end(path.endsWith('/ophtml.js') ? source : path === '/legacy.js' ? legacy : styles);
    } else if (path === '/docs-quickstart/') {
      res.setHeader('Content-Type', 'text/html');
      res.end(readmeHtml.find(html => html.startsWith('<!doctype html>')));
    } else if (path === '/docs-quickstart/components/welcome.htm') {
      res.end(readmeHtml[0]);
    } else if (path.startsWith('/examples/store/') || path.startsWith('/examples/gallery/')) {
      try {
        const file = path.endsWith('/') ? path + 'index.html' : path;
        const body = await readFile(new URL('..' + file, import.meta.url));
        res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
        res.end(body);
      } catch { res.writeHead(404); res.end('missing'); }
    } else if (path === '/') {
      res.setHeader('Content-Type', 'text/html');
      res.end('<!doctype html><div id="app"></div>');
    } else if (path === '/created') {
      res.writeHead(201); res.end('created');
    } else if (path === '/disconnect') {
      req.socket.destroy();
    } else if (path === '/scripts/simple.js') {
      res.end('window.scriptLoads = (window.scriptLoads || 0) + 1;');
    } else if (path === '/echo') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => res.end(JSON.stringify({
        method: req.method, type: req.headers['content-type'],
        content: req.headers.content, body: Buffer.concat(chunks).toString(),
      })));
    } else if (path in fixtures) {
      res.end(fixtures[path]);
    } else { res.writeHead(404); res.end('missing'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({
    headless: true,
    timeout: 15000,
    ...(process.env.OPHTML_BROWSER_PATH ? { executablePath: process.env.OPHTML_BROWSER_PATH } : {}),
  });
});
beforeEach(async () => {
  if (page) await page.close();
  page = await browser.newPage();
  page.setDefaultTimeout(10000);
  await page.goto(origin);
  await page.evaluate(async () => { window.library = await import('/ophtml.js'); _dy.root = '/templates/'; });
});
after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

test('exports and legacy globals keep the same engine', async () => {
  assert.deepEqual(await page.evaluate(() => [
    library.default.html === _dy, _ophtml === _dy, library.ophtml === library.dy,
    library.default.html === _dy, library.default.script === _dyScript,
  ]), [true, true, true, true, true]);
});
test('render preserves values, overlapping names, and metadata', async () => {
  const result = await page.evaluate(async () => {
    const value = await _dy.render('/simple', { heading: 'A $& $$headingLong', headingLong: 'B' }, true);
    return { html: value.html, tid: value.data.TID, registered: !!_dy.TsID[value.data.TID] };
  });
  assert.equal(result.html, '<h1>A $& $$headingLong</h1><p>B</p>');
  assert.equal(result.registered, true);
  assert.ok(result.tid > 0);
});
test('root accepts a missing trailing slash and dotted component names', async () => {
  assert.equal(await page.evaluate(async () => {
    _dy.root = '/templates';
    return await _dy.render('group.card', { name: 'Ada' });
  }), '<p>Ada</p>');
});
test('default root and explicit root argument work', async () => {
  assert.deepEqual(await page.evaluate(async () => {
    delete _dy.root;
    return [await _dy.render('default'), (await _dy.loadPage('group.card', null, null, '/templates/', { name: 'Ada' })).html];
  }), ['<p>default</p>', '<p>Ada</p>']);
});
test('cache and both noCache flags preserve request behavior', async () => {
  const begin = requests.length;
  await page.evaluate(async () => {
    await _dy.render('simple', {}); await _dy.render('simple', {});
    await _dy.render('simple', { noCache: true });
    await _dy.render('simple', { noCache: 'true' });
    await _dy.render('simple.htm', {});
  });
  const hits = requests.slice(begin).filter(url => url.startsWith('/templates/simple.htm'));
  assert.equal(hits.length, 3);
  assert.equal(hits.filter(url => url.includes('?')).length, 2);
});
test('missing templates and malformed expressions reject render', async () => {
  const errors = await page.evaluate(async () => {
    const results = await Promise.allSettled([_dy.render('missing'), _dy.render('error')]);
    return results.map(result => [result.status, result.reason.message]);
  });
  assert.equal(errors[0][0], 'rejected'); assert.match(errors[0][1], /HTTP 404/);
  assert.equal(errors[1][0], 'rejected'); assert.match(errors[1][1], /template expression/);
});
test('nested conditions, false branches, optional then and if alias', async () => {
  const output = await page.evaluate(() => {
    const compile = (text, values) => _dy.compileHtmlHashParts(text, values).replace(/\s+/g, ' ').trim();
    return [
      compile('#is define a #then YES #else NO #end', { a: false }),
      compile('#is define a YES #else NO #end', { a: 1 }),
      compile('#is not define a MISSING #else PRESENT #end', {}),
      compile('#is not define a MISSING #else PRESENT #end', { a: null }),
      compile('#is value $$a #then A #if $$b #then B #else C #end #else D #end tail', { a: true, b: false }),
      compile('#is value false #then #dy(noSuchFunction()#) #else OK #end', {}),
    ];
  });
  assert.deepEqual(output, ['NO', 'YES', 'MISSING', 'PRESENT', 'A C tail', 'OK']);
});
test('quoted and unquoted string expressions do not turn data into code', async () => {
  assert.deepEqual(await page.evaluate(() => {
    const value = `O'Reilly "quoted" \\ $$other`;
    window.injected = false;
    return [
      _dy.compileHtmlHashParts('#is value $$name === $$$item.name #then YES #else NO #end', { name: value }).trim(),
      _dy.compileHtmlHashParts('#is value "$$name" === $$name #then YES #else NO #end', { name: value }).trim(),
      _dy.compileHtmlHashParts('#dy($$a * $$b#)', { a: 3, b: 4 }),
      _dy.compileHtmlHashParts('#is value "$$name" == "active" #then YES #else NO #end', { name: '"; window.injected = true; //' }).trim(),
      window.injected,
    ];
  }), ['YES', 'YES', '12', 'NO', false]);
});
test('header output is available to conditions', async () => {
  assert.match(await page.evaluate(() => _dy.render('header')), /<h1>From header<\/h1>/);
});
test('real browser image hooks render repeaters and preserve item references', async () => {
  await page.evaluate(async () => {
    window.tasks = [{ label: 'Read', done: true }, { label: 'Build', done: false }, null];
    document.querySelector('#app').innerHTML = await _dy.render('tasks', { heading: 'Tasks', tasks });
  });
  await page.waitForFunction(() => document.querySelectorAll('#app p').length === 2);
  assert.match(await page.locator('#app p').nth(0).innerText(), /Read:\s+done/);
  assert.match(await page.locator('#app p').nth(1).innerText(), /Build:\s+pending/);
  await page.locator('#app button').nth(1).click();
  assert.equal(await page.evaluate(() => selected === tasks[1]), true);
});
test('loader handles empty arrays as repeaters', async () => {
  assert.equal(await page.evaluate(async () => {
    const container = document.querySelector('#app');
    await _dy.loader(container, [], '<p>$$name</p>');
    return container.innerHTML;
  }), '');
});
test('repeater oncreate receives interpolated content', async () => {
  assert.equal(await page.evaluate(async () => {
    const container = document.querySelector('#app');
    const txt = document.createElement('textarea');
    txt.value = '<p>$$name</p>';
    txt.setAttribute('params', '[{name:"Ada"}]');
    txt.setAttribute('oncreate', 'content = content.replace("Ada", "Grace");');
    await _dy.elementPageRepeat({ parentNode: container, nextElementSibling: txt }, 99);
    return container.innerHTML;
  }), '<p>Grace</p>');
});
test('switchers use first case by default and numeric loader selects another', async () => {
  await page.evaluate(async () => { document.querySelector('#app').innerHTML = await _dy.render('switch'); });
  await page.waitForFunction(() => document.querySelector('#app b')?.textContent === 'First');
  assert.equal(await page.evaluate(async () => {
    const element = document.createElement('div');
    await _dy.loader(element, 1, '<b>First</b>$$next-case<b>Second</b>');
    return element.innerHTML;
  }), '<b>Second</b>');
});
test('dynamic callbacks receive the actual content and are retained', async () => {
  for (const component of ['dynamic', 'element']) {
    await page.evaluate(async name => { document.querySelector('#app').innerHTML = await _dy.render(name); }, component);
    await page.waitForFunction(() => document.querySelector('#app b')?.textContent === 'Ada');
    assert.match(await page.locator('#app').innerText(), /Hello Ada/);
  }
});
test('nested component loader evaluates dotted parameters', async () => {
  await page.evaluate(async () => { document.querySelector('#app').innerHTML = await _dy.render('loader'); });
  await page.waitForFunction(() => document.querySelector('#app p')?.textContent === 'Ada');
});
test('async initialization runs once and background scripts see the controller', async () => {
  await page.evaluate(() => _dy.renderElement(document.querySelector('#app'), 'lifecycle', {}));
  await page.waitForFunction(() => document.querySelector('#app b')?.textContent === 'Ada');
  assert.deepEqual(await page.evaluate(() => {
    const ctrl = document.querySelector('#app > div');
    const parent = _dy.TsID.find(item => item && item.ctrl === ctrl);
    return [parent.initCount, parent.hasController, window.backgroundCount];
  }), [1, true, 1]);
});
test('renderTemplate supports data interpolation and rejects bad scripts', async () => {
  assert.equal(await page.evaluate(() => _dy.renderTemplate('<h1>$$name</h1>', { name: 'Ada' })), '<h1>Ada</h1>');
  assert.equal(await page.evaluate(async () => {
    try { await _dy.renderTemplate('<script>throw new Error("broken")</script>/// main content<div/>', {}); }
    catch (error) { return error.message; }
  }), 'broken');
});
test('expression evaluator preserves URL strings, comments and newlines', async () => {
  assert.deepEqual(await page.evaluate(async () => [
    _dy.js('"https://example.com/ // still text"'),
    _dy.js('function(){ // comment\n return 7; }')(),
    await _dy.asyncjs('Promise.resolve(9)'),
  ]), ['https://example.com/ // still text', 7, 9]);
});
test('helpers support deep addresses, missing elements and component lookup', async () => {
  assert.deepEqual(await page.evaluate(() => {
    const node = document.querySelector('#app');
    node.iden = 123; _dy.TsID[123] = { name: 'found' };
    return [
      _dy.address({ a: 7 }, 'a'), _dy.address({ a: { b: { c: { d: { e: 9 } } } } }, 'a.b.c.d.e'),
      _dy.address({}, 'a.b') === undefined, _dy.element('.missing->value'),
      _dy.getDyElement('#app').name, _dy.rgbToHex(255, 16, 0),
    ];
  }), [7, 9, true, null, 'found', '#ff1000']);
});
test('image uploader accepts input argument and preserves JPEG MIME', async () => {
  assert.deepEqual(await page.evaluate(async () => {
    const input = document.createElement('input'); input.type = 'file';
    document.querySelector('#app').appendChild(input);
    const dt = new DataTransfer(); dt.items.add(new File(['jpeg'], 'test.jpg', { type: 'image/jpeg' }));
    input.files = dt.files;
    const image = document.createElement('img');
    return await new Promise(resolve => {
      _dy.imageUploader = data => resolve([data.file.name, data.blob.type, image.src.startsWith('data:image/jpeg;base64,')]);
      _dy.imageFileUploader(input, null, image);
    });
  }), ['test.jpg', 'image/jpeg', true]);
});
test('network helper accepts HTTP 201', async () => {
  assert.equal(await page.evaluate(() => new Promise((resolve, reject) => {
    _dy.down({ url: '/created', success: resolve, error: reject });
  })), 'created');
});
test('network failure reports error and end exactly once', async () => {
  assert.deepEqual(await page.evaluate(() => new Promise(resolve => {
    let errors = 0, endings = 0;
    _dy.down({ url: '/disconnect', error: () => errors++, end: () => {
      endings++; setTimeout(() => resolve([errors, endings]), 10);
    } });
  })), [1, 1]);
});
test('uploads support JSON false and multipart without external helpers', async () => {
  const results = await page.evaluate(async () => {
    function upload(options) {
      return new Promise((resolve, reject) => _dy.upload({
        url: '/echo', ...options, success: text => resolve(JSON.parse(text)), error: reject,
      }));
    }
    return [await upload({ data: false }), await upload({
      data: { name: 'Ada' }, file: [{ data: new File(['hello'], 'hello.txt', { type: 'text/plain' }) }],
    })];
  });
  assert.equal(results[0].method, 'POST');
  assert.equal(results[0].body, 'false');
  assert.match(results[0].type, /application\/json/);
  assert.match(results[1].type, /multipart\/form-data; boundary=/);
  assert.equal(results[1].content, '{"name":"Ada"}');
  assert.match(results[1].body, /name="file0"; filename="hello.txt"/);
  assert.match(results[1].body, /hello/);
});
test('script loading calls delayed and empty-list callbacks once', async () => {
  assert.deepEqual(await page.evaluate(async () => {
    let empty = 0, delayed = 0;
    _dyScript.load([], () => empty++);
    await new Promise(resolve => {
      _dyScript.add('/scripts/simple.js', () => {
        delayed++; setTimeout(resolve, 15);
      }, {}, false, 5);
    });
    return [empty, delayed, window.scriptLoads];
  }), [1, 1, 1]);
});
test('existing dystyle module remains compatible', async () => {
  assert.equal(await page.evaluate(async () => {
    await import('/dystyle.js');
    _dyStyle.live('test-style', _dyStyle.color({ colors: { brand: '#123456' } }));
    document.querySelector('#app').classList.add('cbrand');
    return getComputedStyle(document.querySelector('#app')).backgroundColor;
  }), 'rgb(18, 52, 86)');
});
test('ophtml takes over legacy globals when the old version was loaded first', async () => {
  await page.goto(origin);
  assert.equal(await page.evaluate(async () => {
    await import('/legacy.js');
    const old = _dy;
    const next = await import('/ophtml.js');
    return _dy !== old && _dy === next.default.html;
  }), true);
});

test('styles are built into the module with legacy and new aliases', async () => {
  assert.deepEqual(await page.evaluate(() => [
    library.style === library.default.style, _dy.style === library.style,
    _dyStyle === _dy.style, _ophtmlStyle === _dy.style,
    document.querySelectorAll('#ophtml-animations').length,
    document.querySelectorAll('#ophtml-visibility').length,
  ]), [true, true, true, true, 1, 1]);
});
test('style use and live update one stylesheet and leave unrelated styles alone', async () => {
  assert.deepEqual(await page.evaluate(() => {
    const external = _dy.style.init('#app{outline-width:3px;outline-style:solid}');
    _dy.style.use({ colors: { brand: '#123456' } });
    document.querySelector('#app').className = 'cbrand';
    const first = getComputedStyle(document.querySelector('#app')).backgroundColor;
    _dy.style.use({ colors: { brand: '#abcdef' } });
    return [first, getComputedStyle(document.querySelector('#app')).backgroundColor,
      document.querySelectorAll('#ophtml-theme').length, external.isConnected,
      _dy.style.nested() === _dy.style.nasted()];
  }), ['rgb(18, 52, 86)', 'rgb(171, 205, 239)', 1, true, true]);
});
test('default style configuration is independent between calls', async () => {
  assert.equal(await page.evaluate(() => {
    const first = _dy.style.default_template(); first.sizes.md = '999px'; first.breakPoints[0] = 1;
    const second = _dy.style.default_template();
    return second.sizes.md === '16px' && second.breakPoints[0] === 420;
  }), true);
});
test('size utilities use real values for important width, spacing and min/max classes', async () => {
  assert.deepEqual(await page.evaluate(() => {
    _dy.style.use({ sizes: { card: '120px', gap: '12.5px' } });
    const app = document.querySelector('#app');
    app.innerHTML = '<div id="box" class="_w-i-card _h-i-gap _ptb-i-gap _plr-i-gap mtb-i-gap mlr-i-gap" style="width:999px"></div>';
    const box = getComputedStyle(document.querySelector('#box'));
    return [box.width, box.height, box.paddingTop, box.paddingBottom,
      box.paddingLeft, box.paddingRight, box.marginTop, box.marginLeft];
  }), ['120px', '12.5px', '12.5px', '12.5px', '12.5px', '12.5px', '12.5px', '12.5px']);
});
test('size classes support CSS expressions, numeric values and escaped token names', async () => {
  assert.deepEqual(await page.evaluate(() => {
    _dy.style.live('sizes', _dy.style.size({ sizes: { '1/2': '50%', expression: 'calc(10px + 2px)', number: 24 } }));
    const app = document.querySelector('#app'); app.style.width = '400px';
    app.innerHTML = '<div id="half" class="_w-1/2"></div><div id="expression" class="_w-expression"></div><div id="number" class="_w-number"></div>';
    return ['half', 'expression', 'number'].map(id => getComputedStyle(document.getElementById(id)).width);
  }), ['200px', '12px', '24px']);
});
test('aspect ratios and negative positions produce valid CSS', async () => {
  assert.deepEqual(await page.evaluate(() => {
    _dy.style.use({ sizes: { gap: '12.5px', offset: 'calc(10px + 2px)' } });
    document.querySelector('#app').innerHTML = '<div id="box" class="absolute l-ngap t-noffset asp-2x3"></div>';
    const style = getComputedStyle(document.querySelector('#box'));
    return [style.left, style.top, style.aspectRatio, _dy.style.size({ sizes: { gap: '10px' } }).includes('nkey')];
  }), ['-12.5px', '-12px', '2 / 3', false]);
});
test('borders retain decimals and use px for numeric values', async () => {
  assert.deepEqual(await page.evaluate(() => {
    const sheet = _dy.style.live('borders', _dy.style.border({ borders: { thin: '0.5px', medium: 2 } })).sheet;
    const rules = [...sheet.cssRules];
    return [rules.find(rule => rule.selectorText === '.ba-thin').style.borderWidth,
      rules.find(rule => rule.selectorText === '.ba-medium').style.borderWidth,
      rules.filter(rule => rule.selectorText === '.ba-00').length];
  }), ['0.5px', '2px', 1]);
});
test('font, radius, opacity, layers and flex utilities work together', async () => {
  assert.deepEqual(await page.evaluate(() => {
    _dy.style.use({ textSizes: { body: 18 }, radius: { card: '12.5px' }, opacity: { half: .5 }, layers: { overlay: 42 } });
    document.querySelector('#app').innerHTML = '<div id="box" class="f f-c f-ac fs-body rad-card op-half ly-overlay"></div>';
    const style = getComputedStyle(document.querySelector('#box'));
    return [style.display, style.flexDirection, style.alignItems, style.fontSize,
      style.borderTopLeftRadius, style.opacity, style.zIndex];
  }), ['flex', 'column', 'center', '18px', '12.5px', '0.5', '42']);
});
test('radius supports legacy custom prefix and descendant selectors', async () => {
  assert.deepEqual(await page.evaluate(() => {
    _dy.style.live('radii', _dy.style.radius({ radius: { sm: 6 } }, 'round', 'span'));
    document.querySelector('#app').innerHTML = '<div class="round-r-sm"><span>Content</span></div>';
    const style = getComputedStyle(document.querySelector('#app span'));
    return [style.borderTopRightRadius, style.borderTopLeftRadius];
  }), ['6px', '0px']);
});
test('color classes preserve hover, focus and important names without duplicate selectors', async () => {
  await page.evaluate(() => {
    _dy.style.live('colors', _dy.style.color({ colors: { brand: '#123456' } }));
    document.querySelector('#app').innerHTML = '<button class="c-t-i-hbrand c-i-fbrand">Button</button>';
  });
  await page.locator('button').hover();
  assert.equal(await page.locator('button').evaluate(element => getComputedStyle(element).color), 'rgb(18, 52, 86)');
  await page.locator('button').focus();
  assert.equal(await page.locator('button').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(18, 52, 86)');
  assert.equal(await page.evaluate(() => [...document.querySelector('#colors').sheet.cssRules]
    .filter(rule => rule.selectorText === '.c-b-i-fbrand:focus').length), 1);
});
test('shadows support legacy blur.opacity entries and structured options', async () => {
  assert.deepEqual(await page.evaluate(() => {
    _dy.style.live('shadows', _dy.style.shadow('soft', { shadows: ['12.15'] }) +
      _dy.style.shadow('card', { shadows: { raised: { blur: '12.5px', opacity: .2, x: 0, y: 4 } } }));
    document.querySelector('#app').innerHTML = '<div id="legacy" class="shadow-soft-12-15"></div><div id="modern" class="shadow-card-raised"></div>';
    return ['legacy', 'modern'].map(id => getComputedStyle(document.getElementById(id)).boxShadow);
  }), ['rgba(0, 0, 0, 0.15) 1px 1px 12px 0px', 'rgba(0, 0, 0, 0.2) 0px 4px 12.5px 0px']);
});
test('responsive visibility has exactly one active range at each breakpoint', async () => {
  await page.evaluate(() => {
    _dy.style.use();
    document.querySelector('#app').innerHTML = ['1000', '0100', '0010', '0001']
      .map(bits => '<div class="resp-' + bits + '"></div>').join('');
  });
  for (const [width, bucket] of [[419, 0], [420, 1], [719, 1], [720, 2], [1009, 2], [1010, 3]]) {
    await page.setViewportSize({ width, height: 800 });
    assert.deepEqual(await page.evaluate(() => [...document.querySelector('#app').children].map(element => getComputedStyle(element).display)),
      [0, 1, 2, 3].map(index => index === bucket ? 'flex' : 'none'), 'width ' + width);
  }
});
test('responsive custom prefix and short/tall visibility work at exact boundaries', async () => {
  await page.evaluate(() => {
    _dy.style.live('responsive', _dy.style.responsive({ key: 'show-', breakPoints: [400, 600, 900] }));
    document.querySelector('#app').innerHTML = '<div class="show-10"></div><div class="show-01"></div><span class="brk"></span>';
  });
  for (const [height, expected] of [[399, ['flex', 'none', '"2"']], [400, ['none', 'flex', '"1"']]]) {
    await page.setViewportSize({ width: 399, height });
    assert.deepEqual(await page.evaluate(() => [
      ...[...document.querySelectorAll('#app > div')].map(element => getComputedStyle(element).display),
      getComputedStyle(document.querySelector('.brk'), '::after').content,
    ]), expected);
  }
});
test('visibility helpers handle missing elements, delayed restoration and timer cancellation', async () => {
  assert.deepEqual(await page.evaluate(async () => {
    const app = document.querySelector('#app');
    const missing = _dy.style.helpers.hide('.missing');
    _dy.style.helpers.hide(app, 20);
    const initial = getComputedStyle(app).display;
    await new Promise(resolve => setTimeout(resolve, 35));
    const restored = getComputedStyle(app).display;
    _dy.style.helpers.show(app, 20);
    _dy.style.helpers.show(app);
    await new Promise(resolve => setTimeout(resolve, 35));
    return [missing, initial, restored, getComputedStyle(app).display];
  }), [null, 'none', 'block', 'block']);
});
test('one-class animations are installed automatically with modifiers', async () => {
  assert.deepEqual(await page.evaluate(() => {
    document.querySelector('#app').className = 'op-slide-up op-slow';
    const style = getComputedStyle(document.querySelector('#app'));
    return [style.animationName, style.animationDuration, style.animationFillMode];
  }), ['op-slide-up', '1s', 'both']);
});
test('animation CSS variables, loop and pause modifiers work', async () => {
  assert.deepEqual(await page.evaluate(() => {
    const app = document.querySelector('#app'); app.className = 'op-pulse op-loop op-paused';
    app.style.setProperty('--op-duration', '700ms'); app.style.setProperty('--op-delay', '100ms');
    const style = getComputedStyle(app);
    return [style.animationDuration, style.animationDelay, style.animationIterationCount, style.animationPlayState];
  }), ['0.7s', '0.1s', 'infinite', 'paused']);
});
test('all simple CSS effects have keyframes and complete finite animations', async () => {
  assert.equal(await page.evaluate(async () => {
    for (const name of ['fade-in', 'fade-out', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'zoom-in', 'zoom-out', 'pulse', 'shake', 'spin']) {
      const element = document.createElement('div'); element.className = 'op-' + name;
      element.style.cssText = '--op-duration:1ms;--op-repeat:1'; document.body.appendChild(element);
      const animations = element.getAnimations();
      if (animations.length !== 1) return false;
      await animations[0].finished; element.remove();
    }
    return true;
  }), true);
});
test('legacy animation class names and flip alias remain available', async () => {
  assert.deepEqual(await page.evaluate(() => {
    const app = document.querySelector('#app');
    return ['animated fadeIn', 'animated bounceIn', 'animated flip', 'animated _pulse', 'rotating'].map(classes => {
      app.className = classes; return getComputedStyle(app).animationName;
    });
  }), ['fadeIn', 'bounceIn', 'flip', 'pulse', 'rotating']);
});
test('JavaScript animation accepts selectors and elements and returns a controllable Animation', async () => {
  assert.deepEqual(await page.evaluate(async () => {
    const motion = _dy.animate('#app', 'fadeIn', { duration: 1 }); await motion.finished;
    const state = motion.playState, opacity = getComputedStyle(document.querySelector('#app')).opacity;
    motion.cancel();
    const next = _dy.style.animate(document.querySelector('#app'), 'op-slide-up', 1); await next.finished;
    next.cancel();
    return [state, opacity, _dy.animate('.missing', 'fadeIn'), next.playState];
  }), ['finished', '1', null, 'idle']);
});
test('reduced motion limits CSS and JavaScript animation duration and repetition', async () => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.deepEqual(await page.evaluate(async () => {
    const app = document.querySelector('#app'); app.className = 'op-spin op-loop';
    const style = getComputedStyle(app);
    const cssDuration = style.animationDuration, cssRepeat = style.animationIterationCount;
    const motion = _dy.animate(app, 'spin', { duration: 10000, delay: 10000, iterations: Infinity });
    await motion.finished;
    const timing = motion.effect.getTiming();
    motion.cancel();
    return [cssDuration, cssRepeat, timing.duration, timing.delay, timing.iterations];
  }), ['1e-05s', '1', 0, 0, 1]);
});
test('invalid style configuration and unknown animation give clear errors', async () => {
  assert.deepEqual(await page.evaluate(() => {
    const errors = [];
    for (const run of [() => _dy.style.responsive({ breakPoints: [600, 400, 900] }),
      () => _dy.style.live('app', 'body{}'), () => _dy.animate('#app', 'doesNotExist')]) {
      try { run(); } catch (error) { errors.push(error.message.startsWith('ophtml:')); }
    }
    return errors;
  }), [true, true, true]);
});

test('README quickstart runs verbatim', async () => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/docs-quickstart/');
  await page.waitForFunction(() => document.querySelector('#app h1')?.textContent === 'Hello from OPHTML');
  assert.match(await page.locator('#app').innerText(), /HTML components with JavaScript data/);
  assert.equal(await page.locator('#app h1').evaluate(element => getComputedStyle(element).color), 'rgb(20, 98, 171)');
  assert.deepEqual(errors, []);
});
test('documented component state handler increments without guessed inline syntax', async () => {
  assert.ok(documentedCounter, 'counter snippet is extracted from template docs');
  await page.evaluate(async () => {
    document.querySelector('#app').innerHTML = await _dy.render('documented-counter');
  });
  await page.locator('#app button').click();
  await page.locator('#app button').click();
  assert.equal(await page.locator('#app button').innerText(), 'Clicks: 2');
});
test('documented in-memory template condition uses wrapper data correctly', async () => {
  assert.equal(await page.evaluate(() => _dy.renderTemplate(
    '#if $$data.enabled #then<strong>$$title</strong>#end', { title: 'Enabled', enabled: true }
  )), '<strong>Enabled</strong>');
});
test('store example loads real files, filters products, updates basket and replays motion', async () => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/examples/store/');
  await page.waitForFunction(() => document.querySelectorAll('#app article').length === 3);
  assert.equal(await page.locator('#app article').count(), 3);
  assert.match(await page.locator('#app').innerText(), /\$18\.00/);
  assert.equal(await page.locator('#app button:disabled').count(), 1);
  await page.locator('button[data-product="notebook"]').click();
  assert.equal(await page.locator('#basket').innerText(), 'Basket: 1');
  await page.locator('#filter').click();
  await page.waitForFunction(() => document.querySelectorAll('#app article').length === 2);
  assert.equal(await page.locator('#filter').getAttribute('aria-pressed'), 'true');
  await page.locator('#replay').click();
  assert.equal(await page.locator('#status').innerText(), 'Animation replayed.');
  await page.locator('#filter').click();
  await page.waitForFunction(() => document.querySelectorAll('#app article').length === 3);
  await page.setViewportSize({ width: 375, height: 800 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
});

async function openGallery() {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/examples/gallery/');
  await page.waitForFunction(() => document.querySelector('#gallery')?.dataset.ready === 'true');
  await page.waitForFunction(() => document.querySelectorAll('[data-board-tag]').length === 4);
  return errors;
}
const gallerySample = id => page.locator(`[data-sample="${id}"] [data-preview]`);

test('gallery loads 36 genuine examples and nested components without unresolved parameters', async () => {
  const errors = await openGallery();
  assert.equal(await page.locator('[data-sample]').count(), 36);
  assert.equal(await page.locator('[data-sample][data-ready="true"]').count(), 36);
  assert.equal(await page.locator('.sample-error').count(), 0);
  const desktopBoxes = await page.locator('[data-sample]').evaluateAll(cards => cards.slice(0, 3).map(card => {
    const rect = card.getBoundingClientRect(); return { x: rect.x, y: rect.y };
  }));
  assert.ok(desktopBoxes[0].x < desktopBoxes[1].x && desktopBoxes[1].x < desktopBoxes[2].x);
  assert.ok(desktopBoxes.every(box => Math.abs(box.y - desktopBoxes[0].y) < 1));
  assert.equal(await gallerySample('data-table').locator('tbody tr').count(), 3);
  assert.equal(await gallerySample('basic-repeat').locator('.demo-row').count(), 3);
  assert.equal(await gallerySample('nested-categories').locator('[data-category-group]').count(), 2);
  assert.equal(await gallerySample('nested-categories').locator('[data-nested-item]').count(), 3);
  assert.equal(await gallerySample('nested-team').locator('[data-member]').count(), 3);
  assert.equal(await gallerySample('nested-board').locator('[data-board-column]').count(), 2);
  assert.equal(await gallerySample('nested-board').locator('[data-board-card]').count(), 3);
  const text = await page.locator('#gallery').evaluate(root => [...root.querySelectorAll('[data-preview]')].map(node => node.innerText).join('\n'));
  assert.doesNotMatch(text, /\$\$|#_?(?:is|then|else|end|dy)\b|\[object Object\]/);
  await gallerySample('nested-categories').getByRole('button').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-sample="nested-categories"] [data-nested-item]').length === 4);
  assert.deepEqual(errors, []);
});
test('gallery switchers and all condition forms respond to data changes', async () => {
  const errors = await openGallery();
  await gallerySample('view-switcher').locator('select').selectOption('2');
  await page.waitForFunction(() => document.querySelector('[data-sample="view-switcher"] [data-preview]').innerText.includes('The latest project updates.'));
  await gallerySample('if-session').getByRole('button', { name: 'Sign in' }).click();
  await page.waitForFunction(() => document.querySelector('[data-sample="if-session"] [data-preview]').innerText.includes('Welcome back'));
  await gallerySample('is-stock').getByRole('button').click();
  assert.match(await gallerySample('is-stock').innerText(), /Temporarily out of stock/);
  await gallerySample('is-defined').getByRole('button').click();
  assert.match(await gallerySample('is-defined').innerText(), /No subtitle/);
  await gallerySample('is-missing').getByRole('button').click();
  assert.match(await gallerySample('is-missing').innerText(), /Nice to see you, Ada/);
  await gallerySample('nested-conditions').locator('[data-flag="admin"]').check();
  assert.match(await gallerySample('nested-conditions').innerText(), /Admin workspace/);
  await gallerySample('expression-total').locator('select').selectOption('3');
  assert.match(await gallerySample('expression-total').innerText(), /\$54\.00/);
  await gallerySample('async-states').locator('select').selectOption('2');
  await page.waitForFunction(() => document.querySelector('[data-sample="async-states"] [data-preview]').innerText.includes('could not load'));
  assert.deepEqual(errors, []);
});
test('gallery controls support todos, pagination, search, sorting and component state', async () => {
  const errors = await openGallery();
  await gallerySample('todo-list').locator('[data-task="2"]').check();
  assert.equal(await gallerySample('todo-list').locator('input:checked').count(), 2);
  await gallerySample('pagination').locator('[data-page="2"]').click();
  await page.waitForFunction(() => document.querySelector('[data-sample="pagination"] [data-preview]').innerText.includes('Noor Ali'));
  await gallerySample('search-list').locator('input').fill('notebook');
  await page.waitForFunction(() => document.querySelectorAll('[data-sample="search-list"] .demo-row').length === 1);
  await gallerySample('search-list').locator('input').fill('"<unmatched>');
  await page.waitForFunction(() => document.querySelector('[data-sample="search-list"] [data-preview]').innerText.includes('No matching products'));
  assert.equal(await gallerySample('search-list').locator('input').inputValue(), '"<unmatched>');
  await gallerySample('sort-list').locator('select').selectOption('desc');
  assert.match(await gallerySample('sort-list').locator('.demo-row').first().innerText(), /Desk light/);
  await gallerySample('counter').getByRole('button').click();
  await gallerySample('counter').getByRole('button').click();
  assert.equal(await gallerySample('counter').locator('output').innerText(), '2');
  assert.deepEqual(errors, []);
});
test('gallery interface samples work with mouse and keyboard', async () => {
  const errors = await openGallery();
  await gallerySample('faq').locator('summary').first().click();
  assert.equal(await gallerySample('faq').locator('details').first().evaluate(element => element.open), true);
  await gallerySample('tabs').locator('[data-tab="0"]').focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => document.querySelector('[data-sample="tabs"] [role="tab"][aria-selected="true"]').dataset.tab === '1');
  await gallerySample('dropdown').locator('summary').click();
  await gallerySample('dropdown').getByRole('button', { name: 'Settings' }).click();
  assert.match(await gallerySample('dropdown').innerText(), /Settings selected/);
  await gallerySample('modal').getByRole('button', { name: 'Open dialog' }).click();
  assert.equal(await gallerySample('modal').locator('dialog').evaluate(element => element.open), true);
  await page.keyboard.press('Escape');
  assert.equal(await gallerySample('modal').locator('dialog').evaluate(element => element.open), false);
  await gallerySample('toast').getByRole('button').click();
  assert.equal(await gallerySample('toast').locator('[data-toast-message]').isVisible(), true);
  await gallerySample('form').locator('input').fill('ada@example.com');
  await gallerySample('form').getByRole('button').click();
  assert.match(await gallerySample('form').innerText(), /Demo signup for ada@example.com/);
  await gallerySample('stepper').getByRole('button', { name: 'Next' }).click();
  await gallerySample('stepper').getByRole('button', { name: 'Next' }).click();
  assert.match(await gallerySample('stepper').innerText(), /Step 3 of 3/);
  assert.deepEqual(errors, []);
});
test('gallery theme persists and style tokens drive hover and pointer interactions', async () => {
  const errors = await openGallery();
  await gallerySample('theme').getByRole('button', { name: 'Dark', exact: true }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  const darkBackground = await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor);
  await page.reload();
  await page.waitForFunction(() => document.querySelector('#gallery')?.dataset.ready === 'true');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.locator('#theme-toggle').click();
  const lightBackground = await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor);
  assert.notEqual(lightBackground, darkBackground);
  const hover = gallerySample('mouse').getByRole('button');
  await hover.hover();
  await page.waitForTimeout(200);
  assert.equal(await hover.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(40, 118, 90)');
  const pad = gallerySample('mouse').locator('[data-pointer]');
  await pad.hover({ position: { x: 20, y: 30 } });
  const coordinates = (await pad.locator('output').innerText()).split(',').map(Number);
  assert.ok(Math.abs(coordinates[0] - 20) <= 1 && Math.abs(coordinates[1] - 30) <= 1);
  await gallerySample('motion').getByRole('button', { name: 'Pulse' }).click();
  assert.deepEqual(errors, []);
});
test('gallery search, category filters and source inspection are usable on mobile', async () => {
  const errors = await openGallery();
  await page.locator('[data-category="Components"]').click();
  assert.equal(await page.locator('[data-sample]:visible').count(), 5);
  await page.locator('#search').fill('three levels');
  assert.equal(await page.locator('[data-sample]:visible').count(), 1);
  const card = page.locator('[data-sample="nested-board"]');
  await card.locator('.source-panel summary').click();
  assert.match(await card.locator('[data-code]').innerText(), /components\/board-card.htm/);
  await card.locator('[data-source-tab="data"]').click();
  assert.match(await card.locator('[data-code]').innerText(), /"columns"/);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await card.locator('.copy-source').click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), await card.locator('[data-code]').innerText());
  await page.locator('#search').fill('no-such-pattern');
  assert.equal(await page.locator('#no-results').isVisible(), true);
  await page.locator('#search').fill('');
  await page.locator('[data-category="All"]').click();
  await page.setViewportSize({ width: 375, height: 800 });
  assert.equal(await page.locator('[data-sample]:visible').count(), 36);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
});
