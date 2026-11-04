# Styles

Styles are integrated in `dyHTML/ophtml.js`. Importing installs animation/visibility CSS. Call `use()` for the remaining utilities:

```javascript
_dy.style.use({
  colors: { brand: '#1462ab', surface: '#f5f7fb' },
  sizes: { card: '320px', space: '20px' },
  textSizes: { title: '28px' }, borders: { thin: '0.5px' },
  radius: { card: '12px' }, layers: { menu: 50 }, opacity: { muted: 0.6 },
  breakPoints: [420, 720, 1010]
});
```

```html
<article class="_w-card _p-space rad-card csurface">
  <h2 class="fs-title c-tbrand">Product</h2>
</article>
```

Objects merge with defaults; arrays replace defaults. `use(options, id = 'ophtml-theme')` replaces one generated stylesheet. Each call starts with defaults, not the previous call's custom values; pass the complete custom configuration each time.

## Injection and generators

| Method | Behavior |
| --- | --- |
| `init(css)` | Append a style element; return it |
| `live(id, css)` | Create/update a style element; return it |
| `default_template()` | Independent default configuration object |
| `build(options)` | Return utility CSS without injecting it |
| `use(options?, id?)` | Build/inject utilities; return style object |
| `size`, `fontSize`, `border`, `color`, `radius`, `layer`, `opacity`, `shadow`, `responsive` | Return CSS from supplied configuration |
| `flex`, `nasted`, `nested`, `overflow`, `hidden`, `icon`, `animation` | Return corresponding CSS strings |

`nasted()` keeps its original spelling; `nested()` aliases it. Individual generators do not merge defaults. Length numbers become px; strings can use CSS units/expressions.

```javascript
_dyStyle.live('layout',
  _dyStyle.flex() + _dyStyle.size({ sizes: { full: '100%', gap: '16px' } })
);
```

## Defaults

| Configuration | Tokens |
| --- | --- |
| sizes | `0:0px`, `xs:4px`, `sm:8px`, `md:16px`, `lg:24px`, `xl:32px`, `full:100%`, `auto:auto` |
| textSizes | `sm:12px`, `md:16px`, `lg:24px`, `xl:32px` |
| colors | `main:#1462ab`, `white:#fff`, `black:#000`, `transparent:transparent` |
| borders | `0:0px`, `1:1px`, `2:2px` |
| radius | `0:0px`, `sm:4px`, `md:8px`, `lg:16px`, `full:9999px` |
| layers | `base:0`, `dropdown:10`, `modal:100` |
| opacity | `0:0`, `05:0.5`, `1:1` |

Values must suit their property: auto is useful for widths/margins, but not padding. The generator is not a full CSS-value validator.

## Size, spacing and position

For a `card` token in `sizes`:

| Classes | Properties |
| --- | --- |
| `_w-card`, `_h-card` | Width, height |
| `_w-mn-card`, `_w-mx-card`, `_h-mn-card`, `_h-mx-card` | Min/max dimensions |
| `_w-ex-card`, `_h-ex-card` | Dimension plus matching min/max |
| `_p-card`, `_pl-card`, `_pr-card`, `_pt-card`, `_pb-card` | Padding |
| `_plr-card`, `_ptb-card` | Horizontal/vertical padding |
| `m-card`, `ml-card`, `mr-card`, `mt-card`, `mb-card` | Margins |
| `mlr-card`, `mtb-card` | Horizontal/vertical margins |
| `l-card`, `r-card`, `t-card`, `b-card` | Positioned offsets |
| `l-ncard`, `r-ncard`, `t-ncard`, `b-ncard` | Negative offsets, for values supporting negation |
| `gap-card`, `gap-x-card`, `gap-y-card` | Gap, column/row gap |

Insert `-i` before the token for important declarations: `_w-i-card`, `_w-mx-i-card`, `_p-i-card`, `mtb-i-card`. These use configured values, correcting the original always-zero output.

`asp-1x1` through `asp-4x4` produce valid fractions: `asp-2x3` means `aspect-ratio:2/3`.

## Flex

- `f` / `fl`: flex / inline flex.
- `f-r`, `f-c`, `f-rr`, `f-cr`: row, column, reversed row/column.
- `f-w`, `f-nw`, `f-wr`: wrap, no wrap, reversed wrap.
- `f-js`, `f-jc`, `f-je`, `f-ja`, `f-jb`: justify start, center, end, around, between.
- `f-as`, `f-ac`, `f-ae`, `f-at`, `f-al`: align items start, center, end, stretch, baseline.
- `f-cs`, `f-cc`, `f-ce`, `f-ca`, `f-cb`, `f-ct`: align content.
- `f-ss`, `f-sc`, `f-se`, `f-st`, `f-sl`: align self.
- `f-i01`, `f-i00`, `f-i11`, `f-i10`: grow/shrink combinations with auto basis.
- `flex-rc`, `flex-cc`, `f-center`, `f-fit`: legacy layout shortcuts.

