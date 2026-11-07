/* =====================================================================
   ШАҢЫРАҚ. Концепт.
   Анимации: GSAP + ScrollTrigger, плавный скролл: Lenis, 3D: yurt.js.
   Если библиотеки или WebGL недоступны, сайт остаётся рабочим.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. ДАННЫЕ
   --------------------------------------------------------------------- */
const SITE = { name: 'Шаңырақ', whatsapp: '77000000000', open: { from: 12, to: 23, step: 30 } };

// фото блюд для шаңырақа; индекс используется в меню
const DISHES = ['assets/toi.jpg', 'assets/plov.jpg', 'assets/kuyrdak.jpg', 'assets/manty.jpg', 'assets/ribs.jpg', 'assets/et.jpg', 'assets/baursak.jpg'];

const MENU = [
  { cat: 'Горячее', items: [
    { name: 'Бешбармак', note: 'конина и баранина, тонкое тесто, сорпа', w: '450 г', price: 6200, img: 0 },
    { name: 'Бешбармак на табаке', note: 'на компанию из 4–6 человек, с казы и жая', w: '2,5 кг', price: 32000, img: 0 },
    { name: 'Қуырдақ', note: 'жаркое из баранины с картофелем и луком', w: '350 г', price: 3900, img: 2 },
    { name: 'Палау', note: 'плов на казане с изюмом и бараньим ребром', w: '400 г', price: 3400, img: 1 },
    { name: 'Манты', note: 'пять штук, баранина с тыквой', w: '5 шт', price: 3200, img: 3 },
    { name: 'Қабырға', note: 'бараньи рёбра на углях', w: '400 г', price: 5900, img: 4 },
  ]},
  { cat: 'Закуски', items: [
    { name: 'Қазы-қарта', note: 'домашняя конская колбаса и рулет из толстой кишки', w: '250 г', price: 5600, img: 5 },
    { name: 'Баурсаки', note: 'горячие, из казана, с маслом и мёдом', w: '12 шт', price: 1200, img: 6 },
    { name: 'Салат из жая', note: 'копчёная конина, редис, зелень', w: '220 г', price: 3300, img: 5 },
    { name: 'Сүр ет', note: 'вяленая говядина, тонкие ломтики', w: '150 г', price: 4200, img: 5 },
  ]},
  { cat: 'Супы', items: [
    { name: 'Сорпа', note: 'наваристый бульон с курутом', w: '350 мл', price: 1800, img: 0 },
    { name: 'Кеспе', note: 'домашняя лапша с говядиной', w: '400 мл', price: 2300, img: 2 },
    { name: 'Сорпа с ет', note: 'бульон и отварное мясо, как на тое', w: '450 мл', price: 2900, img: 0 },
  ]},
  { cat: 'Чай и десерт', items: [
    { name: 'Самовар на четверых', note: 'чёрный чай, сливки, баурсаки и варенье', w: '2 л', price: 3500, img: 6 },
    { name: 'Қымыз', note: 'кобылье молоко, сезонно', w: '500 мл', price: 1400, img: 6 },
    { name: 'Шұбат', note: 'верблюжье молоко из Шымкента', w: '500 мл', price: 1600, img: 6 },
    { name: 'Чак-чак', note: 'с мёдом и курагой', w: '180 г', price: 1700, img: 6 },
  ]},
];

const STEPS = [
  { t: 'Шаңырақ', kz: 'купол юрты', d: 'Его передают от отца к младшему сыну. Шаңырақ значит «родной дом», поэтому так называется и наш ресторан.' },
  { t: 'Уықтар', kz: 'жерди купола', d: 'Пятьдесят шесть жердей сходятся в одном круге. Как семья за одним дастарханом.' },
  { t: 'Кереге', kz: 'решётчатые стены', d: 'Решётка раскладывается за минуты. Юрту ставили там, где ждали гостей.' },
  { t: 'Киіз', kz: 'войлок', d: 'Войлок держит тепло даже в нашу зиму. Внутри горит огонь и уже заварен чай.' },
];

const HALLS = [
  { name: 'Үлкен зал', cap: 'до 120 гостей', note: 'Для тоя: сцена, свет и звук, отдельный вход. Банкетное меню от 18 000 ₸ на гостя.' },
  { name: 'Кіші зал', cap: 'до 40 гостей', note: 'Для юбилеев и семейных вечеров. Камин и свой официант на весь вечер.' },
  { name: 'Юрта во дворе', cap: 'до 12 гостей', note: 'Настоящая юрта с печкой. Бешбармак на большом табаке и чай из самовара.' },
];
const BOOK_HALLS = ['Общий зал', 'Кіші зал', 'Юрта'];

