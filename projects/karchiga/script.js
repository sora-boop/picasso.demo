/* =====================================================================
   KARCHIGA LASH, Костанай. Демо-версия сайта.
   3D: lash.js, анимации: GSAP + ScrollTrigger, плавный скролл: Lenis.
   Если библиотеки или WebGL недоступны, сайт остаётся рабочим.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. ДАННЫЕ (всё, что меняется под студию, лежит здесь)
   --------------------------------------------------------------------- */
// demo: true — заявка не отправляется, показываем её текст. Перед запуском поставить false
// (или заменить кнопку на ссылку в онлайн-запись студии).
const SITE = {
  name: 'Karchiga Lash',
  whatsapp: '77076641394',
  demo: true,
  open: { from: 10, to: 20, step: 30 },
  tz: 5,                       // Костанай, UTC+5
};

const VISIT = [
  { t: 'Консультация', d: 'Мастер смотрит форму глаз и подбирает изгиб, длину и объём. Покажет, как это будет выглядеть.' },
  { t: 'Подготовка', d: 'Снимаем макияж, обезжириваем ресницы и закрываем нижние патчами.' },
  { t: 'Наращивание', d: 'От полутора до двух с половиной часов, в зависимости от объёма. Можно спокойно подремать.' },
  { t: 'Уход и коррекция', d: 'Расскажем, как ухаживать за ресницами. Коррекция обычно через 2–3 недели.' },
];

const GUARDS = [
  { num: '1:1', mm: '1 ресница в пучке', name: 'Классика', d: 'Одна искусственная ресница на одну свою. Самый естественный эффект, как будто просто накрасились.' },
  { num: '2D', mm: '2 ресницы в пучке', name: 'Лёгкий объём', d: 'Взгляд выразительнее, но всё ещё натурально. Хорошо на редкие свои ресницы.' },
  { num: '3D', mm: '3 ресницы в пучке', name: 'Объём на каждый день', d: 'Заметный, но аккуратный объём. Самый частый выбор.' },
  { num: '5D', mm: '5 ресниц в пучке', name: 'Густой взгляд', d: 'Яркие, густые ресницы для тех, кто любит выразительный взгляд.' },
  { num: 'Мега', mm: '6–9 ресниц в пучке', name: 'Мега-объём', d: 'Максимальная густота. Эффектно для праздников, фотосессий и свадьбы.' },
];

// цены подставим из прайса студии
const SERVICES = [
  { name: 'Наращивание ресниц', note: 'Классика, 2D–5D и мега-объём', price: 'По прайсу', cta: 'Записаться на ресницы' },
  { name: 'Брови', note: 'Архитектура, коррекция, окрашивание и наращивание', price: 'По прайсу', cta: 'Записаться на брови' },
  { name: 'Маникюр', note: 'Европейский, шеллак, наращивание акрилом', price: 'По прайсу', cta: 'Записаться на маникюр' },
  { name: 'Эпиляция', note: 'Лазерная, шугаринг и ваксинг', price: 'По прайсу', cta: 'Записаться на эпиляцию' },
  { name: 'Завивка и окрашивание ресниц', note: 'Без наращивания', price: 'По прайсу', small: true },
];

// имена и фото мастеров подставим, когда студия пришлёт
const MASTERS = [
  { name: 'Лэшмейкер', to: 'лэшмейкеру', quote: 'Имя и фото мастера подставим', photo: 'assets/master-1.jpg' },
  { name: 'Бровист', to: 'бровисту', quote: 'Имя и фото мастера подставим', photo: 'assets/master-2.jpg' },
  { name: 'Мастер маникюра', to: 'мастеру маникюра', quote: 'Имя и фото мастера подставим', photo: 'assets/master-3.jpg' },
];

/* ---------------------------------------------------------------------
   2. УТИЛИТЫ
   --------------------------------------------------------------------- */