## Colors

With `colors: { brand: '#1462ab' }`:

| Purpose | Normal | Important | Hover | Focus |
| --- | --- | --- | --- | --- |
| Background | `cbrand` | `c-ibrand` | `c-hbrand` | `c-fbrand` |
| Text | `c-tbrand` | `c-t-ibrand` | `c-t-hbrand` | `c-t-fbrand` |
| Border | `c-bbrand` | `c-b-ibrand` | `c-b-hbrand` | `c-b-fbrand` |

Important state forms: `c-i-hbrand`, `c-i-fbrand`, `c-t-i-hbrand`, `c-t-i-fbrand`, `c-b-i-hbrand`, `c-b-i-fbrand`.

## Other utilities

| Configuration / generator | Classes |
| --- | --- |
| `textSizes: { title: '28px' }` | `fs-title`, `fs-i-title` |
| `fontSize()` | `fw-100/300/500/700/900`, `ta-left/center/right` |
| `borders: { thin: '0.5px' }` | `ba-thin`, `bt-thin`, `bb-thin`, `bl-thin`, `br-thin` |
| `border()` | `b-none`, `b-solid`, `b-dash`, `b-dot`, `ba-00` |
| `radius: { card: '12px' }` | `rad-card`, `rad-r-card`, `rad-l-card`, `rad-t-card`, `rad-b-card` |
| `layers: { menu: 50 }` | `ly-menu` |
| `opacity: { muted: 0.6 }` | `op-muted`, `op-hmuted` |
| `nasted()` / `nested()` | `full`, `relative`, `absolute`, `fixed`, `prevent-select`, legacy validation/loading styles |
| `overflow()` | `owf`, `owf-x`, `owf-y` |
| `hidden()` | `hdn`, `hdn-i`, `disabled`, `[disable]`, `[disabled]` |
| `icon()` | `icon`; separately load the Material Symbols Outlined font if needed |

`radius(options, prefix = 'rad', descendant = '')` supports custom prefixes and descendants. Example: `radius({ radius: { sm: 6 } }, 'round', 'span')` generates `.round-sm span` and side variants.

`nasted()` includes legacy global Helvetica rules. Those install only through that generator or `use()`, not by importing the module alone.

## Shadows

```javascript
_dy.style.live('shadows', _dy.style.shadow('soft', {
  shadows: ['12.15'], rgb: '0,0,0'
}));
```

Legacy `12.15` means 12px blur and 0.15 alpha, not decimal blur. Classes: `shadow-soft-12-15`, `shadow-hsoft-12-15` for hover.

For decimal blur and named tokens:

```javascript
_dy.style.live('cards', _dy.style.shadow('card', {
  shadows: { raised: { blur: '12.5px', opacity: 0.2, x: 0, y: 4, spread: 0 } }
}));
```

Classes: `shadow-card-raised`, `shadow-hcard-raised`. `use({ shadows: ... })` uses namespace `main`.

## Responsive visibility

Four-bit masks run **smallest to largest viewport**. A 1 displays flex; a 0 hides with important priority.

| Default class | Visible at |
| --- | --- |
| `resp-1000` | Width < 420px |
| `resp-0100` | 420px <= width < 720px |
| `resp-0010` | 720px <= width < 1010px |
| `resp-0001` | Width >= 1010px |
| `resp-1111` | All four ranges |

Ranges do not overlap at boundaries. `responsive({ key: 'show-', breakPoints: [400,600,900] })` changes the prefix and thresholds. `use()` accepts the same settings.

Two-bit masks only apply below the first width breakpoint: `resp-10` shows at short heights, `resp-01` at tall heights, with height threshold equal to the first breakpoint. `.brk::after` exposes the legacy breakpoint indicator. `.wcord` is full width below the largest breakpoint and fixed to that breakpoint above it.

## Visibility helpers

```javascript
_dy.style.helpers.hide('#notice');
_dy.style.helpers.show('#notice');
_dy.style.helpers.show('#notice', 2000); // show now; hide in 2 seconds
_dy.style.helpers.hide('#notice', 2000); // hide now; show in 2 seconds
```

Accept a selector for the first match or a DOM element. Missing elements return null. A new call cancels the element's previous visibility timer.
