/* LUNA QR-меню: разделы, поиск, заказ. Данные в data.js. */
const D = window.LUNA;
const $ = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => n.toLocaleString('ru-RU').replace(/\s/g, '\u00a0') + '\u00a0₸';
const PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

const cart = new Map();
let mode = 'hall';

/* плоский список блюд */
const flat = [];
D.menu.forEach((g) => g.items.forEach(([n, p, d]) => flat.push({ g: g.id, n, p, d: d || '' })));
flat.forEach((it, i) => { it.id = i; });

$('[data-hours]').textContent = D.hours.map((h) => h.join(' ')).join(' / ');
$('[data-addr]').textContent = `${D.city}, ${D.addr} / Instagram @${D.instagram}`;

/* разделы */
$('[data-cats]').innerHTML = D.menu.map((g, i) => `<button class="cat" type="button" data-go="${g.id}" aria-current="${i === 0}">${esc(g.t)}</button>`).join('');

function render(q = '') {
  const norm = (t) => t.toLowerCase().replace(/ё/g, 'е');
  const s = norm(q.trim());
  const html = D.menu.map((g) => {
    const items = flat.filter((it) => it.g === g.id && (!s || norm(it.n + ' ' + it.d).includes(s)));
    if (!items.length) return '';
    return `<section class="group" id="${g.id}">
      <div class="group__head"><h2>${esc(g.t)}</h2></div>
      <div class="group__band"></div>
      ${g.note ? `<p class="group__note">${esc(g.note)}</p>` : ''}
      ${g.img && !s ? `<div class="group__img"><img src="${esc(g.img)}" alt="" loading="lazy"></div>` : ''}
      ${items.map((it) => `<div class="item">
        <span class="item__name">${esc(it.n)}</span>
        ${it.d ? `<span class="item__desc">${esc(it.d)}</span>` : ''}
        <span class="item__price">${money(it.p)}</span>
        <button class="item__add" type="button" data-add="${it.id}" aria-label="Добавить: ${esc(it.n)}">${PLUS}</button>
      </div>`).join('')}
    </section>`;
  }).join('');
  $('[data-menu]').innerHTML = html || '<p class="empty">Ничего не нашлось. Попробуйте другое слово.</p>';
  paintAdds();
}
render();

/* переход по разделам и подсветка текущего */
$('[data-cats]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (!b) return;
  const el = document.getElementById(b.dataset.go);
  if (!el) return;
  const off = $('.top').offsetHeight + $('.cats').offsetHeight + ($('.search').hidden ? 0 : $('.search').offsetHeight) - 1;
  const y = el.getBoundingClientRect().top + scrollY - off;
  scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});
/* лента разделов крутится только по горизонтали и только при смене раздела:
   scrollIntoView на iPhone дёргал всю страницу */
const strip = $('[data-cats]');
let current = '';
const setCurrent = (id) => {
  if (id === current) return;
  current = id;
  $$('.cat').forEach((c) => {
    const on = c.dataset.go === id;
    c.setAttribute('aria-current', String(on));
    if (on) strip.scrollTo({ left: c.offsetLeft - (strip.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
  });
};
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    let cur = D.menu[0].id;
    for (const s of $$('.group')) if (s.getBoundingClientRect().top < 140) cur = s.id;
    setCurrent(cur);
  });
}, { passive: true });

/* поиск */
const searchBox = $('.search');
const input = $('input', searchBox);
$('.search-btn').addEventListener('click', () => {
  searchBox.hidden = !searchBox.hidden;
  if (!searchBox.hidden) input.focus(); else { input.value = ''; render(); }
});
input.addEventListener('input', () => render(input.value));

