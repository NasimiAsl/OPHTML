# Local browser benchmark

Run `node benchmarks/run.mjs` with Playwright installed, or set
`OPHTML_PLAYWRIGHT_MODULE` to an existing Playwright installation and
`OPHTML_BROWSER_PATH` to Chrome. No application compilation or bundling occurs.
The harness downloads pinned production browser builds into the OS temporary
directory; `BENCH_VENDOR_DIR` can supply already downloaded copies.

Results default to the OS temporary directory as `ophtml-benchmark-results.json`.
Override with `BENCH_OUTPUT`. `BENCH_ROUNDS` defaults to 25, after three discarded
warmup rounds. Every sample uses a fresh page; framework order rotates each round.

All implementations create the same 1,000 rows, each with a span and button.
Measured operations, in milliseconds:

- `startup`: local library loading/evaluation, setup, and first 1,000-row render.
  OPHTML additionally fetches its component file. CDN/internet delays, navigation,
  and HTML loading are excluded. This is fresh-page startup, not cold disk/process.
- `create`: populate an empty, initialized application with 1,000 rows.
- `update`: change the label of every tenth row (100 labels).
- `replace`: replace all 1,000 rows with different IDs.
- `clear`: remove all rows.

Each timer includes asynchronous DOM completion, correctness checking of every
row's ID/text, and forced layout. Paint/compositing is excluded. Small results
include validation overhead and should not be treated as engine-only timings.
There are no animations, utility styles, event listeners on rows, or CPU/network
throttling. All libraries are served uncompressed from the same local HTTP server.
Each implementation runs alone; OPHTML's global changes cannot affect competitors.

The harness now includes both HTMLElement connection triggers (`ophtml-rerender`,
`ophtml-dom`) and the preserved image triggers (`ophtml-legacy-rerender`,
`ophtml-legacy-dom`), selected with `_dy.hookMode`. This compares the two modes
using the same runtime source, alongside the other libraries. Historical result
files predate this change; see ELEMENTS-RESULTS.md for the new runs.

Vue and Alpine use keyed declarative templates; React uses keyed createElement
calls with its normal async root rendering. Vue's runtime template compilation is
included in startup. React 18.3.1 is deliberately pinned for its production UMD
distribution; this is not a claim about the newest React. Versions and source
hashes are saved in the JSON report.

`ophtml-rerender` uses the documented file-based render/repeater workflow for all
operations. `ophtml-dom` uses that same workflow except for sparse updates, where
it explicitly changes DOM text, matching the vanilla adapter. That update measures
application DOM code, not an OPHTML reactive engine. Vanilla uses innerHTML for
create/replace/clear. OPHTML's repeater image hooks are awaited by checking the
actual inserted DOM, not just awaiting render(). Component cache is warm for
create/update/replace/clear. OPHTML reference collections are not manually reset.

This is a small, reproducible scenario benchmark, not the JS Framework Benchmark,
a production application simulation, or a general ranking of frameworks.

## 200 × 10 grid

Set `BENCH_SCENARIO=grid` to compare vanilla JS and the two OPHTML update methods
using 200 rows and 10 text cells per row (2,000 cells). This scenario needs no
external library downloads. Each row uses CSS Grid with ten equal-width columns.
All 2,000 cell values and row identities are verified before layout is measured.
The update changes column zero on every second row, totaling 100 cells.
`uncachedCreate` populates an empty grid with the library already loaded and
OPHTML's `noCache: true`; this includes another localhost template request.
For vanilla it repeats normal creation because there is no component cache.
Use a separate `BENCH_OUTPUT` path to preserve the earlier list results.

## Optimization comparisons and profiling

Set `BENCH_BASELINE=/absolute/path/to/saved-runtime.js` to serve an earlier runtime
as a separate adapter. `ophtml-baseline-rerender` and `ophtml-baseline-dom` use the
saved module with element hooks, in isolated fresh pages. Source hashes for both
versions are saved in the result JSON. Use
`BENCH_NAMES=vanilla,ophtml-rerender,ophtml-baseline-rerender` to select only those
adapters; omit it for the full comparison. See OPTIMIZATION-RESULTS.md.

Set `BENCH_PROFILE=/absolute/path/to/output.cpuprofile` to capture a Chrome CPU
profile of the first discarded OPHTML warmup sample. Profiling overhead does not
affect recorded samples. Open the profile in Chrome DevTools to inspect rendering
costs. Keep raw profiles, downloaded libraries, and result JSON outside the repo.

## 4 MiB HTML workload

Set `BENCH_SCENARIO=bulk` to render 10,000 rows × 10 columns (100,000 cells).
`bulk-data.js` generates deterministic ASCII data whose canonical serialized HTML
is exactly 4,194,304 bytes, excluding document/CSS/framework scaffolding. This is
4 MiB (about 4.19 decimal MB). Cell text uses ASCII x padding to reach the exact
size. There is no comment padding, display:none bulk content, virtualization, or
content-visibility; cells use the same fixed-height grid and text clipping rules.

Set `BENCH_FIXTURE=/absolute/path/to/fixture.html` to save that exact HTML fragment
for inspection. The generator is the source artifact; keep the generated file
outside the repo. OPHTML uses a compact repeater component to produce this output;
its fetched template source is not itself 4 MiB. Other adapters produce equivalent
row/cell content; framework-specific attributes/comments are not counted in the
canonical byte size.

`startup` includes library loading/setup and the first full render. `create`
populates an empty initialized application (OPHTML component source is cached).
`updateAll` replaces every cell's text while retaining row IDs: OPHTML and vanilla
rebuild the HTML; keyed Vue/React/Alpine adapters can retain elements. `clear`
removes all rows. Data generation occurs before timers start. All cells are fully
validated after each operation, outside its timer. Timers include a row-count and
last-cell completion check and forced layout, excluding paint/compositing. This
differs from the smaller scenarios, which time exhaustive validation too.

Use `BENCH_ROUNDS=10 BENCH_WARMUPS=3` for the heavy workload. `BENCH_WARMUPS` defaults
to three for every scenario. Recommended adapters with a saved baseline are
`BENCH_NAMES=vanilla,ophtml-rerender,ophtml-baseline-rerender,vue,alpine,react`.
See FOUR-MIB-RESULTS.md for the measured run and source hashes.
