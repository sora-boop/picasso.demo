/* =====================================================================
   ҚАЙРАҚ, барбершоп. Концепт.
   Анимации: GSAP + ScrollTrigger, плавный скролл: Lenis, 3D: razor.js.
   Если библиотеки или WebGL недоступны, сайт остаётся рабочим.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. ДАННЫЕ
   --------------------------------------------------------------------- */
const SITE = {
  name: 'ҚАЙРАҚ',
  whatsapp: '77000000000',
  open: { from: 10, to: 21, step: 30 },
};

const SERVICES = [
  { cat: 'Стрижки', items: [
    { name: 'Мужская стрижка', time: 60, price: 6000 },
    { name: 'Фейд', note: 'плавный переход от нуля', time: 60, price: 6500 },
    { name: 'Стрижка ножницами', note: 'длинные волосы', time: 75, price: 7000 },
    { name: 'Детская стрижка', note: 'до 12 лет', time: 45, price: 4000 },
    { name: 'Отец и сын', time: 100, price: 9500 },
  ]},
  { cat: 'Борода и бритьё', items: [
    { name: 'Оформление бороды', time: 40, price: 4500 },
    { name: 'Королевское бритьё', note: 'горячее полотенце, опасная бритва', time: 45, price: 6000 },
    { name: 'Стрижка и борода', time: 100, price: 9500 },
    { name: 'Бритьё головы', time: 40, price: 5000 },
  ]},
  { cat: 'Уход', items: [
    { name: 'Камуфляж седины', time: 30, price: 4500 },
    { name: 'Горячее полотенце и маска', time: 20, price: 2500 },
    { name: 'Удаление волос воском', note: 'нос или уши', time: 10, price: 1500 },
  ]},
];

const RITUAL = [
  { t: 'Разговор', d: 'Смотрим, как растут волосы, и спрашиваем, как вы укладываетесь утром и сколько у вас на это минут.' },
  { t: 'Мытьё', d: 'Шампунь под тип кожи головы и массаж. По мокрым волосам форма видна честнее.' },
  { t: 'Стрижка', d: 'Машинка, ножницы и финальный контур опасной бритвой. Без спешки, даже если следующий уже ждёт.' },
  { t: 'Полотенце', d: 'Горячее полотенце, бальзам и укладка, которую вы повторите дома за пять минут.' },
];

const MASTERS = [
  { name: 'Ерлан', role: 'Основатель, 11 лет за креслом', photo: 'assets/master-1.jpg' },
  { name: 'Тимур', role: 'Фейды и текстурные стрижки', photo: 'assets/master-2.jpg' },
  { name: 'Арман', role: 'Бороды и бритьё опасной бритвой', photo: 'assets/master-3.jpg' },
];

/* ---------------------------------------------------------------------
   2. УТИЛИТЫ
   --------------------------------------------------------------------- */
