/* =====================================================================
   АҚ ТІС CLINIC. Концепт.
   Анимации: GSAP + ScrollTrigger, плавный скролл: Lenis, 3D: tooth.js.
   Если библиотеки или WebGL недоступны, сайт остаётся рабочим.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. ДАННЫЕ
   --------------------------------------------------------------------- */
const SITE = { name: 'Ақ Тіс', whatsapp: '77000000000', open: { from: 9, to: 20, step: 30 } };

const SERVICES = [
  { cat: 'Лечение', items: [
    { name: 'Осмотр и консультация', note: 'с панорамным снимком и планом лечения', time: '30 мин', price: 0 },
    { name: 'Лечение кариеса', note: 'под микроскопом, светоотверждаемая пломба', time: '1 ч', price: 15000 },
    { name: 'Лечение каналов', note: 'один канал, с контрольным снимком', time: '1,5 ч', price: 35000 },
    { name: 'Удаление зуба', note: 'простое, с анестезией', time: '40 мин', price: 8000 },
    { name: 'Удаление зуба мудрости', time: '1 ч', price: 25000 },
  ]},
  { cat: 'Имплантация', items: [
    { name: 'Имплант под ключ', note: 'имплант, абатмент и циркониевая коронка', time: '2 визита', price: 180000 },
    { name: 'Коронка из циркония', time: '2 визита', price: 85000 },
    { name: 'Синус-лифтинг', note: 'если не хватает кости', time: '1,5 ч', price: 120000 },
    { name: '3D-томография', note: 'снимок всей челюсти', time: '15 мин', price: 8000 },
  ]},
  { cat: 'Гигиена и эстетика', items: [
    { name: 'Профессиональная гигиена', note: 'ультразвук, Air Flow, полировка', time: '1 ч', price: 18000 },
    { name: 'Отбеливание', note: 'кабинетное, за один визит', time: '1,5 ч', price: 60000 },
    { name: 'Винир', note: 'керамика, один зуб', time: '2 визита', price: 95000 },
  ]},
  { cat: 'Детям', items: [
    { name: 'Осмотр ребёнка', note: 'знакомство с врачом без лечения', time: '30 мин', price: 0 },
    { name: 'Лечение молочного зуба', time: '40 мин', price: 10000 },
    { name: 'Герметизация фиссур', note: 'защита от кариеса, один зуб', time: '20 мин', price: 6000 },
  ]},
];

const STEPS = [
  { t: 'Диагностика', fact: '3D-снимок за 15 секунд', d: 'Сканируем челюсть и смотрим зуб под микроскопом. Находим проблему до того, как она заболит.' },
  { t: 'Лечение', fact: 'Анестезия без укола в нёбо', d: 'Убираем кариес и ставим пломбу, которую не отличить от эмали. Синяя лампа твердит её за 20 секунд.' },
  { t: 'Имплантация', fact: 'Гарантия 10 лет', d: 'Если зуб не спасти, ставим титановый имплант и коронку на него. Через пару месяцев не вспомните, какой зуб новый.' },
  { t: 'Улыбка', fact: 'Гигиена раз в полгода', d: 'Профессиональная чистка и отбеливание. Напомним о следующем визите сами, вам нужно только прийти.' },
];

const DOCTORS = [
  { name: 'Айгерим Сапарова', role: 'Терапевт, лечение каналов', exp: 'Стаж 9 лет', photo: 'assets/doc-1.jpg' },
  { name: 'Нурлан Ахметов', role: 'Хирург-имплантолог', exp: 'Стаж 14 лет', photo: 'assets/doc-2.jpg' },
  { name: 'Дана Жумабекова', role: 'Детский стоматолог', exp: 'Стаж 7 лет', photo: 'assets/doc-3.jpg' },
];

const FACTS = [
  { t: 'Микроскоп в каждом кабинете', d: 'Видим трещины и каналы, которые не видно глазом.' },
  { t: 'Свой 3D-томограф', d: 'Снимок делаем на месте, не нужно ехать в диагностический центр.' },
  { t: 'Стерилизация класса B', d: 'Инструменты в запечатанных пакетах, вскрываем при вас.' },
  { t: 'Рассрочка 0-0-12', d: 'На лечение от 100 000 ₸ без переплат и первого взноса.' },
];

/* ---------------------------------------------------------------------
   2. УТИЛИТЫ
   --------------------------------------------------------------------- */
