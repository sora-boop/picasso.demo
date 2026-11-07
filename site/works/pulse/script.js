/* =====================================================================
   PULSE ARENA. Концепт.
   Анимации: GSAP + ScrollTrigger, плавный скролл: Lenis, 3D: bell.js.
   Если библиотеки или WebGL недоступны, сайт остаётся рабочим.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. ДАННЫЕ
   --------------------------------------------------------------------- */
const SITE = { name: 'Pulse Arena', whatsapp: '77000000000', open: { from: 7, to: 22 } };

const ZONES = [
  { t: 'Разминка', bpm: '100–120 уд/мин', d: 'Суставы, лёгкое кардио и мобилизация. Десять минут, чтобы тело включилось и не травмировалось.' },
  { t: 'Сила', bpm: '120–140 уд/мин', d: 'Гири, штанга, турник. Работаем в технике, тренер страхует и считает подходы за вас.' },
  { t: 'Кардио', bpm: '150–170 уд/мин', d: 'Интервалы на сайкле, канаты и бёрпи. Тот самый пульс, на котором уходит лишнее.' },
  { t: 'Восстановление', bpm: '90–100 уд/мин', d: 'Растяжка и дыхание. Пульс возвращается, и вы уходите бодрым, а не разбитым.' },
];

const PROGRAMS = [
  { name: 'Тренажёрный зал', meta: 'без расписания', img: 'assets/gym.jpg', d: 'Свободные веса до 60 кг, силовые рамы и кардиозона. Дежурный тренер поможет с техникой.' },
  { name: 'Функциональный тренинг', meta: '60 мин', img: 'assets/func.jpg', d: 'Круговые тренировки с собственным весом, канатами и медболами. Подходит с нуля.' },
  { name: 'Гиревой тренинг', meta: '45 мин', img: 'assets/bells.jpg', d: 'Махи, рывки и турецкие подъёмы. Сила и выносливость в одной тренировке.' },
  { name: 'Бокс и тайский бокс', meta: '75 мин', img: 'assets/box.jpg', d: 'Техника, работа на лапах и спарринги по желанию. Перчатки и бинты дадим.' },
  { name: 'Растяжка и йога', meta: '60 мин', img: 'assets/stretch.jpg', d: 'Мобильность, растяжка и дыхание. Лучшее, что можно сделать на следующий день после силовой.' },
];

const COACHES = [
  { name: 'Арман Сеитов', role: 'Функциональный и гиревой тренинг, 9 лет', photo: 'assets/coach-1.jpg' },
  { name: 'Данияр Кенжебаев', role: 'Тренажёрный зал и персональные тренировки, 7 лет', photo: 'assets/coach-2.jpg' },
  { name: 'Мадина Ержанова', role: 'Бокс для женщин и растяжка, 6 лет', photo: 'assets/coach-3.jpg' },
];

// групповые тренировки по дням недели (0 — понедельник)
const CLASSES = [
  [['07:00', 1, 0, 'Зал 2', 'все уровни'], ['09:00', 4, 2, 'Зал 3', 'новичкам'], ['18:00', 3, 2, 'Ринг', 'все уровни'], ['19:00', 1, 0, 'Зал 2', 'средний'], ['20:00', 2, 0, 'Зал 2', 'средний']],
  [['07:00', 2, 0, 'Зал 2', 'все уровни'], ['10:00', 4, 2, 'Зал 3', 'все уровни'], ['18:00', 1, 0, 'Зал 2', 'новичкам'], ['19:00', 3, 2, 'Ринг', 'средний'], ['20:00', 4, 2, 'Зал 3', 'все уровни']],
  [['07:00', 1, 0, 'Зал 2', 'все уровни'], ['09:00', 4, 2, 'Зал 3', 'новичкам'], ['18:00', 3, 2, 'Ринг', 'все уровни'], ['19:00', 2, 0, 'Зал 2', 'средний'], ['20:00', 1, 0, 'Зал 2', 'продвинутым']],
  [['07:00', 2, 0, 'Зал 2', 'все уровни'], ['10:00', 4, 2, 'Зал 3', 'все уровни'], ['18:00', 1, 0, 'Зал 2', 'новичкам'], ['19:00', 3, 2, 'Ринг', 'средний'], ['20:00', 4, 2, 'Зал 3', 'все уровни']],
  [['07:00', 1, 0, 'Зал 2', 'все уровни'], ['18:00', 3, 2, 'Ринг', 'все уровни'], ['19:00', 2, 0, 'Зал 2', 'средний'], ['20:00', 4, 2, 'Зал 3', 'новичкам']],
  [['10:00', 1, 0, 'Зал 2', 'все уровни'], ['11:00', 3, 2, 'Ринг', 'все уровни'], ['12:00', 4, 2, 'Зал 3', 'новичкам']],
  [['11:00', 4, 2, 'Зал 3', 'все уровни'], ['12:00', 2, 0, 'Зал 2', 'все уровни']],
];

