import { refreshToc, report } from './store.js';

const chapters = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8'];

refreshToc();
report();
window.Framsteg?.onConnect(report);
for (const k of chapters) {
  import(`./kap/${k}.js`)
    .then(m => m.init())
    .catch(err => {
      console.error(k, err);
      document.getElementById(k)?.insertAdjacentHTML('beforeend', '<p class="warn">Den här delen kunde inte laddas. Prova att ladda om sidan.</p>');
    });
}
