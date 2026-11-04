# HTMLElement hook benchmark results

Measured on 2026-11-04 against the final local runtime. Every report asset hash matches the delivered source.

Environment: Chrome 156.0.8078.80, Apple M4 Max, macOS arm64, headless, 1280 × 800, no CPU/network throttling. OPHTML package version remains 1.1.1 (local changes).

Runtime SHA-256: `e50c903e732a2d2401dacd99baac68c447dc1836f28abfeabbc5131ac63837c9`.

Each scenario uses 25 measured samples per implementation after three discarded warmup rounds, fresh pages, and rotating implementation order. Benchmarks run sequentially to avoid contention. All applications run without a compilation/build step. Libraries and templates are served locally, uncompressed.

## 200 rows × 10 columns

2,000 cells. The sparse update changes column zero on every second row (100 cells). Cached creation uses the source-template cache; uncached creation uses noCache: true with the module already loaded. Vanilla has no component cache, so the uncached column repeats normal creation. Execution order and JIT can affect repeated creation times.

### Median milliseconds

| Implementation | First load | Cached create | Update 100 | Replace | Clear | Uncached create |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Vanilla JS | 9.7 | 7.6 | 1.4 | 10.2 | 0.9 | 7.1 |
| OPHTML elements / rerender | 18.3 | 8.3 | 9.2 | 11.0 | 1.1 | 8.8 |
| OPHTML elements / direct DOM | 18.0 | 8.3 | 1.6 | 10.9 | 1.1 | 9.1 |
| OPHTML image hooks / rerender | 19.9 | 8.7 | 9.7 | 11.5 | 1.1 | 8.9 |
| OPHTML image hooks / direct DOM | 17.7 | 8.7 | 1.6 | 11.1 | 1.1 | 9.3 |

### 95th-percentile milliseconds

| Implementation | First load | Cached create | Update 100 | Replace | Clear | Uncached create |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Vanilla JS | 11.4 | 8.1 | 1.8 | 10.8 | 1.0 | 7.6 |
| OPHTML elements / rerender | 24.4 | 8.7 | 10.0 | 11.9 | 1.2 | 9.1 |
| OPHTML elements / direct DOM | 23.9 | 8.9 | 2.0 | 11.4 | 1.2 | 9.4 |
| OPHTML image hooks / rerender | 23.3 | 9.1 | 10.1 | 11.9 | 1.2 | 9.7 |
| OPHTML image hooks / direct DOM | 24.8 | 9.5 | 2.3 | 12.2 | 1.3 | 9.7 |

## 1,000-row list

Each row has a span and button; sparse updates change 100 labels. Vue, Alpine, and React use production builds and keyed declarative lists. React is pinned to 18.3.1 for its UMD distribution, not the newest release.

### Median milliseconds

| Implementation | First load | Cached create | Update 100 | Replace | Clear |
| --- | ---: | ---: | ---: | ---: | ---: |
| Vanilla JS | 8.6 | 7.1 | 0.9 | 8.8 | 0.8 |
| OPHTML elements / rerender | 20.9 | 9.4 | 10.2 | 11.5 | 0.9 |
| OPHTML elements / direct DOM | 18.5 | 9.3 | 0.8 | 11.3 | 0.9 |
| OPHTML image hooks / rerender | 17.2 | 9.8 | 10.5 | 11.9 | 1.0 |
| OPHTML image hooks / direct DOM | 19.1 | 9.9 | 0.9 | 11.8 | 1.0 |
| Vue 3.5.13 | 20.7 | 7.3 | 2.4 | 10.2 | 1.1 |
| Alpine 3.14.8 | 34.3 | 22.2 | 3.6 | 26.3 | 3.7 |
| React 18.3.1 | 20.0 | 9.2 | 4.1 | 12.3 | 3.3 |

### 95th-percentile milliseconds

| Implementation | First load | Cached create | Update 100 | Replace | Clear |
| --- | ---: | ---: | ---: | ---: | ---: |
| Vanilla JS | 9.2 | 7.6 | 1.1 | 9.3 | 0.9 |
| OPHTML elements / rerender | 25.3 | 10.0 | 10.7 | 12.1 | 1.1 |
| OPHTML elements / direct DOM | 23.0 | 9.8 | 0.9 | 11.7 | 1.1 |
| OPHTML image hooks / rerender | 24.8 | 10.4 | 10.9 | 12.8 | 1.1 |
| OPHTML image hooks / direct DOM | 25.7 | 10.3 | 1.1 | 12.1 | 1.1 |
| Vue 3.5.13 | 28.6 | 7.8 | 2.7 | 10.8 | 1.3 |
| Alpine 3.14.8 | 38.8 | 23.3 | 3.9 | 27.1 | 4.3 |
| React 18.3.1 | 27.1 | 9.7 | 4.4 | 13.0 | 3.6 |

## Interpretation and limits

Element triggers modestly reduced warm creation time in these runs. They do not remove template substitution or full-grid DOM replacement. Sparse native DOM updates remain much cheaper than rebuilding a list; those measurements reflect application textContent assignments, not automatic OPHTML reactivity. Startup varies appreciably; these runs do not establish a reliable startup advantage for either OPHTML mode. Small median differences with overlapping distributions are not evidence of a general framework speed ranking.

Timers include DOM correctness checks for every row/cell and forced layout, excluding paint/compositing. First load includes local library evaluation/setup, initial rendering, and the OPHTML component fetch. The other operations use initialized applications; OPHTML templates are cached except for the explicit uncached measurement. The two variants of each OPHTML mode share rendering/startup code and differ only in the sparse update method; other differences reflect sample variation.

The grid/list benchmarks exercise repeater activation. Switch, component loader, if/else, nested conditions, inactive loaders, synchronous background initialization, repeated imports, the runnable native example, legacy mode, the store, and the gallery are covered by the browser suite. All 64 browser tests passed; npm run check passed. render() still does not await every mounted descendant.

Source and reproduction instructions: [README.md](README.md), [run.mjs](run.mjs), [browser.js](browser.js), [grid-browser.js](grid-browser.js).

Raw samples, timestamps, environment metadata, and all asset hashes:

- `/private/tmp/ophtml-grid-elements-results.json`
- `/private/tmp/ophtml-list-elements-results.json`
