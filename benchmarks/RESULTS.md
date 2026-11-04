# Browser benchmark results

Measured on 2026-11-04. Lower values are faster. All values are milliseconds.

Environment: Chrome 156.0.8078.80, darwin arm64, Apple M4 Max; headless, 1280 × 800, no CPU/network throttling.

25 measured samples per implementation after three discarded warmup rounds. Each sample uses a fresh page; execution order rotates. Libraries are pinned production builds served locally, without an application build step.

| Implementation | Startup | Create 1,000 | Update 100 labels | Replace 1,000 | Clear |
| --- | ---: | ---: | ---: | ---: | ---: |
| Vanilla JS | 8.4 | 7.1 | 0.9 | 8.8 | 0.7 |
| OPHTML 1.1.1 — rerender | 19.7 | 10.0 | 10.5 | 12.1 | 1.0 |
| OPHTML 1.1.1 — explicit DOM update | 21.9 | 10.0 | 0.9 | 11.8 | 1.0 |
| Vue 3.5.13 | 23.3 | 7.4 | 2.4 | 10.1 | 1.1 |
| Alpine 3.14.8 | 33.3 | 22.3 | 3.6 | 26.5 | 3.9 |
| React 18.3.1 | 23.3 | 9.4 | 4.1 | 12.7 | 3.4 |

The table shows medians. Startup includes loading/evaluating the local library, setup, and rendering 1,000 rows, including the initial component request for OPHTML. Later operations use already initialized applications and a warm OPHTML template cache. All timers include DOM correctness checks and forced layout, but exclude paint/compositing.

OPHTML explicit DOM updates use native textContent assignments, matching the vanilla adapter. They do not demonstrate automatic reactive updates. Both OPHTML variants otherwise use the same render/repeater implementation. Their small startup difference reflects measurement variation.

In this scenario, OPHTML created and replaced rows faster than Alpine. Vue was faster than OPHTML for warm creation and sparse declarative updates. Explicit DOM updates were substantially faster than rerendering the entire OPHTML list. These results do not establish a general framework ranking.

## 95th percentile

| Implementation | Startup | Create 1,000 | Update 100 labels | Replace 1,000 | Clear |
| --- | ---: | ---: | ---: | ---: | ---: |
| Vanilla JS | 9.1 | 7.6 | 1.1 | 9.4 | 0.8 |
| OPHTML 1.1.1 — rerender | 26.7 | 10.9 | 11.3 | 12.7 | 1.1 |
| OPHTML 1.1.1 — explicit DOM update | 26.2 | 10.4 | 1.0 | 12.3 | 1.1 |
| Vue 3.5.13 | 28.3 | 7.9 | 2.6 | 10.8 | 1.3 |
| Alpine 3.14.8 | 40.7 | 23.3 | 4.0 | 27.8 | 4.2 |
| React 18.3.1 | 28.1 | 10.2 | 4.5 | 13.8 | 4.6 |

See [README.md](README.md) for methodology, limitations, pinned versions, and reproduction instructions. Raw samples and asset SHA-256 hashes for this run are saved outside the repository at `/private/tmp/ophtml-benchmark-results.json`. No runtime files were changed by this benchmark.