const $  = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SHORT = /(^|[\s(])(в|во|на|с|со|к|ко|у|о|об|и|а|но|из|за|по|до|от|не|для|без|при|как|что)\s+/giu;
const nb = (s) => String(s).replace(SHORT, '$1$2 ').replace(SHORT, '$1$2 ').replace(/(\d)\s+(?=[^\s\d])/g, '$1 ');
const money = (n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₸';
const priceText = (n) => (n ? `от ${money(n)}` : 'бесплатно');
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (t) => t * t * (3 - 2 * t);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMobile = () => innerWidth <= 760;
const ARROW = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

/* ---------------------------------------------------------------------
   3. РАЗМЕТКА ИЗ ДАННЫХ
   --------------------------------------------------------------------- */
const flat = [];
SERVICES.forEach((g) => g.items.forEach((it) => { it.id = flat.length; flat.push(it); }));

$('[data-list="tabs"]').innerHTML = SERVICES.map((g, i) =>
  `<button class="tab" type="button" role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}">${esc(g.cat)}</button>`).join('');
$('[data-list="services"]').innerHTML = SERVICES.map((g, i) => `
  <div class="prices__panel" role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}"${i ? ' hidden' : ''}>
    ${g.items.map((it) => `
      <button class="row" type="button" data-service="${it.id}" data-cursor="В запись">
        <span class="row__name">${esc(nb(it.name))}${it.note ? `<span class="row__note">${esc(nb(it.note))}</span>` : ''}</span>
        <span class="row__time">${esc(nb(it.time))}</span>
        <span class="row__price${it.price ? '' : ' row__price--free'}">${priceText(it.price)}</span>
      </button>`).join('')}
  </div>`).join('');

$('[data-list="steps"]').innerHTML = STEPS.map((s, i) => `
  <li class="tstep">
    <span class="tstep__n" aria-hidden="true">0${i + 1}</span>
    <h3>${esc(s.t)}</h3>
    <p>${esc(nb(s.d))}</p>
    <span class="tstep__fact">${esc(nb(s.fact))}</span>
  </li>`).join('');
$('[data-list="labels"]').innerHTML = STEPS.map((s, i) => `<span${i ? '' : ' class="is-on"'}>${esc(s.t)}</span>`).join('');

$('[data-list="doctors"]').innerHTML = DOCTORS.map((d) => `
  <article class="doc">
    <div class="doc__img"><img src="${esc(d.photo)}" alt="${esc(d.name)}, ${esc(d.role.toLowerCase())}" loading="lazy"></div>
    <div class="doc__body">
      <h3>${esc(d.name)}</h3>
      <span class="doc__role">${esc(nb(d.role))}</span>
      <span class="doc__exp">${esc(d.exp)}</span>
      <button class="doc__go magnetic" type="button" data-doctor="${esc(d.name)}" aria-label="Записаться к врачу ${esc(d.name)}" data-cursor="Записаться">${ARROW}</button>
    </div>
  </article>`).join('');

$('[data-list="facts"]').innerHTML = FACTS.map((f, i) => `
  <li class="fact" data-fade>
    <span class="fact__n">0${i + 1}</span>
    <h3>${esc(nb(f.t))}</h3>
    <p>${esc(nb(f.d))}</p>
  </li>`).join('');

const tabs = $$('.tab');
const panels = $$('.prices__panel');
let onTab = () => {};
tabs.forEach((t, i) => t.addEventListener('click', () => {
  tabs.forEach((x, j) => x.setAttribute('aria-selected', String(i === j)));
  panels.forEach((p, j) => { p.hidden = i !== j; });
  onTab(panels[i]);
}));

/* ---------------------------------------------------------------------
   4. ЗАПИСЬ
   --------------------------------------------------------------------- */
const form = $('#booking');
const state = { service: 0, doctor: 'Любой врач', day: 0, time: '' };
const sel = form.elements.service;
sel.innerHTML = SERVICES.map((g) => `<optgroup label="${esc(g.cat)}">${
  g.items.map((it) => `<option value="${it.id}">${esc(it.name)}, ${priceText(it.price).replace(/ /g, ' ')}</option>`).join('')}</optgroup>`).join('');

const chipsDoc = $('[data-chips="doctor"]');
chipsDoc.innerHTML = ['Любой врач', ...DOCTORS.map((d) => d.name)].map((n) => `<button class="chip" type="button" data-v="${esc(n)}" aria-pressed="false">${esc(n)}</button>`).join('');

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
// воскресенье короче: 10:00–16:00
const hoursFor = (i) => (days[i].getDay() === 0 ? { from: 10, to: 16 } : SITE.open);
function renderTimes() {
  const now = new Date();
  const nowMin = state.day === 0 ? now.getHours() * 60 + now.getMinutes() + 60 : -1;
  const h = hoursFor(state.day);
  const slots = [];
  for (let t = h.from * 60; t <= h.to * 60 - 60; t += SITE.open.step) slots.push(t);
  if (state.day === 0 && !slots.some((t) => t >= nowMin)) { pick('day', 1); return; }
  chipsTime.innerHTML = slots.map((t) =>
    `<button class="chip" type="button" data-v="${toHM(t)}" aria-pressed="${toHM(t) === state.time}"${t < nowMin ? ' disabled' : ''}>${toHM(t)}</button>`).join('');
  const picked = $(`[data-v="${state.time}"]`, chipsTime);
  if (!picked || picked.disabled) state.time = '';
}
const press = (box, v) => $$('.chip', box).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.v === String(v))));
function pick(key, v) {
  state[key] = key === 'day' || key === 'service' ? Number(v) : v;
  if (key === 'service') sel.value = String(v);
  if (key === 'doctor') press(chipsDoc, v);
  if (key === 'day') { press(chipsDay, v); renderTimes(); }
  if (key === 'time') press(chipsTime, v);
  renderSummary();
}
chipsDoc.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) pick('doctor', c.dataset.v); });
chipsDay.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) pick('day', c.dataset.v); });
chipsTime.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c && !c.disabled) pick('time', c.dataset.v); });
sel.addEventListener('change', () => pick('service', sel.value));