const $  = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SHORT = /(^|[\s(])(в|во|на|с|со|к|ко|у|о|об|и|а|но|из|за|по|до|от|не|для|без|при)\s+/giu;
const nb = (s) => String(s).replace(SHORT, '$1$2 ').replace(SHORT, '$1$2 ').replace(/(\d)\s+(?=[^\s\d])/g, '$1 ');
const money = (n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₸';
const dur = (m) => { const h = Math.floor(m / 60), r = m % 60; return h ? `${h} ч${r ? ' ' + r + ' мин' : ''}` : `${r} мин`; };
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

$('[data-list="services"]').innerHTML = SERVICES.map((g) => `
  <div class="price-cat">
    <h3 data-fade>${esc(g.cat)}<small>${g.items.length} ${g.items.length < 5 ? 'услуги' : 'услуг'}</small></h3>
    ${g.items.map((it) => `
      <button class="row" type="button" data-service="${it.id}" data-cursor="В запись">
        <span class="row__name">${esc(nb(it.name))}${it.note ? `<span class="row__note">${esc(nb(it.note))}</span>` : ''}</span>
        <span class="row__time">${dur(it.time)}</span>
        <span class="row__price">${money(it.price)}</span>
      </button>`).join('')}
  </div>`).join('');

$('[data-list="ritual"]').innerHTML = RITUAL.map((s, i) => `
  <li class="ritual-step" data-step="${i}">
    <h3>${esc(s.t)}</h3>
    <p>${esc(nb(s.d))}</p>
  </li>`).join('');

$('[data-list="masters"]').innerHTML = MASTERS.map((m) => `
  <article class="master">
    <div class="master__img"><img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy"></div>
    <div class="master__body">
      <div><h3>${esc(m.name)}</h3><p class="master__role">${esc(nb(m.role))}</p></div>
      <button class="master__go magnetic" type="button" data-master="${esc(m.name)}" aria-label="Записаться к мастеру ${esc(m.name)}" data-cursor="К ${esc(m.name)}у">${ARROW}</button>
    </div>
  </article>`).join('');

/* ---------------------------------------------------------------------
   4. ОНЛАЙН-ЗАПИСЬ
   --------------------------------------------------------------------- */
const form = $('#booking');
const state = { service: 0, master: 'Любой мастер', day: 0, time: '' };
const sel = form.elements.service;
sel.innerHTML = SERVICES.map((g) => `<optgroup label="${esc(g.cat)}">${
  g.items.map((it) => `<option value="${it.id}">${esc(it.name)}, ${money(it.price).replace(/ /g, ' ')}</option>`).join('')}</optgroup>`).join('');

const chipsMaster = $('[data-chips="master"]');
chipsMaster.innerHTML = ['Любой мастер', ...MASTERS.map((m) => m.name)]
  .map((n) => `<button class="chip" type="button" data-v="${esc(n)}" aria-pressed="false">${esc(n)}</button>`).join('');

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
  const svc = flat[state.service];
  const now = new Date();
  const nowMin = state.day === 0 ? now.getHours() * 60 + now.getMinutes() + 30 : -1;
  const slots = [];
  for (let t = SITE.open.from * 60; t + Math.min(svc.time, 60) <= SITE.open.to * 60; t += SITE.open.step) slots.push(t);
  if (state.day === 0 && !slots.some((t) => t >= nowMin)) { pick('day', 1); return; }
  chipsTime.innerHTML = slots.map((t) =>
    `<button class="chip" type="button" data-v="${toHM(t)}" aria-pressed="${toHM(t) === state.time}"${t < nowMin ? ' disabled' : ''}>${toHM(t)}</button>`).join('');
  const picked = $(`[data-v="${state.time}"]`, chipsTime);
  if (!picked || picked.disabled) state.time = '';
}
const press = (box, v) => $$('.chip', box).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.v === String(v))));
function pick(key, v) {
  state[key] = key === 'day' || key === 'service' ? Number(v) : v;
  if (key === 'service') { sel.value = String(v); renderTimes(); }
  if (key === 'master') press(chipsMaster, v);
  if (key === 'day') { press(chipsDay, v); renderTimes(); }
  if (key === 'time') press(chipsTime, v);
  renderSummary();
}
chipsMaster.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) pick('master', c.dataset.v); });
chipsDay.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) pick('day', c.dataset.v); });
chipsTime.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c && !c.disabled) pick('time', c.dataset.v); });
sel.addEventListener('change', () => pick('service', sel.value));