const $  = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SHORT = /(^|[\s(«])(в|во|на|с|со|к|ко|у|о|об|и|а|но|из|за|по|до|от|не|для|без|при|под)\s+/giu;
const NB = '\u00a0';
const nb = (s) => String(s).replace(SHORT, '$1$2' + NB).replace(SHORT, '$1$2' + NB).replace(/(\d) (?=\d{3}\b)/g, '$1' + NB).replace(/(\d)\s+(?=[^\s\d–])/g, '$1' + NB).replace(/\s—/g, NB + '—');
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (t) => t * t * (3 - 2 * t);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE_Q = '(max-width: 760px), (max-width: 1100px) and (orientation: portrait)';
const isMobile = () => matchMedia(MOBILE_Q).matches;
const ARROW = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';
const pageY = (el) => el.getBoundingClientRect().top + scrollY;

/* время в Астане, независимо от часового пояса устройства */
const astanaNow = () => new Date(Date.now() + (SITE.tz * 60 + new Date().getTimezoneOffset()) * 60000);

/* ---------------------------------------------------------------------
   3. РАЗМЕТКА ИЗ ДАННЫХ
   --------------------------------------------------------------------- */
$('[data-list="visit"]').innerHTML = VISIT.map((s, i) => `
  <li class="vstep" data-in>
    <span class="vstep__n">${String(i + 1).padStart(2, '0')}</span>
    <h3>${esc(nb(s.t))}</h3>
    <p>${esc(nb(s.d))}</p>
    ${s.gift ? '<span class="vstep__gift">В подарок</span>' : ''}
  </li>`).join('');

$('[data-list="guards"]').innerHTML = GUARDS.map((g, i) => `
  <button class="gtick" type="button" data-guard="${i}" aria-label="${esc(g.name)}, ${esc(g.mm)}"><b>${esc(g.num)}</b><span>${esc(nb(g.mm))}</span></button>`).join('');

$('[data-list="services"]').innerHTML = SERVICES.map((s, i) => `
  <div class="prow${s.small ? ' prow--small' : ''}" data-in>
    <div><h3 class="prow__name">${esc(nb(s.name))}</h3><p class="prow__note">${esc(nb(s.note))}</p></div>
    <p class="prow__price">${esc(nb(s.price))}</p>
    ${s.small ? '' : `<button class="btn btn--line btn--sm prow__go" type="button" data-service="${i}">
      <span class="btn__fill" aria-hidden="true"></span><span class="btn__label">${esc(nb(s.cta))}</span>${ARROW}</button>`}
  </div>`).join('');

$('[data-list="masters"]').innerHTML = MASTERS.map((m) => `
  <article class="master" data-in>
    <div class="master__img"><img src="${esc(m.photo)}" alt="Мастер ${esc(m.name)}" loading="lazy"></div>
    <div class="master__row">
      <div><h3>${esc(m.name)}</h3><p class="master__quote">${esc(nb(m.quote))}</p></div>
      <button class="round" type="button" data-master="${esc(m.name)}" aria-label="Записаться к мастеру ${esc(m.to)}">${ARROW}</button>
    </div>
  </article>`).join('');


/* ---------------------------------------------------------------------
   4. СТАТУС «ОТКРЫТО СЕЙЧАС»
   --------------------------------------------------------------------- */
const statusEl = $('[data-status]');
function isOpenNow() {
  const n = astanaNow();
  const m = n.getHours() * 60 + n.getMinutes();
  return m >= SITE.open.from * 60 && m < SITE.open.to * 60;
}
function renderStatus() {
  const open = isOpenNow();
  statusEl.classList.toggle('is-open', open);
  $('.status__text', statusEl).textContent = open ? `Открыто до ${SITE.open.to}:00` : `Откроемся в ${SITE.open.from}:00`;
}
renderStatus();
setInterval(renderStatus, 60000);

/* ---------------------------------------------------------------------
   5. ОНЛАЙН-ЗАПИСЬ
   --------------------------------------------------------------------- */
const form = $('#booking');
const state = { service: 0, master: 'Любой мастер', day: 0, time: '' };

const chipsService = $('[data-chips="service"]');
chipsService.innerHTML = SERVICES.map((s, i) =>
  `<button class="chip" type="button" data-v="${i}" aria-pressed="false">${esc(s.name)}<small>${esc(s.price)}</small></button>`).join('');

const chipsMaster = $('[data-chips="master"]');
chipsMaster.innerHTML = ['Любой мастер', ...MASTERS.map((m) => m.name)]
  .map((n) => `<button class="chip" type="button" data-v="${esc(n)}" aria-pressed="false">${esc(n)}</button>`).join('');

const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const days = Array.from({ length: 7 }, (_, i) => { const d = astanaNow(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
const dayTitle = (i) => (i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : `${WD[days[i].getDay()]}, ${days[i].getDate()}`);
const dayLong = (i) => `${i === 0 ? 'сегодня, ' : i === 1 ? 'завтра, ' : ''}${days[i].getDate()} ${MON[days[i].getMonth()]}`;
const chipsDay = $('[data-chips="day"]');
chipsDay.innerHTML = days.map((d, i) =>
  `<button class="chip" type="button" data-v="${i}" aria-pressed="false">${dayTitle(i)}<small>${d.getDate()} ${MON[d.getMonth()].slice(0, 3)}</small></button>`).join('');

const chipsTime = $('[data-chips="time"]');
const toHM = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
function renderTimes() {
  const n = astanaNow();
  const nowMin = state.day === 0 ? n.getHours() * 60 + n.getMinutes() + 30 : -1;
  const slots = [];
  for (let t = SITE.open.from * 60; t + 30 <= SITE.open.to * 60; t += SITE.open.step) slots.push(t);
  if (state.day === 0 && !slots.some((t) => t >= nowMin)) { pick('day', 1); return; }
  chipsTime.innerHTML = slots.map((t) =>
    `<button class="chip" type="button" data-v="${toHM(t)}" aria-pressed="${toHM(t) === state.time}"${t < nowMin ? ' disabled' : ''}>${toHM(t)}</button>`).join('');
  const picked = $(`[data-v="${state.time}"]`, chipsTime);
  if (!picked || picked.disabled) state.time = '';
}
const press = (box, v) => $$('.chip', box).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.v === String(v))));
function pick(key, v) {
  state[key] = key === 'day' || key === 'service' ? Number(v) : v;
  if (key === 'service') press(chipsService, v);
  if (key === 'master') press(chipsMaster, v);
  if (key === 'day') { press(chipsDay, v); renderTimes(); }
  if (key === 'time') press(chipsTime, v);
  renderSummary();
}
const onChip = (box, key) => box.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c && !c.disabled) pick(key, c.dataset.v); });
onChip(chipsService, 'service');
onChip(chipsMaster, 'master');
onChip(chipsDay, 'day');
onChip(chipsTime, 'time');