/* ---------------------------------------------------------------------
   2. УТИЛИТЫ
   --------------------------------------------------------------------- */
const $  = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SHORT = /(^|[\s(])(в|во|на|с|со|к|ко|у|о|об|и|а|но|из|за|по|до|от|не|для|без|при|как)\s+/giu;
const nb = (s) => String(s).replace(SHORT, '$1$2 ').replace(SHORT, '$1$2 ').replace(/(\d)\s+(?=[^\s\d])/g, '$1 ');
const money = (n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₸';
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (t) => t * t * (3 - 2 * t);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMobile = () => innerWidth <= 760;
const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; };

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
      <div class="dish" data-dish="${it.id}" tabindex="0">
        <span class="dish__name">${esc(nb(it.name))}<span class="dish__note">${esc(nb(it.note))}</span></span>
        <span class="dish__w">${esc(nb(it.w))}</span>
        <span class="dish__price">${money(it.price)}</span>
      </div>`).join('')}
  </div>`).join('');

$('[data-list="steps"]').innerHTML = STEPS.map((s, i) => `
  <li class="ystep">
    <span class="ystep__n" aria-hidden="true">0${i + 1}</span>
    <h3>${esc(s.t)}</h3>
    <span class="ystep__kz">${esc(s.kz)}</span>
    <p>${esc(nb(s.d))}</p>
  </li>`).join('');
$('[data-list="labels"]').innerHTML = STEPS.map((s, i) => `<span${i ? '' : ' class="is-on"'}>${esc(s.t)}</span>`).join('');

$('[data-list="halls"]').innerHTML = HALLS.map((h, i) => `
  <li class="hall" data-fade>
    <span class="hall__n">0${i + 1}</span>
    <h3>${esc(h.name)}</h3>
    <span class="hall__cap">${esc(nb(h.cap))}</span>
    <p class="hall__note">${esc(nb(h.note))}</p>
  </li>`).join('');

/* меню: вкладки и блюдо в шаңыраке */
const tabs = $$('.tab');
const panels = $$('.menu__panel');
let onTab = () => {};
let yurt = null;
const dishName = $('.menu__dish-name');
function showDish(row) {
  if (!row) return;
  $$('.dish.is-on').forEach((d) => d !== row && d.classList.remove('is-on'));
  row.classList.add('is-on');
  const it = flat[Number(row.dataset.dish)];
  dishName.textContent = it.name;
  if (yurt) yurt.setDish(it.img);
}
tabs.forEach((t, i) => t.addEventListener('click', () => {
  tabs.forEach((x, j) => x.setAttribute('aria-selected', String(i === j)));
  panels.forEach((p, j) => { p.hidden = i !== j; });
  showDish($('.dish', panels[i]));
  onTab(panels[i]);
}));
const panelsBox = $('.menu__panels');
panelsBox.addEventListener('pointerover', (e) => showDish(e.target.closest('.dish')));
panelsBox.addEventListener('focusin', (e) => showDish(e.target.closest('.dish')));
panelsBox.addEventListener('click', (e) => showDish(e.target.closest('.dish')));
showDish($('.dish'));

/* ---------------------------------------------------------------------
   4. БРОНЬ
   --------------------------------------------------------------------- */
const form = $('#booking');
const state = { hall: BOOK_HALLS[0], guests: 2, day: 0, time: '' };

const chipsHall = $('[data-chips="hall"]');
chipsHall.innerHTML = BOOK_HALLS.map((h) => `<button class="chip" type="button" data-v="${esc(h)}" aria-pressed="false">${esc(h)}</button>`).join('');

const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
const dayTitle = (i) => (i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : `${WD[days[i].getDay()]}, ${days[i].getDate()}`);
const dayLong = (i) => `${i === 0 ? 'сегодня, ' : i === 1 ? 'завтра, ' : ''}${days[i].getDate()} ${MON[days[i].getMonth()]}`;
const chipsDay = $('[data-chips="day"]');
chipsDay.innerHTML = days.map((d, i) =>
  `<button class="chip" type="button" data-v="${i}" aria-pressed="false">${dayTitle(i)}<small>${d.getDate()} ${MON[d.getMonth()].slice(0, 3)}</small></button>`).join('');

