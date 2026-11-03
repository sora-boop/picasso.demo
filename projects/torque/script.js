/* =====================================================================
   TORQUE 52. Концепт.
   Анимации: GSAP + ScrollTrigger, плавный скролл: Lenis, 3D: brake.js.
   Если библиотеки или WebGL недоступны, сайт остаётся рабочим.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. ДАННЫЕ
   --------------------------------------------------------------------- */
const SITE = { name: 'TORQUE 52', whatsapp: '77000000000', open: { from: 9, to: 19, step: 30 } };

const SERVICES = [
  { cat: 'ТО и масло', items: [
    { name: 'Замена масла в двигателе', note: 'с масляным фильтром', time: '30 мин', price: 5000 },
    { name: 'Замена масла в АКПП', note: 'частичная, с проверкой уровня', time: '1 ч', price: 8000 },
    { name: 'Замена фильтров', note: 'воздушный и салонный', time: '20 мин', price: 3000 },
    { name: 'Замена свечей зажигания', time: '40 мин', price: 4000 },
    { name: 'Замена ремня ГРМ', note: 'с роликами и помпой', time: '3 ч', price: 35000 },
  ]},
  { cat: 'Тормоза', items: [
    { name: 'Замена передних колодок', note: 'ось, с чисткой направляющих', time: '40 мин', price: 6000 },
    { name: 'Замена задних колодок', time: '50 мин', price: 7000 },
    { name: 'Замена тормозных дисков', note: 'ось', time: '1 ч', price: 10000 },
    { name: 'Проточка диска', note: 'один диск, без замены', time: '30 мин', price: 5000 },
    { name: 'Замена тормозной жидкости', time: '40 мин', price: 6000 },
    { name: 'Ремонт суппорта', note: 'ремкомплект, направляющие, пыльники', time: '1,5 ч', price: 12000 },
  ]},
  { cat: 'Подвеска', items: [
    { name: 'Диагностика подвески', note: 'бесплатно, если ремонтируем у нас', time: '30 мин', price: 3000 },
    { name: 'Замена амортизаторов', note: 'ось', time: '2 ч', price: 18000 },
    { name: 'Замена ступичного подшипника', time: '1,5 ч', price: 15000 },
    { name: 'Замена рычага', time: '1 ч', price: 8000 },
    { name: 'Развал-схождение', note: '3D-стенд', time: '40 мин', price: 10000 },
  ]},
  { cat: 'Диагностика', items: [
    { name: 'Компьютерная диагностика', note: 'ошибки двигателя, АКПП, ABS', time: '40 мин', price: 8000 },
    { name: 'Проверка перед покупкой', note: 'толщиномер, подвеска, сканер', time: '1,5 ч', price: 15000 },
    { name: 'Диагностика кондиционера', time: '30 мин', price: 5000 },
  ]},
  { cat: 'Шины', items: [
    { name: 'Шиномонтаж R13–R16', note: 'четыре колеса с балансировкой', time: '40 мин', price: 8000 },
    { name: 'Шиномонтаж R17–R20', note: 'четыре колеса с балансировкой', time: '1 ч', price: 12000 },
    { name: 'Хранение шин', note: 'сезон, с мойкой', time: '', price: 15000 },
  ]},
];

const STEPS = [
  { t: 'Диагностика', fact: 'Толщиномер и стенд, 15 минут', d: 'Меряем толщину диска и колодок, проверяем тормозную жидкость и люфты. Всё показываем на подъёмнике.' },
  { t: 'Разбор', fact: 'Цена каждой детали заранее', d: 'Снимаем колесо, суппорт и колодки. Говорим, что менять и сколько это стоит, до того как начнём.' },
  { t: 'Замена', fact: 'Старые детали отдадим вам', d: 'Протачиваем или меняем диск, ставим новые колодки, чистим и смазываем направляющие суппорта.' },
  { t: 'Сборка', fact: 'Гарантия 12 месяцев', d: 'Затягиваем динамометрическим ключом по моменту завода и делаем тест-драйв вместе с вами.' },
];

const PARTS = [
  { k: 'caliper', name: 'Суппорт', price: 'ремонт от 12 000 ₸' },
  { k: 'padF', name: 'Колодки', price: 'замена 6 000 ₸', left: true },
  { k: 'disc', name: 'Диск', price: 'проточка 5 000 ₸' },
  { k: 'hub', name: 'Ступица', price: 'подшипник 15 000 ₸' },
  { k: 'nut', name: 'Гайки', price: 'момент 120 Н·м', left: true },
];