function renderSummary() {
  const s = SERVICES[state.service];
  $('.summary__text').textContent = nb([
    s.name,
    state.master === 'Любой мастер' ? 'любой свободный мастер' : `мастер ${state.master}`,
    state.time ? `${dayLong(state.day)} в ${state.time}` : `${dayLong(state.day)}, время не выбрано`,
  ].join(', '));
  $('.summary__price').textContent = s.small ? 'Цену скажет мастер' : s.price;
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
  const s = SERVICES[state.service];
  const text = [
    `Здравствуйте! Хочу записаться в ${SITE.name}.`,
    `Услуга: ${s.name}`,
    `Мастер: ${state.master}`,
    `Когда: ${dayLong(state.day)}, ${state.time}`,
    `Имя: ${f.name.value.trim()}`,
    `Телефон: ${f.phone.value}`,
  ].join('\n');
  if (SITE.demo) {
    // демо: заявку не отправляем, показываем, что получит студия
    err.hidden = false;
    err.textContent = 'Это демо-версия. На готовом сайте студия получит в WhatsApp: ' + text.replace(/\n/g, ' / ');
    return;
  }
  window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

pick('service', 0);
pick('master', 'Любой мастер');
pick('day', 0);

/* ---------------------------------------------------------------------
   6. НАСАДКИ: текст и шкала
   --------------------------------------------------------------------- */
let guardIdx = 0;
function showGuard(i) {
  guardIdx = i;
  const g = GUARDS[i];
  $('[data-g="num"]').textContent = g.num;
  $('[data-g="mm"]').textContent = nb(g.mm);
  $('[data-g="name"]').textContent = g.name;
  $('[data-g="desc"]').textContent = nb(g.d);
  $$('.gtick').forEach((b, j) => { b.classList.toggle('is-on', j === i); b.setAttribute('aria-pressed', String(j === i)); });
}
showGuard(0);

/* ---------------------------------------------------------------------
   7. РАЗБИВКА ЗАГОЛОВКОВ НА СТРОКИ
   --------------------------------------------------------------------- */
$$('[data-lines]').forEach((el) => {
  const parts = el.innerHTML.split(/<br\s*\/?>/i);
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  el.innerHTML = parts.map((p) => `<span class="line" aria-hidden="true"><span class="line__in">${p}</span></span>`).join('');
});

/* ---------------------------------------------------------------------
   8. 3D-МАШИНКА
   --------------------------------------------------------------------- */
let clipper = null;
const stage = $('.stage');
async function initClipper() {
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('no webgl');
    const mod = await import('./lash.js');
    await document.fonts.load('500 40px "Wix Madefor Display"');
    clipper = mod.createLash(stage, { mobile: isMobile(), accent: '#c9567a' });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
  }
}