const chipsTime = $('[data-chips="time"]');
const toHM = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
function renderTimes() {
  const now = new Date();
  const nowMin = state.day === 0 ? now.getHours() * 60 + now.getMinutes() + 60 : -1;
  const slots = [];
  for (let t = SITE.open.from * 60; t <= SITE.open.to * 60 - 60; t += SITE.open.step) slots.push(t);
  if (state.day === 0 && !slots.some((t) => t >= nowMin)) { pick('day', 1); return; }
  chipsTime.innerHTML = slots.map((t) =>
    `<button class="chip" type="button" data-v="${toHM(t)}" aria-pressed="${toHM(t) === state.time}"${t < nowMin ? ' disabled' : ''}>${toHM(t)}</button>`).join('');
  const picked = $(`[data-v="${state.time}"]`, chipsTime);
  if (!picked || picked.disabled) state.time = '';
}
const press = (box, v) => $$('.chip', box).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.v === String(v))));
function pick(key, v) {
  state[key] = key === 'day' ? Number(v) : v;
  if (key === 'hall') press(chipsHall, v);
  if (key === 'day') { press(chipsDay, v); renderTimes(); }
  if (key === 'time') press(chipsTime, v);
  renderSummary();
}
chipsHall.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) pick('hall', c.dataset.v); });
chipsDay.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) pick('day', c.dataset.v); });
chipsTime.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c && !c.disabled) pick('time', c.dataset.v); });

const guestsOut = $('.stepper__v');
const guestsHint = $('.stepper__hint');
$$('[data-guests]').forEach((b) => b.addEventListener('click', () => {
  state.guests = Math.max(1, Math.min(120, state.guests + Number(b.dataset.guests)));
  renderSummary();
}));

function renderSummary() {
  guestsOut.textContent = state.guests;
  guestsHint.textContent = state.hall === 'Юрта' && state.guests > 12 ? 'Юрта вмещает до 12 гостей, предложим зал'
    : state.guests > 20 ? 'Для тоя от 20 гостей перезвоним и обсудим меню'
    : `${state.guests} ${plural(state.guests, 'гость', 'гостя', 'гостей')}`;
  $('.summary__text').textContent = nb([
    state.hall,
    `${state.guests} ${plural(state.guests, 'гость', 'гостя', 'гостей')}`,
    state.time ? `${dayLong(state.day)} в ${state.time}` : `${dayLong(state.day)}, время не выбрано`,
  ].join(', '));
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
$$('.field input', form).forEach((i) => i.addEventListener('input', () => i.closest('.field').classList.remove('is-bad')));

const err = $('.booking__error');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = form.elements;
  const okName = !!f.name.value.trim();
  const okPhone = f.phone.value.replace(/\D/g, '').length === 11;
  const miss = [!state.time && 'время', !okName && 'имя', !okPhone && 'телефон'].filter(Boolean);
  f.name.closest('.field').classList.toggle('is-bad', !okName);
  f.phone.closest('.field').classList.toggle('is-bad', !okPhone);
  if (miss.length) {
    err.hidden = false;
    err.textContent = nb(`Осталось указать: ${miss.join(', ')}`);
    return;
  }
  err.hidden = true;
  const text = [
    `Здравствуйте! Хочу забронировать стол в ресторане ${SITE.name}.`,
    `Зал: ${state.hall}`,
    `Гостей: ${state.guests}`,
    `Когда: ${dayLong(state.day)}, ${state.time}`,
    `Имя: ${f.name.value.trim()}`,
    `Телефон: ${f.phone.value}`,
  ].join('\n');
  window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

pick('hall', BOOK_HALLS[0]);
pick('day', 0);

/* ---------------------------------------------------------------------
   5. РАЗБИВКА ТЕКСТА
   --------------------------------------------------------------------- */
function splitChars(el) {
  const lines = el.innerHTML.split(/<br\s*\/?>/i).map((h) => { const t = document.createElement('span'); t.innerHTML = h; return t.textContent; });
  el.setAttribute('aria-label', lines.join(' '));
  // буквы внутри слов не переносятся: слово держится целиком
  const word = (w) => `<span class="split-word">${[...w].map((ch) => `<span class="split-char">${ch === '\u00a0' ? '&nbsp;' : esc(ch)}</span>`).join('')}</span>`;
  el.innerHTML = lines.map((line) => `<span class="split-line" aria-hidden="true">${line.trim().split(/ +/).map(word).join(' ')}</span>`).join('<br>');
  return $$('.split-char', el);
}
$$('[data-split], [data-reveal]').forEach(splitChars);

/* ---------------------------------------------------------------------
   6. 3D-СЦЕНА
   --------------------------------------------------------------------- */
const stage = $('.stage');
async function initYurt() {
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('no webgl');
    const mod = await import('./yurt.js');
    yurt = mod.createYurt(stage, { mobile: isMobile(), dishes: DISHES });
    showDish($('.dish.is-on'));
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
  }
}

