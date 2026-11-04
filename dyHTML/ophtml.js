/**
 * ophtml 1.1.1 — successor to dyHTML v2.0.01.
 *
 * Replace the old module import with:
 *   import engine from './ophtml.js';
 *   const _dy = engine.html;
 *   _dy.root = '/components/';
 *   document.querySelector('#app').innerHTML = await _dy.render('products', data);
 *
 * Existing _dy / _dyScript globals, default { html, script } export, .htm files,
 * custom tags, $$ parameters, $$_ state, $$$item, and script markers remain.
 * _ophtml / _ophtmlScript and the named ophtml export are additional aliases.
 * Styles are included: engine.style === _dy.style === window._dyStyle.
 *   _dy.style.use({ colors: { brand: '#1462ab' }, sizes: { card: '320px' } });
 * The original init(css), live(id, css), generator methods, and class names work.
 * New use(options, id?) builds and installs utilities using configurable defaults.
 * nasted() keeps its legacy name; nested() is an additional alias.
 *
 * Animation CSS is installed once on import. One class is enough:
 *   <div class="op-fade-in">Hello</div>
 *   <div class="op-slide-up op-slow" style="--op-delay:100ms">Hello</div>
 *   <span class="op-spin">...</span>
 * JavaScript returns a native Animation (null for a missing element):
 *   const motion = _dy.animate('#card', 'fadeIn', { duration: 400 });
 *   await motion.finished; // motion.cancel() stops it and releases its styles.
 * Effects: fadeIn/Out, slideUp/Down/Left/Right, zoomIn/Out, pulse, shake, spin.
 * CSS also accepts --op-duration, --op-delay, --op-easing, --op-repeat;
 * op-fast/op-slow/op-loop/op-paused are optional modifiers.
 * Existing animated + fadeIn/bounceIn/etc. classes remain available.
 * Animations honor prefers-reduced-motion. Font icons require the user's font.
 *
 * Conditions: #is value EXPR #then ... #else ... #end
 *             #is define KEY ... #else ... #end
 *             #is not define KEY ... #else ... #end
 * #then is optional for define forms. #if EXPR #then is an additional alias.
 * Nested conditions and #dy(EXPR#) work. Repeaters defer directives with #_is,
 * #_if, #_then, #_else, #_end, #_dy(...#_).
 * Definition checks retain legacy truthiness; "not define" means undefined.
 *
 * render / renderTemplate reject on loading or script errors. render(..., true)
 * returns { html, data }; TID identifies the component in _dy.TsID.
 * Awaiting render waits for its own initialization and background script.
 * Repeater/switch/loader hooks use HTMLElement connection signals after insertion.
 * Set html.hookMode = 'legacy' for the original image-load signals.
 * Templates, inline handlers, and scripts remain trusted executable code.
 * Interpolation remains raw HTML; sanitize untrusted content before passing it.
 */
