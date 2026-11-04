# Runtime optimization results

Measured 2026-11-04 on Apple M4 Max, macOS arm64, Chrome 156.0.8078.80. Browser applications ran directly, without compilation or bundling.

The optimized and saved previous runtimes were compared in the same run, on isolated fresh pages with rotating execution order. Each scenario used 25 recorded samples after three discarded warmup rounds. Grid and list scenarios ran sequentially.

## Changes

- Normalize deferred repeater syntax once per list instead of once per row.
- Reuse placeholder-matching regular expressions in a bounded 128-entry cache keyed by parameter names. Values and object references are still resolved freshly.
- Skip the hash-directive parser for templates containing no hash character.

No public rendering API or template syntax changed. There is no new reactive binding, row HTML cache, DOM diffing, or build step. Component source caching remains independent.

A Chrome CPU profile of the previous runtime identified repeated String.replaceAll and substitute work under elementPageRepeat. Most end-to-end time also includes DOM and layout, which these changes do not remove.

## Before and after

Median milliseconds. Update means rerendering the entire list/grid to change 100 labels/cells. Vanilla uses direct textContent changes for that operation, so it performs less DOM work.

| Workload | Operation | Previous OPHTML | Optimized OPHTML | Reduction | Vanilla |
| --- | --- | ---: | ---: | ---: | ---: |
| 1,000 rows | Cached creation | 9.6 | 7.9 | 17.7% | 7.0 |
| 1,000 rows | Update 100 | 10.3 | 9.0 | 12.6% | 0.9 |
| 1,000 rows | Replace all | 11.6 | 9.9 | 14.7% | 8.9 |
| 200 × 10 cells | Cached creation | 8.3 | 8.1 | 2.4% | 7.7 |
| 200 × 10 cells | Update 100 | 9.3 | 8.8 | 5.4% | 1.5 |
| 200 × 10 cells | Replace all | 11.1 | 10.6 | 4.5% | 10.0 |

The 1,000-row workload showed the larger improvement. Grid creation improved only 0.2 ms; its distributions overlap, so this small median difference is not a strong speed claim. Startup did not reliably improve. These results apply to these workloads and this machine.

## 1,000-row list

### Medians

| Implementation | First load | Cached create | Update 100 | Replace | Clear |
| --- | ---: | ---: | ---: | ---: | ---: |
| Vanilla JS | 8.3 | 7.0 | 0.9 | 8.9 | 0.8 |
| Optimized OPHTML | 18.4 | 7.9 | 9.0 | 9.9 | 0.9 |
| Previous OPHTML | 17.8 | 9.6 | 10.3 | 11.6 | 1.0 |

### 95th percentiles

| Implementation | First load | Cached create | Update 100 | Replace | Clear |
| --- | ---: | ---: | ---: | ---: | ---: |
| Vanilla JS | 9.0 | 7.5 | 1.1 | 9.4 | 0.9 |
| Optimized OPHTML | 26.0 | 8.5 | 9.5 | 10.3 | 1.1 |
| Previous OPHTML | 25.5 | 10.1 | 10.9 | 12.5 | 1.1 |

## 200-row × 10-column grid

### Medians

| Implementation | First load | Cached create | Update 100 | Replace | Clear | Uncached create |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Vanilla JS | 9.8 | 7.7 | 1.5 | 10.0 | 0.9 | 7.1 |
| Optimized OPHTML | 20.7 | 8.1 | 8.8 | 10.6 | 1.1 | 8.5 |
| Previous OPHTML | 20.2 | 8.3 | 9.3 | 11.1 | 1.0 | 8.9 |

### 95th percentiles

| Implementation | First load | Cached create | Update 100 | Replace | Clear | Uncached create |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Vanilla JS | 12.1 | 8.3 | 1.8 | 11.1 | 1.0 | 7.7 |
| Optimized OPHTML | 25.7 | 8.6 | 9.4 | 11.0 | 1.2 | 9.2 |
| Previous OPHTML | 26.5 | 8.8 | 10.0 | 12.0 | 1.4 | 9.4 |

## Validation and reproduction

npm run check passed. All 66 browser tests passed, including fresh substitution values, cache eviction, changing row shapes, deferred condition/expression ordering, element hooks, legacy mode, controller initialization, and the runnable store/gallery/native examples.

Timings include DOM correctness checks and forced layout, excluding paint/compositing. The grid verifies every one of its 2,000 cells. No CPU/network throttling was used. Templates and scripts were served from localhost. First load includes module setup and the first component fetch. Cached operations reuse the component source cache. Explicit uncached creation uses noCache: true with the runtime loaded; vanilla simply repeats creation.

Use [README.md](README.md) with BENCH_BASELINE pointing at a saved runtime, BENCH_NAMES=vanilla,ophtml-rerender,ophtml-baseline-rerender, and separate BENCH_OUTPUT paths. Set BENCH_SCENARIO=grid for the grid workload.

Previous runtime SHA-256: `e50c903e732a2d2401dacd99baac68c447dc1836f28abfeabbc5131ac63837c9`.
Optimized runtime SHA-256: `11907a7de0063568eb3631a9373cb09b677a247daa54cf10d68fd775c4e7b5f2`.

The saved previous runtime is `/private/tmp/ophtml-before-optimization.js`. Raw results and the diagnostic profile are outside the repository:

- `/private/tmp/ophtml-grid-optimized.json`
- `/private/tmp/ophtml-list-optimized.json`
- `/private/tmp/ophtml-before.cpuprofile`
