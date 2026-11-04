# Migrating from dyHTML/dyStyle

```javascript
import OPHTML from './dyHTML/ophtml.js';
const _dy = OPHTML.html;
const _dyStyle = OPHTML.style;
_dy.root = '/existing/components/';
const html = await _dy.render('existing-component', params);
```

Keep existing `.htm` files, parameters, custom tags, and script markers. The default export still has html/script and adds style. Legacy globals remain; `_dy.style` and `_dy.animate` are new conveniences.

The two original modules are reference files. Do not load old `dystyle.js` after OPHTML: it would overwrite `_dyStyle` with the old implementation. Manual CSS generation with `init`/`live` and individual generators still works. `style.use(config)` is an additional full-utility convenience. Animations/visibility install automatically; other utilities remain explicit.

## Corrected behavior to check

OPHTML 1.1.1 adds the example gallery and fixes switcher closing-tag conversion, so content following a switcher remains outside its case template.

- Conditions handle false branches/nesting; `#if` aliases expression conditions. Invalid directives now throw instead of silently producing damaged HTML.
- Header parameters precede conditions. Async main initialization is awaited and runs once per component identity.
- Failed template requests reject instead of leaving rendering pending.
- Dynamic oncreate receives content before transformation; switchers default to case zero; empty arrays follow the repeater path.
- Replacement respects complete names and literal values, without repeatedly substituting newly inserted text in the same pass.
- Dotted address reads, component lookup, color conversion, image inputs/MIME, request statuses, and callback issues are corrected.
- Important size/spacing classes use configured values. Replace accidental reliance on their previous always-zero output with an explicit zero token.
- Negative positions and aspect ratios use valid CSS; decimal border widths survive.
- Adjacent responsive ranges no longer overlap at exact breakpoints.
- `helpers.hide(target, duration)` hides immediately and later restores; repeated visibility calls cancel prior timers.

Raw HTML interpolation, trusted executable expressions, legacy global string helpers, and explicit UI updates remain. Validate existing custom patterns in a browser, especially ones not represented in the documented examples.