// Bound this cache: applications can render components with changing data shapes.
const substitutionPatterns = new Map();
const substitutionPatternLimit = 128;
// Errors keep their original type/message; context is shared by render and hooks.
function contextualError(cause, context) {
    const error = cause instanceof Error ? cause : new Error(String(cause), { cause });
    try {
        error.ophtml = { ...context, ...error.ophtml };
    }
    catch { /* A caller may throw a frozen Error. Preserve it unchanged. */ }
    return error;
}
function def(value, fallback) {
    return value !== undefined && value !== null ? value : fallback ?? null;
}
// Executable templates and legacy scripts deliberately share one trusted boundary.
const trustedScripts = {
    expression(source) { return window.eval('(' + source + '\n)'); },
    execute(source) { return window.eval(source); },
};
// Explicit ownership leaves legacy arrays/indexes intact while enabling disposal.
const componentState = {
    records: new Map(),
    pendingMounts: new WeakMap(),
    ensure(engine, tid) {
        const state = engine.TsID[tid] || (engine.TsID[tid] = {});
        let record = this.records.get(tid);
        if (!record || record.state !== state) {
            record = { tid, state, engine, children: new Set(), objects: new Set(),
                items: new Set(), requests: new Set(), cleanups: new Set(), controllers: new Set(), disposed: false };
            this.records.set(tid, record);
        }
        return record;
    },
    create(engine, params, controller, parentTid) {
        const parameters = { ...params, TID: ++engine.temp_baseIdentity };
        engine.TsID[parameters.TID] = { ctrl: controller, ref: parameters };
        const record = this.ensure(engine, parameters.TID);
        if (controller)
            record.controllers.add(controller);
        record.mountTarget = controller && this.pendingMounts.get(controller);
        const parent = this.records.get(parentTid);
        if (parent && !parent.disposed) {
            record.parentTid = parentTid;
            parent.children.add(record.tid);
        }
        return { parameters, record };
    },
    assertActive(target) {
        const record = typeof target === 'object' ? target : this.records.get(target);
        if (record?.disposed) {
            throw contextualError(new DOMException('ophtml: component was disposed', 'AbortError'), { phase: 'dispose', tid: record.tid });
        }
    },
    retainObject(engine, value, tid) {
        const id = ++engine.temp_objectIden;
        engine.temp_object[id] = value;
        if (tid != null)
            this.ensure(engine, tid).objects.add(id);
        return id;
    },
    retainItem(engine, value, tid) {
        const index = engine.repRef.push(value) - 1;
        this.ensure(engine, tid).items.add(index);
        return index;
    },
    resolve(target) {
        if (typeof target === 'number' || typeof target === 'string') {
            const record = this.records.get(Number(target));
            return record ? [record] : [];
        }
        if (!target)
            return [];
        return [...this.records.values()].filter(record => {
            const controller = record.state.ctrl;
            return target.iden === record.tid || controller && (controller === target || target.contains?.(controller))
                || record.mountTarget && (target === record.mountTarget || target.contains?.(record.mountTarget))
                || [...record.controllers].some(node => node === target || target.contains?.(node));
        });
    },
    dispose(target) {
        const ordered = new Set();
        const visit = record => {
            if (ordered.has(record))
                return;
            // Parent links are only created by loaders; guard against user-mutated state.
            ordered.add(record);
            for (const childTid of record.children) {
                const child = this.records.get(childTid);
                if (child)
                    visit(child);
            }
        };
        for (const record of this.resolve(target))
            visit(record);
        const records = [...ordered].reverse();
        const pending = new Set(records.filter(record => record.disposed).map(record => record.disposal));
        const active = records.filter(record => !record.disposed);
        for (const record of active) {
            record.disposed = true;
        }
        const disposal = Promise.resolve().then(async () => {
            const errors = [];
            for (const promise of pending) {
                try {
                    await promise;
                }
                catch (error) {
                    errors.push(error);
                }
            }
            for (const record of active) {
                for (const request of record.requests) {
                    try {
                        request.abort();
                    }
                    catch (error) {
                        errors.push(error);
                    }
                }
                for (const cleanup of [...record.cleanups].reverse()) {
                    try {
                        await cleanup(record.state);
                    }
                    catch (error) {
                        errors.push(error);
                    }
                }
                for (const id of record.objects)
                    delete record.engine.temp_object[id];
                for (const index of record.items)
                    delete record.engine.repRef[index];
                if (record.engine.TsID[record.tid] === record.state)
                    delete record.engine.TsID[record.tid];
                this.records.get(record.parentTid)?.children.delete(record.tid);
                this.records.delete(record.tid);
                // Applications may retain immutable state snapshots. Release our
                // ownership rather than mutating their fields or descriptors.
                record.state = null;
                record.children.clear();
                record.objects.clear();
                record.items.clear();
                record.requests.clear();
                record.cleanups.clear();
                record.controllers.clear();
                record.mountTarget = null;
            }
            if (errors.length)
                throw contextualError(new AggregateError(errors, 'ophtml: component cleanup failed'), { phase: 'dispose' });
            return active.length;
        });
        for (const record of active)
            record.disposal = disposal;
        return disposal;
    },
};
export function dy() { }
;
// Runtime state: one compatibility-preserving store per engine.
function createRuntimeState() {
    return {
        JsIden: 0,
        temp_baseIdentity: 0,
        temp_objectIden: 0,
        temp_object: [],
        temp_img: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAABdJREFUKFNjZCASMBKpjmFUId6QIjp4AAppAAuXjCs4AAAAAElFTkSuQmCC`,
        TsID: [],
        TsName: [],
        repRef: [],
        dyHtmlExtensionFormat: ".htm",
        cacheComopunents: [],
        helpers: [],
        coreScript: [],
        coreThreadIdentity: 0,
        behindLoopContainer: [],
        rootUps: [],
        rootMoves: [],
        rootClick: [],
        rootWheel: [],
    };
}
// DOM selection and extraction.
const domApi = {
    address: function (r, d) {
        return String(d).split('.').reduce(function (value, key) {
            return value == null ? undefined : value[key];
        }, r);
    },
    element: function (s, p) {
        p = def(p, document);
        var sub = '';
        if (s.indexOf('->') != -1) {
            sub = s.split('->')[1];
            s = s.split('->')[0];
        }
        try {
            var rl = p.querySelector(s);
        }
        catch (e) {
            console.log(e, s, p);
            return null;
        }
        return (sub == '' ? rl : rl && rl[sub]);
    },
    elements: async function (s, f, e, b, p) {
        var sub = '';
        if (s.indexOf('->') != -1) {
            sub = s.split('->')[1].split(',');
            s = s.split('->')[0];
        }
        p = def(p, document);
        var rl = p.querySelectorAll(s);
        if (b)
            return b(rl);
        var vals = [];
        for (var r in rl) {
            if (rl[r] && rl[r].classList && sub != '') {
                var vl = {};
                for (var j in sub) {
                    if (sub[j].indexOf('>>') != -1) {
                        var val = await _dy.elements(sub[j].replace('>>', '->').split('|')[1], null, null, null, rl[r]);
                        var ky = sub[j].split('>>')[0].split('|')[0];
                        if (ky.indexOf('.') != -1) {
                            if (!vl[ky.split('.')[0]])
                                vl[ky.split('.')[0]] = [];
                            for (var iv in val) {
                                if (!vl[ky.split('.')[0]][iv])
                                    vl[ky.split('.')[0]][iv] = {};
                                vl[ky.split('.')[0]][iv][ky.split('.')[1]] = val[iv];
                            }
                        }
                        else {
                            if (!vl[ky])
                                vl[ky] = [];
                            for (var iv in val) {
                                if (!vl[ky][iv])
                                    vl[ky][iv] = {};
                                for (var ivs in val[iv]) {
                                    vl[ky][iv][ivs] = val[iv][ivs];
                                }
                            }
                        }
                    }
                    else if (sub[j].indexOf('~') != -1) {
                        var val = await _dy.elements(sub[j].replace('~', '->').split('|')[1], null, null, null, rl[r]);
                        if (!vl[sub[j].split('~')[0].split('|')[0]])
                            vl[sub[j].split('~')[0].split('|')[0]] = {};
                        for (var iv in val[0]) {
                            vl[sub[j].split('~')[0].split('|')[0]] = val[0][iv];
                        }
                    }
                    else if (sub[j].startsWith('#')) {
                        var pref = sub[j];
                        var eref = rl[r];
                        if (pref.indexOf && pref.indexOf('parent.') != -1)
                            for (var mi = 0; mi < 5; mi++) {
                                if (pref.replace('#', '').startsWith('parent.')) {
                                    eref = eref.parentNode;
                                    pref = pref.replace('parent.', '');
                                }
                            }
                        if (pref.replace('#', '').startsWith('prop.')) {
                            vl[pref.replace('#', '')] = (eref[pref.replace('#', '').replace('prop.', '')]);
                        }
                        else if (pref.replace('#', '') == 'innerHTML') {
                            vl[pref.replace('#', '')] = (eref.innerHTML ? btoa(eref.innerHTML) : null);
                        }
                        else if (pref.replace('#', '') == 'outerHTML') {
                            vl[pref.replace('#', '')] = (eref.outerHTML ? btoa(eref.outerHTML) : null);
                        }
                        else if (pref.replace('#', '') == 'innerText') {
                            vl[pref.replace('#', '')] = (eref.innerText ? eref.innerText : null);
                        }
                        else if (pref.replace('#', '').startsWith('style')) {
                            vl[pref.replace('#', '')] = (eref.style[pref.replace('#', '').replace('style.', '')] ? eref.style[pref.replace('#', '').replace('style.', '')] : null);
                        }
                        else if (pref.replace('#', '') == 'value') {
                            vl[pref.replace('#', '')] = (eref.value);
                        }
                        else {
                            vl[pref.replace('#', '')] = (eref.attributes[pref.replace('#', '')] ? eref.attributes[pref.replace('#', '')].value : null);
                        }
                    }
                    else {
                        vl[sub[j]] = rl[r];
                    }
                }
                vals.push(vl);
            }
            if (f && rl[r] && rl[r].classList)
                await f((sub != '' ? rl[r][sub] : rl[r]), r);
        }
        if (e)
            return e(rl);
        if (sub != '')
            return vals;
        return rl;
    },
    last_element: function (s, f, p) {
        p = def(p, document);
        var rl = p.querySelectorAll(s);
        if (!def(f))
            return rl[rl.length - 1];
        if (rl.length > 0)
            f(rl[rl.length - 1]);
    },
    getDyElement: function (sel) {
        var element = typeof sel === 'string' ? _dy.element(sel) : sel;
        if (!element)
            return null;
        if (element.iden != null)
            return _dy.TsID[element.iden] || null;
        // Exact managed controllers are discoverable without adding legacy DOM
        // identity fields that change loader(element, ...) routing.
        for (const record of componentState.records.values()) {
            if (record.controllers.has(element))
                return record.state;
        }
        return null;
    },
};
// Trusted expressions, parameter substitution, and hash directives.
const templateApi = {
    js: function (op, adr) {
        if (op == null || String(op).trim() === '')
            return null;
        // Keep newlines: removing them changes comments, strings, and ASI behavior.
        var source = String(op).trim().replace(/;+\s*$/, '');
        try {
            return trustedScripts.expression(source);
        }
        catch (error) {
            if (adr)
                error.message += ' (' + adr + ')';
            throw contextualError(error, { phase: 'expression' });
        }
    },
    asyncjs: async function (op, adr) {
        return await _dy.js(op, adr);
    },
    substitute: function (text, values, references, ownerTid) {
        values = values || {};
        var replacements = Object.create(null);
        Object.keys(values).forEach(function (key) {
            var value = values[key];
            if (references && value !== null && typeof value === 'object') {
                var id = componentState.retainObject(_dy, value, ownerTid);
                replacements[key] = '_dy.temp_object[' + id + ']';
            }
            else
                replacements[key] = String(value);
        });
        var keys = Object.keys(replacements).sort(function (a, b) { return b.length - a.length; });
        if (!keys.length)
            return text;
        var signature = JSON.stringify(keys);
        var pattern = substitutionPatterns.get(signature);
        if (!pattern) {
            var escaped = keys.map(function (key) { return key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
            pattern = new RegExp('(?<!\\$)\\$\\$(' + escaped.join('|') + ')(?![\\w$])', 'g');
            if (substitutionPatterns.size >= substitutionPatternLimit)
                substitutionPatterns.delete(substitutionPatterns.keys().next().value);
            substitutionPatterns.set(signature, pattern);
        }
        return text.replace(pattern, function (_, key) { return replacements[key]; });
    },
    evaluateTemplate: function (expression, values) {
        // Bind values rather than inserting their text into JavaScript source.
        // Template expressions remain trusted JavaScript, as in dyHTML.
        function reference(token) {
            if (token === '$$$item')
                return '_localItem';
            return '_localItem[' + JSON.stringify(token.slice(2)) + ']';
        }
        // Also accept legacy quoted placeholders: "$$status" == "active".
        var source = expression.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\$\$\$item\b|\$\$[A-Za-z_][\w]*/g, function (token) {
            if (token.startsWith('$$'))
                return reference(token);
            if (!/\$\$/.test(token))
                return token;
            var quote = token[0];
            return '(' + token.replace(/\$\$\$item\b|\$\$[A-Za-z_][\w]*/g, function (placeholder) {
                return quote + ' + String(' + reference(placeholder) + ') + ' + quote;
            }) + ')';
        });
        const hadItem = Object.prototype.hasOwnProperty.call(window, '_localItem');
        const previousItem = window._localItem;
        window._localItem = values || {};
        try {
            return _dy.js(source, 'template expression');
        }
        finally {
            if (hadItem)
                window._localItem = previousItem;
            else
                delete window._localItem;
        }
    },
    compileHtmlHashParts: function (d, pms) {
        if (d.indexOf('#') === -1)
            return d;
        pms = pms || {};
        var marker = /#is\s+(not\s+define|define|value)\s+|#if\s+|#then\b|#else\b|#end\b;?/g;
        var root = { parts: [] };
        var stack = [root];
        var cursor = 0;
        var match;
        while ((match = marker.exec(d))) {
            var current = stack[stack.length - 1];
            current.parts.push(d.slice(cursor, match.index));
            var token = match[0];
            if (token.startsWith('#is') || token.startsWith('#if')) {
                var type = match[1] ? match[1].replace(/\s+/g, ' ') : 'value';
                var begin = marker.lastIndex;
                var finish;
                var condition;
                if (type === 'value') {
                    finish = d.indexOf('#then', begin);
                    if (finish < 0)
                        throw new SyntaxError('ophtml: condition requires #then');
                    condition = d.slice(begin, finish).trim();
                    marker.lastIndex = finish + '#then'.length;
                }
                else {
                    var key = /^([^\s#]+)/.exec(d.slice(begin));
                    if (!key)
                        throw new SyntaxError('ophtml: define requires a parameter name');
                    condition = key[1].replace(/^\$\$/, '');
                    marker.lastIndex = begin + key[0].length;
                    // Accept #then here too, while preserving the old optional syntax.
                    var then = /^\s*#then\b/.exec(d.slice(marker.lastIndex));
                    if (then)
                        marker.lastIndex += then[0].length;
                }
                var node = { type: type, condition: condition, yes: [], no: [] };
                node.parts = node.yes;
                current.parts.push(node);
                stack.push(node);
            }
            else if (token.startsWith('#else')) {
                if (stack.length === 1 || current.parts === current.no)
                    throw new SyntaxError('ophtml: unexpected #else');
                current.parts = current.no;
            }
            else if (token.startsWith('#end')) {
                if (stack.length === 1)
                    throw new SyntaxError('ophtml: unexpected #end');
                stack.pop();
            }
            else
                throw new SyntaxError('ophtml: unexpected #then');
            cursor = marker.lastIndex;
        }
        stack[stack.length - 1].parts.push(d.slice(cursor));
        if (stack.length !== 1)
            throw new SyntaxError('ophtml: missing #end');
        function render(parts) {
            return parts.map(function (part) {
                if (typeof part === 'string')
                    return part;
                var value = pms[part.condition];
                var yes = part.type === 'value'
                    ? _dy.evaluateTemplate(part.condition, pms)
                    : part.type === 'not define' ? value === undefined
                        : value != null && value !== false && value !== '' && value != 0;
                return render(yes ? part.yes : part.no);
            }).join('');
        }
        return render(root.parts).replace(/#dy\(([\s\S]*?)#\)/g, function (_, expression) {
            return String(_dy.evaluateTemplate(expression, pms));
        });
    },
    init_page: function (d, json) {
        return _dy.substitute(d, json).replaceAll('$$hide', 'hdn-i ');
    },
};
// HTTP transport. Callback return types remain compatible.
const requestApi = {
    down: function (op) {
        return _dy.request(op, false);
    },
    upload: function (op) {
        return _dy.request(op, true);
    },
    request: function (op, uploading) {
        op = op || {};
        var client;
        var finished = false;
        function finish(error) {
            if (finished)
                return;
            finished = true;
            try {
                if (error) {
                    if (op.error)
                        op.error(error);
                }
                else if (op.success)
                    op.success(client.responseText, op.option || {});
            }
            finally {
                if (op.end)
                    op.end();
            }
        }
        function progress(event) {
            if (event.lengthComputable && op.progress)
                op.progress(event.loaded * 100 / event.total);
        }
        try {
            client = new XMLHttpRequest();
            client.onreadystatechange = function () {
                if (op.subProgress)
                    op.subProgress(client);
                if (client.readyState === 4)
                    finish((client.status >= 200 && client.status < 300) || client.status === 304 ? null : client);
            };
            client.onerror = client.ontimeout = client.onabort = function () { finish(client); };
            client.open(op.type || (uploading ? 'POST' : 'GET'), op.url || '/', true);
            if (op.timeout != null)
                client.timeout = op.timeout;
            client.onprogress = progress;
            if (uploading && client.upload)
                client.upload.onprogress = progress;
            var body = null;
            if (uploading) {
                if (op.file) {
                    body = new FormData();
                    Object.keys(op.file).forEach(function (key) {
                        var file = op.file[key];
                        body.append('file' + key, file.data === undefined ? file : file.data);
                    });
                    client.setRequestHeader('content', JSON.stringify(op.data || {}));
                }
                else {
                    client.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                    body = op.data == null ? '' : JSON.stringify(op.data);
                }
            }
            if (op.begin)
                op.begin(client);
            client.send(body);
        }
        catch (error) {
            finish(error);
        }
        return client;
    },
};
// Component lifecycle and reference access.
const lifecycleApi = {
    isDisposed(tid) {
        return !_dy.TsID[tid] || componentState.records.get(Number(tid))?.disposed === true;
    },
    onDispose(tid, cleanup) {
        if (typeof cleanup !== 'function')
            throw new TypeError('ophtml: cleanup must be a function');
        if (!_dy.TsID[tid])
            throw new RangeError('ophtml: unknown component ' + tid);
        const record = componentState.ensure(_dy, Number(tid));
        componentState.assertActive(record);
        record.cleanups.add(cleanup);
        return () => record.cleanups.delete(cleanup);
    },
    dispose(target) {
        return componentState.dispose(target);
    },
    async unmount(element) {
        if (!element || typeof element.replaceChildren !== 'function')
            throw new TypeError('ophtml: unmount requires a DOM element');
        try {
            return await componentState.dispose(element);
        }
        finally {
            element.replaceChildren();
        }
    },
    get: function (tid) {
        return _dy.temp_object[tid];
    },
    callInitialized: async function (tid, f) {
        f = f || function () { };
        var state = _dy.TsID[tid];
        if (state && state.initScript && !state.scriptApplyed) {
            if (!state.initializing) {
                var source = state.initScript.replaceAll('$$_', '_dy.TsID[' + tid + '].')
                    .replaceAll('$$$item', '_dy.TsID[' + tid + ']');
                state.initializing = _dy.js('async function(data){' + source + '\n}')(state);
            }
            try {
                await state.initializing;
                state.scriptApplyed = true;
            }
            catch (error) {
                delete state.initializing;
                throw contextualError(error, { phase: 'initialize', tid });
            }
        }
        return await f(state && state.data);
    },
};
function compileTemplateTags(d, engine) {
    // Short template names remain compatible; registered browser names need '-'.
    d = d.replace(/<(\/?)switch(?=[\s>])/g, '<$1switcher')
        .replace(/<(\/?)if(?=[\s>])/g, '<$1op-if')
        .replace(/<(\/?)else(?=[\s>])/g, '<$1op-else');
    d = d
        .replaceAll("<loader", ` <img src="$$temp_img" onload="_dy.elementPageLoad(this,$$TID)" /><tmp class="hdn-i" `).replaceAll("<iloader", `<div ><img src="$$temp_img" onload="_dy.elementPageLoad(this,$$TID)" /><tmp class="hdn-i"`).replaceAll("<repeater", `<img src="$$temp_img" onload="_dy.elementPageRepeat(this,$$TID)" /><textarea class="hdn-i" `)
        .replaceAll("<switcher", `<img src="$$temp_img" onload="_dy.elementPageSwitch(this,$$TID)" /><textarea class="hdn-i" `)
        .replaceAll("<callscript>", `<img src="$$temp_img" onload="`)
        .replaceAll("</callscript>", `" />`)
        .replaceAll("<dy ", `<div ><img src="$$temp_img" onload="_dy.elementPageDynamic(this,$$TID)" /><textarea class="hdn-i" params=`).replaceAll("<dyc ", `<img src="$$temp_img" onload="_dy.elementElementDynamic(this,$$TID)" /><tmp class="hdn-i" params=`).replaceAll("<com", `<div ><img src="$$temp_img" onload="_dy.elementPageLoad(this,$$TID)" /><tmp class="hdn-i" page=`).replaceAll("<content", `<img src="$$temp_img" onload="_dy.elementPageDynamic(this,$$TID)" /><textarea class="hdn-i" `).replaceAll("<icontent", `<div ><img src="$$temp_img" onload="_dy.elementPageDynamic(this,$$TID)" /><textarea class="hdn-i" `)
        .replaceAll("</loader>", ` </tmp> `)
        .replaceAll("</iloader>", ` </tmp></div>`)
        .replaceAll("</com>", ` </tmp></div>`)
        .replaceAll("</repeater>", `</textarea>`)
        .replaceAll("</switcher>", `</textarea>`)
        .replaceAll("</dy>", `</textarea></div>`)
        .replaceAll("</dyc>", `</tmp>`)
        .replaceAll("</dy-style>", `</textarea></div>`)
        .replaceAll("</content>", `</textarea>`)
        .replaceAll("</icontent>", `</textarea></div>`)
        .replaceAll("$$root", def(engine.basePath, ""))
        .replaceAll("$$src=", "src=")
        .replaceAll("$$date", new Date().getTime())
        .replaceAll("$$images", "/images")
        .replaceAll("$$temp_img", engine.temp_img);
    if (engine.hookMode !== 'legacy') {
        const hookTags = { elementPageRepeat: 'op-repeater', elementPageSwitch: 'op-switch', elementPageLoad: 'op-com' };
        d = d.replace(/<img src="[^"]*" onload="_dy\.(elementPageRepeat|elementPageSwitch|elementPageLoad)\(this,\$\$TID\)"\s*\/>/g, (_, method) => `<${hookTags[method]} hidden data-tid="$$TID"></${hookTags[method]}>`);
    }
    return d;
}
function componentScript(source, tid) {
    return source.replace('<script>', '').replace('</script>', '\n;_dy.JsIden++;\n')
        .replaceAll('$$_', '_dy.TsID[' + tid + '].');
}
async function releaseFailedComponent(record, cause, context) {
    if (record.failure === cause)
        throw contextualError(cause, context);
    if (record.disposed && cause?.name !== 'AbortError') {
        const abort = new DOMException('ophtml: component was disposed', 'AbortError');
        abort.cause = cause;
        cause = contextualError(abort, { phase: 'dispose', tid: record.tid });
    }
    const error = contextualError(cause, context);
    record.failure = error;
    try {
        await componentState.dispose(record.tid);
    }
    catch (cleanupError) {
        try {
            error.cleanupError = cleanupError;
        }
        catch { }
    }
    throw error;
}
async function renderComponentTemplate(template, output, transformScript, parameters, after) {
    const engine = window._dy;
    parameters ||= {};
    parameters.TID ??= ++engine.temp_baseIdentity;
    const record = componentState.ensure(engine, parameters.TID);
    const state = record.state;
    output ??= content => content;
    transformScript ??= source => source;
    after ||= () => { };
    let phase = 'template';
    try {
        componentState.assertActive(record);
        let content = compileTemplateTags(template, engine);
        if (content.includes('/// header')) {
            phase = 'header';
            const sections = content.split('/// header');
            content = sections[1];
            const header = {};
            header.dy_init = engine.js('async function(item){' + sections[0].replace('<script>', '').replace('</script>', '\n') + ' return item;}');
            const values = await header.dy_init(header);
            componentState.assertActive(record);
            for (const key in values)
                parameters[key] = values[key];
        }
        phase = 'template';
        content = engine.compileHtmlHashParts(content, parameters);
        content = engine.substitute(content, parameters, true, parameters.TID);
        state.ref = parameters;
        state.ref.parent = def(parameters.parent, parameters.TID);
        if (content.includes('/// main content')) {
            phase = 'initialize';
            const sections = content.split('/// main content');
            content = sections[1];
            state.initScript = transformScript(sections[0]).replace('<script>', '').replace('</script>', '\n;_dy.JsIden++;\n');
            await engine.callInitialized(parameters.TID);
            componentState.assertActive(record);
        }
        content = content.replaceAll('$$out', '').replaceAll('$$hover', '').replaceAll('_ext$$ext', '');
        const sections = content.split('/// background script');
        content = sections[0];
        state._script = sections[1];
        let releaseBackground;
        if (transformScript && sections.length > 1)
            state.backgroundReady = new Promise(resolve => { releaseBackground = resolve; });
        try {
            phase = 'mount';
            componentState.assertActive(record);
            await output(content);
            componentState.assertActive(record);
            if (transformScript && sections.length > 1) {
                phase = 'background';
                trustedScripts.execute(componentScript(transformScript(sections[1]), parameters.TID));
            }
        }
        finally {
            releaseBackground?.();
        }
        phase = 'after';
        await after(state);
        componentState.assertActive(record);
    }
    catch (error) {
        return releaseFailedComponent(record, error, { phase, tid: parameters.TID });
    }
}
function componentAddress(engine, page, root) {
    root = engine.root || (root && root !== '/' ? root : '/dyhtml/components/');
    const extension = engine.dyHtmlExtensionFormat;
    let name = String(page).replace(/^\/+/, '');
    if (name.endsWith(extension))
        name = name.slice(0, -extension.length);
    return (root.replace(/\/+$/, '') + '/' + name.replace(/\./g, '/') + extension).replace('/public/', '/');
}
async function loadComponent({ page, controller, output, root, params, after, parentTid }) {
    const engine = window._dy;
    const url = componentAddress(engine, page, root);
    const noCache = params && (params.noCache === true || params.noCache === 'true');
    const requestUrl = url + (noCache ? '?' + Date.now() : '');
    const { parameters, record } = componentState.create(engine, params, controller, parentTid);
    let phase = 'load';
    try {
        let template;
        if (!noCache && Object.prototype.hasOwnProperty.call(engine.cacheComopunents, url)) {
            template = engine.cacheComopunents[url];
        }
        else {
            let request;
            template = await new Promise((resolve, reject) => {
                request = engine.down({
                    url: requestUrl,
                    success: resolve,
                    error(cause) {
                        if (record.disposed) {
                            reject(contextualError(new DOMException('ophtml: component was disposed', 'AbortError'), { phase: 'dispose', tid: record.tid }));
                        }
                        else {
                            reject(new Error('ophtml: failed to load ' + requestUrl + (cause?.status ? ' (HTTP ' + cause.status + ')' : ''), { cause }));
                        }
                    },
                });
                if (request)
                    record.requests.add(request);
            });
            record.requests.delete(request);
            componentState.assertActive(record);
            if (!noCache)
                engine.cacheComopunents[url] = template;
        }
        componentState.assertActive(record);
        phase = 'render';
        let html;
        await engine.initInnerContent(template, async (content) => {
            componentState.assertActive(record);
            html = engine.init_page(content, parameters.data);
            if (typeof output === 'function')
                await output(controller, html, parameters);
            else if (controller)
                controller.innerHTML = html;
        }, null, parameters, async () => {
            if (controller)
                parameters.ready = controller.onready;
            if (after)
                await after(parameters);
        });
        componentState.assertActive(record);
        return { html, data: parameters };
    }
    catch (error) {
        return releaseFailedComponent(record, error, { phase, page, url, tid: record.tid });
    }
}
// Component rendering and mounting.
const renderingApi = {
    initInnerContent: renderComponentTemplate,
    render: async function (page, data, showData) {
        var rendered = await _dy.loadPage(page, null, function () { }, undefined, data);
        return showData ? rendered : rendered.html;
    },
    renderElement: async function (element, page, params, css) {
        if (!element)
            return;
        const controller = document.createElement('div');
        controller.className = css || '';
        componentState.pendingMounts.set(controller, element);
        let record;
        try {
            const rendered = await _dy.loadPage(page, controller, function (_, html) {
                controller.innerHTML = html;
            }, undefined, params);
            record = componentState.records.get(rendered.data.TID);
            if (!record)
                throw contextualError(new DOMException('ophtml: component was disposed', 'AbortError'), { phase: 'dispose', tid: rendered.data.TID });
            componentState.assertActive(record);
            element.replaceChildren(controller);
            record.mountTarget = null;
            return controller;
        }
        catch (error) {
            if (record)
                return releaseFailedComponent(record, error, { phase: 'mount', page, tid: record.tid });
            throw error;
        }
        finally {
            componentState.pendingMounts.delete(controller);
        }
    },
    renderTemplate: async function (template, data, showData) {
        var ctl = document.createElement('div');
        const { parameters: pms } = componentState.create(_dy, { data: data || {} }, ctl);
        var html;
        await _dy.initInnerContent(template, function (content) {
            html = _dy.init_page(content, pms.data);
            ctl.innerHTML = html;
        }, null, pms, function () { pms.ready = ctl.onready; });
        return showData ? { html: html, data: pms } : html;
    },
    loadPage(page, controller, output, root, params, after, parentTid) {
        return loadComponent({ page, controller, output, root, params, after, parentTid });
    },
};
// DOM controllers used by native and legacy activation signals.
function controllerRecord(trigger, tid) {
    const state = window._dy.TsID[tid];
    if (componentState.records.get(tid)?.disposed || !state && trigger.nodeType === 1)
        return null;
    const record = componentState.ensure(window._dy, tid);
    if (trigger.parentNode)
        record.controllers.add(trigger.parentNode);
    return record;
}
const controllerApi = {
    elementPageLoad: function (th, tid, noNeedParse, fun) {
        const record = controllerRecord(th, tid);
        if (!record)
            return;
        componentState.assertActive(record);
        var nxt = th.nextElementSibling;
        var par = th.parentNode;
        par.iden = tid;
        if (_dy.TsID[tid] && _dy.TsID[tid].name)
            par.name = _dy.TsID[tid].name;
        if (!nxt.attributes['def'])
            nxt.setAttribute('def', 'true');
        var def = dy.prototype.js(nxt.attributes['def'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
        if (!def) {
            par.remove();
            return;
        }
        if (!nxt.attributes['page'])
            nxt.setAttribute('page', 'icon');
        if (!nxt.attributes['path'])
            nxt.setAttribute('path', '/');
        if (!nxt.attributes['params'])
            nxt.setAttribute('params', '{}');
        ['path', 'page'].forEach(function (name) {
            var value = nxt.attributes[name].value;
            if (typeof value === 'string' && value.indexOf('$$_') !== -1)
                nxt.setAttribute(name, _dy.js(value.replaceAll('$$_', '_dy.TsID[' + tid + '].')
                    .replaceAll('$$$item', '_dy.TsID[' + tid + ']')));
        });
        if (nxt.attributes['online'])
            nxt.online = _dy.js('function(p){var element=p;var me=p.event;' + nxt.attributes['online'].value + '}');
        if (nxt.attributes['onready'])
            nxt.onready = _dy.js('function(element,model){' + nxt.attributes['onready'].value + '}');
        par.onready = nxt.onready;
        var param = nxt.attributes['params'].value;
        if (!noNeedParse && typeof param === 'string')
            param = _dy.js(param.replaceAll('$$_', '_dy.TsID[' + tid + '].')
                .replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
        var cls = nxt.attributes && nxt.attributes['css'] ? nxt.attributes['css'].value : '';
        if (cls != '')
            par.className = cls;
        if (nxt.innerHTML && param) {
            param.content = nxt.innerHTML;
        }
        return dy.prototype.loadPage(nxt.attributes['page'].value, par, fun, nxt.attributes['path'].value, param, nxt.online, tid);
    },
    elementPageRepeat: async function (th, tid, noNeedParse, fun) {
        const record = controllerRecord(th, tid);
        if (!record)
            return;
        componentState.assertActive(record);
        var txt = th.nextElementSibling;
        var par = th.parentNode;
        par.iden = tid;
        if (_dy.TsID[tid] && _dy.TsID[tid].name)
            par.name = _dy.TsID[tid].name;
        if (!txt.attributes['params'])
            txt.setAttribute('params', '{}');
        if (txt.attributes['online'])
            txt.online = dy.prototype.js('function(p){var element = p;var me = p.event;' + txt.attributes['online'].value + '}');
        var param;
        if (!noNeedParse)
            param = dy.prototype.js(txt.attributes['params'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
        else
            param = txt.attributes['params'].value;
        if (!txt.attributes['def'])
            txt.setAttribute('def', 'true');
        var def = dy.prototype.js(txt.attributes['def'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
        if (!def) {
            par.remove();
            return;
        }
        let txtValue = txt.value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']');
        // The deferred syntax belongs to the row template, not to each row's data.
        // Normalize it once before iterating, without rescanning substituted values.
        txtValue = txtValue.replaceAll('$$hide', 'hdn-i ')
            .replaceAll('#_if', '#if')
            .replaceAll('#_is', '#is')
            .replaceAll('#_else', '#else')
            .replaceAll('#_then', '#then')
            .replaceAll('#_end', '#end')
            .replaceAll('#_dy', '#dy')
            .replaceAll('#_)', '#)');
        if (txt.attributes['oncreate'])
            txt.oncreate = dy.prototype.js('function(cont ,data,index){ var content = cont; ' + txt.attributes['oncreate'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']') + ' return content;}');
        if (!txt.oncreate)
            txt.oncreate = null;
        if (!_dy.TsID[tid])
            _dy.TsID[tid] = {};
        _dy.TsID[tid].template = txt.value;
        _dy.TsID[tid].ctrl = par;
        var content = '';
        var r_ind = 0;
        if (param)
            for (var i in param) {
                var ip = param[i];
                if (ip !== null && typeof (ip) == 'object') {
                    ip.repeaterKey = i;
                    ip.repeaterIndex = r_ind++;
                    componentState.assertActive(record);
                    var ind_rep = componentState.retainItem(_dy, ip, tid);
                    var values = Object.assign({}, ip);
                    for (var key in ip) {
                        if (ip[key] && typeof ip[key] === 'object') {
                            for (var child in ip[key])
                                values[key + '.' + child] = ip[key][child];
                        }
                    }
                    values.repeaterItem = '_dy.repRef[' + ind_rep + ']';
                    values.repeaterKey = i;
                    // Evaluate deferred conditions against values before inserting their text.
                    var c = _dy.compileHtmlHashParts(txtValue, ip);
                    c = _dy.substitute(c, values);
                    if (txt.oncreate)
                        c = await txt.oncreate(c, ip, i);
                    content += c;
                }
            }
        if (par.onready)
            await par.onready(content);
        componentState.assertActive(record);
        par.innerHTML = content;
        var cls = txt.attributes && txt.attributes['css'] ? txt.attributes['css'].value : '';
        if (cls != '')
            par.className = cls;
        if (fun)
            await fun(par);
        if (txt && txt.remove)
            txt.remove();
    },
    elementPageSwitch: async function (th, tid, noNeedParse, fun) {
        const record = controllerRecord(th, tid);
        if (!record)
            return;
        componentState.assertActive(record);
        var txt = th.nextElementSibling;
        if (_dy.TsID[tid] && _dy.TsID[tid].initializing)
            await _dy.callInitialized(tid);
        var par = th.parentNode;
        par.iden = tid;
        if (_dy.TsID[tid] && _dy.TsID[tid].name)
            par.name = _dy.TsID[tid].name;
        if (!txt.attributes['params'])
            txt.setAttribute('params', '{}');
        if (txt.attributes['online'])
            txt.online = dy.prototype.js('function(p){var element = p;var me = p.event;' + txt.attributes['online'].value + '}');
        var param;
        if (!noNeedParse)
            param = dy.prototype.js(txt.attributes['params'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
        else
            param = txt.attributes['params'].value;
        if (!txt.attributes['def'])
            txt.setAttribute('def', 'true');
        var def = dy.prototype.js(txt.attributes['def'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
        if (!def) {
            par.remove();
            return;
        }
        let txtValue = txt.value.split('$$next-case');
        if (txt.attributes['oncreate'])
            txt.oncreate = dy.prototype.js('function(content,data){var item = 0;' + txt.attributes['oncreate'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']') + ' return item;}');
        if (!txt.oncreate)
            txt.oncreate = null;
        var content = '';
        if (!_dy.TsID[tid])
            _dy.TsID[tid] = {};
        _dy.TsID[tid].template = txt.value;
        _dy.TsID[tid].ctrl = par;
        var ip = param;
        var item = txt.oncreate ? await txt.oncreate(txt.value, ip) : 0;
        if (txtValue[item] === undefined)
            throw new RangeError('ophtml: invalid switcher case ' + item);
        var c = txtValue[item].replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']');
        c = _dy.substitute(c, ip);
        c = c.replaceAll('$$hide', 'hdn-i ');
        content = c;
        if (par.onready)
            await par.onready(content);
        componentState.assertActive(record);
        par.innerHTML = content;
        if (fun)
            await fun(par);
        if (!noNeedParse)
            txt.remove();
    },
    elementElementDynamic: async function (th, tid, fun) {
        const record = controllerRecord(th, tid);
        if (!record)
            return;
        componentState.assertActive(record);
        var txt = th.nextElementSibling;
        if (_dy.TsID[tid] && _dy.TsID[tid].initializing)
            await _dy.callInitialized(tid);
        var par = th.parentNode;
        if (!txt.attributes['params'])
            txt.setAttribute('params', '{}');
        if (txt.attributes['online'])
            txt.online = dy.prototype.js('function(p){var element = p;var me = p.event;' + txt.attributes['online'].value + '}');
        var param = dy.prototype.js(txt.attributes['params'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
        if (!txt.attributes['def'])
            txt.setAttribute('def', 'true');
        var def = dy.prototype.js(txt.attributes['def'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
        if (!def) {
            par.remove();
            return;
        }
        let txtValue = txt.innerHTML;
        if (txt.attributes['oncreate'])
            txt.oncreate = dy.prototype.js('function(content,data){var item = 0;' + txt.attributes['oncreate'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']') + ' return content;}');
        if (!txt.oncreate)
            txt.oncreate = null;
        var content = '';
        var ip = param;
        var c = txtValue;
        if (txt.oncreate)
            c = await txt.oncreate(c, ip);
        c = _dy.substitute(c, ip);
        c = c.replaceAll('$$hide', 'hdn-i ');
        content = c;
        if (par.onready)
            await par.onready(content);
        componentState.assertActive(record);
        par.innerHTML = content;
        if (fun)
            await fun(par);
        txt.remove();
    },
    elementPageDynamic: async function (th, tid, fun) {
        const record = controllerRecord(th, tid);
        if (!record)
            return;
        componentState.assertActive(record);
        var txt = th.nextElementSibling;
        if (_dy.TsID[tid] && _dy.TsID[tid].initializing)
            await _dy.callInitialized(tid);
        var par = th.parentNode;
        if (!txt.attributes['params'])
            txt.setAttribute('params', '{}');
        if (txt.attributes['online'])
            txt.online = dy.prototype.js('function(p){var element = p;var me = p.event;' + txt.attributes['online'].value + '}');
        var param = dy.prototype.js(txt.attributes['params'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
        if (!txt.attributes['def'])
            txt.setAttribute('def', 'true');
        var def = dy.prototype.js(txt.attributes['def'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
        if (!def) {
            par.remove();
            return;
        }
        let txtValue = txt.value;
        if (txt.attributes['oncreate'])
            txt.oncreate = dy.prototype.js('function(content,data){var item = 0;' + txt.attributes['oncreate'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']') + ' return content;}');
        if (!txt.oncreate)
            txt.oncreate = null;
        var content = '';
        var ip = param;
        var c = txtValue;
        if (txt.oncreate)
            c = await txt.oncreate(c, ip);
        c = _dy.substitute(c, ip);
        c = c.replaceAll('$$hide', 'hdn-i ');
        content = c;
        if (par.onready)
            await par.onready(content);
        componentState.assertActive(record);
        par.innerHTML = content;
        var cls = txt.attributes && txt.attributes['css'] ? txt.attributes['css'].value : '';
        par.className = cls;
        if (fun)
            await fun(par);
        txt.remove();
    },
};
// Global and prototype mutations are deliberately confined to this adapter.
function installLegacyCompatibility(engine, scripts) {
    trustedScripts.execute(`function def(n,r){return void 0!=n&&null!=n?n:void 0!=r&&null!=r?r:null} var floor=Math.floor,sin=Math.sin,cos=Math.cos,tan=Math.tan,atan=Math.atan,atan2=Math.atan2,asin=Math.asin,acos=Math.acos,pow=function(n,r){return Math.pow(n,r||2)},ceil=Math.ceil,abs=Math.abs,exp=Math.exp,log=Math.log,max=Math.max,min=Math.min,sqrt=Math.sqrt,random=Math.random,round=Math.round,sqrt=Math.sqrt,sign=Math.sign,PI=Math.PI,E=Math.E,deg=PI/180,rad=180/PI;`);
    String.prototype.trim = function () { return this.replace(/^\s+|\s+$/gm, ""); };
    String.prototype.replaceAll = function (n, r, a) { return this.replace(RegExp(n.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), a ? "gi" : "g"), "string" == typeof r ? r.replace(/\$/g, "$$$$") : r); };
    window._dy = engine;
    window._dyScript = scripts;
}
function installLegacySplitFirst() {
    String.prototype.splitFirst = function (n, c) {
        var ar = this.split(n);
        ar = ar.reverse();
        var ft = [];
        for (var i = 0; i < def(c, 1); i++)
            ft.push(ar.pop());
        ft = ft.join(n);
        return [ft, ar.reverse().join(n)];
    };
}
// Legacy convenience APIs retained at the compatibility boundary.
const legacyApi = {
    init(engine, scripts) { installLegacyCompatibility(engine, scripts); },
    paste: async function (f) {
        var v = await navigator.clipboard.readText();
        f(v);
    },
    to_raw: function (d) {
        return d.replaceAll('"', '____qt').replaceAll("'", '____t').replaceAll('`', '____st');
    },
    imageFileUploader: function (fileInp, prg, result) {
        const file = fileInp && fileInp.files && fileInp.files[0];
        if (!file)
            return;
        fileInp.parentNode.classList.add('disabled');
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                // Convert ArrayBuffer to Base64
                const arrayBuffer = reader.result;
                var raw_content = arrayBuffer;
                var blob = new Blob([raw_content], { type: file.type });
                var binary = '';
                var bytes = new Uint8Array(arrayBuffer);
                var len = bytes.byteLength;
                for (var i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                var base64String = btoa(binary);
                if (result)
                    result.src = 'data:' + (file.type || 'application/octet-stream') + ';base64,' + base64String;
                if (result)
                    result.classList.add('op-05');
                if (prg)
                    prg.style.width = '0%';
                if (_dy.imageUploader)
                    _dy.imageUploader({ file: file, blob: blob, base64: base64String, input: fileInp, prg: prg, output: result });
                else
                    fileInp.parentNode.classList.remove('disabled');
            };
            reader.onerror = reader.onabort = function () { fileInp.parentNode.classList.remove('disabled'); };
            reader.readAsArrayBuffer(file);
        }
    },
    toHash: function (value, i) {
        var hash = btoa(value.replaceAll('.', '_').replaceAll(' ', '_').replaceAll('-', '_'))
            .replaceAll('.', '').replaceAll('+', '').replaceAll('=', '');
        return hash;
    },
    select: async function (all, sel, add, rem, p, tg) {
        var stt = false;
        var el = _dy.element(sel, p);
        var isSelected = el && add && add.length && el.classList.contains(add[0]);
        stt = await _dy.elements(all, function (at) {
            if (at && at.classList) {
                if (rem)
                    for (var i in rem) {
                        at.classList.add(rem[i]);
                    }
                if (add)
                    for (var i in add) {
                        at.classList.remove(add[i]);
                    }
            }
        }, function () {
            if (tg && isSelected) {
                if (rem)
                    for (var i in rem) {
                        el.classList.add(rem[i]);
                    }
                if (add)
                    for (var i in add) {
                        el.classList.remove(add[i]);
                    }
                stt = false;
                return stt;
            }
            else if (el) {
                if (rem)
                    for (var i in rem) {
                        el.classList.remove(rem[i]);
                    }
                if (add)
                    for (var i in add) {
                        el.classList.add(add[i]);
                    }
                stt = true;
                return stt;
            }
        }, null, p);
        return stt;
    },
    filter: function (l, f) {
        var ls = [];
        var _i = 0;
        for (var i in l) {
            if (f(l[i], i)) {
                _i++;
                l[i].dy_index = i;
                l[i].ls_index = _i;
                ls.push(l[i]);
            }
        }
        return ls;
    },
    selectMuli: function (sel, add, rem, p) {
        var el = _dy.element(sel, p);
        if (!el)
            return;
        if (rem)
            for (var i in rem) {
                el.classList.add(rem[i]);
            }
        if (add)
            for (var i in add) {
                el.classList.remove(add[i]);
            }
    },
    generateCssColor: function (th, key, value, parent) {
        var el;
        if (!document.getElementById('special_dy_style_' + key)) {
            el = document.createElement('style');
            th.parentNode.parentNode.appendChild(el);
        }
        else {
            el = document.getElementById('special_dy_style_' + key);
        }
        el.id = 'special_dy_style_' + key;
        el.innerHTML = (parent ? parent + ' ' : '') + ` .` + key + ` {
       ` + value + (parent ? ' !important' : '') + `;
    } `;
    },
    last_item: function (ar) {
        ar = def(ar, []);
        if (!def(ar.length))
            return null;
        return ar[ar.length - 1];
    },
    mixdeep: function (a, b) {
        var j = Array.isArray(a) ? a.slice() : {};
        for (var i in a) {
            j[i] = a[i];
        }
        for (var i in b) {
            if (b[i] !== null && typeof (b[i]) == 'object' && !Array.isArray(b[i])) {
                j[i] = _dy.mixdeep(a[i], b[i]);
            }
            else {
                j[i] = b[i];
            }
        }
        return j;
    },
    mix_json: function (a, b, n) {
        if (n)
            for (var bi in b)
                a[bi] = def(b[bi], def(a[bi], ""));
        else
            for (var bi in b)
                if (a[bi] != null && a[bi] != undefined)
                    a[bi] = def(b[bi], def(a[bi], ""));
        return a;
    },
    rgbToHex: function (r, g, b) {
        return '#' + [r, g, b].map(function (v) {
            return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
        }).join('');
    },
    hexToRgb: function (hex, d) {
        d = def(d, 1.0);
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16) / d,
                g: parseInt(result[2], 16) / d,
                b: parseInt(result[3], 16) / d,
                x: parseInt(result[1], 16) / d,
                y: parseInt(result[2], 16) / d,
                z: parseInt(result[3], 16) / d,
                w: 1.,
            }
            : null;
    },
    behindLoop: function () {
        for (var i in _dy.behindLoopContainer)
            if (_dy.behindLoopContainer[i])
                _dy.behindLoopContainer[i]();
        requestAnimationFrame(_dy.behindLoop);
    },
    img: function (path, f) {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            var originalImageData = ctx.canvas.toDataURL();
            f(originalImageData, img.height / img.width);
        };
        img.src = path;
    },
    reload: function (par, itm, page, path, fun, template) {
        par.innerHTML = '';
        return this.append(par, itm, page, path, fun, template);
    },
    append: function (par, itm, page, path, fun, template) {
        var div = document.createElement('div');
        var data = itm;
        data.type = itm.type;
        data.name = itm.name;
        data.title = itm.title;
        div.className = 'w-full';
        data.page = page;
        data.path = path;
        data.item = def(itm.item, 1);
        div.data = data;
        par.appendChild(div);
        return _dy.loader(div, data, template, fun);
    },
    loader: function (tid, data, template, fun) {
        if (typeof (tid) != "number") {
            if (!tid || !tid.iden) {
                _dy.TsID[++dy.prototype.temp_baseIdentity] = { ctrl: tid };
                tid = _dy.temp_baseIdentity;
            }
            else
                tid = (tid.iden);
        }
        if (!_dy.TsID[tid]) {
            console.log('Error Replace:', tid + ' not found component!');
            return;
        }
        var ctl = _dy.TsID[tid].ctrl;
        var th = { parentNode: ctl };
        th.nextElementSibling = {
            value: template ? template : _dy.TsID[tid].template,
            attributes: {
                "params": { value: data },
            },
            setAttribute: function (n, v) {
                th.nextElementSibling.attributes[n] = { value: v };
            },
        };
        if (data !== null && typeof (data) == "object") {
            if (Array.isArray(data)) {
                return dy.prototype.elementPageRepeat(th, tid, true, fun);
            }
            else {
                th.nextElementSibling.attributes = {
                    "params": { value: data },
                    "path": { value: data.path || '/' },
                    "page": { value: data.page || 'icon' },
                };
                th.nextElementSibling.setAttribute = function (n, v) {
                    th.nextElementSibling.attributes[n] = { value: v };
                };
                return dy.prototype.elementPageLoad(th, tid, true, fun);
            }
        }
        else if (typeof (data) == "number") {
            th.nextElementSibling.attributes['oncreate'] = { value: 'item = ' + data + ';' };
            return _dy.elementPageSwitch(th, tid, true, fun);
        }
        else if (typeof (data) == "string") {
        }
    },
    initDrop: function (type, dropEvent, op) {
        if (!_dy['dragList' + type]) {
            _dy['dragList' + type] = [];
            _dy['dragList' + type + '_state'] = 0;
            _dy['dragList' + type + '_iden'] = 0;
            _dy['dragList' + type + '_Height'] = 10;
            _dy['dragList' + type + '_Width'] = 10;
        }
        _dy.elements('.dropItem._' + type, function (dropItem) {
            if (dropItem && dropItem.addEventListener && _dy.element('.item_' + type, dropItem)) {
                _dy.element('.item_' + type, dropItem).addEventListener("dragstart", (event) => {
                    // make it half transparent
                    event.stopPropagation();
                    event.currentTarget.classList.add('draged');
                    if (op)
                        op.start(event.currentTarget, type);
                    else {
                        _dy.hideAllDragHelper();
                        _dy['dragList' + type + '_state'] = 1;
                        _dy['dragList' + type][++_dy['dragList' + type + '_iden']] = dropItem;
                        _dy['dragList' + type + '_Height'] = max(10, dropItem.offsetHeight);
                        _dy['dragList' + type + '_Width'] = max(10, dropItem.offsetWidth);
                    }
                    event.dataTransfer.setData("text", _dy['dragList' + type + '_iden']);
                });
                dropItem.addEventListener("dragover", (event) => {
                    // reset the transparency
                    var th = event.currentTarget;
                    if (op && op.over) {
                        op.over(th, type, _dy.lastItemOvered);
                        return;
                    }
                    if (_dy.lastItemOvered && _dy.lastItemOvered != th) {
                        _dy.elements('.before,.after,.middle', function (sub) {
                            if (sub && sub.classList) {
                                sub.classList.add('hdn-i');
                            }
                        }, null, null, _dy.lastItemOvered);
                    }
                    event.stopPropagation();
                    var mps = event.offsetY;
                    _dy.lastItemOvered = th;
                    _dy.elements('dropItem .before,.after,.middle', function (sub) {
                        if (sub && sub.classList)
                            sub.classList.add('hdn-i');
                    }, function () {
                        if (_dy.element('.before' + th.id, th))
                            _dy.element('.before' + th.id, th).classList.remove('hdn-i');
                        if (_dy.element('.after' + th.id, th))
                            _dy.element('.after' + th.id, th).classList.remove('hdn-i');
                        if (_dy.element('.middle' + th.id, th))
                            _dy.element('.middle' + th.id, th).classList.remove('hdn-i');
                    }, null, th.parentNode);
                });
                var drop = (event, next) => {
                    var curr = event.currentTarget;
                    var th = event.currentTarget.parentNode;
                    if (op && op.drop) {
                        op.drop(th, type, _dy.lastItemOvered);
                        dropEvent();
                        return;
                    }
                    _dy.hideAllDragHelper();
                    _dy.elements(' .draged', function (sub) {
                        if (sub && sub.classList)
                            sub.classList.remove('draged');
                    });
                    event.preventDefault();
                    var dv = null;
                    var data = event.dataTransfer.getData("text");
                    if (_dy['dragList' + type + '_state'] == 1) {
                        _dy['dragList' + type + '_state'] = 0;
                        dv = _dy['dragList' + type][data];
                    }
                    else {
                        /// unknown drop
                    }
                    if (th.parentNode)
                        if (next == 1) {
                            if (th.nextElementSibling) {
                                th.parentNode.insertBefore(dv, th.nextElementSibling);
                                dropEvent();
                            }
                            else {
                                th.parentNode.appendChild(dv);
                                dropEvent();
                            }
                        }
                        else if (next == 0) {
                            th.parentNode.insertBefore(dv, th);
                            dropEvent();
                        }
                        else if (curr.nextElementSibling
                            && curr.nextElementSibling.appendChild) {
                            curr.nextElementSibling.appendChild(dv);
                            dropEvent();
                        }
                };
                if (_dy.element('.before' + dropItem.id, dropItem))
                    _dy.element('.before' + dropItem.id, dropItem).addEventListener("drop", (event) => { drop(event, 0); });
                if (_dy.element('.after' + dropItem.id, dropItem))
                    _dy.element('.after' + dropItem.id, dropItem).addEventListener("drop", (event) => { drop(event, 1); });
                if (_dy.element('.middle' + dropItem.id, dropItem))
                    _dy.element('.middle' + dropItem.id, dropItem).addEventListener("drop", (event) => { drop(event, 2); });
            }
        });
    },
    hideAllDragHelper: function () {
        _dy.elements('.dropItem .before,.after,.middle', function (sub) {
            if (sub && sub.classList)
                sub.classList.add('hdn-i');
        });
    },
    urlParam: function (index) {
        return location.href.replaceAll('%20', ' ').replaceAll('%2B', '+').split('/')[2 + index].split('#')[0];
    },
    routeParam: function (index) {
        if (index == undefined || index == null) {
            return location.search.indexOf('~') !== -1 ? location.search.split('~') : location.search.split('/');
        }
        if (typeof (index) == 'number') {
            var s = location.search.replace('?', '').indexOf('~') != -1 ? location.search.replace('?', '').split('~')[index] : location.search.replace('?', '').split('/')[index];
            return s;
        }
        else {
            var prs = location.search.split('/');
            for (var i in prs) {
                if (prs[i].toLowerCase().indexOf(index.toString().toLowerCase()) == 0) {
                    return prs[i].substring(index.length).replace('?', '');
                }
            }
        }
    },
};
// Public compatibility facade: preserve constructor aliases and method names.
dy.prototype = Object.assign({}, createRuntimeState(), domApi, templateApi, requestApi, lifecycleApi, renderingApi, controllerApi, legacyApi);
export function dyScript() { }
dyScript.prototype = {
    coreThreadIdentity: 0,
    coreScript: [],
    add: function (p, fn, prm, localJs, ts) {
        dy.prototype.down({
            url: p,
            success: function (d) {
                _dyScript.coreThreadIdentity++;
                var d1 = d;
                if (!prm)
                    prm = {};
                prm.TID = _dyScript.coreThreadIdentity;
                for (var pm in prm) {
                    if (typeof (prm[pm]) == 'object') {
                        _dy.temp_objectIden++;
                        _dyScript.coreScript[_dy.temp_objectIden] = prm[pm];
                        d1 = d1.replaceAll('$$' + pm, '_dyScript.coreScript[' + _dy.temp_objectIden + ']');
                    }
                    else
                        d1 = d1.replaceAll('$$' + pm, prm[pm]);
                }
                if (localJs) {
                    var local = {};
                    local = dy.prototype.js(d1);
                    if (fn) {
                        var l = fn(prm, local);
                    }
                }
                else {
                    trustedScripts.execute(d1);
                    if (fn) {
                        if (ts)
                            setTimeout(function () { fn(prm); }, ts);
                        else
                            fn(prm);
                    }
                }
            }
        });
    },
    load: function (ps, fn, n, isLocal) {
        if (n == undefined) {
            _dyScript.load(ps, fn, 0, isLocal);
            return;
        }
        if (n >= ps.length) {
            if (fn)
                fn();
            return;
        }
        if (n < ps.length) {
            _dyScript.add(ps[n], n == ps.length - 1 ? fn : function (op, l) {
                _dyScript.load(ps, fn, n + 1, isLocal);
            }, null, isLocal);
        }
    },
};
// Styles are part of this module: no extra stylesheet or import is required.
const styleDefaults = {
    sizes: { '0': '0px', xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', full: '100%', auto: 'auto' },
    textSizes: { sm: '12px', md: '16px', lg: '24px', xl: '32px' },
    colors: { main: '#1462ab', white: '#fff', black: '#000', transparent: 'transparent' },
    borders: { '0': '0px', '1': '1px', '2': '2px' },
    radius: { '0': '0px', sm: '4px', md: '8px', lg: '16px', full: '9999px' },
    layers: { base: 0, dropdown: 10, modal: 100 },
    opacity: { '0': 0, '05': 0.5, '1': 1 },
    shadows: [],
    breakPoints: [420, 720, 1010],
};
const styleLength = value => typeof value === 'number' || /^-?(?:\d+\.?\d*|\.\d+)$/.test(String(value).trim())
    ? String(value).trim() + 'px' : String(value);
const styleClass = value => CSS.escape(String(value));
const styleRule = (selector, declarations) => selector + '{' + Object.entries(declarations)
    .map(([property, value]) => property + ':' + value + ';').join('') + '}\n';
const styleEntries = (options, key) => Object.entries(options && options[key] || {});
const styleTarget = target => typeof target === 'string' ? document.querySelector(target) : target;
const visibilityTimers = new WeakMap();
function setStyleVisibility(target, hidden, duration) {
    const element = styleTarget(target);
    if (!element)
        return null;
    clearTimeout(visibilityTimers.get(element));
    element.classList.toggle('hdn-i', hidden);
    if (Number(duration) > 0) {
        visibilityTimers.set(element, setTimeout(() => {
            element.classList.toggle('hdn-i', !hidden);
            visibilityTimers.delete(element);
        }, Number(duration)));
    }
    return element;
}
const motionFrames = {
    fadeIn: [{ opacity: 0 }, { opacity: 1 }],
    fadeOut: [{ opacity: 1 }, { opacity: 0 }],
    slideUp: [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }],
    slideDown: [{ opacity: 0, transform: 'translateY(-20px)' }, { opacity: 1, transform: 'translateY(0)' }],
    slideLeft: [{ opacity: 0, transform: 'translateX(20px)' }, { opacity: 1, transform: 'translateX(0)' }],
    slideRight: [{ opacity: 0, transform: 'translateX(-20px)' }, { opacity: 1, transform: 'translateX(0)' }],
    zoomIn: [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'scale(1)' }],
    zoomOut: [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.9)' }],
    pulse: [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }],
    shake: [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(0)' }],
    spin: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
};
const motionNames = Object.fromEntries(Object.keys(motionFrames).map(name => [
    name, name.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()),
]));
function easyAnimationCss() {
    let css = '';
    for (const [name, frames] of Object.entries(motionFrames)) {
        const effect = motionNames[name];
        css += '@keyframes op-' + effect + '{' + frames.map((frame, index) => {
            const properties = Object.fromEntries(Object.entries(frame).map(([key, value]) => [
                key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()), value,
            ]));
            return styleRule((index * 100 / (frames.length - 1)) + '%', properties);
        }).join('') + '}\n';
        css += styleRule('.op-' + effect, {
            'animation-name': 'op-' + effect,
            'animation-duration': 'var(--op-duration,' + (name === 'spin' ? '1s' : '300ms') + ')',
            'animation-delay': 'var(--op-delay,0ms)',
            'animation-timing-function': 'var(--op-easing,' + (name === 'spin' ? 'linear' : 'ease-out') + ')',
            'animation-iteration-count': 'var(--op-repeat,' + (name === 'spin' ? 'infinite' : '1') + ')',
            'animation-fill-mode': 'both',
        });
    }
    css += '.op-fast{--op-duration:150ms}.op-slow{--op-duration:1s}' +
        '.op-loop{--op-repeat:infinite}.op-paused{animation-play-state:paused}';
    const selectors = Object.values(motionNames).map(name => '.op-' + name).join(',');
    const legacySelectors = ".rot-45, .animated, .animated.hinge, ._pulse, .rubberBand, .shake, .swing, .tada, .wobble, .jello, .bounceIn, .bounceInDown, .bounceInLeft, .bounceInRight, .bounceInUp, .bounceOut, .bounceOutDown, .bounceOutLeft, .bounceOutRight, .bounceOutUp, .fadeIn, .fadeInDown, .fadeInDownBig, .fadeInLeft, .fadeInLeftBig, .fadeInRight, .fadeInRightBig, .fadeInUp, .fadeInUpBig, .fadeOut, .fadeOutDown, .fadeOutDownBig, .fadeOutLeft, .fadeOutLeftBig, .fadeOutRight, .fadeOutRightBig, .fadeOutUp, .fadeOutUpBig, .an.flip, .animated.flip, .flipInX, .flipInY, .flipOutX, .flipOutY, .lightSpeedIn, .lightSpeedOut, .rotateIn, .rotating-r, .rotating, .rotateInDownLeft, .rotateInDownRight, .rotateInUpLeft, .rotateInUpRight, .rotateOut, .rotateOutDownLeft, .rotateOutDownRight, .rotateOutUpLeft, .rotateOutUpRight, .hinge, .rollIn, .rollOut, .zoomIn, .zoomInDown, .zoomInLeft, .zoomInRight, .zoomInUp, .zoomOut, .zoomOutDown, .zoomOutLeft, .zoomOutRight, .zoomOutUp, .slideInDown, .slideInLeft, .slideInRight, .slideInUp, .slideOutDown, .slideOutLeft, .slideOutRight, .slideOutUp, .rotate3, .rotate4, .pulse";
    return css + '@media(prefers-reduced-motion:reduce){' + selectors + ',' + legacySelectors +
        '{animation-duration:.01ms!important;animation-delay:0ms!important;animation-iteration-count:1!important}}';
}
const opStyle = {
    version: '1.1.1',
    init(value = '') {
        const element = document.createElement('style');
        element.textContent = String(value);
        document.head.appendChild(element);
        return element;
    },
    live(id, value = '') {
        let element = document.getElementById(id);
        if (element && element.tagName !== 'STYLE')
            throw new TypeError('ophtml: style ID belongs to another element: ' + id);
        if (!element) {
            element = document.createElement('style');
            element.id = id;
            document.head.appendChild(element);
        }
        element.textContent = String(value);
        return element;
    },
    default_template() {
        return Object.fromEntries(Object.entries(styleDefaults).map(([key, value]) => [
            key, Array.isArray(value) ? value.slice() : { ...value },
        ]));
    },
    build(options = {}) {
        const config = this.default_template();
        for (const [key, value] of Object.entries(options)) {
            config[key] = value && typeof value === 'object' && !Array.isArray(value)
                ? { ...config[key], ...value } : value;
        }
        return this.nasted() + this.flex() + this.hidden() + this.overflow() + this.icon() +
            this.size(config) + this.fontSize(config) + this.color(config) + this.border(config) +
            this.radius(config) + this.layer(config) + this.opacity(config) + this.responsive(config) +
            this.shadow('main', config);
    },
    use(options = {}, id = 'ophtml-theme') {
        this.live(id, this.build(options));
        return this;
    },
    size(options = {}) {
        let css = '';
        for (let width = 1; width <= 4; width++) {
            for (let height = 1; height <= 4; height++)
                css += styleRule('.asp-' + width + 'x' + height, { 'aspect-ratio': width + '/' + height + ' !important' });
        }
        const properties = {
            '_w-mx': ['max-width'], '_w-ex': ['width', 'min-width', 'max-width'],
            '_h-ex': ['height', 'min-height', 'max-height'], '_h-mx': ['max-height'],
            '_w-mn': ['min-width'], '_h-mn': ['min-height'], '_w': ['width'], '_h': ['height'],
            l: ['left'], r: ['right'], t: ['top'], b: ['bottom'],
            _pl: ['padding-left'], _pr: ['padding-right'], _pt: ['padding-top'], _pb: ['padding-bottom'],
            _ptb: ['padding-top', 'padding-bottom'], _plr: ['padding-left', 'padding-right'], _p: ['padding'],
            ml: ['margin-left'], mr: ['margin-right'], mt: ['margin-top'], mb: ['margin-bottom'],
            mtb: ['margin-top', 'margin-bottom'], mlr: ['margin-left', 'margin-right'], m: ['margin'],
            gap: ['gap'], 'gap-x': ['column-gap'], 'gap-y': ['row-gap'],
        };
        for (const [key, raw] of styleEntries(options, 'sizes')) {
            const value = styleLength(raw);
            for (const [prefix, props] of Object.entries(properties)) {
                for (const important of [false, true]) {
                    const declarations = Object.fromEntries(props.map(prop => [prop, value + (important ? ' !important' : '')]));
                    css += styleRule('.' + styleClass(prefix + (important ? '-i-' : '-') + key), declarations);
                }
            }
            for (const [prefix, property] of Object.entries({ l: 'left', r: 'right', t: 'top', b: 'bottom' })) {
                if (CSS.supports(property, 'calc(-1 * (' + value + '))'))
                    css += styleRule('.' + styleClass(prefix + '-n' + key), { [property]: 'calc(-1 * (' + value + '))' });
            }
        }
        return css;
    },
    fontSize(options = {}) {
        let css = [100, 300, 500, 700, 900].map(weight => styleRule('.fw-' + weight, { 'font-weight': weight })).join('');
        for (const align of ['left', 'center', 'right'])
            css += styleRule('.ta-' + align, { 'text-align': align });
        for (const [key, value] of styleEntries(options, 'textSizes')) {
            css += styleRule('.' + styleClass('fs-' + key), { 'font-size': styleLength(value) });
            css += styleRule('.' + styleClass('fs-i-' + key), { 'font-size': styleLength(value) + ' !important' });
        }
        return css;
    },
    border(options = {}) {
        let css = '.b-none{border:none!important}.b-solid{border-style:solid!important}' +
            '.b-dash{border-style:dashed!important}.b-dot{border-style:dotted!important}.ba-00{border:none!important}\n';
        for (const [key, value] of styleEntries(options, 'borders')) {
            for (const [prefix, prop] of Object.entries({ ba: 'border-width', bt: 'border-top-width', bb: 'border-bottom-width', bl: 'border-left-width', br: 'border-right-width' }))
                css += styleRule('.' + styleClass(prefix + '-' + key), { [prop]: styleLength(value) + ' !important', 'border-style': 'solid' });
        }
        return css;
    },
    color(options = {}) {
        let css = '';
        for (const [key, value] of styleEntries(options, 'colors')) {
            if (typeof value !== 'string')
                continue;
            for (const [prefix, prop] of Object.entries({ c: 'background-color', 'c-t': 'color', 'c-b': 'border-color' })) {
                css += styleRule('.' + styleClass(prefix + key), { [prop]: value });
                css += styleRule('.' + styleClass(prefix + '-i' + key), { [prop]: value + ' !important' });
                for (const [letter, state] of [['h', 'hover'], ['f', 'focus']]) {
                    css += styleRule('.' + styleClass(prefix + '-' + letter + key) + ':' + state, { [prop]: value, cursor: 'pointer' });
                    css += styleRule('.' + styleClass(prefix + '-i-' + letter + key) + ':' + state, { [prop]: value + ' !important', cursor: 'pointer' });
                }
            }
        }
        return css;
    },
    radius(options = {}, key = 'rad', sub = '') {
        let css = '';
        const corners = {
            '': ['border-radius'], r: ['border-top-right-radius', 'border-bottom-right-radius'],
            l: ['border-top-left-radius', 'border-bottom-left-radius'],
            t: ['border-top-left-radius', 'border-top-right-radius'], b: ['border-bottom-left-radius', 'border-bottom-right-radius'],
        };
        for (const [token, value] of styleEntries(options, 'radius')) {
            for (const [side, props] of Object.entries(corners))
                css += styleRule('.' + styleClass(key + (side ? '-' + side : '') + '-' + token) + (sub ? ' ' + sub : ''), Object.fromEntries(props.map(prop => [prop, styleLength(value)])));
        }
        return css;
    },
    layer(options = {}) {
        return styleEntries(options, 'layers').map(([key, value]) => styleRule('.' + styleClass('ly-' + key), { 'z-index': value + ' !important' })).join('');
    },
    opacity(options = {}) {
        return styleEntries(options, 'opacity').map(([key, value]) => styleRule('.' + styleClass('op-' + key), { opacity: value }) +
            styleRule('.' + styleClass('op-h' + key) + ':hover', { opacity: value })).join('');
    },
    shadow(name = 'main', options = {}) {
        let css = '';
        for (const [key, raw] of styleEntries(options, 'shadows')) {
            const structured = raw !== null && typeof raw === 'object';
            const parts = String(raw).split('.');
            const blur = structured ? styleLength(raw.blur ?? 8) : styleLength(Number(parts[0]));
            const opacity = structured ? raw.opacity ?? 0.15 : Number('0.' + (parts[1] || '15'));
            const suffix = structured ? key : parts[0] + '-' + (parts[1] || '15');
            const rgb = structured ? raw.rgb ?? options.rgb ?? '0,0,0' : options.rgb ?? '0,0,0';
            const x = structured ? styleLength(raw.x ?? 1) : '1px';
            const y = structured ? styleLength(raw.y ?? 1) : '1px';
            const spread = structured ? styleLength(raw.spread ?? 0) : '0px';
            const value = `${x} ${y} ${blur} ${spread} rgba(${rgb},${opacity})`;
            css += styleRule('.' + styleClass('shadow-' + name + '-' + suffix), { 'box-shadow': value });
            css += styleRule('.' + styleClass('shadow-h' + name + '-' + suffix) + ':hover', { 'box-shadow': value });
        }
        return css;
    },
    responsive(options = {}) {
        const points = options.breakPoints || styleDefaults.breakPoints;
        if (points.length !== 3 || points.some((point, index) => !Number.isFinite(Number(point)) || Number(point) <= 0 || (index && Number(point) <= Number(points[index - 1]))))
            throw new RangeError('ophtml: breakPoints must contain three increasing positive numbers');
        const [small, medium, large] = points.map(Number);
        const prefix = options.key ?? 'resp-';
        const ranges = [`(width < ${small}px)`, `(${small}px <= width < ${medium}px)`,
            `(${medium}px <= width < ${large}px)`, `(width >= ${large}px)`];
        let css = '';
        ranges.forEach((query, bucket) => {
            css += '@media ' + query + '{';
            for (let mask = 0; mask < 16; mask++) {
                const bits = mask.toString(2).padStart(4, '0');
                css += styleRule('.' + styleClass(prefix + bits), { display: bits[bucket] === '1' ? 'flex' : 'none !important' });
            }
            css += styleRule('.wcord', { width: bucket === 3 ? large + 'px' : '100%' });
            if (bucket === 1)
                css += '.wcord div,.wcord input,.wcord select{font-size:9pt}';
            css += `.brk::after{content:'${bucket + 1}'}}`;
        });
        for (const short of [true, false]) {
            css += `@media (width < ${small}px) and (height ${short ? '<' : '>='} ${small}px){`;
            for (let mask = 0; mask < 4; mask++) {
                const bits = mask.toString(2).padStart(2, '0');
                css += styleRule('.' + styleClass(prefix + bits), { display: bits[short ? 0 : 1] === '1' ? 'flex' : 'none !important' });
            }
            css += `.brk::after{content:'${short ? 2 : 1}'}}`;
        }
        return css;
    },
    flex() {
        return `
.f { display: flex; unicode-bidi: normal; }
.fl { display: inline-flex; }
.f-r { flex-direction: row; }
.f-rr { flex-direction: row-reverse; }
.f-c { flex-direction: column; }
.f-cr { flex-direction: column-reverse; }
.f-w { flex-wrap: wrap; }
.f-nw { flex-wrap: nowrap; white-space: nowrap; }
.f-wr { flex-wrap: wrap-reverse; }
.f-js { justify-content: flex-start; }
.f-je { justify-content: flex-end; }
.f-jc { justify-content: center; }
.f-jb { justify-content: space-between; }
.f-ja { justify-content: space-around; }
.f-as { align-items: flex-start; }
.f-ae { align-items: flex-end; }
.f-ac { align-items: center; }
.f-al { align-items: baseline; }
.f-at { align-items: stretch; }
.f-cs { align-content: flex-start; }
.f-ce { align-content: flex-end; }
.f-cc { align-content: center; }
.f-cb { align-content: space-between; }
.f-ca { align-content: space-around; }
.f-ct { align-content: stretch; }
.f-sa { align-self: auto; }
.f-ss { align-self: flex-start; }
.f-se { align-self: flex-end; }
.f-sc { align-self: center; }
.f-sl { align-self: baseline; }
.f-st { align-self: stretch; }
.flex-rc { display: flex; flex-direction: row; justify-content: center; align-items: center; flex-wrap: wrap; }
.flex-rc>div { align-self: center; flex: 0 1 auto; }
.flex-cc { display: flex; flex-direction: column; justify-content: center; align-items: center; flex-wrap: wrap; }
.flex-cc>div { align-self: center; flex: 0 1 auto; }
.f-center { display: flex; align-content: center; justify-content: center; align-items: center; }
.f-fit { display: flex; flex-direction: column; justify-content: space-around; align-content: stretch; align-items: stretch; }
.f-fit>div,
 .f-fit>canvas { align-self: stretch; flex: 1 0 auto ; }
.f-i01 { flex: 0 1 auto ; }
.f-i11 { flex: 1 1 auto ; }
.f-i00 { flex: 0 0 auto ; }
.f-i10 { flex: 1 0 auto ; }
.f-col2 { column-count: 2; }
.f-col3 { column-count: 3; }
.f-col4 { column-count: 4; }
`;
    },
    nasted() {
        return `
html,
        body,
        *,
        div { font-family: 'Helvetica'; }
.full { top: 0%; left: 0%; width: 100%; height: 100%; }
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.prevent-select { user-select: none; }
canvas { outline : none !important; }
notValid { display:none; }
.notValid notValid { display:block !important; }
.notValid valid { display:none !important; }
.valid notValid { display:none !important; }
.valid valid { display:block !important; }
.no-out { outline : none !important }
.ns   .sub,
 .ns   .sub-f { display: none; }
.ns:hover .sub,
 .ns:focus .sub { display: block; }
.ns:hover .sub-f,
 .ns:focus .sub-f { display: flex; }
@keyframes v3load { 100% { left: -68.5%; } 0% { left: -40%; } }
V3LOADING,
        .v3 { display: block; position: absolute; text-align: center; z-index: 999; left: 0%; width: 100%; height: 100%; top: 50%; }
V3LOADING>span { color: #1360a83d; font-size: 35px; font-family: Helvetica bold; font-weight: 100; width: 66px; position: relative; }
V3LOADING>span .v1::after { content: '/////////////////'; border-radius: 5px; left: 0px; position: relative; animation: linear infinite; animation-name: v3load; animation-duration: 2s; }
V3LOADING>span .v1 { position: relative; left: calc(50% - 50px); height: 55px; overflow: hidden; max-width: 100px; }
V3LOADING>span .v3 { color: #1462ab; position: relative; top: -14px; font-size: 12px; font-weight: 700; z-index: 15; }
V3LOADING>span .info { position: fixed; color: #1462ab99; bottom: 30px; width: 100%; font-size: 13px; }
V3LOADING .v1 .progress { position: absolute; left: 0px; width: 0%; height: 17px; bottom: calc( 0% ); overflow: hidden; background-color: #1462ab; border-radius: 2px; }
V3LOADING .v1 .progress div { color: #ffffff; position: relative; top: 2px; font-size: 12px; font-weight: 700; z-index: 130; }
`;
    },
    nested() { return this.nasted(); },
    overflow() { return '.owf{overflow:hidden}.owf-x{overflow-x:hidden}.owf-y{overflow-y:hidden}'; },
    hidden() {
        return 'input[type="file"]{cursor:pointer!important}.hdn{display:none}.hdn-i{display:none!important}' +
            '*[disable],*[disabled],.disabled{user-select:none;opacity:.5;filter:grayscale(60%);pointer-events:none!important}';
    },
    icon() {
        return '.icon{font-family:"Material Symbols Outlined"!important;font-weight:normal;font-style:normal;' +
            'display:inline-block;line-height:1;text-transform:none;letter-spacing:normal;word-wrap:normal;white-space:nowrap;' +
            'direction:ltr;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-feature-settings:"liga"}';
    },
    animation() {
        return `
.rot-45 { transform: rotate3d(0, 0, 1, 45deg); }
.animated { animation-duration: 1s; animation-fill-mode: both; }
.animated.hinge { animation-duration: 2s; }
@keyframes pulse { 0% { transform: scale3d(1, 1, 1); } 50% { transform: scale3d(1.05, 1.05, 1.05); } 100% { transform: scale3d(1, 1, 1); } }
._pulse { animation-name: pulse; }
@keyframes rubberBand { 0% { transform: scale3d(1, 1, 1); } 30% { transform: scale3d(1.25, 0.75, 1); } 40% { transform: scale3d(0.75, 1.25, 1); } 50% { transform: scale3d(1.15, 0.85, 1); } 65% { transform: scale3d(.95, 1.05, 1); } 75% { transform: scale3d(1.05, .95, 1); } 100% { transform: scale3d(1, 1, 1); } }
.rubberBand { animation-name: rubberBand; }
@keyframes shake { 0%, 100% { transform: translate3d(0, 0, 0); } 10%, 30%, 50%, 70%, 90% { transform: translate3d(-10px, 0, 0); } 20%, 40%, 60%, 80% { transform: translate3d(10px, 0, 0); } }
.shake { animation-name: shake; }
@keyframes swing { 20% { transform: rotate3d(0, 0, 1, 15deg); } 40% { transform: rotate3d(0, 0, 1, -10deg); } 60% { transform: rotate3d(0, 0, 1, 5deg); } 80% { transform: rotate3d(0, 0, 1, -5deg); } 100% { transform: rotate3d(0, 0, 1, 0deg); } }
.swing { transform-origin: top center; animation-name: swing; }
@keyframes tada { 0% { transform: scale3d(1, 1, 1); } 10%, 20% { transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg); } 30%, 50%, 70%, 90% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg); } 40%, 60%, 80% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg); } 100% { transform: scale3d(1, 1, 1); } }
.tada { animation-name: tada; }
@keyframes wobble { 0% { transform: none; } 15% { transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg); } 30% { transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg); } 45% { transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg); } 60% { transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg); } 75% { transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg); } 100% { transform: none; } }
.wobble { animation-name: wobble; }
@keyframes jello { 11.1% { transform: none; } 22.2% { transform: skewX(-12.5deg) skewY(-12.5deg); } 33.3% { transform: skewX(6.25deg) skewY(6.25deg); } 44.4% { transform: skewX(-3.125deg) skewY(-3.125deg); } 55.5% { transform: skewX(1.5625deg) skewY(1.5625deg); } 66.6% { transform: skewX(-0.78125deg) skewY(-0.78125deg); } 77.7% { transform: skewX(0.390625deg) skewY(0.390625deg); } 88.8% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); } 100% { transform: none; } }
.jello { animation-name: jello; transform-origin: center; }
@keyframes bounceIn { 0%, 20%, 40%, 60%, 80%, 100% { animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); } 0% { opacity: 0; transform: scale3d(.3, .3, .3); } 20% { transform: scale3d(1.1, 1.1, 1.1); } 40% { transform: scale3d(.9, .9, .9); } 60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); } 80% { transform: scale3d(.97, .97, .97); } 100% { opacity: 1; transform: scale3d(1, 1, 1); } }
.bounceIn { animation-name: bounceIn; }
@keyframes bounceInDown { 0%, 60%, 75%, 90%, 100% { animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); } 0% { opacity: 0; transform: translate3d(0, -3000px, 0); } 60% { opacity: 1; transform: translate3d(0, 25px, 0); } 75% { transform: translate3d(0, -10px, 0); } 90% { transform: translate3d(0, 5px, 0); } 100% { transform: none; } }
.bounceInDown { animation-name: bounceInDown; }
@keyframes bounceInLeft { 0%, 60%, 75%, 90%, 100% { animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); } 0% { opacity: 0; transform: translate3d(-3000px, 0, 0); } 60% { opacity: 1; transform: translate3d(25px, 0, 0); } 75% { transform: translate3d(-10px, 0, 0); } 90% { transform: translate3d(5px, 0, 0); } 100% { transform: none; } }
.bounceInLeft { animation-name: bounceInLeft; }
@keyframes bounceInRight { 0%, 60%, 75%, 90%, 100% { animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); } 0% { opacity: 0; transform: translate3d(3000px, 0, 0); } 60% { opacity: 1; transform: translate3d(-25px, 0, 0); } 75% { transform: translate3d(10px, 0, 0); } 90% { transform: translate3d(-5px, 0, 0); } 100% { transform: none; } }
.bounceInRight { animation-name: bounceInRight; }
@keyframes bounceInUp { 0%, 60%, 75%, 90%, 100% { animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); } 0% { opacity: 0; transform: translate3d(0, 3000px, 0); } 60% { opacity: 1; transform: translate3d(0, -20px, 0); } 75% { transform: translate3d(0, 10px, 0); } 90% { transform: translate3d(0, -5px, 0); } 100% { transform: translate3d(0, 0, 0); } }
.bounceInUp { animation-name: bounceInUp; }
@keyframes bounceOut { 20% { transform: scale3d(.9, .9, .9); } 50%, 55% { opacity: 1; transform: scale3d(1.1, 1.1, 1.1); } 100% { opacity: 0; transform: scale3d(.3, .3, .3); } }
.bounceOut { animation-name: bounceOut; }
@keyframes bounceOutDown { 20% { transform: translate3d(0, 10px, 0); } 40%, 45% { opacity: 1; transform: translate3d(0, -20px, 0); } 100% { opacity: 0; transform: translate3d(0, 2000px, 0); } }
.bounceOutDown { animation-name: bounceOutDown; }
@keyframes bounceOutLeft { 20% { opacity: 1; transform: translate3d(20px, 0, 0); } 100% { opacity: 0; transform: translate3d(-2000px, 0, 0); } }
.bounceOutLeft { animation-name: bounceOutLeft; }
@keyframes bounceOutRight { 20% { opacity: 1; transform: translate3d(-20px, 0, 0); } 100% { opacity: 0; transform: translate3d(2000px, 0, 0); } }
.bounceOutRight { animation-name: bounceOutRight; }
@keyframes bounceOutUp { 20% { transform: translate3d(0, -10px, 0); } 40%, 45% { opacity: 1; transform: translate3d(0, 20px, 0); } 100% { opacity: 0; transform: translate3d(0, -2000px, 0); } }
.bounceOutUp { animation-name: bounceOutUp; }
@keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
.fadeIn { animation-name: fadeIn; }
@keyframes fadeInDown { 0% { opacity: 0; transform: translate3d(0, -100%, 0); } 100% { opacity: 1; transform: none; } }
.fadeInDown { animation-name: fadeInDown; }
@keyframes fadeInDownBig { 0% { opacity: 0; transform: translate3d(0, -2000px, 0); } 100% { opacity: 1; transform: none; } }
.fadeInDownBig { animation-name: fadeInDownBig; }
@keyframes fadeInLeft { 0% { opacity: 0; transform: translate3d(-100%, 0, 0); } 100% { opacity: 1; transform: none; } }
.fadeInLeft { animation-name: fadeInLeft; }
@keyframes fadeInLeftBig { 0% { opacity: 0; transform: translate3d(-2000px, 0, 0); } 100% { opacity: 1; transform: none; } }
.fadeInLeftBig { animation-name: fadeInLeftBig; }
@keyframes fadeInRight { 0% { opacity: 0; transform: translate3d(100%, 0, 0); } 100% { opacity: 1; transform: none; } }
.fadeInRight { animation-name: fadeInRight; }
@keyframes fadeInRightBig { 0% { opacity: 0; transform: translate3d(2000px, 0, 0); } 100% { opacity: 1; transform: none; } }
.fadeInRightBig { animation-name: fadeInRightBig; }
@keyframes fadeInUp { 0% { opacity: 0; transform: translate3d(0, 100%, 0); } 100% { opacity: 1; transform: none; } }
.fadeInUp { animation-name: fadeInUp; }
@keyframes fadeInUpBig { 0% { opacity: 0; transform: translate3d(0, 2000px, 0); } 100% { opacity: 1; transform: none; } }
.fadeInUpBig { animation-name: fadeInUpBig; }
@keyframes fadeOut { 0% { opacity: 1; } 100% { opacity: 0; } }
.fadeOut { animation-name: fadeOut; }
@keyframes fadeOutDown { 0% { opacity: 1; } 100% { opacity: 0; transform: translate3d(0, 100%, 0); } }
.fadeOutDown { animation-name: fadeOutDown; }
@keyframes fadeOutDownBig { 0% { opacity: 1; } 100% { opacity: 0; transform: translate3d(0, 2000px, 0); } }
.fadeOutDownBig { animation-name: fadeOutDownBig; }
@keyframes fadeOutLeft { 0% { opacity: 1; } 100% { opacity: 0; transform: translate3d(-100%, 0, 0); } }
.fadeOutLeft { animation-name: fadeOutLeft; }
@keyframes fadeOutLeftBig { 0% { opacity: 1; } 100% { opacity: 0; transform: translate3d(-2000px, 0, 0); } }
.fadeOutLeftBig { animation-name: fadeOutLeftBig; }
@keyframes fadeOutRight { 0% { opacity: 1; } 100% { opacity: 0; transform: translate3d(100%, 0, 0); } }
.fadeOutRight { animation-name: fadeOutRight; }
@keyframes fadeOutRightBig { 0% { opacity: 1; } 100% { opacity: 0; transform: translate3d(2000px, 0, 0); } }
.fadeOutRightBig { animation-name: fadeOutRightBig; }
@keyframes fadeOutUp { 0% { opacity: 1; } 100% { opacity: 0; transform: translate3d(0, -100%, 0); } }
.fadeOutUp { animation-name: fadeOutUp; }
@keyframes fadeOutUpBig { 0% { opacity: 1; } 100% { opacity: 0; transform: translate3d(0, -2000px, 0); } }
.fadeOutUpBig { animation-name: fadeOutUpBig; }
@keyframes flip { 0% { transform: perspective(400px) rotate3d(0, 1, 0, -360deg); animation-timing-function: ease-out; } 40% { transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -190deg); animation-timing-function: ease-out; } 50% { transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -170deg); animation-timing-function: ease-in; } 80% { transform: perspective(400px) scale3d(.95, .95, .95); animation-timing-function: ease-in; } 100% { transform: perspective(400px); animation-timing-function: ease-in; } }
.an.flip, .animated.flip { backface-visibility: visible; animation-name: flip; }
@keyframes flipInX { 0% { transform: perspective(400px) rotate3d(1, 0, 0, 90deg); animation-timing-function: ease-in; opacity: 0; } 40% { transform: perspective(400px) rotate3d(1, 0, 0, -20deg); animation-timing-function: ease-in; } 60% { transform: perspective(400px) rotate3d(1, 0, 0, 10deg); opacity: 1; } 80% { transform: perspective(400px) rotate3d(1, 0, 0, -5deg); } 100% { transform: perspective(400px); } }
.flipInX { backface-visibility: visible !important; animation-name: flipInX; }
@keyframes flipInY { 0% { transform: perspective(400px) rotate3d(0, 1, 0, 90deg); animation-timing-function: ease-in; opacity: 0; } 40% { transform: perspective(400px) rotate3d(0, 1, 0, -20deg); animation-timing-function: ease-in; } 60% { transform: perspective(400px) rotate3d(0, 1, 0, 10deg); opacity: 1; } 80% { transform: perspective(400px) rotate3d(0, 1, 0, -5deg); } 100% { transform: perspective(400px); } }
.flipInY { backface-visibility: visible !important; animation-name: flipInY; }
@keyframes flipOutX { 0% { transform: perspective(400px); } 30% { transform: perspective(400px) rotate3d(1, 0, 0, -20deg); opacity: 1; } 100% { transform: perspective(400px) rotate3d(1, 0, 0, 90deg); opacity: 0; } }
.flipOutX { animation-name: flipOutX; backface-visibility: visible !important; }
@keyframes flipOutY { 0% { transform: perspective(400px); } 30% { transform: perspective(400px) rotate3d(0, 1, 0, -15deg); opacity: 1; } 100% { transform: perspective(400px) rotate3d(0, 1, 0, 90deg); opacity: 0; } }
.flipOutY { backface-visibility: visible !important; animation-name: flipOutY; }
@keyframes lightSpeedIn { 0% { transform: translate3d(100%, 0, 0) skewX(-30deg); opacity: 0; } 60% { transform: skewX(20deg); opacity: 1; } 80% { transform: skewX(-5deg); opacity: 1; } 100% { transform: none; opacity: 1; } }
.lightSpeedIn { animation-name: lightSpeedIn; animation-timing-function: ease-out; }
@keyframes lightSpeedOut { 0% { opacity: 1; } 100% { transform: translate3d(100%, 0, 0) skewX(30deg); opacity: 0; } }
.lightSpeedOut { animation-name: lightSpeedOut; animation-timing-function: ease-in; }
@keyframes rotateIn { 0% { transform-origin: center; transform: rotate3d(0, 0, 1, -200deg); opacity: 0; } 100% { transform-origin: center; transform: none; opacity: 1; } }
.rotateIn { animation-name: rotateIn; }
@keyframes rotateInf { 0% { transform-origin: center; transform: rotate3d(0, 0, 1, -360deg); opacity: 0; } 100% { transform-origin: center; transform: none; opacity: 1; } }
@keyframes rotating-r { from { transform-origin: center; transform: rotate(0deg); } to { transform-origin: center; transform: rotate( 360deg); } }
.rotating-r { animation: rotating-r 2s linear infinite; }
@keyframes rotating { from { transform-origin: center; transform: rotate(0deg); } to { transform-origin: center; transform: rotate(-360deg); } }
.rotating { animation: rotating 2s linear infinite; }
@keyframes rotateInDownLeft { 0% { transform-origin: left bottom; transform: rotate3d(0, 0, 1, -45deg); opacity: 0; } 100% { transform-origin: left bottom; transform: none; opacity: 1; } }
.rotateInDownLeft { animation-name: rotateInDownLeft; }
@keyframes rotateInDownRight { 0% { transform-origin: right bottom; transform: rotate3d(0, 0, 1, 45deg); opacity: 0; } 100% { transform-origin: right bottom; transform: none; opacity: 1; } }
.rotateInDownRight { animation-name: rotateInDownRight; }
@keyframes rotateInUpLeft { 0% { transform-origin: left bottom; transform: rotate3d(0, 0, 1, 45deg); opacity: 0; } 100% { transform-origin: left bottom; transform: none; opacity: 1; } }
.rotateInUpLeft { animation-name: rotateInUpLeft; }
@keyframes rotateInUpRight { 0% { transform-origin: right bottom; transform: rotate3d(0, 0, 1, -90deg); opacity: 0; } 100% { transform-origin: right bottom; transform: none; opacity: 1; } }
.rotateInUpRight { animation-name: rotateInUpRight; }
@keyframes rotateOut { 0% { transform-origin: center; opacity: 1; } 100% { transform-origin: center; transform: rotate3d(0, 0, 1, 200deg); opacity: 0; } }
.rotateOut { animation-name: rotateOut; }
@keyframes rotateOutDownLeft { 0% { transform-origin: left bottom; opacity: 1; } 100% { transform-origin: left bottom; transform: rotate3d(0, 0, 1, 45deg); opacity: 0; } }
.rotateOutDownLeft { animation-name: rotateOutDownLeft; }
@keyframes rotateOutDownRight { 0% { transform-origin: right bottom; opacity: 1; } 100% { transform-origin: right bottom; transform: rotate3d(0, 0, 1, -45deg); opacity: 0; } }
.rotateOutDownRight { animation-name: rotateOutDownRight; }
@keyframes rotateOutUpLeft { 0% { transform-origin: left bottom; opacity: 1; } 100% { transform-origin: left bottom; transform: rotate3d(0, 0, 1, -45deg); opacity: 0; } }
.rotateOutUpLeft { animation-name: rotateOutUpLeft; }
@keyframes rotateOutUpRight { 0% { transform-origin: right bottom; opacity: 1; } 100% { transform-origin: right bottom; transform: rotate3d(0, 0, 1, 90deg); opacity: 0; } }
.rotateOutUpRight { animation-name: rotateOutUpRight; }
@keyframes hinge { 0% { transform-origin: top left; animation-timing-function: ease-in-out; } 20%, 60% { transform: rotate3d(0, 0, 1, 80deg); transform-origin: top left; animation-timing-function: ease-in-out; } 40%, 80% { transform: rotate3d(0, 0, 1, 60deg); transform-origin: top left; animation-timing-function: ease-in-out; opacity: 1; } 100% { transform: translate3d(0, 700px, 0); opacity: 0; } }
.hinge { animation-name: hinge; }
@keyframes rollIn { 0% { opacity: 0; transform: translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg); } 100% { opacity: 1; transform: none; } }
.rollIn { animation-name: rollIn; }
@keyframes rollOut { 0% { opacity: 1; } 100% { opacity: 0; transform: translate3d(100%, 0, 0) rotate3d(0, 0, 1, 120deg); } }
.rollOut { animation-name: rollOut; }
@keyframes zoomIn { 0% { opacity: 0; transform: scale3d(.3, .3, .3); } 50% { opacity: 1; } }
.zoomIn { animation-name: zoomIn; }
@keyframes zoomInDown { 0% { opacity: 0; transform: scale3d(.1, .1, .1) translate3d(0, -1000px, 0); animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190); } 60% { opacity: 1; transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0); animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1); } }
.zoomInDown { animation-name: zoomInDown; }
@keyframes zoomInLeft { 0% { opacity: 0; transform: scale3d(.1, .1, .1) translate3d(-1000px, 0, 0); animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190); } 60% { opacity: 1; transform: scale3d(.475, .475, .475) translate3d(10px, 0, 0); animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1); } }
.zoomInLeft { animation-name: zoomInLeft; }
@keyframes zoomInRight { 0% { opacity: 0; transform: scale3d(.1, .1, .1) translate3d(1000px, 0, 0); animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190); } 60% { opacity: 1; transform: scale3d(.475, .475, .475) translate3d(-10px, 0, 0); animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1); } }
.zoomInRight { animation-name: zoomInRight; }
@keyframes zoomInUp { 0% { opacity: 0; transform: scale3d(.1, .1, .1) translate3d(0, 1000px, 0); animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190); } 60% { opacity: 1; transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0); animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1); } }
.zoomInUp { animation-name: zoomInUp; }
@keyframes zoomOut { 0% { opacity: 1; } 50% { opacity: 0; transform: scale3d(.3, .3, .3); } 100% { opacity: 0; } }
.zoomOut { animation-name: zoomOut; }
@keyframes zoomOutDown { 40% { opacity: 1; transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0); animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190); } 100% { opacity: 0; transform: scale3d(.1, .1, .1) translate3d(0, 2000px, 0); transform-origin: center bottom; animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1); } }
.zoomOutDown { animation-name: zoomOutDown; }
@keyframes zoomOutLeft { 40% { opacity: 1; transform: scale3d(.475, .475, .475) translate3d(42px, 0, 0); } 100% { opacity: 0; transform: scale(.1) translate3d(-2000px, 0, 0); transform-origin: left center; } }
.zoomOutLeft { animation-name: zoomOutLeft; }
@keyframes zoomOutRight { 40% { opacity: 1; transform: scale3d(.475, .475, .475) translate3d(-42px, 0, 0); } 100% { opacity: 0; transform: scale(.1) translate3d(2000px, 0, 0); transform-origin: right center; } }
.zoomOutRight { animation-name: zoomOutRight; }
@keyframes zoomOutUp { 40% { opacity: 1; transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0); animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190); } 100% { opacity: 0; transform: scale3d(.1, .1, .1) translate3d(0, -2000px, 0); transform-origin: center bottom; animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1); } }
.zoomOutUp { animation-name: zoomOutUp; }
@keyframes slideInDown { 0% { transform: translate3d(0, -100%, 0); visibility: visible; } 100% { transform: translate3d(0, 0, 0); } }
.slideInDown { animation-name: slideInDown; }
@keyframes slideInLeft { 0% { transform: translate3d(-100%, 0, 0); visibility: visible; } 100% { transform: translate3d(0, 0, 0); } }
.slideInLeft { animation-name: slideInLeft; }
@keyframes slideInRight { 0% { transform: translate3d(100%, 0, 0); visibility: visible; } 100% { transform: translate3d(0, 0, 0); } }
.slideInRight { animation-name: slideInRight; }
@keyframes slideInUp { 0% { transform: translate3d(0, 100%, 0); visibility: visible; } 100% { transform: translate3d(0, 0, 0); } }
.slideInUp { animation-name: slideInUp; }
@keyframes slideOutDown { 0% { transform: translate3d(0, 0, 0); } 100% { visibility: hidden; transform: translate3d(0, 100%, 0); } }
.slideOutDown { animation-name: slideOutDown; }
@keyframes slideOutLeft { 0% { transform: translate3d(0, 0, 0); } 100% { visibility: hidden; transform: translate3d(-100%, 0, 0); } }
.slideOutLeft { animation-name: slideOutLeft; }
@keyframes slideOutRight { 0% { transform: translate3d(0, 0, 0); } 100% { visibility: hidden; transform: translate3d(100%, 0, 0); } }
.slideOutRight { animation-name: slideOutRight; }
@keyframes slideOutUp { 0% { transform: translate3d(0, 0, 0); } 100% { visibility: hidden; transform: translate3d(0, -100%, 0); } }
.slideOutUp { animation-name: slideOutUp; }
@keyframes rotate3 { 100% { transform: rotate(360deg); } }
.rotate3 { animation-name: rotate3; }
@keyframes rotate4 { 100% { transform: rotate(-360deg); } }
.rotate4 { animation-name: rotate4; }
.pulse { animation-name: pulse; }
` + easyAnimationCss();
    },
    animate(target, effect = 'fadeIn', options = {}) {
        const element = styleTarget(target);
        if (!element)
            return null;
        const name = Object.keys(motionNames).find(key => key === effect || motionNames[key] === effect || 'op-' + motionNames[key] === effect);
        if (!name)
            throw new RangeError('ophtml: unknown animation ' + effect);
        const timing = {
            duration: name === 'spin' ? 1000 : 300, easing: name === 'spin' ? 'linear' : 'ease-out', fill: 'both',
            ...(typeof options === 'number' ? { duration: options } : options),
        };
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            timing.duration = 0;
            timing.delay = 0;
            timing.iterations = 1;
            timing.endDelay = 0;
        }
        return element.animate(motionFrames[name], timing);
    },
    helpers: {
        show(target, duration) { return setStyleVisibility(target, false, duration); },
        hide(target, duration) { return setStyleVisibility(target, true, duration); },
    },
};
var _dyHtml = dy.prototype;
var _dyScript = dyScript.prototype;
function reportHookError(element, cause) {
    if (cause?.name === 'AbortError' && cause.ophtml?.phase === 'dispose')
        return;
    const error = contextualError(cause, { phase: 'hook', tid: Number(element.dataset.tid) || undefined });
    element.dispatchEvent(new CustomEvent('ophtml-error', { detail: error, bubbles: true }));
}
// These elements are activation signals for the existing template controllers.
// Defer one microtask so innerHTML has inserted the sibling template and parent
// conditional elements can discard inactive branches before child hooks run.
class OpElement extends HTMLElement {
    static ophtmlElement = true;
    connectedCallback() {
        if (this._opStarted || this._opScheduled)
            return;
        this._opScheduled = true;
        this.ready = Promise.resolve().then(async () => {
            this._opScheduled = false;
            if (!this.isConnected || this._opStarted)
                return;
            this._opStarted = true;
            const state = window._dy.TsID[this.dataset.tid];
            if (this.hasAttribute('data-tid') && window._dy.isDisposed(this.dataset.tid))
                return;
            const backgroundReady = state?.backgroundReady;
            if (backgroundReady)
                await backgroundReady;
            if (!this.isConnected) {
                this._opStarted = false;
                return;
            }
            if (this.hasAttribute('data-tid') && window._dy.isDisposed(this.dataset.tid))
                return;
            return this.activate();
        });
        this.ready.catch(error => reportHookError(this, error));
    }
    activate() { }
}
class OpRepeater extends OpElement {
    activate() { return window._dy.elementPageRepeat(this, Number(this.dataset.tid)); }
}
class OpSwitch extends OpElement {
    activate() { return window._dy.elementPageSwitch(this, Number(this.dataset.tid)); }
}
class OpCom extends OpElement {
    activate() { return window._dy.elementPageLoad(this, Number(this.dataset.tid)); }
}
class OpIf extends OpElement {
    activate() {
        if (!this.hasAttribute('test'))
            throw new Error('ophtml: <if> requires test');
        const branches = Array.from(this.children).filter(node => node.localName === 'op-else');
        if (branches.length > 1)
            throw new Error('ophtml: <if> accepts one direct <else>');
        const yes = !!window._dy.js(this.getAttribute('test'));
        const alternative = branches[0];
        if (yes)
            alternative?.remove();
        else
            this.replaceChildren(...(alternative ? Array.from(alternative.childNodes) : []));
        this.style.display = 'contents';
    }
}
class OpElse extends OpElement {
    activate() { throw new Error('ophtml: <else> must be a direct child of <if>'); }
}
function registerComponentElements() {
    for (const [name, constructor] of Object.entries({
        'op-repeater': OpRepeater, 'op-switch': OpSwitch, 'op-com': OpCom,
        'op-if': OpIf, 'op-else': OpElse,
    })) {
        const existing = customElements.get(name);
        if (existing && !existing.ophtmlElement)
            throw new Error('ophtml: custom element name already registered: ' + name);
        if (!existing)
            customElements.define(name, constructor);
    }
}
// Single startup boundary: install compatibility globals, hooks, and base CSS.
function installRuntime(engine, scripts, styles) {
    engine.hookMode = 'elements';
    engine.init(engine, scripts);
    installLegacySplitFirst();
    window._dyInit = true;
    window._ophtml = engine;
    window._ophtmlScript = scripts;
    engine.style = styles;
    engine.animate = styles.animate.bind(styles);
    window._dyStyle = styles;
    window._ophtmlStyle = styles;
    registerComponentElements();
    styles.live('ophtml-animations', styles.animation());
    styles.live('ophtml-visibility', styles.hidden());
}
installRuntime(_dyHtml, _dyScript, opStyle);
export { dy as ophtml, opStyle as style };
export default {
    html: _dyHtml,
    script: _dyScript,
    style: opStyle
};