const CALC = {
  classes: [{ v: 'Легковой', k: 1 }, { v: 'Кроссовер', k: 1.2 }, { v: 'Внедорожник или минивэн', k: 1.4 }],
  works: [
    { v: 'Замена масла', price: 5000, h: 0.5 },
    { v: 'Колодки, ось', price: 6000, h: 0.7 },
    { v: 'Диски, ось', price: 10000, h: 1 },
    { v: 'Тормозная жидкость', price: 6000, h: 0.7 },
    { v: 'Амортизаторы, ось', price: 18000, h: 2 },
    { v: 'Развал-схождение', price: 10000, h: 0.7 },
    { v: 'Компьютерная диагностика', price: 8000, h: 0.7 },
    { v: 'Ремень ГРМ', price: 35000, h: 3 },
    { v: 'Шиномонтаж', price: 8000, h: 0.7 },
  ],
};

const FACTS = [
  { t: 'Гарантия 12 месяцев', d: 'На работу и на запчасти, которые подбирали мы.' },
  { t: 'Цена не растёт', d: 'Если нашли что-то ещё, сначала звоним и согласуем.' },
  { t: 'Видео ремонта', d: 'Пришлём в WhatsApp, что сняли и что поставили.' },
  { t: 'Старые детали ваши', d: 'Отдаём в руки, чтобы было видно, за что вы платите.' },
];

/* ---------------------------------------------------------------------
   2. УТИЛИТЫ
   --------------------------------------------------------------------- */
const $  = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SHORT = /(^|[\s(])(в|во|на|с|со|к|ко|у|о|об|и|а|но|из|за|по|до|от|не|для|без|при|как|что)\s+/giu;
const nb = (s) => String(s).replace(SHORT, '$1$2 ').replace(SHORT, '$1$2 ').replace(/(\d)\s+(?=[^\s\d])/g, '$1 ');
const num = (n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ');
const money = (n) => num(n) + ' ₸';
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (t) => t * t * (3 - 2 * t);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMobile = () => innerWidth <= 760;

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
        <span class="row__price">${money(it.price)}</span>
      </button>`).join('')}
  </div>`).join('');

$('[data-list="steps"]').innerHTML = STEPS.map((s, i) => `
  <li class="rstep">
    <span class="rstep__n" aria-hidden="true">0${i + 1}</span>
    <h3>${esc(s.t)}</h3>
    <p>${esc(nb(s.d))}</p>
    <span class="rstep__fact">${esc(nb(s.fact))}</span>
  </li>`).join('');
$('[data-list="labels"]').innerHTML = STEPS.map((s, i) => `<span${i ? '' : ' class="is-on"'}>${esc(s.t)}</span>`).join('');

$('[data-list="parts"]').innerHTML = PARTS.map((p) => `
  <div class="part${p.left ? ' part--left' : ''}" data-part="${p.k}">
    <span class="part__dot"></span><span class="part__line"></span>
    <span class="part__text"><span class="part__name">${esc(p.name)}</span><span class="part__price">${esc(p.price)}</span></span>
  </div>`).join('');

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
   4. КАЛЬКУЛЯТОР РЕМОНТА
   --------------------------------------------------------------------- */
const calc = { cls: 0, works: new Set([1]) };
const boxClass = $('[data-chips="class"]'), boxWorks = $('[data-chips="works"]');
boxClass.innerHTML = CALC.classes.map((c, i) => `<button class="chip" type="button" data-i="${i}" aria-pressed="false">${esc(c.v)}</button>`).join('');
boxWorks.innerHTML = CALC.works.map((w, i) => `<button class="chip" type="button" data-i="${i}" aria-pressed="false">${esc(w.v)}<small>${num(w.price)}</small></button>`).join('');
const calcNum = $('.calc__num');
let shownCalc = 0;
function calcTotal() {
  const k = CALC.classes[calc.cls].k;
  let price = 0, h = 0;
  calc.works.forEach((i) => { price += CALC.works[i].price; h += CALC.works[i].h; });
  return { price: Math.round((price * k) / 500) * 500, h };
}
function renderCalc() {
  $$('.chip', boxClass).forEach((c) => c.setAttribute('aria-pressed', String(Number(c.dataset.i) === calc.cls)));
  $$('.chip', boxWorks).forEach((c) => c.setAttribute('aria-pressed', String(calc.works.has(Number(c.dataset.i)))));
  const { price, h } = calcTotal();
  const hours = Math.max(0.5, Math.round(h * 2) / 2);
  $('.calc__time').textContent = !calc.works.size ? 'Отметьте работы, и мы посчитаем'
    : `Примерно ${String(hours).replace('.', ',')} ч. ${h <= 6 ? 'Заберёте машину в тот же день' : 'Машина останется у нас до завтра'}`;
  const from = shownCalc; shownCalc = price;
  if (window.gsap && !reduce) {
    const o = { v: from };
    window.gsap.to(o, { v: price, duration: 0.8, ease: 'expo.out', onUpdate: () => { calcNum.textContent = num(Math.round(o.v / 100) * 100); } });
  } else calcNum.textContent = num(price);
}
boxClass.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) { calc.cls = Number(c.dataset.i); renderCalc(); } });
boxWorks.addEventListener('click', (e) => {
  const c = e.target.closest('.chip'); if (!c) return;
  const i = Number(c.dataset.i);
  calc.works.has(i) ? calc.works.delete(i) : calc.works.add(i);
  $('.calc__error').hidden = true;
  renderCalc();
});
$('#calc-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!calc.works.size) { $('.calc__error').hidden = false; return; }
  const { price } = calcTotal();
  const text = [
    `Здравствуйте! Посчитал ремонт на сайте ${SITE.name}:`,
    `Машина: ${CALC.classes[calc.cls].v.toLowerCase()}`,
    `Работы: ${[...calc.works].sort((a, b) => a - b).map((i) => CALC.works[i].v).join('; ')}`,
    `Работа примерно: ${money(price).replace(/ /g, ' ')}`,
    'Подскажите по запчастям и свободному времени.',
  ].join('\n');
  window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});
