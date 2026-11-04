# Easy animations

Importing OPHTML installs animation CSS once. No `style.use()` call is needed for animation.

```html
<div class="op-fade-in">Hello</div>
<article class="op-slide-up op-slow">Product card</article>
<span class="op-spin">↻</span>
```

| CSS class | JavaScript effect | Behavior |
| --- | --- | --- |
| `op-fade-in`, `op-fade-out` | `fadeIn`, `fadeOut` | Fade in/out |
| `op-slide-up`, `op-slide-down` | `slideUp`, `slideDown` | Enter from below/above |
| `op-slide-left`, `op-slide-right` | `slideLeft`, `slideRight` | Enter from right/left |
| `op-zoom-in`, `op-zoom-out` | `zoomIn`, `zoomOut` | Grow in/shrink out |
| `op-pulse` | `pulse` | Scale pulse |
| `op-shake` | `shake` | Horizontal shake |
| `op-spin` | `spin` | Clockwise rotation |

Most CSS effects run once over 300ms, ease-out, with both fill. CSS spin defaults to a continuous 1-second linear loop. Use one effect per element; wrappers can compose effects.

## Timing

```html
<div class="op-slide-up op-fast">150ms</div>
<div class="op-slide-up op-slow">1 second</div>
<div class="op-pulse op-loop">Repeating</div>
<div class="op-spin op-paused">Paused</div>
<div class="op-fade-in" style="--op-duration:600ms;--op-delay:120ms;--op-repeat:2">
  Custom timing
</div>
```

Variables: `--op-duration`, `--op-delay` (CSS times), `--op-easing` (timing function), `--op-repeat` (count or infinite). Reapplying an already-present class may not restart an animation; use JavaScript for repeated event-driven effects.

## JavaScript

```javascript
const motion = _dy.animate('#card', 'fadeIn', { duration: 400, delay: 100 });
if (motion) {
  await motion.finished;
  motion.cancel(); // release retained animation styles
}
```

Targets are selectors for the first match or DOM elements. Returns a native Animation, not a promise. A missing target returns null; an unknown effect throws. Camel-case, dashed, and op-prefixed effect names work. `_dy.style.animate` is the same helper.

```javascript
const motion = _dy.animate(document.querySelector('#card'), 'slide-up', 500);
motion.pause();
motion.play();
motion.reverse();
motion.cancel();
```

A numeric third argument is duration in milliseconds. An object accepts native timing options: duration, delay, easing, iterations, direction, fill. JavaScript defaults to one iteration, including spin:

```javascript
const spinner = _dy.animate('#spinner', 'spin', { iterations: Infinity });
// Later: spinner?.cancel();
```

Do not await an infinite animation's finished promise. Cancellation rejects a running animation's finished promise if you are awaiting it. Animate a wrapper to preserve an existing transform on a child.

## Reduced motion and legacy effects

With prefers-reduced-motion: reduce, CSS effects run once at near-zero duration without delay. JavaScript uses zero duration, delay, and end delay, with one iteration. Legacy CSS effects honor this too.

Existing `animated fadeIn`, `animated bounceIn`, `animated zoomIn`, `animated slideInUp`, and `animated _pulse` remain. `animated flip` is supported; `pulse` aliases `_pulse`. `rotating` and `rotating-r` retain their own shorthand. New op-prefixed classes are the recommended single-class usage.

`_dy.style.animation()` returns all animation CSS for manual inspection/injection, which normal imports do not require.
