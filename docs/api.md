# API reference

```javascript
import OPHTML, { style } from './dyHTML/ophtml.js';
const _dy = OPHTML.html;
const scripts = OPHTML.script;
```

The default export is `{ html, script, style }`. After import, `style === _dy.style === window._dyStyle`. Globals `_dy`, `_dyScript`, `_dyStyle`, `_ophtml`, `_ophtmlScript`, and `_ophtmlStyle` support legacy templates. Named `dy`, `dyScript`, and `ophtml` exports are constructor/prototype compatibility exports; `ophtml` aliases `dy`, not the default engine object. Use the default export for ordinary apps.

## Rendering

### `await _dy.render(page, params?, showData?)`

Returns compiled HTML. Pass `true` third for `{ html, data }`, where `data` contains parameters and generated `TID`/metadata.

```javascript
_dy.root = '/components/';
const { html, data } = await _dy.render('products', { heading: 'Products' }, true);
document.querySelector('#app').innerHTML = html;
console.log(data.TID, _dy.TsID[data.TID]);
```

Parameters are shallow-copied; nested objects remain references. Loading/template errors reject. Custom-tag hooks and nested requests after insertion are not awaited.

### `await _dy.renderElement(element, page, params?, css?)`

Loads into a generated `<div>`, replaces the target's contents after successful rendering, and returns that wrapper. Its controller exists while the background script runs, but is attached to the target afterward.

```javascript
await _dy.renderElement(document.querySelector('#app'), 'products', { products }, 'page');
```

### `await _dy.renderTemplate(template, data?, showData?)`

Compiles an in-memory template. Ordinary text placeholders are filled from `data` in a final interpolation pass. Unlike `render`, its initial parameter object is `{ data, TID }`: conditions should use `$$data` or `$$$item.data`.

```javascript
const html = await _dy.renderTemplate('<h1>$$title</h1>', { title: 'Hello' });
const conditional = await _dy.renderTemplate(
  '#if $$data.enabled #then<strong>$$title</strong>#end',
  { title: 'Enabled', enabled: true }
);
```

Use file-based `render` for reusable components and custom-tag-heavy templates. `renderTemplate` uses a detached internal controller; insert the HTML yourself. `showData: true` returns `{ html, data }` with the wrapper parameters above.

### `await _dy.loadPage(page, controller?, callback?, root?, params?, after?)`

Lower-level loader resolving `{ html, data }`. The callback receives `(controller, html, params)`; without it, a supplied controller receives `innerHTML`. `after(params)` runs after synchronous background code. `_dy.root` takes precedence over the `root` argument.

```javascript
await _dy.loadPage('card', document.querySelector('#card'), null, '/components/', { title: 'Card' });
```

### Legacy controller operations

| Method | Behavior |
| --- | --- |
| `loader(elementOrTid, data, template?, callback?)` | Arrays repeat; objects load their `page`/`path`; numbers select switcher cases |
| `append(parent, item, page, path, callback?, template?)` | Append a wrapper and invoke the legacy loader |
| `reload(parent, item, page, path, callback?, template?)` | Clear parent, then append via the legacy loader |

Prefer `render`/`renderElement` for new code.

## Configuration and state

| Property | Meaning |
| --- | --- |
| `_dy.root` | Component directory; default `/dyhtml/components/` |
| `_dy.hookMode` | `'elements'` (default): HTMLElement triggers for repeaters/switchers/loaders; `'legacy'`: original image-load triggers |
| `_dy.dyHtmlExtensionFormat` | Default `.htm` |
| `_dy.basePath` | Legacy `$$root` replacement, separate from component root |
| `_dy.TsID[tid]` | State; `.ref` holds parameters and `.ctrl` the controller, if supplied |
| `_dy.cacheComopunents` | Legacy-spelled template cache |
| `_dy.temp_object`, `_dy.repRef` | Internal object references; do not rewrite manually |

`getDyElement(selectorOrElement)` reads state through a legacy `iden` property or an exact managed-controller ownership match, or returns null. It does not walk ancestors or infer state for arbitrary children. Managed wrapper lookup does not add DOM identity fields that change legacy loader routing.

## Component cleanup

```javascript
const wrapper = await _dy.renderElement(document.querySelector('#app'), 'products', { products });
const unregister = _dy.onDispose(_dy.getDyElement(wrapper).ref.TID, () => {
  // Clear application timers, listeners, subscriptions, or other owned resources.
});
await _dy.unmount(document.querySelector('#app'));
```

| Method | Behavior |
| --- | --- |
| `onDispose(tid, cleanup)` | Register a sync/async cleanup callback; return an unregister function. Unknown IDs throw RangeError. |
| `await dispose(tidOrElement)` | Release matching managed components and nested loads; leave their DOM in place. Return the number of components newly disposed. |
| `await unmount(element)` | Dispose components owned by the element/subtree and pending mounts, then clear its contents even if cleanup rejects. Return the newly disposed count. |
| `isDisposed(tid)` | True for disposing, disposed, or unknown IDs. Lifecycle status does not occupy application state fields. |

Descendants clean up before their parent; each component's callbacks run in reverse
registration order and may return promises. All callbacks and reference releases
run even when callbacks throw; failures are collected in an AggregateError. An
unregister function prevents its callback from running. Register application-owned
timers/listeners explicitly; arbitrary browser resources are not inferred.

Framework component requests are aborted on disposal, and pending framework DOM
commits are canceled with AbortError. Repeated disposal after completion returns
zero. Concurrent disposal waits for current cleanup without invoking it twice.
Owned `TsID`, `temp_object`, and `repRef` entries are deleted without shifting
other live indexes; array lengths are not live counts. Source/pattern caches remain.
Application-held state objects retain their fields, including nonconfigurable
application properties; disposal releases the engine's ownership of them.

