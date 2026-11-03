/* =====================================================================
   TOBYL COFFEE. Концепт.
   Анимации: GSAP + ScrollTrigger, плавный скролл: Lenis, 3D: cup.js.
   Если библиотеки или WebGL недоступны, сайт остаётся рабочим.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. ДАННЫЕ
   --------------------------------------------------------------------- */
const SITE = { name: 'Tobyl Coffee', whatsapp: '77000000000' };

const MENU = [
  { cat: 'Горячие', items: [
    { name: 'Эспрессо', note: 'двойной, на нашей обжарке', vol: '30 мл', price: 900 },
    { name: 'Американо', vol: '350 мл', price: 1100 },
    { name: 'Капучино', vol: '250 мл', price: 1400 },
    { name: 'Флэт уайт', note: 'двойной шот, меньше молока', vol: '200 мл', price: 1500 },
    { name: 'Латте', vol: '350 мл', price: 1600 },
    { name: 'Раф ванильный', vol: '350 мл', price: 1800 },
    { name: 'Латте «Тобыл»', note: 'солёная карамель и сливочный крем', vol: '350 мл', price: 1900 },
  ]},
  { cat: 'Холодные', items: [
    { name: 'Айс-латте', note: 'тот самый, из первого экрана', vol: '400 мл', price: 1700 },
    { name: 'Айс-американо', vol: '400 мл', price: 1300 },
    { name: 'Колд брю', note: '12 часов холодной экстракции', vol: '300 мл', price: 1600 },
    { name: 'Эспрессо-тоник', vol: '300 мл', price: 1800 },
    { name: 'Бамбл', note: 'апельсиновый сок, карамель, эспрессо', vol: '300 мл', price: 1800 },
  ]},
  { cat: 'Без кофе', items: [
    { name: 'Матча латте', vol: '350 мл', price: 1900 },
    { name: 'Какао', note: 'бельгийский шоколад', vol: '350 мл', price: 1400 },
    { name: 'Облепиховый чай', note: 'с мёдом и апельсином', vol: '500 мл', price: 1300 },
    { name: 'Лимонад', note: 'маракуйя или клубника', vol: '400 мл', price: 1500 },
  ]},
  { cat: 'Выпечка', items: [
    { name: 'Круассан', note: 'печём каждое утро в 7:00', vol: '80 г', price: 1100 },
    { name: 'Круассан с миндалём', vol: '110 г', price: 1500 },
    { name: 'Баурсаки с мёдом', note: 'пять штук, тёплые', vol: '150 г', price: 900 },
    { name: 'Баскский чизкейк', vol: '140 г', price: 1900 },
    { name: 'Синнабон', vol: '130 г', price: 1500 },
  ]},
];

const BREW = [
  { label: 'Лёд', t: 'Лёд', d: 'Восемь крупных кубиков из фильтрованной воды. Тают медленно и не разбавляют кофе до последнего глотка.', spec: ['8 кубиков', '−18 °C'] },
  { label: 'Молоко', t: 'Молоко', d: 'Холодное молоко 3,2 % с фермы под Костанаем. Можно заменить на овсяное или миндальное.', spec: ['200 мл', '4 °C'] },
  { label: 'Эспрессо', t: 'Эспрессо', d: 'Двойной шот льём последним, поверх молока. Кофе опускается вниз облаками, и получаются слои.', spec: ['18 г зерна', '28 секунд'] },
  { label: 'С собой', t: 'С собой', d: 'Купол, трубочка, и можно идти гулять вдоль Тобола. Без очереди, если заказать с сайта.', spec: ['400 мл', '1 700 ₸'] },
];

const ORIGINS = [
  { name: 'Эфиопия, Иргачеффе', notes: 'черника, бергамот, жасмин', use: 'для эспрессо-тоника и фильтра' },
  { name: 'Колумбия, Уила', notes: 'карамель, апельсин, какао', use: 'основа всех молочных напитков' },
  { name: 'Бразилия, Серрадо', notes: 'фундук, молочный шоколад', use: 'в колд брю и раф' },
];

const PICKUP = ['Через 10 минут', 'Через 20 минут', 'Через 30 минут', 'Через час'];

/* ---------------------------------------------------------------------
   2. УТИЛИТЫ
   --------------------------------------------------------------------- */