const PLANS = [
  { t: 'Пробная тренировка', cost: 'бесплатно', per: 'один раз', d: 'Любое направление и знакомство с тренером. Без обязательств.' },
  { t: 'Разовое посещение', cost: '3 000 ₸', per: 'одна тренировка', d: 'Зал или любая групповая тренировка из расписания.' },
  { t: 'Месяц', cost: '16 000 ₸', per: '530 ₸ в день', d: 'Безлимит: зал, все групповые, душ и сауна.' },
  { t: '3 месяца', cost: '42 000 ₸', per: '14 000 ₸ в месяц', d: 'Безлимит и заморозка 14 дней. Столько нужно, чтобы увидеть результат.', best: true },
  { t: 'Год', cost: '140 000 ₸', per: '11 700 ₸ в месяц', d: 'Безлимит, заморозка 30 дней и две персональные тренировки в подарок.' },
  { t: 'Персональная тренировка', cost: '7 000 ₸', per: '60 минут', d: 'Один на один с тренером: программа под вашу цель и контроль техники.' },
];

const FACTS = [
  { t: 'Ежедневно 6:00–23:00', d: 'Без выходных и праздников.' },
  { t: 'Душ, сауна, полотенца', d: 'Полотенце берём на себя, просто приходите.' },
  { t: 'Парковка на 40 мест', d: 'Бесплатно для гостей клуба.' },
  { t: 'Пульсометры бесплатно', d: 'Ваш пульс на экране в зале на каждой групповой.' },
];

/* ---------------------------------------------------------------------
   2. УТИЛИТЫ
   --------------------------------------------------------------------- */
