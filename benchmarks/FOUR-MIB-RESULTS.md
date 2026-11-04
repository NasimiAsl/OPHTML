# 4 MiB HTML comparison

Measured 2026-11-04. Exact canonical HTML size: **4,194,304 bytes** (4 MiB, approximately 4.19 decimal MB), with **10,000 rows × 10 columns = 100,000 cells**.

Environment: Chrome 156.0.8078.80, Apple M4 Max, darwin arm64, headless 1280 × 800, without CPU/network throttling.

10 measured samples per implementation after 3 discarded warmup rounds. Each sample uses a fresh page; adapter order rotates. Implementations run sequentially. Production browser builds are served locally, with no application compilation or bundling.

## Median milliseconds

| Implementation | First load + render | Initialized create | Update all cells | Clear |
| --- | ---: | ---: | ---: | ---: |
| Vanilla JS | 440.1 | 456.6 | 437.9 | 52.7 |
| Optimized OPHTML | 463.9 | 481.4 | 472.8 | 60.3 |
| Previous OPHTML | 480.7 | 500.5 | 494.1 | 60.3 |
| Vue 3.5.13 | 463.3 | 467.7 | 371.2 | 56.0 |
| Alpine 3.14.8 | 1150.5 | 1030.3 | 2106.7 | 531.1 |
| React 18.3.1 | 475.2 | 768.7 | 423.2 | 1179.3 |

## 95th-percentile milliseconds

| Implementation | First load + render | Initialized create | Update all cells | Clear |
| --- | ---: | ---: | ---: | ---: |
| Vanilla JS | 466.1 | 475.3 | 453.2 | 54.0 |
| Optimized OPHTML | 486.9 | 513.7 | 493.0 | 67.1 |
| Previous OPHTML | 504.9 | 524.9 | 519.4 | 67.3 |
| Vue 3.5.13 | 481.8 | 481.2 | 381.1 | 60.1 |
| Alpine 3.14.8 | 1192.0 | 1071.0 | 2186.7 | 581.6 |
| React 18.3.1 | 481.4 | 814.9 | 435.7 | 1291.3 |

## Interpretation

Optimized OPHTML reduced initialized creation from 500.5 to 481.4 ms (3.8% lower median), and was 5.4% slower than vanilla for that operation. Vue was faster for updating all cell text; OPHTML remained faster than Alpine and React for initialized creation in this workload. These are scenario results, not a general framework ranking.

The 4 MiB payload was generated and independently parsed to confirm exactly one section, 10,000 row divs, 100,000 spans, and no unresolved placeholders. Cell text is padded with ASCII x characters to reach the exact byte size. There is no comment filler, display:none bulk content, virtualization, or content-visibility. Standard fixed-height grid cells clip text overflow.

## Measurement boundaries

- The byte count describes canonical rendered row/cell HTML, excluding the containing document, CSS, library scripts, and framework-specific attributes/comments. The downloadable fixture is that exact HTML fragment.
- OPHTML uses a compact repeater template to generate 4 MiB of output. The fetched component source is not itself 4 MiB; this does not measure downloading or parsing a 4 MiB template source.
- Data generation and canonical-size verification happen before timing. No network fetch of the 4 MiB fixture is included.
- First load includes library loading/evaluation, application setup, rendering, DOM completion, and forced layout. OPHTML also fetches its compact component template. This is fresh-page startup, not a cold disk/browser process.
- Initialized creation starts with an empty mounted application and a loaded library. OPHTML reuses its component-source cache.
- Update all changes the first character of every cell while retaining row IDs. OPHTML and vanilla rebuild HTML; keyed Vue/React/Alpine implementations may reuse their DOM.
- Each timed operation checks row count and the last cell to detect DOM completion, then forces layout. Every one of the 100,000 cell values and every row identity are validated outside the timer after startup, creation, and update.
- Exhaustive validation is outside timers for this large scenario; the earlier small-list/grid scenarios included it. Their timings are not directly comparable. Paint/compositing, event handling, memory usage, scrolling performance, and network latency are not measured.
- Ten samples give a coarse tail estimate: nearest-rank p95 is the maximum of those ten samples.

## Artifacts and reproduction

Generator: [bulk-data.js](bulk-data.js). Adapters: [bulk-browser.js](bulk-browser.js). Runner: [run.mjs](run.mjs). See [README.md](README.md) for environment variables and Playwright/Chrome setup.

Use BENCH_SCENARIO=bulk, BENCH_ROUNDS=10, BENCH_WARMUPS=3, BENCH_BASELINE=/path/to/saved-runtime.js, and BENCH_NAMES=vanilla,ophtml-rerender,ophtml-baseline-rerender,vue,alpine,react. BENCH_FIXTURE saves the exact output fragment; BENCH_OUTPUT saves raw samples.

- Fixture: `/private/tmp/ophtml-4mib-fixture.html`.
- Raw results: `/private/tmp/ophtml-4mib-results.json`.
- Previous runtime: `/private/tmp/ophtml-before-optimization.js`.

Fixture SHA-256: `96d5121a4e9e731d44d8ea27c98e56478dc44b51c89e09b8c78b9782ff6e583e`.
Optimized runtime SHA-256: `11907a7de0063568eb3631a9373cb09b677a247daa54cf10d68fd775c4e7b5f2`.
Previous runtime SHA-256: `e50c903e732a2d2401dacd99baac68c447dc1836f28abfeabbc5131ac63837c9`.

No runtime changes were made for this benchmark. All adapters passed an initial smoke run and all repeated exhaustive DOM checks; benchmark JavaScript syntax checks and git diff --check passed.