const $  = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SHORT = /(^|[\s(])(в|во|на|с|со|к|ко|у|о|об|и|а|но|из|за|по|до|от|не|для|без|при)\s+/giu;
const nb = (s) => String(s).replace(SHORT, '$1$2 ').replace(SHORT, '$1$2 ').replace(/(\d)\s+(?=[^\s\d])/g, '$1 ');
const money = (n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₸';
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (t) => t * t * (3 - 2 * t);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMobile = () => innerWidth <= 760;
const PLUS = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const MINUS = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>';

/* ---------------------------------------------------------------------
   3. РАЗМЕТКА ИЗ ДАННЫХ
   --------------------------------------------------------------------- */
const flat = [];
MENU.forEach((g) => g.items.forEach((it) => { it.id = flat.length; flat.push(it); }));

$('[data-list="tabs"]').innerHTML = MENU.map((g, i) =>
  `<button class="tab" type="button" role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}">${esc(g.cat)}</button>`).join('');
$('[data-list="menu"]').innerHTML = MENU.map((g, i) => `
  <div class="menu__panel" role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}"${i ? ' hidden' : ''}>
    ${g.items.map((it) => `
      <button class="row" type="button" data-item="${it.id}" data-cursor="В заказ">
        <span class="row__name">${esc(nb(it.name))}${it.note ? `<span class="row__note">${esc(nb(it.note))}</span>` : ''}</span>
        <span class="row__vol">${esc(nb(it.vol))}</span>
        <span class="row__price">${money(it.price)}</span>
        <span class="row__add" aria-hidden="true">${PLUS}</span>
      </button>`).join('')}
  </div>`).join('');

$('[data-list="brew"]').innerHTML = BREW.map((s, i) => `
  <li class="brew-step" data-step="${i}">
    <span class="brew-step__n" aria-hidden="true">0${i + 1}</span>
    <h3>${esc(s.t)}</h3>
    <p>${esc(nb(s.d))}</p>
    <span class="brew-step__spec">${s.spec.map((x) => `<span>${esc(nb(x))}</span>`).join('<span aria-hidden="true">/</span>')}</span>
  </li>`).join('');
$('[data-list="brew-labels"]').innerHTML = BREW.map((s, i) => `<span${i ? '' : ' class="is-on"'}>${esc(s.label)}</span>`).join('');

$('[data-list="origins"]').innerHTML = ORIGINS.map((o) => `
  <li class="origin" data-fade>
    <h3>${esc(nb(o.name))}</h3>
    <span class="origin__notes">${esc(nb(o.notes))}</span>
    <span class="origin__use">${esc(nb(o.use))}</span>
  </li>`).join('');

/* вкладки меню */
const tabs = $$('.tab');
const panels = $$('.menu__panel');
let onTab = () => {};
tabs.forEach((t, i) => t.addEventListener('click', () => {
  tabs.forEach((x, j) => x.setAttribute('aria-selected', String(i === j)));
  panels.forEach((p, j) => { p.hidden = i !== j; });
  onTab(panels[i]);
}));

/* ---------------------------------------------------------------------
   4. ЗАКАЗ НАВЫНОС
   --------------------------------------------------------------------- */
const form = $('#booking');
const cart = new Map();
const order = { pickup: PICKUP[0] };
const cartList = $('[data-list="cart"]');
const cartEmpty = $('.cart__empty');
const cartbar = $('.cartbar');
const total = () => [...cart].reduce((s, [id, q]) => s + flat[id].price * q, 0);
const count = () => [...cart.values()].reduce((s, q) => s + q, 0);
const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; };
let cartbarAllowed = false;

function setQty(id, q) {
  if (q <= 0) cart.delete(id); else cart.set(id, Math.min(20, q));
  renderCart();
}
function renderCart() {
  cartList.innerHTML = [...cart].map(([id, q]) => `
    <li class="cart__item">
      <span class="cart__name">${esc(nb(flat[id].name))}</span>
      <span class="cart__qty">
        <button type="button" data-dec="${id}" aria-label="Убрать одну позицию: ${esc(flat[id].name)}">${MINUS}</button>
        <output aria-label="Количество">${q}</output>
        <button type="button" data-inc="${id}" aria-label="Добавить ещё: ${esc(flat[id].name)}">${PLUS}</button>
      </span>
      <span class="cart__sum">${money(flat[id].price * q)}</span>
    </li>`).join('');
  cartEmpty.hidden = cart.size > 0;
  $$('.row').forEach((r) => {
    const q = cart.get(Number(r.dataset.item)) || 0;
    r.classList.toggle('is-in', q > 0);
    $('.row__add', r).innerHTML = q ? `<span class="row__count">${q}</span>` : PLUS;
  });
  const n = count();
  $('.cartbar__text').textContent = n ? `${n} ${plural(n, 'позиция', 'позиции', 'позиций')}, ${money(total())}` : '';
  updateCartbar();
  renderSummary();
}
function updateCartbar() {
  cartbar.hidden = !(cart.size && cartbarAllowed);
}
cartList.addEventListener('click', (e) => {
  const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
  if (inc) setQty(Number(inc.dataset.inc), (cart.get(Number(inc.dataset.inc)) || 0) + 1);
  if (dec) setQty(Number(dec.dataset.dec), (cart.get(Number(dec.dataset.dec)) || 0) - 1);
});
$('.menu__panels').addEventListener('click', (e) => {
  const row = e.target.closest('[data-item]');
  if (!row) return;
  const id = Number(row.dataset.item);
  setQty(id, (cart.get(id) || 0) + 1);
  row.classList.remove('is-bump'); void row.offsetWidth; row.classList.add('is-bump');
});

const chipsTime = $('[data-chips="time"]');
chipsTime.innerHTML = PICKUP.map((p) => `<button class="chip" type="button" data-v="${esc(p)}" aria-pressed="${p === order.pickup}">${esc(p)}</button>`).join('');
chipsTime.addEventListener('click', (e) => {
  const c = e.target.closest('.chip');
  if (!c) return;
  order.pickup = c.dataset.v;
  $$('.chip', chipsTime).forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
  renderSummary();
});

function renderSummary() {
  const n = count();
  $('.summary__text').textContent = nb(n
    ? `${n} ${plural(n, 'позиция', 'позиции', 'позиций')}, ${order.pickup.toLowerCase()}, у стойки на набережной`
    : 'Добавьте напитки или выпечку из меню');
  $('.summary__price').textContent = money(total());
}

const phone = form.elements.phone;
phone.addEventListener('input', () => {
  // всё после префикса +7; ведущие 8 или 7 из полного номера отбрасываем
  let d = phone.value.replace(/\D/g, '');
  if (phone.value.trim().startsWith('+7')) d = d.slice(1);
  if (d.length > 10 && (d[0] === '8' || d[0] === '7')) d = d.slice(1);
  d = d.slice(0, 10);
  const p = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)];
  phone.value = '+7' + (p[0] ? ` (${p[0]}` : '') + (p[0].length === 3 ? ')' : '') + (p[1] ? ` ${p[1]}` : '') + (p[2] ? `-${p[2]}` : '') + (p[3] ? `-${p[3]}` : '');
});
phone.addEventListener('focus', () => { if (!phone.value) phone.value = '+7 '; });
phone.addEventListener('blur', () => { if (phone.value.replace(/\D/g, '').length <= 1) phone.value = ''; });