const BASE = { x: 0, y: 0, z: 0, rx: 0.5, rz: 0, scale: 1, uyk: 0, kerege: 0, felt: 0, glow: 0, outer: 1, disc: 0, stars: 1, shadow: 0, idle: 0, alpha: 1 };
const S = (o) => ({ ...BASE, ...o });
function keyStates() {
  const m = isMobile();
  const built = m ? { x: 0, y: 0.72, scale: 0.32, rx: 0.3 } : { x: 1.75, y: 0.88, scale: 0.6, rx: 0.3 };
  return {
    intro: S(m ? { y: -3.5, scale: 0.6, rx: 1.1, stars: 0 } : { x: 0.25, y: -4, scale: 1.1, rx: 1.1, stars: 0 }),
    hero: S(m ? { y: -0.32, scale: 0.66, rx: 0.62, idle: 1 } : { x: 0.25, y: -0.38, scale: 1.5, rx: 0.62, idle: 1 }),
    s0: S(m ? { y: 0.45, scale: 0.55, rx: 0.55 } : { x: 1.6, y: 0.4, scale: 1.15, rx: 0.55 }),
    uyk: S({ ...built, uyk: 1, shadow: 0.6 }),
    kerege: S({ ...built, uyk: 1, kerege: 1, shadow: 1 }),
    felt: S({ ...built, uyk: 1, kerege: 1, felt: 1, shadow: 1 }),
    glow: S({ ...built, rx: 0.24, uyk: 1, kerege: 1, felt: 1, glow: 1, shadow: 1 }),
    menu: m ? S({ y: 3, scale: 0.5, alpha: 0, outer: 0, stars: 0.35 })
            : S({ x: -2.55, y: -0.15, scale: 1.22, rx: -1.32, outer: 0, disc: 1, stars: 0.35 }),
    gone: S({ x: -1, y: 4.5, scale: 0.6, alpha: 0, outer: 0, stars: 0.25 }),
    book: m ? S({ y: 3, scale: 0.3, alpha: 0, outer: 0, stars: 0.5 })
            : S({ x: -2.55, y: -0.5, scale: 0.4, rx: 0.24, uyk: 1, kerege: 1, felt: 1, glow: 1, shadow: 1, idle: 1, stars: 0.8 }),
    foot: S({ y: 3, scale: 0.3, alpha: 0, outer: 0, stars: 1 }),
  };
}
const mixState = (a, b, t) => Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] - a[k]) * t]));
const pageY = (el) => el.getBoundingClientRect().top + scrollY;