const $  = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SHORT = /(^|[\s(])(в|во|на|с|со|к|ко|у|о|об|и|а|но|из|за|по|до|от|не|для|без|при|как|что)\s+/giu;
const nb = (s) => String(s).replace(SHORT, '$1$2 ').replace(SHORT, '$1$2 ').replace(/(\d)\s+(?=[^\s\d])/g, '$1 ');
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (t) => t * t * (3 - 2 * t);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMobile = () => innerWidth <= 760;
const ARROW = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

/* ---------------------------------------------------------------------
   3. РАЗМЕТКА ИЗ ДАННЫХ
   --------------------------------------------------------------------- */
$('[data-list="zones"]').innerHTML = ZONES.map((z, i) => `
  <li class="zstep">
    <span class="zstep__n" aria-hidden="true">0${i + 1}</span>
    <span class="zstep__bpm">${esc(z.bpm)}</span>
    <h3>${esc(z.t)}</h3>
    <p>${esc(nb(z.d))}</p>
  </li>`).join('');
$('[data-list="labels"]').innerHTML = ZONES.map((z, i) => `<span${i ? '' : ' class="is-on"'}>${esc(z.t)}</span>`).join('');

$('[data-list="program-photos"]').innerHTML = PROGRAMS.map((p, i) => `<img src="${esc(p.img)}" alt="${esc(p.name)}"${i ? '' : ' class="is-on"'} loading="lazy">`).join('');
$('[data-list="programs"]').innerHTML = PROGRAMS.map((p, i) => `
  <li class="prog${i ? '' : ' is-on'}" data-prog="${i}" tabindex="0">
    <span class="prog__n">0${i + 1}</span>
    <h3>${esc(nb(p.name))}</h3>
    <span class="prog__meta">${esc(p.meta)}</span>
    <p>${esc(nb(p.d))}</p>
  </li>`).join('');
const progPhotos = $$('.programs__photo img');
function showProgram(row) {
  if (!row) return;
  const i = Number(row.dataset.prog);
  $$('.prog').forEach((r) => r.classList.toggle('is-on', r === row));
  progPhotos.forEach((img, j) => img.classList.toggle('is-on', j === i));
}
$('.programs__list').addEventListener('pointerover', (e) => showProgram(e.target.closest('.prog')));
$('.programs__list').addEventListener('focusin', (e) => showProgram(e.target.closest('.prog')));

$('[data-list="prices"]').innerHTML = PLANS.map((p) => `
  <div class="plan${p.best ? ' plan--best' : ''}" data-fade>
    <h3>${esc(p.t)}${p.best ? '<span class="plan__tag">выгоднее</span>' : ''}</h3>
    <span class="plan__cost">${esc(p.cost)}</span>
    <p class="plan__note">${esc(nb(p.d))}</p>
    <span class="plan__per">${esc(nb(p.per))}</span>
  </div>`).join('');

$('[data-list="coaches"]').innerHTML = COACHES.map((c) => `
  <article class="coach">
    <div class="coach__img"><img src="${esc(c.photo)}" alt="${esc(c.name)}" loading="lazy"></div>
    <div class="coach__body"><h3>${esc(c.name)}</h3><span class="coach__role">${esc(nb(c.role))}</span></div>
  </article>`).join('');

$('[data-list="facts"]').innerHTML = FACTS.map((f, i) => `
  <li class="fact" data-fade>
    <span class="fact__n">0${i + 1}</span>
    <h3>${esc(nb(f.t))}</h3>
    <p>${esc(nb(f.d))}</p>
  </li>`).join('');

/* ---------------------------------------------------------------------
   4. РАСПИСАНИЕ И ЗАПИСЬ
   --------------------------------------------------------------------- */
const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const WD_FULL = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
const mondayIdx = (d) => (d.getDay() + 6) % 7;

// вкладки расписания начинаются с сегодняшнего дня
const tabsBox = $('[data-list="days"]');
tabsBox.innerHTML = days.map((d, i) => `<button class="tab" type="button" role="tab" aria-selected="${i === 0}" data-day="${i}">${i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : WD_FULL[mondayIdx(d)]}</button>`).join('');
const listBox = $('[data-list="classes"]');
let onDay = () => {};
function renderClasses(di) {
  const rows = CLASSES[mondayIdx(days[di])];
  listBox.innerHTML = rows.map(([time, p, c, room, lvl]) => `
    <div class="cls">
      <span class="cls__time">${time}</span>
      <span class="cls__name">${esc(nb(PROGRAMS[p].name))}<span class="cls__lvl">${esc(lvl)}</span></span>
      <span class="cls__coach">${esc(COACHES[c].name)}</span>
      <span class="cls__room">${esc(room)}</span>
      <button class="btn btn--line btn--sm" type="button" data-book="${p}|${di}|${time}" data-cursor="В заявку"><span class="btn__fill" aria-hidden="true"></span><span class="btn__label">Записаться</span></button>
    </div>`).join('');
  onDay();
}
tabsBox.addEventListener('click', (e) => {
  const t = e.target.closest('.tab'); if (!t) return;
  $$('.tab', tabsBox).forEach((x) => x.setAttribute('aria-selected', String(x === t)));
  renderClasses(Number(t.dataset.day));
});
renderClasses(0);

const form = $('#booking');
const state = { program: 0, day: 0, time: '' };
const chipsProg = $('[data-chips="program"]');
chipsProg.innerHTML = PROGRAMS.map((p, i) => `<button class="chip" type="button" data-v="${i}" aria-pressed="false">${esc(p.name)}</button>`).join('');
const dayTitle = (i) => (i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : `${WD[days[i].getDay()]}, ${days[i].getDate()}`);
const dayLong = (i) => `${i === 0 ? 'сегодня, ' : i === 1 ? 'завтра, ' : ''}${days[i].getDate()} ${MON[days[i].getMonth()]}`;
const chipsDay = $('[data-chips="day"]');
chipsDay.innerHTML = days.map((d, i) =>
  `<button class="chip" type="button" data-v="${i}" aria-pressed="false">${dayTitle(i)}<small>${d.getDate()} ${MON[d.getMonth()].slice(0, 3)}</small></button>`).join('');
const chipsTime = $('[data-chips="time"]');
const toHM = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
function renderTimes() {
  const now = new Date();
  const nowMin = state.day === 0 ? now.getHours() * 60 + now.getMinutes() + 30 : -1;
  const slots = [];
  for (let t = SITE.open.from * 60; t <= SITE.open.to * 60 - 60; t += 60) slots.push(t);
  if (state.day === 0 && !slots.some((t) => t >= nowMin)) { pick('day', 1); return; }
  chipsTime.innerHTML = slots.map((t) =>
    `<button class="chip" type="button" data-v="${toHM(t)}" aria-pressed="${toHM(t) === state.time}"${t < nowMin ? ' disabled' : ''}>${toHM(t)}</button>`).join('');
  const picked = $(`[data-v="${state.time}"]`, chipsTime);
  if (!picked || picked.disabled) state.time = '';
}
const press = (box, v) => $$('.chip', box).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.v === String(v))));
function pick(key, v) {
  state[key] = key === 'time' ? v : Number(v);
  if (key === 'program') press(chipsProg, v);
  if (key === 'day') { press(chipsDay, v); renderTimes(); }
  if (key === 'time') press(chipsTime, v);
  renderSummary();
}
chipsProg.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) pick('program', c.dataset.v); });
chipsDay.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) pick('day', c.dataset.v); });
chipsTime.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c && !c.disabled) pick('time', c.dataset.v); });
function renderSummary() {
  $('.summary__text').textContent = nb([
    `Пробная: ${PROGRAMS[state.program].name.toLowerCase()}`,
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
  if (miss.length) { err.hidden = false; err.textContent = nb(`Осталось указать: ${miss.join(', ')}`); return; }
  err.hidden = true;
  const text = [
    `Здравствуйте! Хочу на пробную тренировку в ${SITE.name}.`,
    `Направление: ${PROGRAMS[state.program].name}`,
    `Когда: ${dayLong(state.day)}, ${state.time}`,
    `Имя: ${f.name.value.trim()}`,
    `Телефон: ${f.phone.value}`,
  ].join('\n');
  window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});
pick('program', 0);
pick('day', 0);

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
   6. 3D-СЦЕНА И ПУЛЬСОМЕТР
   --------------------------------------------------------------------- */
let bell = null;
const stage = $('.stage');
async function initBell() {
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('no webgl');
    const mod = await import('./bell.js');
    await document.fonts.load('500 40px "Wix Madefor Display"');
    bell = mod.createBell(stage, { mobile: isMobile() });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
  }
}