/* ключевые положения: x, y — доли экрана от центра, scale 1 = 80% высоты экрана */
const H = -Math.PI / 2;
function keyStates() {
  const m = isMobile();
  const base = { z: 0, ry: 0, curl: 0.5 };
  const S = (o) => ({ ...base, ...o });
  return m ? {
    intro:  S({ x: 0, y: 0.7, rx: 0.6, rz: 0.2, scale: 0.3, alpha: 1, shadow: 0, vol: 0 }),
    hero:   S({ x: 0, y: 0.19, rx: 0.15, rz: 0, scale: 0.34, alpha: 1, shadow: 0, vol: 2 }),
    visit:  S({ x: 0, y: 0.45, rx: 0.2, rz: 0, scale: 0.3, alpha: 0, shadow: 0, vol: 1 }),
    guards: S({ x: 0, y: 0.2, rx: 0.15, rz: 0, scale: 0.4, alpha: 1, shadow: 0, vol: 0 }),
    gone:   S({ x: 0, y: 0.6, rx: 0.3, rz: 0, scale: 0.3, alpha: 0, shadow: 0, vol: 2 }),
    foot:   S({ x: 0, y: -0.2, rx: 0.15, rz: 0, scale: 0.36, alpha: 1, shadow: 0, vol: 4 }),
  } : {
    intro:  S({ x: -0.2, y: 0.7, rx: 0.6, rz: 0.2, scale: 0.6, alpha: 1, shadow: 0, vol: 0 }),
    hero:   S({ x: -0.19, y: 0.2, rx: 0.15, rz: 0.04, scale: 0.6, alpha: 1, shadow: 0.5, vol: 2 }),
    visit:  S({ x: 0.3, y: 0.05, rx: 0.15, rz: -0.08, scale: 0.5, alpha: 1, shadow: 0.5, vol: 1 }),
    guards: S({ x: 0.11, y: -0.02, rx: 0.15, rz: 0, scale: 0.8, alpha: 1, shadow: 0.6, vol: 0 }),
    gone:   S({ x: 0.3, y: 0.6, rx: 0.3, rz: 0, scale: 0.5, alpha: 0, shadow: 0, vol: 2 }),
    foot:   S({ x: 0.14, y: -0.17, rx: 0.15, rz: 0, scale: 0.6, alpha: 1, shadow: 0, vol: 4 }),
  };
}
const mixState = (a, b, t) => Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] - a[k]) * t]));

let keys = [];
let gRange = [0, 0];
function buildKeys() {
  const K = keyStates();
  const vh = innerHeight;
  const vis = $('.visit'), gu = $('.guards');
  const gTop = pageY(gu), gEnd = gTop + gu.offsetHeight - vh;
  gRange = [gTop, gEnd];
  const maxY = document.documentElement.scrollHeight - vh;
  keys = [
    [0, K.hero],
    [pageY(vis) - vh * 0.2, K.visit],
    [Math.max(pageY(vis), pageY(vis) + vis.offsetHeight - vh * 1.1), K.visit],
    [gTop, K.guards],
    [gEnd, K.guards],
    [gEnd + vh * 0.7, K.gone],
    [maxY - vh * 0.9, K.gone],
    [maxY, K.foot],
  ].sort((a, b) => a[0] - b[0]);
}
function scrollState(y) {
  let s = keys[keys.length - 1][1];
  if (y <= keys[0][0]) s = keys[0][1];
  else for (let i = 1; i < keys.length; i++) {
    if (y <= keys[i][0]) {
      const [y0, s0] = keys[i - 1], [y1, s1] = keys[i];
      s = mixState(s0, s1, smooth(clamp01((y - y0) / Math.max(1, y1 - y0))));
      break;
    }
  }
  // в сцене объёма шаг идёт ступенькой: классика, 2D, 3D, 5D, мега
  if (y >= gRange[0] - 1 && y <= gRange[1] + 1) s = { ...s, vol: guardIdx };
  return s;
}

/* ---------------------------------------------------------------------
   9. ЗАПУСК
   --------------------------------------------------------------------- */
