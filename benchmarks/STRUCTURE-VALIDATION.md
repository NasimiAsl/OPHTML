# Runtime structure and lifecycle validation

Validated 2026-11-04. The refactor preserves the self-contained browser module and build-free deployment. It adds explicit component ownership and cleanup and organizes internal responsibilities.

## Compatibility and behavior

- All 67 pre-refactor facade properties remain available. The default export is still exactly {html, script, style}; constructor and legacy global aliases remain compatible.
- Rendering, templates, expressions, DOM helpers, requests, controllers, styles/motion, and compatibility installers have named internal boundaries. Trusted executable JavaScript is confined to one evaluation helper.
- Component state/reference ownership is centralized. onDispose, dispose, unmount, and isDisposed provide explicit cleanup. Children clean up before parents; callbacks run in reverse registration order and may be asynchronous.
- Cleanup aborts owned component requests, blocks late DOM commits, and cancels pending detached mounts. Failures aggregate after other resource cleanup. Engine-owned reference indexes are deleted without shifting live indexes.
- Application-held state fields/descriptors are preserved, including nonconfigurable properties. Temporary expression globals are restored after nested evaluation or errors.
- Store and gallery rerenders release old component IDs. The runnable lifecycle example owns and releases a real listener and interval.

## Verification

npm run check passed. All 81 browser tests passed. Coverage includes existing render/template/style/animation behavior, native and legacy hook parity, examples and mobile interactions, the original facade properties, exact managed-wrapper lookup with legacy loader targeting, cleanup/unregister ordering, concurrency/idempotence, nested ownership, cleanup errors, request/initialization cancellation, pending detached mounts, readonly application fields, timer/listener release, and repeated mount/unmount cycles.

The repeated-cycle test leaves zero live managed state, temporary-object, and repeater entries. This verifies reference release; it is not a complete heap/memory benchmark. Documentation local links and git diff --check also passed.

## Regression measurements

Environment: Chrome 156.0.8078.80, Apple M4 Max, macOS arm64, headless 1280 × 800. Saved pre-refactor and current runtimes run on isolated fresh pages in rotating order, with scenarios executed sequentially.

List/grid runs: 25 samples each after three discarded warmups. The 4 MiB stress run: five samples after one discarded warmup. Smaller runs include exhaustive DOM validation and layout in timing; bulk validation occurs outside timers. Paint is excluded in every scenario.

| Workload | Operation | Previous (ms) | Refactored (ms) |
| --- | --- | ---: | ---: |
| 1,000 rows | First load | 20.3 | 20.2 |
| 1,000 rows | Initialized creation | 8.2 | 8.2 |
| 1,000 rows | Update 100 / full rerender | 9.2 | 9.3 |
| 1,000 rows | Replace rows | 10.0 | 10.2 |
| 1,000 rows | Clear | 0.9 | 1.0 |
| 200 × 10 cells | First load | 21.2 | 21.5 |
| 200 × 10 cells | Initialized creation | 7.8 | 7.9 |
| 200 × 10 cells | Update 100 / full rerender | 8.7 | 8.9 |
| 200 × 10 cells | Replace rows | 10.6 | 10.7 |
| 200 × 10 cells | Clear | 1.1 | 1.1 |
| 4 MiB / 100,000 cells | First load | 471.9 | 471.4 |
| 4 MiB / 100,000 cells | Initialized creation | 485.7 | 487.9 |
| 4 MiB / 100,000 cells | Update all text | 477.3 | 483.1 |
| 4 MiB / 100,000 cells | Clear | 61.7 | 62.0 |

Warm list/grid operations were close in these runs. In the five-sample bulk run, creation was 487.9 versus 485.7 ms and update-all was 483.1 versus 477.3 ms. This is a structural/lifecycle refactor, not a speed optimization; these limited samples do not establish a general performance ranking. Raw samples and percentiles are retained below.

## Footprint and limits

- Previous runtime: 93,521 bytes; gzip level 9: 22,190 bytes.
- Refactored runtime: 117,793 bytes; gzip level 9: 25,315 bytes.
- Readable layering and lifecycle handling add code; no runtime dependencies or build step were added. Package version remains 1.1.1 with local unreleased changes.
- Cleanup is explicit. Manually inserted render strings need their TID retained; plain innerHTML replacement does not infer all ownership. Arbitrary app resources need registered cleanup callbacks.
- Legacy globals/string extensions and trusted eval/raw interpolation remain for compatibility. There is no automatic reactive binding, full-subtree readiness promise, or new sandbox.

See [architecture](../docs/architecture.md), [API](../docs/api.md), and the [lifecycle example](../examples/lifecycle/index.html).

Current source SHA-256: `d8686d6b49ba77abb6c84af59939d9963512e5cd4367283d646a618660d04dda`.
Previous source SHA-256: `11907a7de0063568eb3631a9373cb09b677a247daa54cf10d68fd775c4e7b5f2`.

Raw benchmark results are outside the repository:

- `/private/tmp/ophtml-structure-list.json`
- `/private/tmp/ophtml-structure-grid.json`
- `/private/tmp/ophtml-structure-bulk.json`
