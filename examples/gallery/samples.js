// These are gallery fixtures and handlers, not additional OPHTML runtime APIs.
const people = [{ name: 'Ada Lovelace', role: 'Engineer', initials: 'AL' }, { name: 'Lin Chen', role: 'Designer', initials: 'LC' }, { name: 'Sam Rivera', role: 'Writer', initials: 'SR' }];
const products = [{ name: 'Notebook', price: 18, stock: 12 }, { name: 'Morning cup', price: 24, stock: 8 }, { name: 'Desk light', price: 64, stock: 0 }];

export const samples = [
  { id: 'basic-repeat', title: 'The simple repeater', category: 'Data', description: 'Turn an array of objects into a useful list.', data: { people } },
  { id: 'product-grid', title: 'Product cards', category: 'Data', description: 'Repeat products with per-item stock conditions.', data: { products } },
  { id: 'data-table', title: 'A proper data table', category: 'Data', description: 'Generate native table rows with a #dy expression.', data: { people } },
  { id: 'todo-list', title: 'A little to-do list', category: 'Data', description: 'Update data and explicitly render checked tasks.', data: { tasks: [{ id: 1, label: 'Read the docs', done: true }, { id: 2, label: 'Make something', done: false }] }, events: {
    async change(ctx, event) { const id = Number(event.target.dataset.task); const task = ctx.data.tasks.find(item => item.id === id); if (task) { task.done = event.target.checked; await ctx.render(); } }
  } },
  { id: 'view-switcher', title: 'One switch, three views', category: 'Logic', description: 'Select a zero-based switcher case with oncreate.', data: { view: 0 }, events: {
    async change(ctx, event) { if (event.target.matches('[data-view]')) { ctx.data.view = Number(event.target.value); await ctx.render(); } }
  } },
  { id: 'if-session', title: 'Signed in, or not', category: 'Logic', description: 'Use #if, #then, #else, and #end with a boolean.', data: { signedIn: false }, events: {
    async click(ctx, event) { if (event.target.closest('[data-toggle]')) { ctx.data.signedIn = !ctx.data.signedIn; await ctx.render(); } }
  } },
  { id: 'is-stock', title: 'An expression condition', category: 'Logic', description: '#is value compares stock before rendering HTML.', data: { stock: 3 }, events: {
    async click(ctx, event) { if (event.target.closest('[data-stock]')) { ctx.data.stock = ctx.data.stock ? 0 : 3; await ctx.render(); } }
  } },
  { id: 'is-defined', title: 'Optional content', category: 'Logic', description: '#is define uses the original truthiness rules.', data: { subtitle: 'A small optional subtitle.' }, events: {
    async click(ctx, event) { if (event.target.closest('[data-toggle]')) { ctx.data.subtitle = ctx.data.subtitle ? '' : 'A small optional subtitle.'; await ctx.render(); } }
  } },
  { id: 'is-missing', title: 'A graceful fallback', category: 'Logic', description: '#is not define checks an absent property.', data: {}, events: {
    async click(ctx, event) { if (event.target.closest('[data-toggle]')) { if ('nickname' in ctx.data) delete ctx.data.nickname; else ctx.data.nickname = 'Ada'; await ctx.render(); } }
  } },
  { id: 'nested-conditions', title: 'Conditions within conditions', category: 'Logic', description: 'Combine account and permission checks.', data: { account: true, admin: false }, events: {
    async change(ctx, event) { if (event.target.dataset.flag) { ctx.data[event.target.dataset.flag] = event.target.checked; await ctx.render(); } }
  } },
  { id: 'expression-total', title: 'The tiny calculator', category: 'Logic', description: '#dy evaluates a total from price and quantity.', data: { price: 18, quantity: 2 }, events: {
    async change(ctx, event) { if (event.target.matches('[data-quantity]')) { ctx.data.quantity = Number(event.target.value); await ctx.render(); } }
  } },
  { id: 'nested-categories', title: 'Repeat inside a component', category: 'Components', description: 'A repeated loader gives each category its own list.', data: { groups: [{ groupTitle: 'Essentials', entries: [{ itemName: 'Notebook' }, { itemName: 'Pen' }] }, { groupTitle: 'Desk', entries: [{ itemName: 'Lamp' }] }] }, dependencies: ['category-list'], events: {
    async click(ctx, event) { if (event.target.closest('[data-add-entry]')) { ctx.data.groups[0].entries.push({ itemName: 'New item ' + ctx.data.groups[0].entries.length }); await ctx.render(); } }
  } },
  { id: 'nested-team', title: 'Teams and their people', category: 'Components', description: 'Separate component scopes keep nested data clear.', data: { teams: [{ teamTitle: 'Design', members: people.slice(0, 2) }, { teamTitle: 'Editorial', members: people.slice(2) }] }, dependencies: ['team-members'] },
  { id: 'nested-board', title: 'Three levels of components', category: 'Components', description: 'Columns repeat cards; card components repeat tags.', data: { columns: [{ columnTitle: 'In progress', cards: [{ cardTitle: 'Build gallery', tags: [{ tagLabel: 'HTML' }, { tagLabel: 'OPHTML' }] }, { cardTitle: 'Write docs', tags: [{ tagLabel: 'Docs' }] }] }, { columnTitle: 'Done', cards: [{ cardTitle: 'Set up project', tags: [{ tagLabel: 'Setup' }] }] }] }, dependencies: ['board-column', 'board-card'] },
  { id: 'faq', title: 'Questions, answered', category: 'Interface', description: 'Repeat native details elements for an accordion.', data: { questions: [{ question: 'Do I need a build step?', answer: 'No. Serve the files over HTTP.' }, { question: 'Is state reactive?', answer: 'No. Update the DOM or explicitly render again.' }] } },
  { id: 'tabs', title: 'A compact tab panel', category: 'Interface', description: 'Accessible tab buttons drive a switcher.', data: { active: 0 }, events: {
    async click(ctx, event) { const button = event.target.closest('[data-tab]'); if (button) { ctx.data.active = Number(button.dataset.tab); await ctx.render(); ctx.root.querySelector('[data-tab="' + ctx.data.active + '"]').focus(); } },
    async keydown(ctx, event) { const tab = event.target.closest('[data-tab]'); if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); ctx.data.active = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - ctx.data.active; await ctx.render(); ctx.root.querySelector('[data-tab="' + ctx.data.active + '"]').focus(); }
  } },
  { id: 'dropdown', title: 'A useful dropdown', category: 'Interface', description: 'Native disclosure keeps a small menu simple.', data: { options: [{ label: 'Your profile' }, { label: 'Settings' }, { label: 'Help center' }] }, events: {
    click(ctx, event) { const button = event.target.closest('[data-menu-choice]'); if (button) { ctx.root.querySelector('[data-menu-result]').textContent = button.textContent + ' selected'; ctx.root.querySelector('details').open = false; } }
  } },
  { id: 'modal', title: 'A native modal', category: 'Interface', description: 'Use dialog for focus management and Escape.', data: {}, events: {
    click(ctx, event) { if (event.target.closest('[data-open]')) ctx.root.querySelector('dialog').showModal(); if (event.target.closest('[data-close]')) ctx.root.querySelector('dialog').close(); }
  } },
  { id: 'toast', title: 'A friendly notification', category: 'Interface', description: 'Visibility helpers show and dismiss feedback.', data: {}, events: {
    click(ctx, event) { if (event.target.closest('[data-toast]')) { const toast = ctx.root.querySelector('[data-toast-message]'); _dy.style.helpers.show(toast, 1800); } }
  } },
  { id: 'pagination', title: 'A page at a time', category: 'Data', description: 'Slice data and re-render the current page.', data: { page: 1, all: people.concat([{ name: 'Noor Ali', role: 'Developer', initials: 'NA' }]), rows: people.slice(0, 2) }, events: {
    async click(ctx, event) { const button = event.target.closest('[data-page]'); if (button) { ctx.data.page = Number(button.dataset.page); ctx.data.rows = ctx.data.all.slice((ctx.data.page - 1) * 2, ctx.data.page * 2); await ctx.render(); } }
  } },
  { id: 'search-list', title: 'Find something quickly', category: 'Data', description: 'Filter the array, then refresh the repeater.', data: { query: '', queryAttribute: '', all: products, matches: products }, events: {
    async input(ctx, event) { if (!event.target.matches('[data-search-products]')) return; const position = event.target.selectionStart; ctx.data.query = event.target.value; ctx.data.queryAttribute = ctx.data.query.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]); ctx.data.matches = ctx.data.all.filter(item => item.name.toLowerCase().includes(ctx.data.query.toLowerCase())); await ctx.render(); const input = ctx.root.querySelector('input'); input.focus(); input.setSelectionRange(position, position); }
  } },
  { id: 'sort-list', title: 'Put things in order', category: 'Data', description: 'Sort repeated products by price in either direction.', data: { order: 'asc', products }, events: {
    async change(ctx, event) { ctx.data.order = event.target.value; ctx.data.products.sort((a, b) => ctx.data.order === 'asc' ? a.price - b.price : b.price - a.price); await ctx.render(); }
  } },
  { id: 'form', title: 'A small signup form', category: 'Interface', description: 'Native validation plus honest local feedback.', data: {}, events: {
    submit(ctx, event) { event.preventDefault(); const input = ctx.root.querySelector('input'); ctx.root.querySelector('[data-form-result]').textContent = 'Thanks! Demo signup for ' + input.value; }
  } },
  { id: 'stepper', title: 'One step after another', category: 'Interface', description: 'A switcher makes a three-step flow explicit.', data: { step: 0 }, events: {
    async click(ctx, event) { const button = event.target.closest('[data-step]'); if (button) { ctx.data.step = Math.max(0, Math.min(2, ctx.data.step + Number(button.dataset.step))); await ctx.render(); } }
  } },
  { id: 'pricing', title: 'Choose a plan', category: 'Data', description: 'Repeat pricing cards with a conditional recommendation.', data: { plans: [{ planName: 'Starter', amount: 0, featured: false }, { planName: 'Pro', amount: 12, featured: true }] }, events: {
    click(ctx, event) { const button = event.target.closest('[data-plan]'); if (button) ctx.notify(button.dataset.plan + ' selected — demo only'); }
  } },
  { id: 'breadcrumbs', title: 'You are here', category: 'Data', description: 'A repeated breadcrumb trail with a current page.', data: { crumbs: [{ label: 'Home', current: false }, { label: 'Components', current: false }, { label: 'Gallery', current: true }] } },
  { id: 'timeline', title: 'A readable activity feed', category: 'Data', description: 'Repeat events into a simple vertical timeline.', data: { events: [{ activity: 'Project created', time: '09:00' }, { activity: 'Components added', time: '10:30' }, { activity: 'Ready to share', time: '12:00' }] } },
  { id: 'avatars', title: 'A few familiar faces', category: 'Data', description: 'Repeat an avatar stack with accessible names.', data: { people } },
  { id: 'progress', title: 'A little progress', category: 'Data', description: 'Native progress bars from repeated data.', data: { metrics: [{ label: 'Design', value: 85 }, { label: 'Development', value: 60 }, { label: 'Documentation', value: 40 }] } },
  { id: 'async-states', title: 'Loading, empty, or error', category: 'Logic', description: 'Switch between honest interface states.', data: { state: 0 }, events: {
    async change(ctx, event) { ctx.data.state = Number(event.target.value); await ctx.render(); }
  } },
  { id: 'badges', title: 'Status at a glance', category: 'Logic', description: 'Deferred #if conditions choose each row’s badge.', data: { orders: [{ orderName: 'Order 1042', shipped: true }, { orderName: 'Order 1043', shipped: false }] } },
  { id: 'theme', title: 'Light meets dark', category: 'Style', description: 'One palette powers every preview through dyStyle.', data: {}, events: {
    click(ctx, event) { const button = event.target.closest('[data-theme-choice]'); if (button) ctx.setTheme(button.dataset.themeChoice); }
  } },
  { id: 'mouse', title: 'Follow the cursor', category: 'Style', description: 'Hover, focus, and pointer coordinates use style tokens.', data: {}, events: {
    pointermove(ctx, event) { const pad = event.target.closest('[data-pointer]'); if (!pad) return; const box = pad.getBoundingClientRect(); const x = Math.round(event.clientX - box.left), y = Math.round(event.clientY - box.top); pad.style.setProperty('--x', x + 'px'); pad.style.setProperty('--y', y + 'px'); pad.querySelector('output').textContent = x + ', ' + y; }
  } },
  { id: 'motion', title: 'A little motion', category: 'Style', description: 'Replay an effect using the native Animation handle.', data: {}, events: {
    click(ctx, event) { const button = event.target.closest('[data-effect]'); if (!button) return; const motion = _dy.animate(ctx.root.querySelector('[data-motion]'), button.dataset.effect, 350); motion.finished.then(() => motion.cancel()).catch(() => {}); }
  } },
  { id: 'dynamic', title: 'An inline component', category: 'Components', description: 'A dy tag renders its own parameter scope.', data: {} },
  { id: 'counter', title: 'State inside a component', category: 'Components', description: 'Main initialization owns a component-local counter.', data: {} }
];