renderCalc();

/* ---------------------------------------------------------------------
   5. ЗАПИСЬ
   --------------------------------------------------------------------- */
const form = $('#booking');
const state = { service: 0, day: 0, time: '' };
const sel = form.elements.service;
sel.innerHTML = SERVICES.map((g) => `<optgroup label="${esc(g.cat)}">${
  g.items.map((it) => `<option value="${it.id}">${esc(it.name)}, ${money(it.price).replace(/ /g, ' ')}</option>`).join('')}</optgroup>`).join('');

const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
// воскресенье только по записи, поэтому в календаре шесть рабочих дней вперёд
const days = [];
for (let i = 0; days.length < 7; i++) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); if (d.getDay() !== 0) days.push(d); }
const today = new Date(); today.setHours(0, 0, 0, 0);
const isToday = (i) => days[i].getTime() === today.getTime();
const isTomorrow = (i) => days[i].getTime() === today.getTime() + 864e5;
const dayTitle = (i) => (isToday(i) ? 'Сегодня' : isTomorrow(i) ? 'Завтра' : `${WD[days[i].getDay()]}, ${days[i].getDate()}`);
const dayLong = (i) => `${isToday(i) ? 'сегодня, ' : isTomorrow(i) ? 'завтра, ' : ''}${days[i].getDate()} ${MON[days[i].getMonth()]}`;
const chipsDay = $('[data-chips="day"]');
chipsDay.innerHTML = days.map((d, i) =>
  `<button class="chip" type="button" data-v="${i}" aria-pressed="false">${dayTitle(i)}<small>${d.getDate()} ${MON[d.getMonth()].slice(0, 3)}</small></button>`).join('');

const chipsTime = $('[data-chips="time"]');
const toHM = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
function renderTimes() {
  const now = new Date();
  const nowMin = isToday(state.day) ? now.getHours() * 60 + now.getMinutes() + 60 : -1;
  const slots = [];
  for (let t = SITE.open.from * 60; t <= SITE.open.to * 60 - 60; t += SITE.open.step) slots.push(t);
  if (isToday(state.day) && !slots.some((t) => t >= nowMin)) { pick('day', state.day + 1); return; }
  chipsTime.innerHTML = slots.map((t) =>
    `<button class="chip" type="button" data-v="${toHM(t)}" aria-pressed="${toHM(t) === state.time}"${t < nowMin ? ' disabled' : ''}>${toHM(t)}</button>`).join('');
  const picked = $(`[data-v="${state.time}"]`, chipsTime);
  if (!picked || picked.disabled) state.time = '';
}
const press = (box, v) => $$('.chip', box).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.v === String(v))));
function pick(key, v) {
  state[key] = key === 'day' || key === 'service' ? Number(v) : v;
  if (key === 'service') sel.value = String(v);
  if (key === 'day') { press(chipsDay, v); renderTimes(); }
  if (key === 'time') press(chipsTime, v);
  renderSummary();
}
chipsDay.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) pick('day', c.dataset.v); });
chipsTime.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c && !c.disabled) pick('time', c.dataset.v); });
sel.addEventListener('change', () => pick('service', sel.value));