const BASE = { x: 0, y: 0, z: 0, rx: 0.12, rz: 0, scale: 1, bpm: 72, energy: 0.4, swing: 0, cloud: 1, idle: 1, shadow: 1, alpha: 1 };
const S = (o) => ({ ...BASE, ...o });
function keyStates() {
  const m = isMobile();
  const pos = m ? { x: 0, y: -0.08, scale: 0.42 } : { x: 1.7, y: -0.1, scale: 0.92 };
  return {
    intro: S(m ? { y: -3.4, scale: 0.5, cloud: 0 } : { x: 0.3, y: -4, scale: 1, cloud: 0 }),
    hero: S(m ? { x: 0, y: 0.4, scale: 0.45 } : { x: 0.3, y: -0.12, scale: 1.0 }),
    warm: S({ ...pos, bpm: 112, energy: 0.35 }),
    strength: S({ ...pos, bpm: 132, energy: 0.6, swing: 1, idle: 0.3 }),
    cardio: S({ ...pos, bpm: 164, energy: 1, swing: 0.55, rx: 0.3, idle: 1.6 }),
    recovery: S({ ...pos, bpm: 92, energy: 0.15, swing: 0, cloud: 0.75, idle: 0.4 }),
    gone: S({ x: 1.5, y: 4.2, scale: 0.6, alpha: 0, bpm: 80 }),
    prices: m ? S({ y: 3.4, scale: 0.4, alpha: 0, bpm: 80 }) : S({ x: -2.6, y: -0.7, scale: 0.55, bpm: 80, cloud: 0.45, energy: 0.2 }),
    book: m ? S({ y: 3.4, scale: 0.4, alpha: 0, bpm: 76 }) : S({ x: -2.6, y: -1.1, scale: 0.52, bpm: 76, cloud: 0.5, energy: 0.2 }),
    foot: S({ x: 0, y: 3.6, scale: 0.5, alpha: 0, bpm: 70 }),
  };
}
const mixState = (a, b, t) => Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] - a[k]) * t]));
const pageY = (el) => el.getBoundingClientRect().top + scrollY;

