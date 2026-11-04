# Contributing

The browser runtime is `dyHTML/ophtml.js`. There is no build step or runtime package dependency. `package.json` is private; this repository does not claim an npm package has been published.

## Run the example

```sh
python3 -m http.server 8000
```

Run from the repository root and open `http://localhost:8000/examples/store/`.

## Validate a change

Use Node.js 22 or newer:

```sh
npm ci
npx playwright install chromium
npm run check
npm test
```

On Linux CI, `npx playwright install --with-deps chromium` installs browser system dependencies too. Tests start a temporary HTTP server on `127.0.0.1` and a temporary headless browser profile, then close both. Runtime tests check actual DOM hooks. The example test runs the files linked in the README and exercises their controls.

To reuse installed Playwright and Chrome:

```sh
OPHTML_PLAYWRIGHT_MODULE=/absolute/path/to/playwright-core \
OPHTML_BROWSER_PATH=/absolute/path/to/chrome \
npm test
```

`OPHTML_PLAYWRIGHT_MODULE` can also point to an installed `playwright` package. Omit both variables for normal `npm ci` + bundled Chromium usage.

Keep original dyHTML/dyStyle files as references. Test public behavior before changing it. Update the guides and `llms-full.txt` when APIs change; LLM-facing snippets must use the same API as the runnable example. Add targeted browser regressions for meaningful fixes.