let keys = [];
function buildKeys() {
  const K = keyStates();
  const vh = innerHeight;
  const yu = $('.yurt'), menu = $('.menu'), toi = $('.toi'), book = $('.book'), foot = $('.foot');
  const top = pageY(yu), len = Math.max(1, yu.offsetHeight - vh);
  const at = (p) => top + len * p;
  const maxY = document.documentElement.scrollHeight - vh;
  keys = [
    [0, K.hero],
    [vh * 0.15, K.hero],
    [top, K.s0],
    [at(0.06), K.s0],
    [at(0.24), K.uyk],
    [at(0.3), K.uyk],
    [at(0.48), K.kerege],
    [at(0.55), K.kerege],
    [at(0.74), K.felt],
    [at(0.8), K.felt],
    [at(0.9), K.glow],
    [top + yu.offsetHeight - vh * 0.1, K.glow],
    [pageY(menu) + vh * 0.05, K.menu],
    [Math.max(pageY(menu) + vh * 0.1, pageY(menu) + menu.offsetHeight - vh * 1.1), K.menu],
    [pageY(toi) + vh * 0.1, K.gone],
    [pageY(toi) + toi.offsetHeight - vh * 0.9, K.gone],
    [pageY(book) + vh * 0.05, K.book],
    [Math.max(pageY(book) + vh * 0.1, pageY(book) + book.offsetHeight - vh * 1.1), K.book],
    [pageY(foot) + vh * 0.1, K.foot],
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
  await initYurt(); target = 0.85;
  await new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
  target = 1;
  await new Promise((r) => setTimeout(r, Math.max(0, (reduce ? 0 : 1300) - (performance.now() - t0))));
  await new Promise((r) => { const w = () => (shown.p >= 1 || reduce ? r() : requestAnimationFrame(w)); w(); });

  const steps = $$('.ystep');
  const labels = $$('.yurt__labels span');

  if (!hasAnim) {
    loader.remove();
    document.body.classList.remove('is-loading');
    steps.forEach((s, i) => { s.style.opacity = i === 3 ? 1 : 0; });
    if (yurt) { buildKeys(); yurt.jump(keyStates().hero); }
    return;
  }

  g.registerPlugin(ST);

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

  const heroChars = $$('.hero__word .split-char');
  if (!reduce) {
    g.set(heroChars, { yPercent: 118 });
    g.set('.hero [data-fade], .nav', { autoAlpha: 0, y: 24, filter: 'blur(14px)' });
  }

  /* юрта: вступление смешивается со скроллом, вращение идёт от скролла */
  const intro = { k: reduce ? 1 : 0 };
  const K0 = keyStates();
  const update = () => {
    if (!yurt) return;
    const s = mixState(K0.intro, scrollState(scrollY), smooth(intro.k));
    s.ry = (scrollY / innerHeight) * 0.55;
    yurt.setState(s);
    yurt.setVisible(s.alpha > 0.002 || s.stars > 0.01);
  };
  if (yurt) { buildKeys(); yurt.jump({ ...K0.intro, ry: 0 }); update(); }

  const tl = g.timeline({ defaults: { ease: 'expo.out' } });
  tl.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: reduce ? 0 : 1.1, ease: 'expo.inOut' })
    .add(() => { loader.remove(); document.body.classList.remove('is-loading'); });
  if (!reduce) {
    tl.to(heroChars, { yPercent: 0, duration: 1.3, stagger: 0.06 }, '-=0.45')
      .to(intro, { k: 1, duration: 2.4, ease: 'power3.inOut', onUpdate: update }, '<0.1')
      .to('.nav', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, '<0.3')
      .to('.hero [data-fade]', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.1 }, '<0.3');
  }
  tl.add(() => { lenis && lenis.start(); });

  ST.create({ start: 0, end: 'max', onUpdate: update });
  ST.addEventListener('refresh', () => { buildKeys(); update(); });
  if (yurt) addEventListener('pointermove', (e) => yurt.setMouse((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)), { passive: true });

  if (!reduce) {
    $$('[data-reveal]').forEach((el) => {
      g.from($$('.split-char', el), { yPercent: 118, duration: 1.1, ease: 'expo.out', stagger: 0.03, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('[data-fade]').forEach((el) => {
      if (el.closest('.hero')) return;
      g.from(el, { autoAlpha: 0, y: 28, filter: 'blur(14px)', duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    const rowsIn = (panel) => g.fromTo($$('.dish', panel), { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out', stagger: 0.05, overwrite: true });
    g.from($$('.dish', panels[0]), { y: 30, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.menu__panels', start: 'top 82%' } });
    g.from('.tab', { y: 20, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.tabs', start: 'top 90%' } });
    onTab = (panel) => { rowsIn(panel); ST.refresh(); };
    g.fromTo('.toi__img img', { yPercent: -8, scale: 1.08 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.toi__hero', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    g.fromTo('.halls__photo img', { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: '.halls', start: 'top bottom', end: 'bottom top', scrub: true } });
    g.from('.halls__photo', { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.halls', start: 'top 80%' } });
    g.from('.foot__word .split-char', { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.foot__word', start: 'top 95%' } });
  } else {
    onTab = () => ST.refresh();
  }

  /* шаги юрты */
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
    trigger: '.yurt', start: 'top top', end: 'bottom bottom',
    onUpdate: (self) => {
      g.set('.yurt__progress i', { scaleX: self.progress });
      showStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999)));
    },
  });

  const nav = $('.nav');
  let lastY = 0;
  ST.create({
    start: 0, end: 'max',
    onUpdate: () => {
      const y = scrollY;
      nav.classList.toggle('is-solid', y > innerHeight * 0.6);
      nav.classList.toggle('is-hidden', y > lastY && y > innerHeight * 0.6);
      lastY = y;
    },
  });

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
