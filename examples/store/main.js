import OPHTML from '../../dyHTML/ophtml.js';

const _dy = OPHTML.html;
_dy.root = new URL('./components/', import.meta.url).pathname;
_dy.style.use({
  colors: { main: '#244bd8', muted: '#667085', surface: '#ffffff', success: '#147346' },
  sizes: { card: '280px' },
  radius: { card: '18px' }
});

// Static trusted demo data. Sanitize external data for its destination first.
const products = [
  { id: 'notebook', name: 'Everyday notebook', description: 'A quiet place for your next idea.', price: 18, stock: 12, emoji: '📓' },
  { id: 'cup', name: 'Morning cup', description: 'A ceramic companion for slow mornings.', price: 24, stock: 8, emoji: '☕' },
  { id: 'lamp', name: 'Desk light', description: 'A warm glow for focused evenings.', price: 64, stock: 0, emoji: '💡' }
];
let inStockOnly = false;
let basket = 0;
const app = document.querySelector('#app');
const status = document.querySelector('#status');

async function render() {
  app.setAttribute('aria-busy', 'true');
  try {
    app.innerHTML = await _dy.render('catalog', {
      heading: inStockOnly ? 'Available now' : 'The collection',
      products: inStockOnly ? products.filter(product => product.stock > 0) : products
    });
  } catch (error) {
    app.textContent = 'Could not load products. Check the component path and HTTP server.';
    status.textContent = error.message;
  } finally {
    app.setAttribute('aria-busy', 'false');
  }
}

// Delegation keeps working after rendering replaces the product DOM.
app.addEventListener('click', event => {
  const button = event.target.closest('button[data-product]');
  if (!button) return;
  const product = products.find(item => item.id === button.dataset.product);
  if (!product || product.stock < 1) return;
  basket += 1;
  document.querySelector('#basket').textContent = 'Basket: ' + basket;
  status.textContent = product.name + ' added to basket.';
  const motion = _dy.animate(button.closest('article'), 'pulse', { duration: 220 });
  motion?.finished.then(() => motion.cancel()).catch(() => {});
});

document.querySelector('#filter').addEventListener('click', async event => {
  inStockOnly = !inStockOnly;
  event.currentTarget.setAttribute('aria-pressed', String(inStockOnly));
  event.currentTarget.textContent = inStockOnly ? 'Show all products' : 'Show in-stock only';
  await render();
});

document.querySelector('#replay').addEventListener('click', () => {
  app.querySelectorAll('article').forEach((card, index) => {
    const motion = _dy.animate(card, 'slideUp', { duration: 300, delay: index * 60 });
    motion.finished.then(() => motion.cancel()).catch(() => {});
  });
  status.textContent = 'Animation replayed.';
});

await render();