function renderSummary() {
  const svc = flat[state.service];
  const car = form.elements.car.value.trim();
  $('.summary__text').textContent = nb([
    svc.name,
    car || 'машина не указана',
    state.time ? `${dayLong(state.day)} в ${state.time}` : `${dayLong(state.day)}, время не выбрано`,
  ].join(', '));
  $('.summary__price').textContent = money(svc.price);
}
form.elements.car.addEventListener('input', renderSummary);

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
  const okCar = !!f.car.value.trim();
  const okName = !!f.name.value.trim();
  const okPhone = f.phone.value.replace(/\D/g, '').length === 11;
  const miss = [!okCar && 'машину', !state.time && 'время', !okName && 'имя', !okPhone && 'телефон'].filter(Boolean);
  f.car.closest('.field').classList.toggle('is-bad', !okCar);
  f.name.closest('.field').classList.toggle('is-bad', !okName);
  f.phone.closest('.field').classList.toggle('is-bad', !okPhone);
  if (miss.length) { err.hidden = false; err.textContent = nb(`Осталось указать: ${miss.join(', ')}`); return; }
  err.hidden = true;
  const svc = flat[state.service];
  const text = [
    `Здравствуйте! Хочу записаться в ${SITE.name}.`,
    `Машина: ${f.car.value.trim()}`,
    `Работа: ${svc.name} (${money(svc.price).replace(/ /g, ' ')})`,
    `Когда: ${dayLong(state.day)}, ${state.time}`,
    `Имя: ${f.name.value.trim()}`,
    `Телефон: ${f.phone.value}`,
  ].join('\n');
  window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

pick('day', 0);
pick('service', 0);

/* ---------------------------------------------------------------------
   6. РАЗБИВКА ТЕКСТА
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
   7. 3D-СЦЕНА
   --------------------------------------------------------------------- */
let brake = null;
const stage = $('.stage');
async function initBrake() {
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('no webgl');
    const mod = await import('./brake.js');
    await document.fonts.load('400 40px Oswald');
    brake = mod.createBrake(stage, { mobile: isMobile() });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
  }
}

const BASE = { x: 0, y: 0, z: 0, rx: 0.15, ry: -0.55, rz: 0, scale: 1, explode: 0, rust: 0, wear: 0, idle: 0, shadow: 1, alpha: 1 };
const S = (o) => ({ ...BASE, ...o });
function keyStates() {
  const m = isMobile();
  const pos = m ? { x: 0, y: 0.12, scale: 0.44 } : { x: 1.75, y: -0.3, scale: 0.8 };
  const ex = m ? { x: 0.1, y: 0.05, scale: 0.38, ry: -0.95, rx: 0.2 } : { x: 1.55, y: -0.45, scale: 0.68, ry: -0.95, rx: 0.2 };
  return {
    intro: S(m ? { y: -3.6, scale: 0.5, rx: 0.8 } : { x: 0.35, y: -4.2, scale: 1, rx: 0.8 }),
    hero: S(m ? { x: 0, y: 0.62, scale: 0.46, idle: 1 } : { x: 0.6, y: -0.2, scale: 0.92, idle: 1 }),
    r0: S({ ...pos }),
    diag: S({ ...pos, rust: 1, wear: 1, ry: -0.3, rx: 0.3 }),
    explode: S({ ...ex, explode: 1, rust: 1, wear: 1 }),
    replace: S({ ...ex, explode: 1, rust: 0, wear: 0 }),
    built: S({ ...pos }),
    prices: m ? S({ y: 3.4, scale: 0.4, alpha: 0 }) : S({ x: -2.5, y: 0.45, scale: 0.52, idle: 1 }),
    gone: S({ x: -1.5, y: 4.4, scale: 0.5, alpha: 0 }),
    book: m ? S({ y: 3.4, scale: 0.4, alpha: 0 }) : S({ x: -2.6, y: -1.35, scale: 0.46, idle: 1 }),
    foot: S({ x: 0, y: 3.6, scale: 0.5, alpha: 0 }),
  };
}
const mixState = (a, b, t) => Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] - a[k]) * t]));
const pageY = (el) => el.getBoundingClientRect().top + scrollY;