async function boot() {
  const g = window.gsap;
  const ST = window.ScrollTrigger;
  await initClipper();

  if (!g || !ST) {
    if (clipper) { buildKeys(); clipper.jump(keyStates().hero); }
    return;
  }
  g.registerPlugin(ST);

  /* плавный скролл */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    lenis.on('scroll', ST.update);
    g.ticker.add((t) => lenis.raf(t * 1000));
    g.ticker.lagSmoothing(0);
  }
  const scrollToY = (y, opts = {}) => (lenis ? lenis.scrollTo(y, { duration: 1.4, ...opts }) : scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }));
  const scrollToEl = (el) => (lenis ? lenis.scrollTo(el, { duration: 1.5 }) : el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href').length > 1) {
      const t = $(a.getAttribute('href'));
      if (t) { e.preventDefault(); scrollToEl(t); }
    }
    const sv = e.target.closest('[data-service]');
    if (sv) { pick('service', sv.dataset.service); scrollToEl($('#book')); }
    const ms = e.target.closest('[data-master]');
    if (ms) { pick('master', ms.dataset.master); scrollToEl($('#book')); }
    const gt = e.target.closest('[data-guard]');
    if (gt) {
      const i = Number(gt.dataset.guard);
      scrollToY(gRange[0] + (gRange[1] - gRange[0]) * ((i + 0.5) / GUARDS.length));
    }
  });

  /* ресницы: вступление смешивается со скроллом */
  const intro = { k: reduce ? 1 : 0 };
  const updateClipper = () => {
    if (!clipper) return;
    const K = keyStates();
    const s = mixState(K.intro, scrollState(scrollY), smooth(intro.k));
    clipper.setState(s);
    clipper.setVisible(s.alpha > 0.01);
  };
  if (clipper) {
    buildKeys();
    clipper.jump(reduce ? scrollState(scrollY) : keyStates().intro);
    addEventListener('pointermove', (e) => clipper.setMouse((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)), { passive: true });
  }

  /* объём: шаг по прогрессу закреплённой сцены */
  ST.create({
    trigger: '.guards', start: 'top top', end: 'bottom bottom',
    onUpdate: (self) => {
      const i = Math.min(GUARDS.length - 1, Math.floor(self.progress * GUARDS.length));
      if (i !== guardIdx) {
        showGuard(i);
        if (!reduce) g.fromTo('.guards__now, .guards__name, .guards__desc', { y: 18, filter: 'blur(8px)', opacity: 0 }, { y: 0, filter: 'blur(0px)', opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.05, overwrite: true });
      }
    },
  });

  ST.create({ start: 0, end: 'max', onUpdate: updateClipper });
  ST.addEventListener('refresh', () => { buildKeys(); updateClipper(); });

  /* вход первого экрана: лесенка 420 / 900 / 1040 / 1200 мс */
  if (!reduce) {
    g.set('.nav', { opacity: 0, y: -16, filter: 'blur(14px)' });
    g.set('.hero .line__in', { yPercent: 110 });
    g.set('.hero [data-in]:not(.hero__photo)', { opacity: 0, y: 28, filter: 'blur(14px)' });
    g.set('.hero__photo', { clipPath: 'inset(0 0 0 100%)' });
    const tl = g.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.hero__photo', { clipPath: 'inset(0 0 0 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.1)
      .to('.nav', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, 0.42)
      .to('.hero .line__in', { yPercent: 0, duration: 1.2, stagger: 0.1 }, 0.9)
      .to('.hero__lead', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, 1.04)
      .to('.hero .cta-row', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, 1.2)
      .to('.hero .rating', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, 1.3)
      .to(intro, { k: 1, duration: 2.2, ease: 'power3.inOut', onUpdate: updateClipper }, 0.3);

    /* заголовки секций: строки из-под маски */
    $$('[data-lines]').forEach((el) => {
      if (el.closest('.hero')) return;
      g.from($$('.line__in', el), { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    /* остальное: подъём с размытием; opacity, а не autoAlpha, чтобы всё было доступно с клавиатуры */
    const groups = new Map();
    $$('[data-in]').forEach((el) => {
      if (el.closest('.hero')) return;
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });
    groups.forEach((els, parent) => {
      g.from(els, { opacity: 0, y: 28, filter: 'blur(14px)', duration: 0.9, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: parent, start: 'top 85%' } });
    });
    /* фото мастеров открываются шторкой */
    $$('.master__img').forEach((el) => {
      g.from(el, { clipPath: 'inset(100% 0 0 0)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    /* большое фото зала чуть плывёт */
    g.fromTo('.place__img', { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.place', start: 'top bottom', end: 'bottom top', scrub: true } });
    /* слово в подвале */
    g.from('.foot__word', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.foot__word', start: 'top 95%' } });
  } else if (clipper) {
    updateClipper();
  }

  /* при смене ориентации пересобираем опорные точки */
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => ST.refresh(), 200); });
  ST.refresh();
}

boot();