const err = $('.booking__error');
$$('.field input', form).forEach((i) => i.addEventListener('input', () => i.closest('.field').classList.remove('is-bad')));
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = form.elements;
  const okName = !!f.name.value.trim();
  const okPhone = f.phone.value.replace(/\D/g, '').length === 11;
  const miss = [!cart.size && 'хотя бы одну позицию', !okName && 'имя', !okPhone && 'телефон'].filter(Boolean);
  f.name.closest('.field').classList.toggle('is-bad', !okName);
  f.phone.closest('.field').classList.toggle('is-bad', !okPhone);
  if (miss.length) {
    err.hidden = false;
    err.textContent = nb(`Осталось указать: ${miss.join(', ')}`);
    return;
  }
  err.hidden = true;
  const text = [
    `Здравствуйте! Заказ навынос в ${SITE.name}:`,
    ...[...cart].map(([id, q]) => `${flat[id].name} x${q}, ${money(flat[id].price * q).replace(/ /g, ' ')}`),
    `Итого: ${money(total()).replace(/ /g, ' ')}`,
    `Заберу: ${order.pickup.toLowerCase()}`,
    `Имя: ${f.name.value.trim()}`,
    `Телефон: ${f.phone.value}`,
  ].join('\n');
  window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});
renderCart();

/* ---------------------------------------------------------------------
   5. РАЗБИВКА ТЕКСТА ДЛЯ АНИМАЦИЙ
   --------------------------------------------------------------------- */