let keys = [];
function buildKeys() {
  const K = keyStates();
  const vh = innerHeight;
  const rp = $('.repair'), pr = $('.prices'), calcEl = $('.calc'), book = $('.book'), foot = $('.foot');
  const top = pageY(rp), len = Math.max(1, rp.offsetHeight - vh);
  const at = (p) => top + len * p;
  const maxY = document.documentElement.scrollHeight - vh;
  keys = [
    [0, K.hero],
    [vh * 0.15, K.hero],
    [top, K.r0],
    [at(0.04), K.r0],
    [at(0.2), K.diag],
    [at(0.28), K.diag],
    [at(0.46), K.explode],
    [at(0.53), K.explode],
    [at(0.71), K.replace],
    [at(0.78), K.replace],
    [at(0.95), K.built],
    [top + rp.offsetHeight - vh * 0.1, K.built],
    [pageY(pr) + vh * 0.05, K.prices],
    [Math.max(pageY(pr) + vh * 0.1, pageY(pr) + pr.offsetHeight - vh * 1.1), K.prices],
    [pageY(calcEl) + vh * 0.1, K.gone],
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
   8. ЗАПУСК
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
  await initBrake(); target = 0.85;
  await new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
  target = 1;
  await new Promise((r) => setTimeout(r, Math.max(0, (reduce ? 0 : 1300) - (performance.now() - t0))));
  await new Promise((r) => { const w = () => (shown.p >= 1 || reduce ? r() : requestAnimationFrame(w)); w(); });

  const steps = $$('.rstep');
  const labels = $$('.rail__labels span');

  if (!hasAnim) {
    loader.remove();
    document.body.classList.remove('is-loading');
    steps.forEach((s, i) => { s.style.opacity = i === 3 ? 1 : 0; });
    if (brake) { buildKeys(); brake.jump(keyStates().hero); }
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
  });

  const heroChars = $$('.hero__word .split-char');
  if (!reduce) {
    g.set(heroChars, { yPercent: 118 });
    g.set('.hero [data-fade], .nav', { autoAlpha: 0, y: 24, filter: 'blur(14px)' });
  }

  /* узел: вступление смешивается со скроллом, колесо крутится от скролла */
  const intro = { k: reduce ? 1 : 0 };
  const K0 = keyStates();
  const partsBox = $('.parts');
  const partEls = $$('.part');
  let partsOn = false;
  const update = () => {
    if (!brake) return;
    const s = mixState(K0.intro, scrollState(scrollY), smooth(intro.k));
    s.spin = (scrollY / innerHeight) * 2.4;
    brake.setState(s);
    brake.setVisible(s.alpha > 0.002);
    const on = s.explode > 0.85 && !isMobile();
    if (on !== partsOn) { partsOn = on; partsBox.classList.toggle('is-on', on); }
  };
  // подписи едут за деталями каждый кадр, пока видны
  g.ticker.add(() => {
    if (!brake || !partsOn) return;
    const A = brake.anchors();
    partEls.forEach((el) => { const p = A[el.dataset.part]; el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`; });
  });
  if (brake) { buildKeys(); brake.jump({ ...K0.intro, spin: 0 }); update(); }

  const tl = g.timeline({ defaults: { ease: 'expo.out' } });
  tl.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: reduce ? 0 : 1.1, ease: 'expo.inOut' })
    .add(() => { loader.remove(); document.body.classList.remove('is-loading'); });
  if (!reduce) {
    tl.to(heroChars, { yPercent: 0, duration: 1.3, stagger: 0.06 }, '-=0.45')
      .to(intro, { k: 1, duration: 2.2, ease: 'power3.inOut', onUpdate: update }, '<0.1')
      .to('.nav', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, '<0.3')
      .to('.hero [data-fade]', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.1 }, '<0.3');
  }
  tl.add(() => { lenis && lenis.start(); });

  ST.create({ start: 0, end: 'max', onUpdate: update });
  ST.addEventListener('refresh', () => { buildKeys(); update(); });
  if (brake) addEventListener('pointermove', (e) => brake.setMouse((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)), { passive: true });

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
    $$('.chips', $('.calc')).forEach((box) => g.from($$('.chip', box), { y: 18, autoAlpha: 0, duration: 0.7, ease: 'expo.out', stagger: 0.04, scrollTrigger: { trigger: box, start: 'top 90%' } }));
    $$('.ph__img').forEach((el) => {
      g.from(el, { clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('.ph__img img').forEach((img) => {
      g.fromTo(img, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    g.fromTo('.garage__img img', { yPercent: -8, scale: 1.08 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.garage__hero', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    g.from('.foot__word .split-char', { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.foot__word', start: 'top 95%' } });
  } else {
    onTab = () => ST.refresh();
  }

  /* шаги ремонта */
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
    trigger: '.repair', start: 'top top', end: 'bottom bottom',
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
    const cursor = $('.cursor');
    const label = $('.cursor__label');
    const cx = g.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const cy = g.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    addEventListener('pointermove', (e) => { cursor.classList.add('is-on'); cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    document.addEventListener('pointerover', (e) => {
      const lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, input, select');
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
