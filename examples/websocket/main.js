import OPHTML from '../../dyHTML/ophtml.js';
const engine = OPHTML.html;
const roots = {api:'https://api.rudan.studio/op/components/',cdn:'https://cdn.rudan.studio/op/components/',socket:'wss://' + location.host + '/__op/components'};
const form = document.querySelector('#profile-form'),status = document.querySelector('#status');
let requests = 0, renderVersion = 0;
function escaped(value) {return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function service() {
  if (window.OPComponents) return window.OPComponents;
  return new Promise((resolve,reject) => {
    const timer = setTimeout(() => {window.removeEventListener('op-components-ready',ready);reject(Error('The mapped-page component helper is unavailable.'));},30000);
    function ready() {clearTimeout(timer);resolve(window.OPComponents);}
    window.addEventListener('op-components-ready',ready,{once:true});
  });
}
async function render(fresh = false) {
  const version = ++renderVersion;status.dataset.error = 'false';status.textContent = 'Loading profile card…';
  engine.root = roots[document.querySelector('#root').value];
  try {
    const html = await engine.render('profile-card',{name:escaped(document.querySelector('#name').value),role:escaped(document.querySelector('#role').value),noCache:fresh});
    if (version !== renderVersion) return;
    document.querySelector('#profile-card').innerHTML = html;
    status.textContent = 'Profile card rendered through OPHTML. Template cache is active.';
  } catch (error) {if(version === renderVersion){status.dataset.error = 'true';status.textContent = 'Could not load the component: ' + error.message;}}
}
form.addEventListener('submit',event => {event.preventDefault();render();});
document.querySelector('#refresh').addEventListener('click',() => render(true));
document.querySelector('#root').addEventListener('change',() => render());
try {
  const client = await service();
  engine.componentSocket = {get ready(){return client.ready;},get(names,options){document.querySelector('#request-count').textContent = String(++requests);return client.get(names,options);}};
  await render();
} catch(error) {status.dataset.error = 'true';status.textContent = error.message;}