function splitChars(el) {
  const lines = el.innerHTML.split(/<br\s*\/?>/i).map((h) => { const t = document.createElement('span'); t.innerHTML = h; return t.textContent; });
  el.setAttribute('aria-label', lines.join(' '));
  el.innerHTML = lines.map((line) => `<span class="split-line" aria-hidden="true">${
    [...line].map((ch) => `<span class="split-char">${ch === ' ' || ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('')}</span>`).join('<br>');
  return $$('.split-char', el);
}
$$('[data-split], [data-reveal]').forEach(splitChars);

/* ---------------------------------------------------------------------
   6. 3D-СЦЕНА
   --------------------------------------------------------------------- */
let cup = null;
const stage = $('.stage');
async function initCup() {
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('no webgl');
    const mod = await import('./cup.js');
    await Promise.all([document.fonts.load('400 40px "Playfair Display"'), document.fonts.load('400 20px Manrope')]);
    cup = mod.createCup(stage, { mobile: isMobile() });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
  }
}

/* ключевые положения. x, y в мировых единицах, alpha — прозрачность сцены */
const BASE = {
  x: 0, y: 0, z: 0, rx: 0.1, rz: 0, scale: 1,
  paper: 1, ice: 0, level: 0, esp: 0, lid: 0, straw: 0, cond: 0,
  steam: 0, beans: 0, dark: 0, shadow: 1, idle: 0, alpha: 1,
};
const S = (o) => ({ ...BASE, ...o });
function keyStates() {
  const m = isMobile();
  const brewPos = m ? { x: 0.3, y: 0.2, scale: 0.4 } : { x: 1.7, y: -0.1, scale: 0.92 };
  const brew = S({ ...brewPos, paper: 0, dark: 1, shadow: 0.9 });
  const iced = { ice: 1, level: 0.84, esp: 1, lid: 1, straw: 1, cond: 1 };
  return {
    intro: S(m ? { y: -3.6, scale: 0.4, steam: 0 } : { x: 0.3, y: -4.6, scale: 0.7, steam: 0 }),
    hero: S(m ? { x: 0.05, y: 0.55, scale: 0.44, steam: 1, beans: 1, idle: 1 } : { x: 0.3, y: -0.12, rz: -0.05, scale: 0.95, steam: 1, beans: 1, idle: 1 }),
    brew0: brew,
    ice: { ...brew, ice: 1 },
    milk: { ...brew, ice: 1, level: 0.62, rz: 0.05 },
    esp: { ...brew, ice: 1, level: 0.84, esp: 1, rz: -0.04 },
    lid: { ...brew, ...iced, straw: 0, cond: 0.5, ...(m ? {} : { y: -0.25, scale: 0.84 }) },
    done: { ...brew, ...iced, ...(m ? {} : { y: -0.32, scale: 0.8 }) },
    menu: m ? S({ ...iced, paper: 0, y: 3.5, scale: 0.4, alpha: 0 })
            : S({ ...iced, paper: 0, x: -2.45, y: -0.25, rx: 0.14, scale: 0.72, shadow: 0.8 }),
    gone: S(m ? { y: 3.8, scale: 0.4, alpha: 0 } : { x: -1, y: 4.4, scale: 0.6, alpha: 0 }),
    foot: m ? S({ y: 3.8, scale: 0.4, alpha: 0 }) : S({ x: 2.75, y: -0.95, scale: 0.55, steam: 1, idle: 1 }),
  };
}
const mixState = (a, b, t) => Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] - a[k]) * t]));
const pageY = (el) => el.getBoundingClientRect().top + scrollY;

let keys = [];
const brewBox = { top: 0, len: 1 };
function buildKeys() {
  const K = keyStates();
  const vh = innerHeight;
  const brew = $('.brew'), menu = $('.menu'), roast = $('.roast'), foot = $('.foot');
  brewBox.top = pageY(brew);
  brewBox.len = Math.max(1, brew.offsetHeight - vh);
  const at = (p) => brewBox.top + brewBox.len * p;
  const maxY = document.documentElement.scrollHeight - vh;
  const menuEnd = pageY(menu) + menu.offsetHeight - vh;
  keys = [
    [0, K.hero],
    [vh * 0.12, K.hero],
    [brewBox.top, K.brew0],
    [at(0.05), K.brew0],
    [at(0.22), K.ice],
    [at(0.29), K.ice],
    [at(0.47), K.milk],
    [at(0.54), K.milk],
    [at(0.72), K.esp],
    [at(0.78), K.esp],
    [at(0.86), K.lid],
    [at(0.94), K.done],
    [brewBox.top + brew.offsetHeight - vh * 0.1, K.done],
    [pageY(menu) + vh * 0.05, K.menu],
    [Math.max(pageY(menu) + vh * 0.1, menuEnd - vh * 0.2), K.menu],
    [pageY(roast) + vh * 0.2, K.gone],
    [Math.max(pageY(roast) + vh * 0.3, pageY(foot) - vh * 0.6), K.gone],
    [maxY, K.foot],
  ].sort((a, b) => a[0] - b[0]);
}
function scrollState(y) {
  if (y <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (y <= keys[i][0]) {
      const [y0, s0] = keys[i - 1], [y1, s1] = keys[i];
      return mixState(s0, s1, smooth(clamp01((y - y0) / Math.max(1, y1 - y0))));
    }
  }
  return keys[keys.length - 1][1];
}

/* ---------------------------------------------------------------------
   7. ЗАПУСК
   --------------------------------------------------------------------- */
const loader = $('.loader');
const countEl = $('.loader__count');
const barEl = $('.loader__bar i');

async function boot() {
  const g = window.gsap;
  const ST = window.ScrollTrigger;
  const hasAnim = !!(g && ST);

  // предзагрузка: реальный прогресс шрифтов, 3D и картинок первого экрана
  let progress = 0, target = 0.15;
  const setProgress = (p) => {
    progress = Math.max(progress, p);
    countEl.textContent = String(Math.round(progress * 100)).padStart(2, '0');
    barEl.style.transform = `scaleX(${progress})`;
  };
  const t0 = performance.now();
  const shown = { p: 0 };
  const tick = () => {
    if (shown.p < target) { shown.p = Math.min(target, shown.p + 0.012 + (target - shown.p) * 0.08); setProgress(shown.p); }
    if (shown.p < 1) requestAnimationFrame(tick);
  };
  if (!reduce) requestAnimationFrame(tick);
  await document.fonts.ready; target = 0.45;
  await initCup(); target = 0.85;
  await new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
  target = 1;
  await new Promise((r) => setTimeout(r, Math.max(0, (reduce ? 0 : 1300) - (performance.now() - t0))));
  await new Promise((r) => { const w = () => (shown.p >= 1 || reduce ? r() : requestAnimationFrame(w)); w(); });

  const steps = $$('.brew-step');
  const labels = $$('.brew__labels span');

  if (!hasAnim) {
    loader.remove();
    document.body.classList.remove('is-loading');
    steps.forEach((s, i) => { s.style.opacity = i === 3 ? 1 : 0; });
    if (cup) { buildKeys(); cup.jump(keyStates().hero); }
    return;
  }

  g.registerPlugin(ST);

  /* плавный скролл */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    lenis.on('scroll', ST.update);
    g.ticker.add((t) => lenis.raf(t * 1000));
    g.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollToEl = (el) => (lenis ? lenis.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href').length > 1) {
      const t = $(a.getAttribute('href'));
      if (t) { e.preventDefault(); scrollToEl(t); }
    }
  });

  /* начальные состояния */
  const heroChars = $$('.hero__word .split-char');
  if (!reduce) {
    g.set(heroChars, { yPercent: 118 });
    g.set('.hero [data-fade], .nav', { autoAlpha: 0, y: 24, filter: 'blur(14px)' });
  }

  /* стакан: вступление смешивается со скроллом, вращение идёт от скролла */
  const intro = { k: reduce ? 1 : 0 };
  const K0 = keyStates();
  const updateCup = () => {
    if (!cup) return;
    const s = mixState(K0.intro, scrollState(scrollY), smooth(intro.k));
    s.ry = (scrollY / innerHeight) * 0.9;
    cup.setState(s);
    stage.style.opacity = s.alpha > 0.002 ? '1' : '0';
    cup.setVisible(s.alpha > 0.002);
  };
  if (cup) { buildKeys(); cup.jump({ ...K0.intro, ry: 0 }); updateCup(); }

  /* уход прелоадера и вход первого экрана */
  const tl = g.timeline({ defaults: { ease: 'expo.out' } });
  tl.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: reduce ? 0 : 1.1, ease: 'expo.inOut' })
    .add(() => { loader.remove(); document.body.classList.remove('is-loading'); });
  if (!reduce) {
    tl.to(heroChars, { yPercent: 0, duration: 1.3, stagger: 0.05 }, '-=0.45')
      .to(intro, { k: 1, duration: 2.2, ease: 'power3.inOut', onUpdate: updateCup }, '<0.1')
      .to('.nav', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, '<0.3')
      .to('.hero [data-fade]', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.1 }, '<0.3');
  }
  tl.add(() => { lenis && lenis.start(); });

  ST.create({ start: 0, end: 'max', onUpdate: updateCup });
  ST.addEventListener('refresh', () => { buildKeys(); updateCup(); });
  if (cup) addEventListener('pointermove', (e) => cup.setMouse((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)), { passive: true });

  if (!reduce) {
    $$('[data-reveal]').forEach((el) => {
      g.from($$('.split-char', el), { yPercent: 118, duration: 1.1, ease: 'expo.out', stagger: 0.035, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('[data-fade]').forEach((el) => {
      if (el.closest('.hero')) return;
      g.from(el, { autoAlpha: 0, y: 28, filter: 'blur(14px)', duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    const rowsIn = (panel) => g.fromTo($$('.row', panel), { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out', stagger: 0.05, overwrite: true });
    g.from($$('.row', panels[0]), { y: 30, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.menu__panels', start: 'top 82%' } });
    g.from('.tab', { y: 20, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.tabs', start: 'top 90%' } });
    onTab = (panel) => { rowsIn(panel); ST.refresh(); };

    /* фото: шторка снизу и параллакс */
    $$('.ph__img').forEach((el) => {
      g.from(el, { clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('.ph__img img, .roast__photo img').forEach((img) => {
      g.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    g.fromTo('.space__img img', { yPercent: -8, scale: 1.08 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.space__hero', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    g.from('.foot__word .split-char', { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.foot__word', start: 'top 95%' } });
  } else {
    onTab = () => ST.refresh();
  }

  /* айс-латте: шаги сменяются по скроллу */
  g.set(steps, { autoAlpha: 0, y: 40 });
  g.set(steps[0], { autoAlpha: 1, y: 0 });
  let current = 0;
  const showStep = (i) => {
    if (i === current) return;
    const dir = i > current ? 1 : -1;
    g.to(steps[current], { autoAlpha: 0, y: -40 * dir, filter: 'blur(10px)', duration: 0.6, ease: 'expo.out', overwrite: true });
    g.fromTo(steps[i], { autoAlpha: 0, y: 40 * dir, filter: 'blur(10px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out', overwrite: true });
    labels.forEach((l, j) => l.classList.toggle('is-on', j === i));
    current = i;
  };
  ST.create({
    trigger: '.brew', start: 'top top', end: 'bottom bottom',
    onUpdate: (self) => {
      g.set('.brew__progress i', { scaleX: self.progress });
      showStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999)));
    },
  });

  /* навигация: прячется вниз, светлеет на тёмной сцене; корзина не мешает форме */
  const nav = $('.nav');
  let lastY = 0;
  ST.create({
    start: 0, end: 'max',
    onUpdate: () => {
      const y = scrollY, vh = innerHeight;
      nav.classList.toggle('is-solid', y > vh * 0.6);
      nav.classList.toggle('is-hidden', y > lastY && y > vh * 0.6);
      const b = $('.brew'), o = $('.order');
      const bt = pageY(b);
      nav.classList.toggle('on-dark', y > bt - 40 && y < bt + b.offsetHeight - 40);
      const ot = pageY(o);
      cartbarAllowed = y > vh * 0.8 && !(y + vh > ot + 120 && y < ot + o.offsetHeight);
      updateCartbar();
      lastY = y;
    },
  });

  /* курсор и магнитные кнопки */
  if (fine && !reduce) {
    const cursor = $('.cursor');
    const label = $('.cursor__label');
    const cx = g.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const cy = g.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    addEventListener('pointermove', (e) => { cursor.classList.add('is-on'); cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    document.addEventListener('pointerover', (e) => {
      const lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, input');
      cursor.classList.toggle('is-label', !!lab);
      cursor.classList.toggle('is-link', !lab && !!link);
      if (lab) label.textContent = lab.dataset.cursor;
    });
    $$('.magnetic').forEach((el) => {
      const mx = g.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      const my = g.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.3);
        my((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  ST.refresh();
}

boot();
