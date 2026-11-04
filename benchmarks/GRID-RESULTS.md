# 200-row × 10-column grid results

Measured 2026-11-04 in headless Chrome 156.0.8078.80 on Apple M4 Max,
macOS arm64, viewport 1280 × 800, without throttling. OPHTML 1.1.1.
25 samples per implementation after three discarded warmup rounds; each sample
uses a fresh page, with implementation order rotated between rounds.

Each grid has 200 row elements and 2,000 text cells, styled with identical CSS
Grid rules. Every row ID and all 2,000 cell values are checked. Timers include
these checks, asynchronous DOM completion, and forced layout, but exclude paint.
Both implementations run directly without an application build step.

Median milliseconds (lower is faster):

| Operation | Vanilla JS | OPHTML rerender | OPHTML direct cell updates |
| --- | ---: | ---: | ---: |
| Library setup + first complete grid | 9.9 | 17.9 | 20.7 |
| Create grid, initialized application / cached component | 7.7 | 8.6 | 8.7 |
| Update 100 cells | 1.5 | 9.8 | 1.5 |
| Replace all rows with new IDs | 10.1 | 11.6 | 10.9 |
| Clear grid | 0.8 | 1.1 | 1.0 |
| Create grid with OPHTML component cache bypassed | 7.1 | 9.2 | 9.4 |

95th-percentile milliseconds:

| Operation | Vanilla JS | OPHTML rerender | OPHTML direct cell updates |
| --- | ---: | ---: | ---: |
| Library setup + first complete grid | 11.7 | 26.0 | 26.2 |
| Create grid, initialized application / cached component | 8.2 | 9.3 | 9.6 |
| Update 100 cells | 1.8 | 10.4 | 1.8 |
| Replace all rows with new IDs | 10.8 | 12.8 | 11.8 |
| Clear grid | 1.0 | 1.3 | 1.1 |
| Create grid with OPHTML component cache bypassed | 7.5 | 9.6 | 10.0 |

The update changes the first column of every second row. Vanilla and the OPHTML
direct-update variant assign native textContent; OPHTML rerender rebuilds the
whole grid. Direct updates measure application code, not automatic OPHTML binding.
The two OPHTML variants otherwise use identical rendering code; timing differences
are measurement variation, not different startup or rendering implementations.

Startup includes local module loading and the first component fetch for OPHTML.
Cached creation uses OPHTML's built-in source-template cache. Cache-bypassed
creation runs last, with noCache: true, and includes a localhost template fetch;
the module remains loaded. Vanilla has no template fetch/cache and simply repeats
creation in that last measurement. Therefore its two creation numbers differ
through execution order/JIT/measurement variation. This is not a paired experiment
isolating the exact cost of caching, nor a measurement of internet latency.

OPHTML's median cached creation was 0.9 ms slower than vanilla in the rerender
variant. Native cell updates matched vanilla; full-grid rerenders cost more.
These numbers describe this workload on this machine, not a general speed claim.

Reproduce using the instructions in [README.md](README.md), with
BENCH_SCENARIO=grid and a separate BENCH_OUTPUT. Raw samples, asset hashes, and
environment metadata: `/private/tmp/ophtml-grid-benchmark-results.json`.
