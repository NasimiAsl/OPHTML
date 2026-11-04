# Templates and component lifecycle

```javascript
import OPHTML from '../dyHTML/ophtml.js'; // adjust relative to your JS file
const _dy = OPHTML.html;
_dy.root = '/components/';
const html = await _dy.render('products', { heading: 'Products', products: [] });
document.querySelector('#app').innerHTML = html;
```

## Paths

With `_dy.root = '/components/'`, `render('products', data)` requests `/components/products.htm`; `render('shop.products', data)` requests `/components/shop/products.htm`. Leading slashes in names are removed: `/products` still uses the configured root. Names may include `.htm`.

The default root is `/dyhtml/components/` (lowercase), independent of the runtime's `dyHTML/` source directory. Set it explicitly for a new app. A configured `_dy.root` overrides loader `path` attributes and the `loadPage` root argument.

## Parameters

`$$name` substitutes a parameter. Text is inserted literally without HTML escaping. Object/array parameters become internal references so `params="$$products"` can use the original object.

```html
<h1>$$heading</h1>
<p>$$subtitle</p>
```

Use simple, distinct names. Unprovided placeholders remain in the output. There is no universal nested-property interpolation in ordinary markup; flatten display values or use an expression. Escape/sanitize untrusted values for their destination.

`$$TID` is the component identity. `$$hide` produces `hdn-i`. Legacy `$$root` uses `_dy.basePath`, which is separate from `_dy.root`. `$$images` produces `/images`; `$$date` produces a timestamp.

## Conditions and expressions

```html
#is value $$price > 100 #then
  <span>Premium</span>
#else
  <span>Standard</span>
#end

#if $$available #then
  <button>Buy</button>
#end

#is define title
  <h2>$$title</h2>
#else
  <h2>Untitled</h2>
#end

#is not define description
  <p>No description provided.</p>
#end

<span>Total: #dy($$price * $$quantity#)</span>
```

- `#if EXPR #then` aliases `#is value EXPR #then`.
- `#else` is optional. Conditions can nest; close each with `#end`.
- Define forms take a parameter name and optionally `#then`.
- `#is define name` preserves legacy truthiness: undefined, null, false, empty string, and values loosely equal to zero fail. This is not just property existence.
- `#is not define name` checks strictly for undefined; null counts as defined here.
- Expressions accept `$$parameter`, `$$$item` for the current parameter/item object, and trusted JavaScript. Both `$$status === 'active'` and legacy `"$$status" === "active"` work.
- Invalid expressions/unmatched directives throw; `render` rejects.

Expressions are not a sandbox. Use trusted template code.

## Repeaters

Pass an array of objects. Null and primitive entries are skipped; empty arrays produce empty content.

```javascript
const html = await _dy.render('tasks', {
  heading: 'Tasks',
  tasks: [
    { label: 'Read OPHTML', done: true },
    { label: 'Build a store', done: false }
  ]
});
```

```html
<h1>$$heading</h1>
<div class="f f-c gap-md">
  <repeater params="$$tasks">
    <article>
      <span>$$label</span>
      #_is value $$done #_then
        <span>Completed</span>
      #_else
        <span>Pending</span>
      #_end
      <span>Row #_dy($$repeaterIndex + 1#_)</span>
      <button onclick="console.log($$repeaterItem)">Inspect</button>
    </article>
  </repeater>
</div>
```

The hook replaces the parent's entire contents with the list. Keep headings and unrelated siblings outside that wrapper.

| Outer directive | Deferred per-item directive |
| --- | --- |
| `#is` / `#if` | `#_is` / `#_if` |
| `#then` / `#else` / `#end` | `#_then` / `#_else` / `#_end` |
| `#dy(EXPR#)` | `#_dy(EXPR#_)` |

Items expose `$$repeaterKey` (collection key), `$$repeaterIndex` (zero-based object-item index), and `$$repeaterItem` (JavaScript reference to the original object). The engine adds `repeaterKey`/`repeaterIndex` to each item. An `oncreate` attribute can transform interpolated item HTML using `content`, `data`, and `index`.

Avoid reusing outer parameter names as item fields: outer substitution happens first. Nested repeaters are not a documented supported pattern in this version; use separately loaded components for complex nested lists.

## Custom tags

| Tag | Purpose | Example |
| --- | --- | --- |
| `loader` | Load a component into its parent | `<loader page="card" params="{name:'Ada'}"></loader>` |
| `iloader` | Loader with a generated wrapper | `<iloader page="card" params="{name:'Ada'}"></iloader>` |
| `com` | Wrapped loader shorthand | `<com "card" params="{name:'Ada'}"></com>` |
| `repeater` | Repeat its template for object entries | `<repeater params="$$items">...</repeater>` |
| `switcher` | Choose a case separated by `$$next-case` | See below |
| `content` | Render inline content with parameters | `<content params="{name:'Ada'}">$$name</content>` |
| `icontent` | Inline content with generated wrapper | `<icontent params="{name:'Ada'}">$$name</icontent>` |
| `dy` | Wrapped inline shorthand | `<dy "{name:'Ada'}">$$name</dy>` |
| `dyc` | Inline element-content variant | `<dyc "{name:'Ada'}">$$name</dyc>` |
| `callscript` | Inline execution hook | `<callscript>console.log('ready')</callscript>` |

These tags are compiled as strings, not Web Components. Use lowercase paired tags and the shown attribute forms. Give consuming tags their own wrapper.

Loader attributes include `page`, `path`, `params`, `def`, `css`, `onready`, and `online`. `def="false"` removes the parent. `params` is an evaluated JavaScript expression, not necessarily JSON. `path` follows root precedence above.

```html
<div>
  <switcher params="{loggedIn:true}" oncreate="item = data.loggedIn ? 1 : 0;">
    <p>Please sign in.</p>
    $$next-case
    <p>Welcome back.</p>
  </switcher>
</div>
```

The default case is zero. `oncreate` assigns the zero-based `item`. Invalid cases throw.

## Script sections and component state

```html
<script>
  $$_clicks = 0;
  $$_increment = function (button) {
    $$_clicks += 1;
    button.textContent = 'Clicks: ' + $$_clicks;
  };
</script>
/// main content
<button onclick="_dy.TsID[$$TID].increment(this)">Clicks: 0</button>
```

In initialization, `$$_name` becomes `_dy.TsID[TID].name`; `$$$item` becomes the state object. Initialization can await and runs once per component identity. Its `data` argument is the component state; `.ref` contains render parameters.

`$$_` expands in script sections and processed custom-tag attributes, not universally in ordinary inline handlers. In ordinary markup use `_dy.TsID[$$TID].method(...)`, as above. Each render creates a new identity. State changes do not rerender automatically.

Other section markers:

- `/// header`: preceding JavaScript runs asynchronously with a fresh `item` object. Properties assigned to `item` merge into parameters before conditions. This object is not the data passed to `render`. Example: `<script>item.title = 'Hello';</script>/// header<h1>$$title</h1>`.
- `/// background script`: following JavaScript runs after the HTML callback. `$$_ctrl` is available with controller-based loading; plain `render()` has no mounted controller. This uses ordinary eval: no top-level await, and promises started inside it are not awaited.

## What await guarantees

`await _dy.render(...)` waits for loading, header execution, async initialization, the HTML callback, and synchronous background code. It returns a string, not a mounted tree. After insertion, image-load hooks activate custom tags; nested loaders can make further asynchronous requests. Wait for their DOM content before inspecting them.

Templates are cached by URL. Pass `noCache: true` or `noCache: 'true'` to fetch again. Data interpolation and initialization still run on every render.