For manually inserted `render()` strings, retain the TID with `render(name, data,
true)` and pass it to `dispose()`. DOM ownership cannot always be inferred from a
plain string. Replacing `innerHTML` does not automatically dispose old components.

Rendering/native-hook errors preserve their types and messages and add
`error.ophtml` phase/component/path details when available. Failed rendering
releases its owned state. Native-hook failures emit `ophtml-error`; intentional
disposal cancellation does not. See [runtime structure](architecture.md).

## DOM helpers

Rendering reuses up to 128 internal placeholder-matching patterns by parameter-name
shape. This cache is separate from the component-source cache and retains neither
rendered row HTML nor substituted values. There is no new cache configuration API.

| Method | Result |
| --- | --- |
| `element(selector, parent?)` | First element or null; `'.field->value'` reads a property |
| `await elements(selector, each?, end?, batch?, parent?)` | Query elements, await callbacks, or use legacy extraction syntax |
| `last_element(selector, callback?, parent?)` | Last matching element, or invoke callback |
| `address(object, 'a.b.c')` | Dotted path, undefined if missing |
| `get(id)` | Internal temporary object by index |
| `last_item(array)` | Last entry, or null for an empty array (legacy behavior) |

Consult the source for advanced extraction and drag/drop helpers. Prefer native DOM APIs when clearer; no generic binding system is implied.

## Requests

`down(options)` and `upload(options)` return an XMLHttpRequest and use callbacks, not promises.

```javascript
_dy.down({
  url: '/api/products',
  success(text) { console.log(JSON.parse(text)); },
  error(error) { console.error(error); },
  progress(percent) { console.log(percent); },
  end() { console.log('finished'); }
});
_dy.upload({ url: '/api/products', type: 'POST', data: { name: 'Example' } });
```

Options: `url`, `type`, upload `data`/`file`, `timeout` in milliseconds, `begin(xhr)`, `success(text, option)`, `error(cause)`, `end()`, `progress(percent)`, `subProgress(xhr)`, and `option`. Defaults: GET for download, POST for upload; success is 2xx/304. Set custom headers in `begin(xhr)` after the request is opened. JSON upload sets Content-Type. Multipart lets the browser set its boundary and sends metadata in the legacy `content` header.

```javascript
_dy.upload({ url: '/api/files', file: [{ data: fileInput.files[0] }], data: { folder: 'images' } });
```

`imageFileUploader(input, progressElement?, resultImage?)` reads the selected file, preserves its MIME type, and calls an assigned `_dy.imageUploader({ file, blob, base64, input, prg, output })`. That callback owns actual uploading and successful UI cleanup. Empty selections do nothing; read errors release the disabled parent.

## Script loader

`OPHTML.script.add(url, callback?, params?, localJs?, delay?)` downloads/executes trusted JavaScript. The callback receives parameters and, in local mode, the evaluated result. `OPHTML.script.load(urls, callback?, undefined, localMode?)` loads sequentially. These are legacy callback APIs, not an awaited module system. Prefer native ES modules for new application code.

## Styles and motion

Use `_dy.style`, `OPHTML.style`, or named `style`. `_dyStyle` points to the same object unless another script overwrites it. See [styles](styles.md) and [animations](animations.md).

`_dy.animate(target, effect, options?)` shortcuts `_dy.style.animate`. It returns a native Animation, or null for a missing element. Await `.finished`, not the returned object itself.

## Component roots over the page WebSocket

On an OP-SERVER mapped HTTPS page, its injected `window.OPComponents` helper supplies component source. Set `_dy.root` to `https://api.rudan.studio/op/components/`, `https://cdn.rudan.studio/op/components/`, either origin alone, or a `wss://<mapped-host>/__op/components` selector. These roots reuse the page's component-only socket; they do not open an operator socket or download component files through HTTP. Same-origin HTTPS `/op/components/` roots are also supported. Other roots retain the existing HTTP loader.

```javascript
_dy.root = 'https://api.rudan.studio/op/components/';
const html = await _dy.render('profile-card', {name:'Nasimi', role:'OPHTML author'});
```

The existing source cache is checked first, so cached templates render with fresh data even when the socket is offline. Concurrent initial reads of the same URL share one request. `noCache:true` and `noCache:'true'` request fresh source without replacing the normal cache, matching existing HTTP behavior. Caching is per page/URL, with no automatic live subscription or persistent-browser cache. Nested components use the same loader.

`_dy.componentSocket` optionally supplies a helper implementing `.ready` and `.get(names, {timeout})`; by default the runtime uses `window.OPComponents` and waits for its ready event if it has not been installed yet. `_dy.componentWebSocketTimeout` defaults to 30,000 ms. `_dy.componentWebSocketOrigins` defaults to the API/CDN HTTPS origins above; configure that array for other deployments or use an explicit component WebSocket root. WebSocket roots select the existing helper, not an arbitrary remote connection. A missing helper, rejected component or socket failure rejects rendering without silent HTTP fallback. Disposing one render cancels that render's wait and prevents insertion, without closing the shared page connection or cancelling other consumers.

Only `.htm` templates and valid component names are supported by this service. The component-only role needs no operator key or pairing code. It can read public templates only; it does not prove a human visitor.

[Mapped-page example](../examples/websocket/index.html). The runtime can now initialize and render plain interpolation-only components without `unsafe-eval`. Expression directives and executable template scripts still require a compatible trusted-script CSP; this change does not remove those requirements.
