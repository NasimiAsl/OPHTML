# OPHTML

**Over Powered HTML** — browser HTML components, templates, configurable CSS utilities, and easy animations in one JavaScript module.

```javascript
import OPHTML from './dyHTML/ophtml.js';
const _dy = OPHTML.html;
_dy.root = '/components/';
document.querySelector('#app').innerHTML = await _dy.render('welcome', {
  title: 'Hello from OPHTML'
});
```

No runtime dependencies or build step. OPHTML 1.1.0 preserves the dyHTML workflow and includes the corrected dyStyle generators.

## Try the example

```sh
git clone https://github.com/NasimiAsl/OPHTML.git
cd OPHTML
python3 -m http.server 8000
```

Open [the store example](http://localhost:8000/examples/store/). It demonstrates components, repeaters, conditions, styles, animations, and explicit UI updates.

## Start in three steps

**1. Copy [dyHTML/ophtml.js](dyHTML/ophtml.js) into your project.** Keep the repository path below, or adjust your import if you move it. The older `dyhtmlv2.0.01.js` and `dystyle.js` are reference files; you do not need to load them.

**2. Create `components/welcome.htm`:**

```html
<section class="_p-lg rad-md cwhite op-slide-up">
  <h1 class="c-tmain">$$title</h1>
  #if $$showDetails #then
    <p>HTML components with JavaScript data.</p>
  #else
    <p>Welcome!</p>
  #end
</section>
```

**3. Create `index.html`:**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OPHTML app</title>
</head>
<body>
  <main id="app"></main>
  <script type="module">
    import OPHTML from './dyHTML/ophtml.js';
    const _dy = OPHTML.html;
    _dy.root = './components/';
    _dy.style.use({ colors: { main: '#1462ab' } });
    try {
      document.querySelector('#app').innerHTML = await _dy.render('welcome', {
        title: 'Hello from OPHTML', showDetails: true
      });
    } catch (error) {
      document.querySelector('#app').textContent = error.message;
    }
  </script>
</body>
</html>
```

Serve the project over HTTP, for example with `python3 -m http.server 8000`. Opening through `file://` will not provide the module/component loading environment this code needs.

## Generate an app with an LLM

Give your coding assistant this prompt and access to this repository:

```text
Build [describe the app] using OPHTML 1.1.0.
Read llms.txt, docs/llm-prompt.md, and the linked docs first.
Use dyHTML/ophtml.js as the only OPHTML runtime module.
Keep await _dy.render(name, data), _dy.root, and .htm components.
Use _dy.style.use(...) for styling and op-fade-in/op-slide-up for animation.
Use <repeater params="$$items"> inside its own wrapper, object-array data,
and #_is/#_then/#_else/#_end or #_dy(...#_) for per-item directives.
Do not invent APIs, reactive bindings, or framework syntax.
Deliver complete files, serve instructions, and browser verification.
```

For a chat model without repository access, paste [llms-full.txt](llms-full.txt) before describing your app. [docs/llm-prompt.md](docs/llm-prompt.md) contains a fuller prompt and task-specific variants.

## Templates at a glance

```html
<h1>$$heading</h1>
<div class="f f-w gap-md">
  <repeater params="$$items">
    <article class="_p-md rad-md op-fade-in">
      <h2>$$name</h2>
      #_is value $$available #_then
        <span>Available</span>
      #_else
        <span>Unavailable</span>
      #_end
    </article>
  </repeater>
</div>
```

Pass `items: [{ name: 'Example', available: true }]`. Directives inside a repeater use escaped `#_` forms so they run for each item.

## Styling and animation

```javascript
_dy.style.use({
  colors: { brand: '#1462ab' },
  sizes: { card: '320px', space: '20px' },
  radius: { card: '12px' }
});
```

```html
<article class="_w-card _p-space rad-card cbrand op-slide-up">Product card</article>
<span class="op-spin">↻</span>
```

Animations are installed on import; utilities are installed with `style.use()` or individual CSS generators. Existing `_dyStyle.init(css)`, `_dyStyle.live(id, css)`, and legacy animation classes remain available.

```javascript
const motion = _dy.animate('#card', 'fadeIn', { duration: 400 });
if (motion) { await motion.finished; motion.cancel(); }
```

## Documentation

| Guide | Contents |
| --- | --- |
| [Templates](docs/templates.md) | Parameters, directives, custom tags, scripts, lifecycle |
| [API](docs/api.md) | Rendering, component state, requests, helpers |
| [Styles](docs/styles.md) | Configuration, class names, responsive masks |
| [Animations](docs/animations.md) | Effects, timing, JavaScript controls |
| [LLM prompt](docs/llm-prompt.md) | Copyable generation prompts and guardrails |
| [Migration](docs/migration.md) | Moving existing dyHTML/dyStyle code to OPHTML |
| [Contributing](CONTRIBUTING.md) | Running checks and browser tests |

## Runtime notes

- Target modern browsers with ES modules, CSS media range queries, and the Web Animations API.
- Templates and expressions are trusted executable code. Interpolation is raw; escape or sanitize untrusted data for its destination.
- The legacy workflow uses `eval`, inline image-load hooks, and global string helpers. A strict CSP blocking these needs additional adaptation.
- Rendering returns HTML after the component's initialization and synchronous background script. Custom tags activate after insertion; nested components may finish later.
- There are no automatic reactive updates. Explicitly rerender or update the DOM in a handler.

## Development

```sh
npm ci
npx playwright install chromium
npm test
```

The browser suite covers rendering, repeaters, conditions, requests, styles, responsive boundaries, and animations. See [CONTRIBUTING.md](CONTRIBUTING.md) for existing-browser configuration.

## License

[MIT](LICENSE), copyright NasimiAsl.