function renderSummary() {
  const svc = flat[state.service];
  $('.summary__text').textContent = nb([
    svc.name,
    state.master === 'Любой мастер' ? 'любой свободный мастер' : `мастер ${state.master}`,
    state.time ? `${dayLong(state.day)} в ${state.time}` : `${dayLong(state.day)}, время не выбрано`,
  ].join(', '));
  $('.summary__price').textContent = money(svc.price);
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
  const svc = flat[state.service];
  const text = [
    `Здравствуйте! Хочу записаться в ${SITE.name}.`,
    `Услуга: ${svc.name} (${money(svc.price).replace(/ /g, ' ')})`,
    `Мастер: ${state.master}`,
    `Когда: ${dayLong(state.day)}, ${state.time}`,
    `Имя: ${f.name.value.trim()}`,
    `Телефон: ${f.phone.value}`,
  ].join('\n');
  window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

pick('master', 'Любой мастер');
pick('day', 0);
pick('service', 0);

/* ---------------------------------------------------------------------
   5. РАЗБИВКА ТЕКСТА ДЛЯ АНИМАЦИЙ
   --------------------------------------------------------------------- */
function splitChars(el) {
  const lines = el.innerHTML.split(/<br\s*\/?>/i).map((h) => { const t = document.createElement('span'); t.innerHTML = h; return t.textContent; });
  el.setAttribute('aria-label', lines.join(' '));
  el.innerHTML = lines.map((line) => `<span class="split-line" aria-hidden="true">${
    [...line].map((ch) => `<span class="split-char">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('')}</span>`).join('<br>');
  return $$('.split-char', el);
}
function splitWords(el) {
  const words = el.textContent.split(/ +/);
  el.innerHTML = words.map((w) => `<span class="word">${esc(w)}</span>`).join(' ');
  return $$('.word', el);
}
$$('[data-split], [data-reveal]').forEach(splitChars);
const manifestWords = splitWords($('[data-words]'));

/* ---------------------------------------------------------------------
   6. 3D-СЦЕНА
   --------------------------------------------------------------------- */
let razor = null;
let OPEN = 0.12, CLOSED = Math.PI - 0.02;
const stage = $('.stage');
async function initRazor() {
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('no webgl');
    const mod = await import('./razor.js');
    OPEN = mod.OPEN; CLOSED = mod.CLOSED;
    await document.fonts.load('400 40px Oswald');
    razor = mod.createRazor(stage, { mobile: isMobile(), engraving: 'ҚАЙРАҚ' });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
  }
}

/* ключевые положения бритвы. x, y в мировых единицах, alpha — прозрачность сцены */
function keyStates() {
  const m = isMobile();
  return {
    intro:    { x: 0, y: m ? -0.2 : -0.5, z: -2, rx: 0.6, ry: 1.4, rz: 0.4, open: CLOSED, scale: m ? 0.2 : 0.45, shadow: 0, alpha: 1 },
    hero:     m ? { x: 0.05, y: -0.05, z: 0, rx: 0.15, ry: -0.2, rz: -0.62, open: OPEN, scale: 0.36, shadow: 1, alpha: 1 }
              : { x: 0.3, y: -0.12, z: 0, rx: 0.12, ry: -0.18, rz: -0.24, open: OPEN, scale: 0.84, shadow: 1, alpha: 1 },
    manifest: m ? { x: 0.55, y: 1.55, z: 0, rx: 0.3, ry: 0.9, rz: 1.1, open: 0.6, scale: 0.26, shadow: 0, alpha: 0.35 }
              : { x: 2.45, y: 0.15, z: 0, rx: 0.3, ry: 0.9, rz: 1.15, open: 0.55, scale: 0.68, shadow: 0.6, alpha: 1 },
    price:    m ? { x: -0.4, y: 1.7, z: 0, rx: 0.2, ry: -0.5, rz: -0.9, open: 0.2, scale: 0.24, shadow: 0, alpha: 0.3 }
              : { x: -2.75, y: -0.75, z: 0, rx: 0.25, ry: -0.55, rz: -1.2, open: 0.18, scale: 0.5, shadow: 0.7, alpha: 1 },
    ritualA:  m ? { x: 0.5, y: -1.4, z: 0, rx: 0, ry: 0.4, rz: 0.4, open: OPEN, scale: 0.26, shadow: 0, alpha: 0.35 }
              : { x: 2.75, y: 0.1, z: 0, rx: 0.05, ry: 0.45, rz: 0.45, open: OPEN, scale: 0.6, shadow: 0.6, alpha: 1 },
    ritualB:  m ? { x: 0.5, y: -1.4, z: 0, rx: 0.1, ry: -0.3, rz: 0.1, open: CLOSED, scale: 0.3, shadow: 0, alpha: 0.35 }
              : { x: 2.75, y: 0.1, z: 0, rx: 0.15, ry: -0.35, rz: 0.1, open: CLOSED, scale: 0.66, shadow: 0.6, alpha: 1 },
    gone:     { x: 0, y: 4.2, z: -1, rx: 0.4, ry: 1.2, rz: 0.6, open: CLOSED, scale: 0.4, shadow: 0, alpha: 0 },
    foot:     m ? { x: 0, y: 3.2, z: -1, rx: 0.1, ry: 0, rz: 0.04, open: CLOSED, scale: 0.3, shadow: 0, alpha: 0 }
              : { x: 1.7, y: 1.3, z: 0, rx: 0.12, ry: -0.05, rz: 0.04, open: CLOSED, scale: 0.5, shadow: 0, alpha: 1 },
  };
}
const mixState = (a, b, t) => Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] - a[k]) * t]));
const pageY = (el) => el.getBoundingClientRect().top + scrollY;

/* опорные точки скролла: пересчитываются после любого refresh */
let keys = [];
function buildKeys() {
  const K = keyStates();
  const vh = innerHeight;
  const man = $('.manifest'), pr = $('.price'), rit = $('.ritual'), mas = $('.masters'), ft = $('.foot');
  const ritTop = pageY(rit), ritEnd = ritTop + rit.offsetHeight - vh;
  const maxY = document.documentElement.scrollHeight - vh;
  keys = [
    [0, K.hero],
    [pageY(man) - vh * 0.15, K.manifest],
    [pageY(man) + man.offsetHeight * 0.45, K.manifest],
    [pageY(pr) + vh * 0.05, K.price],
    [pageY(pr) + pr.offsetHeight - vh * 1.05, K.price],
    [ritTop, K.ritualA],
    [ritEnd, K.ritualB],
    [pageY(mas) + vh * 0.2, K.gone],
    [Math.max(pageY(mas) + vh * 0.3, pageY(ft) - vh * 0.6), K.gone],
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
  let progress = 0;
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
  let target = 0.15;
  if (!reduce) requestAnimationFrame(tick);
  await document.fonts.ready; target = 0.45;
  await initRazor(); target = 0.85;
  await new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
  target = 1;
  const minTime = reduce ? 0 : 1300;
  await new Promise((r) => setTimeout(r, Math.max(0, minTime - (performance.now() - t0))));
  await new Promise((r) => { const w = () => (shown.p >= 1 || reduce ? r() : requestAnimationFrame(w)); w(); });

  if (!hasAnim) {
    loader.remove();
    document.body.classList.remove('is-loading');
    manifestWords.forEach((w) => { w.style.opacity = 1; });
    if (razor) { buildKeys(); razor.setState(keyStates().hero); }
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
    const row = e.target.closest('[data-service]');
    if (row) { pick('service', row.dataset.service); scrollToEl($('#book')); }
    const m = e.target.closest('[data-master]');
    if (m) { pick('master', m.dataset.master); scrollToEl($('#book')); }
  });

  /* начальные состояния */
  const heroChars = $$('.hero__word .split-char');
  g.set(heroChars, { yPercent: 115 });
  g.set('.hero [data-fade], .nav', { autoAlpha: 0, y: 24, filter: 'blur(14px)' });

  /* бритва: вступление смешивается со скроллом */
  const intro = { k: reduce ? 1 : 0 };
  const K0 = keyStates();
  const updateRazor = () => {
    if (!razor) return;
    const s = mixState(K0.intro, scrollState(scrollY), smooth(intro.k));
    razor.setState(s);
    stage.style.opacity = s.alpha.toFixed(3);
    razor.setVisible(s.alpha > 0.01);
  };
  if (razor) { buildKeys(); updateRazor(); razor.setState(K0.intro); }

  /* уход прелоадера и вход первого экрана */
  const tl = g.timeline({ defaults: { ease: 'expo.out' } });
  tl.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: reduce ? 0 : 1.1, ease: 'expo.inOut' })
    .add(() => { loader.remove(); document.body.classList.remove('is-loading'); })
    .to(heroChars, { yPercent: 0, duration: 1.3, stagger: 0.06 }, '-=0.45')
    .to(intro, { k: 1, duration: 2.2, ease: 'power3.inOut', onUpdate: updateRazor }, '<0.1')
    .to('.nav', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, '<0.3')
    .to('.hero [data-fade]', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.1 }, '<0.3')
    .add(() => { lenis && lenis.start(); });

  /* бритва следует за скроллом */
  ST.create({ start: 0, end: 'max', onUpdate: updateRazor });
  ST.addEventListener('refresh', () => { buildKeys(); updateRazor(); });

  /* курсор управляет наклоном и бликом */
  if (razor) {
    addEventListener('pointermove', (e) => razor.setMouse((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)), { passive: true });
  }

  if (!reduce) {
    /* заголовки: буквы выезжают из-под маски */
    $$('[data-reveal]').forEach((el) => {
      const chars = $$('.split-char', el);
      g.from(chars, {
        yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: 0.035,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    /* мягкое появление с размытием */
    $$('[data-fade]').forEach((el) => {
      if (el.closest('.hero')) return;
      g.from(el, { autoAlpha: 0, y: 28, filter: 'blur(14px)', duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    /* манифест: слова проявляются по мере чтения */
    if (!reduce) {
      g.to(manifestWords, {
        opacity: 1, stagger: 0.12, ease: 'none',
        scrollTrigger: { trigger: '.manifest__text', start: 'top 78%', end: 'bottom 42%', scrub: true },
      });
    }

    /* счётчики */
    $$('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count);
      const o = { v: end > 1000 ? end - 30 : 0 };
      g.to(o, {
        v: end, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); },
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    });
    g.from('.stat', { y: 40, autoAlpha: 0, filter: 'blur(12px)', stagger: 0.1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 88%' } });

    /* прайс: строки по очереди */
    $$('.price-cat').forEach((cat) => {
      g.from($$('.row', cat), { y: 30, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: cat, start: 'top 82%' } });
    });
  }

  /* ритуал: шаги сменяются по скроллу, цифра прокручивается */
  const steps = $$('.ritual-step');
  const digits = $('.ritual__digits');
  g.set(steps, { autoAlpha: 0, y: 40 });
  g.set(steps[0], { autoAlpha: 1, y: 0 });
  let current = 0;
  const showStep = (i) => {
    if (i === current) return;
    const dir = i > current ? 1 : -1;
    g.to(steps[current], { autoAlpha: 0, y: -40 * dir, filter: 'blur(10px)', duration: 0.6, ease: 'expo.out', overwrite: true });
    g.fromTo(steps[i], { autoAlpha: 0, y: 40 * dir, filter: 'blur(10px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out', overwrite: true });
    g.timeline()
      .to(digits, { yPercent: -100 * dir, autoAlpha: 0, duration: 0.35, ease: 'power3.in' })
      .add(() => { digits.textContent = String(i + 1).padStart(2, '0'); })
      .fromTo(digits, { yPercent: 100 * dir, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out' });
    current = i;
  };
  ST.create({
    trigger: '.ritual', start: 'top top', end: 'bottom bottom',
    onUpdate: (self) => {
      g.set('.ritual__progress i', { scaleX: self.progress });
      showStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999)));
    },
  });

  /* мастера: горизонтальная лента на компьютере */
  const mm = g.matchMedia();
  mm.add('(min-width: 761px)', () => {
    const track = $('.masters__track');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const move = g.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.masters', pin: '.masters__pin', start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true },
    });
    $$('.master__img img, .shot__img img').forEach((img) => {
      g.fromTo(img, { xPercent: -5 }, { xPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } });
    });
    if (!reduce) $$('.master, .shot').forEach((card, i) => {
      // карточки, которые видны до начала горизонтальной прокрутки, проявляются по вертикальному скроллу
      const inView = card.getBoundingClientRect().left < innerWidth * 0.95;
      g.from(card.querySelector('.master__img, .shot__img'), {
        clipPath: 'inset(100% 0 0 0)', duration: 1.2, ease: 'expo.out', delay: inView ? i * 0.12 : 0,
        scrollTrigger: inView
          ? { trigger: '.masters', start: 'top 70%' }
          : { trigger: card, containerAnimation: move, start: 'left 92%' },
      });
    });
  });
  mm.add('(max-width: 760px)', () => {
    if (!reduce) $$('.master__img, .shot__img').forEach((el) => {
      g.from(el, { clipPath: 'inset(100% 0 0 0)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
  });

  /* подвал: большое слово собирается из букв */
  if (!reduce) g.from($$('.foot__word .split-char'), {
    yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.05,
    scrollTrigger: { trigger: '.foot__word', start: 'top 95%' },
  });

  /* навигация: прячется при скролле вниз, появляется при скролле вверх */
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
      const link = e.target.closest('a, button, select, input');
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
