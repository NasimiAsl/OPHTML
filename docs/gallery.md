# The example gallery

Run from the repository root:

```sh
python3 -m http.server 8000
```

Open [the gallery](http://localhost:8000/examples/gallery/). All 36 live examples use `dyHTML/ophtml.js`, `.htm` templates, and the integrated style API. There is no build step or external font/image dependency.

Search the collection or use its category buttons. Every card has **View source**, with Template, Data, and Handlers tabs. Template source includes any child component files. Copy the displayed source or follow `main.js` for the surrounding application code.

## The 36 examples

| # | Pattern | Component |
| --- | --- | --- |
| 1 | Basic object-array repeater | `basic-repeat.htm` |
| 2 | Product grid with per-item conditions | `product-grid.htm` |
| 3 | Native table generated with an expression | `data-table.htm` |
| 4 | Interactive to-do list | `todo-list.htm` |
| 5 | Three-case switcher | `view-switcher.htm` |
| 6 | Session state with #if | `if-session.htm` |
| 7 | Stock expression with #is value | `is-stock.htm` |
| 8 | Optional content with #is define | `is-defined.htm` |
| 9 | Undefined fallback with #is not define | `is-missing.htm` |
| 10 | Nested conditions | `nested-conditions.htm` |
| 11 | Calculated quantity total with #dy | `expression-total.htm` |
| 12 | Categories containing child repeaters | `nested-categories.htm` |
| 13 | Teams containing member components | `nested-team.htm` |
| 14 | Columns, cards, and tags across three levels | `nested-board.htm` |
| 15 | FAQ accordion | `faq.htm` |
| 16 | Keyboard-accessible tabs with switcher | `tabs.htm` |
| 17 | Dropdown menu | `dropdown.htm` |
| 18 | Native modal dialog | `modal.htm` |
| 19 | Toast using visibility helpers | `toast.htm` |
| 20 | Paginated repeated data | `pagination.htm` |
| 21 | Search/filter list | `search-list.htm` |
| 22 | Sortable product list | `sort-list.htm` |
| 23 | Form with native validation | `form.htm` |
| 24 | Three-step switcher flow | `stepper.htm` |
| 25 | Repeated pricing cards | `pricing.htm` |
| 26 | Breadcrumb trail | `breadcrumbs.htm` |
| 27 | Activity timeline | `timeline.htm` |
| 28 | Avatar stack | `avatars.htm` |
| 29 | Native progress indicators | `progress.htm` |
| 30 | Loading/empty/error switcher | `async-states.htm` |
| 31 | Per-item status badges | `badges.htm` |
| 32 | Dark/light palette | `theme.htm` |
| 33 | Hover, focus, and pointer movement | `mouse.htm` |
| 34 | Event-driven animation | `motion.htm` |
| 35 | Inline dy component | `dynamic.htm` |
| 36 | Component initialization and local counter | `counter.htm` |

All files are in [examples/gallery/components](../examples/gallery/components/). Data and handlers live in [samples.js](../examples/gallery/samples.js); [main.js](../examples/gallery/main.js) mounts the gallery and handles event delegation, source inspection, filtering, and theme selection.

## Repeating inside a repeated component

Use an outer repeater to load a component for each parent object. Pass the current object using `$$repeaterItem`, not a hand-built string containing its nested array.

Parent data:

```javascript
await _dy.render('nested-categories', {
  groups: [
    { groupTitle: 'Essentials', entries: [{ itemName: 'Notebook' }, { itemName: 'Pen' }] },
    { groupTitle: 'Desk', entries: [{ itemName: 'Lamp' }] }
  ]
});
```

Parent component:

```html
<div>
  <repeater params="$$groups">
    <div><loader page="category-list" params="$$repeaterItem"></loader></div>
  </repeater>
</div>
```

`category-list.htm`:

```html
<section>
  <h3>$$groupTitle</h3>
  <div>
    <repeater params="$$entries">
      <p>$$itemName</p>
    </repeater>
  </div>
</section>
```

The child is fetched and compiled independently, so its repeater gets its own scope and template. Keep a dedicated wrapper around each consuming tag. Conditions inside either repeater still use `#_is/#_if`, `#_then/#_else/#_end`, and `#_dy(EXPR#_)`.

`nested-board.htm` extends this to three levels: columns load `board-column.htm`, repeated cards load `board-card.htm`, and each card repeats its tags. Browser tests wait for actual tags; awaiting the outer render alone does not mean nested requests are complete. This is component-based nesting, not directly putting repeater tags inside one another in the same template.

## Dark/light mode and mouse behavior

`main.js` uses `_dy.style.live('gallery-palette', css)` for light/dark CSS variables, then `_dy.style.use({ colors: { brand: 'var(--accent)', surface: 'var(--surface)', ... } })` for utility classes. All previews share those tokens. Theme selection follows the system initially and is saved to localStorage after selection; unavailable storage does not prevent switching.

The pointer example sets local CSS variables from pointer coordinates. Its hover button uses the generated `c-hbrand` class. Keyboard focus has a visible outline, and the tab example supports ArrowLeft/ArrowRight/Home/End. Animations follow the runtime's reduced-motion behavior.

## Adapting a sample

1. Copy its `.htm` file and any listed child components into your component directory.
2. Use the Data tab as a starting point for `_dy.render(name, params)`.
3. Copy the event logic into your application event handlers. Gallery contexts such as `ctx.root`, `ctx.data`, `ctx.render()`, `ctx.notify()`, and `ctx.setTheme()` are example scaffolding in `main.js`, **not OPHTML runtime APIs**.
4. Preserve distinct outer and item field names and explicitly update the DOM or render again.
5. Escape untrusted values for their actual destination. The search example escapes its query before inserting it into an input attribute; the form writes submitted text with `textContent`.

The table uses a `#dy` expression to create native rows. Avoid putting loader/repeater hooks directly in table parser contexts such as `tbody`: native HTML parsing can move the generated image hooks outside the table. Other list/grid examples demonstrate the normal repeater workflow.