let keys = [];
let zonesEnd = 0, zonesStart = 0;
function buildKeys() {
  const K = keyStates();
  const vh = innerHeight;
  const zn = $('.zones'), progs = $('.programs'), pr = $('.prices'), coaches = $('.coaches'), book = $('.book'), foot = $('.foot');
  const top = pageY(zn), len = Math.max(1, zn.offsetHeight - vh);
  const at = (p) => top + len * p;
  zonesEnd = top + zn.offsetHeight - vh * 0.4;
  zonesStart = top - vh * 0.2;
  const maxY = document.documentElement.scrollHeight - vh;
  keys = [
    [0, K.hero],
    [vh * 0.15, K.hero],
    [at(0.04), K.warm],
    [at(0.2), K.warm],
    [at(0.3), K.strength],
    [at(0.45), K.strength],
    [at(0.55), K.cardio],
    [at(0.7), K.cardio],
    [at(0.82), K.recovery],
    [top + zn.offsetHeight - vh * 0.1, K.recovery],
    [pageY(progs) + vh * 0.2, K.gone],
    [pageY(pr) - vh * 0.5, K.gone],
    [pageY(pr) + vh * 0.05, K.prices],
    [Math.max(pageY(pr) + vh * 0.1, pageY(pr) + pr.offsetHeight - vh * 1.1), K.prices],
    [pageY(coaches) + vh * 0.1, K.gone],
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

/* ЭКГ: комплекс PQRST, пик R совпадает с ударом в 3D */
const meter = $('.meter');
const ecgCanvas = $('.meter__ecg');
const ecgCtx = ecgCanvas.getContext('2d');
const bpmEl = $('.meter__bpm');
const g1 = (f, c, w) => { let d = Math.abs(f - c); d = Math.min(d, 1 - d); return Math.exp(-(d * d) / (w * w)); };
const ecg = (f) => 0.12 * g1(f, 0.88, 0.03) - 0.14 * g1(f, 0.975, 0.008) + 1.0 * g1(f, 0.0, 0.011) - 0.28 * g1(f, 0.025, 0.01) + 0.26 * g1(f, 0.24, 0.05);
const samples = [];
let ownPhase = 0, ownBpm = 72, lastShown = 0;
function drawEcg(now, dt) {
  const dprE = Math.min(2, window.devicePixelRatio || 1);
  const W = ecgCanvas.clientWidth, H = ecgCanvas.clientHeight;
  if (ecgCanvas.width !== Math.round(W * dprE)) { ecgCanvas.width = Math.round(W * dprE); ecgCanvas.height = Math.round(H * dprE); }
  const b = bell ? bell.getBeat() : null;
  if (!b) ownPhase = (ownPhase + dt * ownBpm / 60) % 1;
  const phase = b ? b.phase : ownPhase, bpm = b ? b.bpm : ownBpm;
  samples.push([now, ecg(phase)]);
  const span = 2600;
  while (samples.length && now - samples[0][0] > span) samples.shift();
  const c = ecgCtx;
  c.setTransform(dprE, 0, 0, dprE, 0, 0);
  c.clearRect(0, 0, W, H);
  c.lineWidth = 1.6; c.lineJoin = 'round'; c.strokeStyle = '#d4ff3a';
  c.beginPath();
  samples.forEach(([t, v], i) => { const x = W - ((now - t) / span) * W, y = H * 0.62 - v * H * 0.5; i ? c.lineTo(x, y) : c.moveTo(x, y); });
  c.stroke();
  const last = samples[samples.length - 1];
  if (last) { c.fillStyle = '#d4ff3a'; c.beginPath(); c.arc(W - 2, H * 0.62 - last[1] * H * 0.5, 2.6, 0, Math.PI * 2); c.fill(); }
  if (now - lastShown > 350) { bpmEl.textContent = Math.round(bpm); lastShown = now; }
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
  await initBell(); target = 0.85;
  await new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
  target = 1;
  await new Promise((r) => setTimeout(r, Math.max(0, (reduce ? 0 : 1300) - (performance.now() - t0))));
  await new Promise((r) => { const w = () => (shown.p >= 1 || reduce ? r() : requestAnimationFrame(w)); w(); });

  const steps = $$('.zstep');
  const labels = $$('.rail__labels span');

  if (!hasAnim) {
    loader.remove();
    document.body.classList.remove('is-loading');
    steps.forEach((s, i) => { s.style.opacity = i === 3 ? 1 : 0; });
    meter.classList.add('is-off');
    if (bell) { buildKeys(); bell.jump(keyStates().hero); }
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
    const bk = e.target.closest('[data-book]');
    if (bk) {
      const [p, d, time] = bk.dataset.book.split('|');
      pick('program', p); pick('day', d); pick('time', time);
      scrollToEl($('#book'));
    }
  });

  const heroChars = $$('.hero__word .split-char');
  if (!reduce) {
    g.set(heroChars, { yPercent: 118 });
    g.set('.hero [data-fade], .nav, .meter', { autoAlpha: 0, y: 24, filter: 'blur(14px)' });
  }

  const intro = { k: reduce ? 1 : 0 };
  const K0 = keyStates();
  const update = () => {
    const s = mixState(K0.intro, scrollState(scrollY), smooth(intro.k));
    ownBpm = s.bpm;
    // на телефоне пульсометр только в зонах, чтобы не спорить с первым экраном
    meter.classList.toggle('is-off', scrollY > zonesEnd || (isMobile() && scrollY < zonesStart));
    if (!bell) return;
    s.ry = (scrollY / innerHeight) * 0.6;
    bell.setState(s);
    bell.setVisible(s.alpha > 0.002);
  };
  buildKeys();
  if (bell) { bell.jump({ ...K0.intro, ry: 0 }); }
  update();
  let lastT = performance.now();
  g.ticker.add(() => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    if (!meter.classList.contains('is-off')) drawEcg(now, dt);
  });

  const tl = g.timeline({ defaults: { ease: 'expo.out' } });
  tl.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: reduce ? 0 : 1.1, ease: 'expo.inOut' })
    .add(() => { loader.remove(); document.body.classList.remove('is-loading'); });
  if (!reduce) {
    tl.to(heroChars, { yPercent: 0, duration: 1.3, stagger: 0.06 }, '-=0.45')
      .to(intro, { k: 1, duration: 2.2, ease: 'power3.inOut', onUpdate: update }, '<0.1')
      .to('.nav', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, '<0.3')
      .to('.hero [data-fade], .meter', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.1 }, '<0.3');
  }
  // после входа снимаем инлайн-прозрачность, чтобы класс is-off снова работал
  tl.add(() => { lenis && lenis.start(); g.set('.meter', { clearProps: 'opacity,visibility,transform,filter' }); });

  ST.create({ start: 0, end: 'max', onUpdate: update });
  ST.addEventListener('refresh', () => { buildKeys(); update(); });
  if (bell) addEventListener('pointermove', (e) => bell.setMouse((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)), { passive: true });

  if (!reduce) {
    $$('[data-reveal]').forEach((el) => {
      g.from($$('.split-char', el), { yPercent: 118, duration: 1.1, ease: 'expo.out', stagger: 0.025, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('[data-fade]').forEach((el) => {
      if (el.closest('.hero')) return;
      g.from(el, { autoAlpha: 0, y: 28, filter: 'blur(14px)', duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    g.from('.prog', { y: 30, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.programs__list', start: 'top 82%' } });
    g.from('.programs__photo', { clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.programs', start: 'top 70%' } });
    const clsIn = () => g.fromTo('.cls', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.05, overwrite: true });
    g.from('.schedule .tab', { y: 20, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.04, scrollTrigger: { trigger: '.schedule .tabs', start: 'top 90%', onEnter: clsIn } });
    onDay = () => { clsIn(); ST.refresh(); };
    $$('.coach__img').forEach((el) => g.from(el, { clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
    g.fromTo('.hall__img img', { yPercent: -8, scale: 1.08 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.hall__hero', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    g.from('.foot__word .split-char', { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.04, scrollTrigger: { trigger: '.foot__word', start: 'top 95%' } });
  } else {
    onDay = () => ST.refresh();
  }

  /* зоны пульса */
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
    trigger: '.zones', start: 'top top', end: 'bottom bottom',
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