/* заказ */
const subtotal = () => [...cart].reduce((s, [id, q]) => s + flat[id].p * q, 0);
const count = () => [...cart.values()].reduce((s, q) => s + q, 0);
function paintAdds() {
  $$('[data-add]').forEach((b) => {
    const q = cart.get(+b.dataset.add) || 0;
    b.classList.toggle('is-in', q > 0);
    b.innerHTML = q ? String(q) : PLUS;
    b.setAttribute('aria-label', (q ? `В заказе ${q}, добавить ещё: ` : 'Добавить: ') + flat[+b.dataset.add].n);
  });
}
function setQty(id, q) {
  if (q <= 0) cart.delete(id); else cart.set(id, Math.min(30, q));
  try { sessionStorage.setItem('luna-cart', JSON.stringify([...cart])); } catch (e) {}
  paintAdds(); paintCart();
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-add]');
  if (a) setQty(+a.dataset.add, (cart.get(+a.dataset.add) || 0) + 1);
});

const bar = $('.cartbar');
const sheet = $('.sheet');
function paintCart() {
  const n = count(), sub = subtotal(), svc = mode === 'hall' ? Math.round(sub * D.service / 100) : 0;
  bar.hidden = !n;
  $('.cartbar__count').textContent = n;
  $('.cartbar__sum').textContent = money(sub + svc);
  $('[data-cart]').innerHTML = [...cart].map(([id, q]) => `<li class="ci">
      <span class="ci__name">${esc(flat[id].n)}</span>
      <span class="ci__qty"><button type="button" data-dec="${id}" aria-label="Убрать одну">−</button><output>${q}</output><button type="button" data-inc="${id}" aria-label="Добавить ещё">+</button></span>
      <span class="ci__sum">${money(flat[id].p * q)}</span>
    </li>`).join('');
  $('[data-sub]').textContent = money(sub);
  $('[data-svc]').textContent = mode === 'hall' ? money(svc) : 'нет';
  $('[data-total]').textContent = money(sub + svc);
  $('[data-hint]').textContent = mode === 'hall'
    ? 'Покажите этот экран официанту, или отправьте заказ, и он придёт на кухню.'
    : 'Заказ придёт администратору в WhatsApp. Заберёте по адресу ' + D.addr + '.';
  $('.sheet__demo').hidden = true;   // старый текст заказа не показываем после изменений
  if (!n) openSheet(false);
}
function openSheet(v, fromHistory) {
  if (sheet.hidden === !v) return;
  sheet.hidden = !v;
  document.body.classList.toggle('is-locked', v);
  if (fromHistory) return;
  if (v) history.pushState({ sheet: 1 }, '');
  else if (history.state && history.state.sheet) history.back();
}
addEventListener('popstate', () => openSheet(false, true));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') openSheet(false); });
bar.addEventListener('click', () => openSheet(true));
$('.sheet__close').addEventListener('click', () => openSheet(false));
sheet.addEventListener('click', (e) => { if (e.target === sheet) openSheet(false); });
$('[data-cart]').addEventListener('click', (e) => {
  const i = e.target.closest('[data-inc]'), d = e.target.closest('[data-dec]');
  if (i) setQty(+i.dataset.inc, (cart.get(+i.dataset.inc) || 0) + 1);
  if (d) setQty(+d.dataset.dec, (cart.get(+d.dataset.dec) || 0) - 1);
});
$$('.mode').forEach((b) => b.addEventListener('click', () => {
  mode = b.dataset.mode;
  $$('.mode').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  paintCart();
}));
$('[data-send]').addEventListener('click', () => {
  const lines = [...cart].map(([id, q]) => `${flat[id].n} x${q} — ${money(flat[id].p * q)}`);
  const sub = subtotal(), svc = mode === 'hall' ? Math.round(sub * D.service / 100) : 0;
  const text = [`Заказ в ${D.name} (${mode === 'hall' ? 'в зале' : 'с собой'}):`, ...lines, `Итого: ${money(sub + svc)}`].join('\n');
  if (!D.whatsapp) {
    const box = $('.sheet__demo');
    box.hidden = false;
    box.textContent = 'Демо: в рабочей версии этот текст уйдёт в WhatsApp заведения.\n\n' + text;
    return;
  }
  window.open(`https://wa.me/${D.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});
try {
  JSON.parse(sessionStorage.getItem('luna-cart') || '[]').forEach(([id, q]) => { if (flat[id] && q > 0) cart.set(id, Math.min(30, q)); });
} catch (e) {}
paintAdds();
paintCart();