function renderSummary() {
  const svc = flat[state.service];
  $('.summary__text').textContent = nb([
    svc.name,
    state.doctor === 'Любой врач' ? 'любой свободный врач' : `врач ${state.doctor}`,
    state.time ? `${dayLong(state.day)} в ${state.time}` : `${dayLong(state.day)}, время не выбрано`,
  ].join(', '));
  $('.summary__price').textContent = priceText(svc.price);
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
  if (miss.length) { err.hidden = false; err.textContent = nb(`Осталось указать: ${miss.join(', ')}`); return; }
  err.hidden = true;
  const svc = flat[state.service];
  const text = [
    `Здравствуйте! Хочу записаться в клинику ${SITE.name}.`,
    `Услуга: ${svc.name} (${priceText(svc.price).replace(/ /g, ' ')})`,
    `Врач: ${state.doctor}`,
    `Когда: ${dayLong(state.day)}, ${state.time}`,
    `Имя: ${f.name.value.trim()}`,
    `Телефон: ${f.phone.value}`,
  ].join('\n');
  window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

pick('doctor', 'Любой врач');
pick('day', 0);
pick('service', 0);

/* ---------------------------------------------------------------------
   5. РАЗБИВКА ТЕКСТА
   --------------------------------------------------------------------- */
function splitChars(el) {
  const lines = el.innerHTML.split(/<br\s*\/?>/i).map((h) => { const t = document.createElement('span'); t.innerHTML = h; return t.textContent; });
  el.setAttribute('aria-label', lines.join(' '));
  const word = (w) => `<span class="split-word">${[...w].map((ch) => `<span class="split-char">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('')}</span>`;
  el.innerHTML = lines.map((line) => `<span class="split-line" aria-hidden="true">${line.trim().split(/ +/).map(word).join(' ')}</span>`).join('<br>');
  return $$('.split-char', el);
}
$$('[data-split], [data-reveal]').forEach(splitChars);

/* ---------------------------------------------------------------------
   6. 3D-СЦЕНА
   --------------------------------------------------------------------- */
let tooth = null;
const stage = $('.stage');
async function initTooth() {
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('no webgl');
    const mod = await import('./tooth.js');
    tooth = mod.createTooth(stage, { mobile: isMobile() || !fine });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
  }
}

const BASE = { x: 0, y: 0, z: 0, rx: 0.3, rz: 0, scale: 1, lens: 1, scan: 0, caries: 0, cure: 0, implant: 0, shine: 0, idle: 0, shadow: 1, halo: 0, alpha: 1 };
const S = (o) => ({ ...BASE, ...o });
function keyStates() {
  const m = isMobile();
  const pos = m ? { x: 0, y: 0.2, scale: 0.5 } : { x: 1.75, y: -0.32, scale: 0.84 };
  return {
    intro: S(m ? { y: -3.6, scale: 0.6, rx: 0.8, lens: 0 } : { x: 0.1, y: -4.2, scale: 1, rx: 0.8, lens: 0 }),
    hero: S(m ? { x: 0.05, y: 0.62, scale: 0.5, idle: 1 } : { x: 0.1, y: -0.05, scale: 1.15, idle: 1 }),
    t0: S({ ...pos, lens: 0 }),
    scan: S({ ...pos, lens: 0, scan: 1, caries: 1, rx: 0.55 }),
    cure0: S({ ...pos, lens: 0, scan: 1, caries: 1, rx: 0.72 }),
    cureMid: S({ ...pos, lens: 0, scan: 1, caries: 0.35, cure: 1, rx: 0.72 }),
    cured: S({ ...pos, lens: 0, scan: 1, caries: 0, cure: 0, rx: 0.5 }),
    implant: S({ ...pos, lens: 0, scan: 1, implant: 1, rx: 0.22 }),
    shine: S({ ...pos, lens: 0, scan: 1, implant: 1, shine: 1, rx: 0.3 }),
    prices: m ? S({ y: 3.4, scale: 0.5, alpha: 0, implant: 1, shine: 1, scan: 1 })
              : S({ x: -2.45, y: 0.35, scale: 0.72, lens: 1, implant: 1, shine: 1, scan: 1, rx: 0.3, idle: 1 }),
    gone: S({ x: -1.5, y: 4.4, scale: 0.6, alpha: 0, implant: 1, shine: 1, scan: 1, lens: 0 }),
    book: m ? S({ y: 3.4, scale: 0.5, alpha: 0, lens: 0 })
            : S({ x: -2.6, y: -1.15, scale: 0.6, lens: 1, idle: 1, scan: 1, shine: 1 }),
    foot: S({ x: 0, y: 3.6, scale: 0.6, alpha: 0, lens: 0, scan: 1, shine: 1 }),
  };
}
const mixState = (a, b, t) => Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] - a[k]) * t]));
const pageY = (el) => el.getBoundingClientRect().top + scrollY;

let keys = [];
function buildKeys() {
  const K = keyStates();
  const vh = innerHeight;
  const tr = $('.treat'), pr = $('.prices'), docs = $('.doctors'), book = $('.book'), foot = $('.foot');
  const top = pageY(tr), len = Math.max(1, tr.offsetHeight - vh);
  const at = (p) => top + len * p;
  const maxY = document.documentElement.scrollHeight - vh;
  keys = [
    [0, K.hero],
    [vh * 0.15, K.hero],
    [top, K.t0],
    [at(0.04), K.t0],
    [at(0.22), K.scan],
    [at(0.28), K.cure0],
    [at(0.38), K.cureMid],
    [at(0.47), K.cured],
    [at(0.53), K.cured],
    [at(0.72), K.implant],
    [at(0.78), K.implant],
    [at(0.95), K.shine],
    [top + tr.offsetHeight - vh * 0.1, K.shine],
    [pageY(pr) + vh * 0.05, K.prices],
    [Math.max(pageY(pr) + vh * 0.1, pageY(pr) + pr.offsetHeight - vh * 1.1), K.prices],
    [pageY(docs) + vh * 0.2, K.gone],
    [pageY(book) - vh * 0.5, K.gone],
    [pageY(book) + vh * 0.05, K.book],
    [Math.max(pageY(book) + vh * 0.1, pageY(foot) - vh), K.book],
    [Math.min(pageY(foot) - vh * 0.35, maxY - 1), K.foot],
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
  await initTooth(); target = 0.85;
  await new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
  target = 1;
  await new Promise((r) => setTimeout(r, Math.max(0, (reduce ? 0 : 1300) - (performance.now() - t0))));
  await new Promise((r) => { const w = () => (shown.p >= 1 || reduce ? r() : requestAnimationFrame(w)); w(); });

  const steps = $$('.tstep');
  const labels = $$('.rail__labels span');

  if (!hasAnim) {
    loader.remove();
    document.body.classList.remove('is-loading');
    steps.forEach((s, i) => { s.style.opacity = i === 3 ? 1 : 0; });
    if (tooth) { buildKeys(); tooth.jump(keyStates().hero); }
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
    const row = e.target.closest('[data-service]');
    if (row) { pick('service', row.dataset.service); scrollToEl($('#book')); }
    const doc = e.target.closest('[data-doctor]');
    if (doc) { pick('doctor', doc.dataset.doctor); scrollToEl($('#book')); }
  });

  const heroChars = $$('.hero__word .split-char');
  if (!reduce) {
    g.set(heroChars, { yPercent: 118 });
    g.set('.hero [data-fade], .nav', { autoAlpha: 0, y: 24, filter: 'blur(14px)' });
  }

  const intro = { k: reduce ? 1 : 0 };
  const K0 = keyStates();
  const update = () => {
    if (!tooth) return;
    const s = mixState(K0.intro, scrollState(scrollY), smooth(intro.k));
    s.ry = (scrollY / innerHeight) * 0.7;
    tooth.setState(s);
    tooth.setVisible(s.alpha > 0.002);
  };
  if (tooth) { buildKeys(); tooth.jump({ ...K0.intro, ry: 0 }); update(); }

  const tl = g.timeline({ defaults: { ease: 'expo.out' } });
  tl.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: reduce ? 0 : 1.1, ease: 'expo.inOut' })
    .add(() => { loader.remove(); document.body.classList.remove('is-loading'); });
  if (!reduce) {
    tl.to(heroChars, { yPercent: 0, duration: 1.3, stagger: 0.08 }, '-=0.45')
      .to(intro, { k: 1, duration: 2.2, ease: 'power3.inOut', onUpdate: update }, '<0.1')
      .to('.nav', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, '<0.3')
      .to('.hero [data-fade]', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.1 }, '<0.3');
  }
  tl.add(() => { lenis && lenis.start(); });

  ST.create({ start: 0, end: 'max', onUpdate: update });
  ST.addEventListener('refresh', () => { buildKeys(); update(); });

  /* рентген: линза идёт за курсором, курсор превращается в кольцо над зубом */
  const cursor = $('.cursor');
  const cursorLabel = $('.cursor__label');
  let overTooth = false;
  if (tooth) {
    addEventListener('pointermove', (e) => {
      tooth.setMouse((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1), e.clientX, e.clientY);
      const c = tooth.toothScreen();
      const near = Math.hypot(e.clientX - c.x, (e.clientY - c.y) * 0.7) < 220 * Math.max(0.6, innerWidth / 1440) && !e.target.closest('a, button, input, select');
      if (near !== overTooth) {
        overTooth = near;
        cursor.classList.toggle('is-xray', near);
        if (near) cursor.classList.remove('is-label', 'is-link');
        if (near) cursorLabel.textContent = 'Рентген';
      }
    }, { passive: true });
    document.addEventListener('pointerleave', () => tooth.leave());
  }

  if (!reduce) {
    $$('[data-reveal]').forEach((el) => {
      g.from($$('.split-char', el), { yPercent: 118, duration: 1.1, ease: 'expo.out', stagger: 0.03, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('[data-fade]').forEach((el) => {
      if (el.closest('.hero')) return;
      g.from(el, { autoAlpha: 0, y: 28, filter: 'blur(14px)', duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    const rowsIn = (panel) => g.fromTo($$('.row', panel), { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out', stagger: 0.05, overwrite: true });
    g.from($$('.row', panels[0]), { y: 30, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.prices__panels', start: 'top 82%' } });
    g.from('.tab', { y: 20, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.tabs', start: 'top 90%' } });
    onTab = (panel) => { rowsIn(panel); ST.refresh(); };
    $$('.doc__img, .ph__img').forEach((el) => {
      g.from(el, { clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('.doc__img img, .ph__img img').forEach((img) => {
      g.fromTo(img, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    g.fromTo('.clinic__img img', { yPercent: -8, scale: 1.08 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.clinic__hero', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    g.from('.foot__word .split-char', { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.foot__word', start: 'top 95%' } });
  } else {
    onTab = () => ST.refresh();
  }

  /* шаги лечения */
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
    trigger: '.treat', start: 'top top', end: 'bottom bottom',
    onUpdate: (self) => {
      g.set('.rail__progress i', { scaleX: self.progress });
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
    const cx = g.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const cy = g.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    addEventListener('pointermove', (e) => { cursor.classList.add('is-on'); cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    document.addEventListener('pointerover', (e) => {
      if (overTooth) return;
      const lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, input, select');
      cursor.classList.toggle('is-label', !!lab);
      cursor.classList.toggle('is-link', !lab && !!link);
      if (lab) cursorLabel.textContent = lab.dataset.cursor;
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
