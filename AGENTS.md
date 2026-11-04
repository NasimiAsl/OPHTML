# Working on OPHTML

Read `llms.txt` and the relevant `docs/` pages before changing framework usage or generating an app.

- `dyHTML/ophtml.js` is the current self-contained browser runtime. The other two files in `dyHTML/` are legacy references; preserve them.
- Preserve `_dy.render`, `_dy.root`, `.htm` components, the default `{ html, script, style }` export, and legacy `_dy`, `_dyScript`, and `_dyStyle` globals.
- Keep rendering and styling changes backward compatible unless the user requests a breaking change.
- Use this runtime's actual syntax. Do not invent component, reactive state, event-binding, or animation APIs.
- Per-item directives in repeaters use escaped `#_` forms. Give each repeater/loader its own wrapper because its hook replaces the wrapper's content.
- Do not claim rendering awaits nested custom-tag hooks. Check inserted DOM in a real browser.
- Run `npm run check` and `npm test` for runtime changes. Browser tests may use `OPHTML_PLAYWRIGHT_MODULE` and `OPHTML_BROWSER_PATH` when Playwright/Chrome is already installed.
- Keep `README.md`, the API guides, `llms-full.txt`, and runnable examples aligned.
- Never commit local secrets, `.DS_Store`, dependencies, browser profiles, or test output.
