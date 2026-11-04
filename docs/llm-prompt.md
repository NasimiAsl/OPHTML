# Build OPHTML apps by prompt

Use the first prompt with a coding agent that can read this repository or fetch its files. For a chat model without file access, paste `llms-full.txt` followed by the project request.

## Copy this prompt

```text
You are building an app using OPHTML 1.1.0 (Over Powered HTML).
Repository: https://github.com/NasimiAsl/OPHTML

Read llms.txt and docs/templates.md, docs/api.md, docs/styles.md,
docs/animations.md. If you cannot access them, ask me to paste llms-full.txt;
do not guess the framework API.

App: [describe the app, users, pages, data, and interactions]
Visual style: [colors, typography, layout, motion]
Existing project constraints: [paths, backend endpoints, files to preserve]

Implementation rules:
1. Import the default export from dyHTML/ophtml.js; const _dy = OPHTML.html.
   Keep the module self-contained. No React/Vue or invented OPHTML APIs.
2. Set _dy.root to the real component directory. Load .htm templates using
   await _dy.render(name, params), then insert the returned HTML. Configure
   _dy.style.use(...) once with the full custom token configuration.
3. Use $$parameter, #is value EXPR #then/#else/#end, #if, or documented
   define forms. For per-item directives use #_is/#_if/#_then/#_else/#_end
   and #_dy(EXPR#_). Repeat arrays of objects, not primitive arrays.
4. Give every consuming repeater/loader its own wrapper. Put headings outside
   that wrapper. Do not reuse outer parameter names as item display fields.
   Avoid nested repeaters; compose separately loaded components instead.
5. Use normal JS event handlers or delegation. No automatic reactive state.
   Explicitly rerender or update DOM. In component initialization scripts
   $$_name is state; in ordinary inline markup reference
   _dy.TsID[$$TID].method(...), not a bare $$_method.
6. Prefer one-class op-fade-in/op-slide-up effects. _dy.animate returns a native
   Animation or null; await animation.finished, not _dy.animate itself.
7. Treat templates/expressions as trusted code. Escape or sanitize untrusted
   values for their actual HTML/attribute/URL destination. Never interpolate
   user text directly into executable handlers or expressions.
8. Serve over HTTP. render() does not await inserted custom-tag hooks or
   nested network requests; browser verification must wait for actual DOM.
9. Output complete file paths and file contents, real setup/run commands,
   a short explanation, and verification results. Do not fabricate test runs.

Start with a small working vertical slice, then finish the requested app.
```

## Useful follow-up prompts

**A new component:**

```text
Using this repo's OPHTML docs, add components/[name].htm and its caller.
Inputs: [list]. Interactions: [list]. Keep _dy.root/render and existing tokens.
Show how callers pass data and handle rendering errors. Verify in a browser.
```

**A theme change:**

```text
Update the OPHTML theme to [description] using _dy.style.use(config).
Preserve existing token names and provide the full custom configuration on
each use() call. Retain layout behavior at exact responsive breakpoints.
```

**Animation:**

```text
Add subtle OPHTML animations to [elements]. Prefer op-slide-up/op-fade-in.
Use _dy.animate for replay on events; handle its Animation return type and
preserve existing transforms with wrappers. Respect reduced-motion behavior.
```

**Fix generated code:**

```text
Compare this code against the real OPHTML 1.1.0 source and docs.
Fix invented APIs, unescaped repeater directives, wrapper replacement bugs,
incorrect state handlers, and assumptions about nested render completion.
Preserve the existing user workflow. Run the relevant browser tests.
```

## Review checklist

- Import/root/component paths exist and match case.
- The default export is used as an object, not called as a constructor.
- Objects/arrays are passed in JavaScript, not hand-built JSON strings.
- Every per-item directive uses escaped syntax; every condition has an end.
- Wrappers contain only the custom content they are intended to replace.
- Event handlers use real DOM/state references, with explicit UI updates.
- Animation return types and completion are correct.
- HTTP errors and empty data have usable UI states.
- Code runs over HTTP and inserted component DOM was checked.
