/* =====================================================================
   ReForma, Костанай. Лендинг: направления, цены, расписание, запись в WhatsApp.
   Без библиотек. Все данные — в начале файла.
   ===================================================================== */

// demo: true — заявка не отправляется, показываем её текст. Перед запуском поставить false.
const SITE = { name: 'ReForma', whatsapp: '77052155625', demo: true };

// Направления (из прайса и расписания в Instagram студии)
const PROGRAMS = [
  { name: 'Кардио и силовая', d: 'Выносливость и сила в одной тренировке.' },
  { name: 'Функциональная тренировка', d: 'Упражнения с собственным весом и инвентарём.' },
  { name: 'Йога «Сила и баланс»', d: 'Гибкость, баланс и спокойное дыхание.' },
  { name: 'Хатха-йога «Сила и баланс»', d: 'Классическая йога по субботам.' },
  { name: 'Кинезио фитнес', d: 'Бережная работа со спиной и суставами.' },
  { name: 'Гимнастика 50+', d: 'Мягкая нагрузка для тех, кому за 50.' },
  { name: 'Оздоровительная гимнастика', d: 'Подвижность и хорошее самочувствие.' },
  { name: 'Джампинг', d: 'Кардио на мини-батутах под музыку.' },
  { name: 'Канго джамп', d: 'Прыжки в пружинящих ботинках Kangoo.' },
  { name: 'Зумба', d: 'Танцевальная тренировка под латино-ритмы.' },
  { name: 'Восточные танцы', d: 'Пластика, осанка и женственность.' },
];

// Прайс от 1 октября 2026
const PRICES = [
  {
    t: 'Все направления', main: true,
    note: 'Кардио и силовая, йога, функциональная, кинезио фитнес, джампинг, канго джамп, восточные танцы, зумба.',
    rows: [['12 занятий', '20 000 ₸'], ['8 занятий', '17 000 ₸'], ['Разовое посещение', '3 000 ₸']],
  },
  {
    t: 'Гимнастика 50+',
    note: 'Цену на оздоровительную гимнастику подставим.',
    rows: [['8 занятий на месяц', '16 000 ₸'], ['Разовое посещение', '2 500 ₸']],
  },
];

// Расписание: 0 — понедельник. null — расписание на день подставим.
const WEEKDAY = [['08:00', 'Функциональная тренировка'], ['09:30', 'Йога «Сила и баланс»'], ['13:00', 'Зумба'], ['15:00', 'Восточные танцы'], ['17:00', 'Кинезио фитнес'], ['19:00', 'Кардио и силовая'], ['20:00', 'Джампинг'], ['21:00', 'Канго джамп']];
const TUE_THU = [['11:00', 'Гимнастика 50+'], ['17:00', 'Оздоровительная гимнастика'], ['19:00', 'Кардио и силовая'], ['20:00', 'Йога «Сила и баланс»']];
const SCHEDULE = [
  WEEKDAY, TUE_THU, WEEKDAY, TUE_THU, WEEKDAY,
  [['11:00', 'Кардио и силовая'], ['12:00', 'Хатха-йога «Сила и баланс»']],
  null,
];
const PARTIAL = { 5: 'Остальные занятия субботы подставим.' };

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const DAYS_FULL = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];
const DAYS_ACC = ['в понедельник', 'во вторник', 'в среду', 'в четверг', 'в пятницу', 'в субботу', 'в воскресенье'];

/* ---------------------------------------------------------------------
   Утилиты
   --------------------------------------------------------------------- */
const $ = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ARROW = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

/* ---------------------------------------------------------------------
   Направления
   --------------------------------------------------------------------- */
$('[data-list="programs"]').innerHTML = PROGRAMS.map((p, i) => `
  <li><button class="prog" type="button" data-book data-program="${i}">
    <span class="prog__name">${esc(p.name)}</span>
    <span class="prog__d">${esc(p.d)}</span>
    <span class="prog__go">Записаться ${ARROW}</span>
  </button></li>`).join('');

/* ---------------------------------------------------------------------
   Цены
   --------------------------------------------------------------------- */
$('[data-list="prices"]').innerHTML = PRICES.map((p) => `
  <article class="price${p.main ? ' price--main' : ''}">
    <h3>${esc(p.t)}</h3>
    <ul class="price__rows">
      ${p.rows.map(([k, v]) => `<li><span>${esc(k)}</span><b>${esc(v)}</b></li>`).join('')}
    </ul>
    <p class="price__note">${esc(p.note)}</p>
  </article>`).join('');

/* ---------------------------------------------------------------------
   Расписание
   --------------------------------------------------------------------- */
const today = (new Date().getDay() + 6) % 7;
const tabs = $('[data-list="days"]');
tabs.innerHTML = DAYS.map((d, i) => `<button class="tab" type="button" role="tab" aria-selected="${i === today}" data-day="${i}" aria-label="${DAYS_FULL[i]}">${d}</button>`).join('');

function showDay(day) {
  $$('.tab', tabs).forEach((t) => t.setAttribute('aria-selected', String(Number(t.dataset.day) === day)));
  const list = SCHEDULE[day];
  const box = $('[data-list="classes"]');
  if (!list) { box.innerHTML = '<li class="classes__empty">Расписание на воскресенье подставим.</li>'; return; }
  box.innerHTML = list.map(([time, name]) => `
    <li><button class="cls" type="button" data-book data-program="${PROGRAMS.findIndex((p) => p.name === name)}" data-slot="${day}|${time}">
      <span class="cls__time">${time}</span>
      <span class="cls__name">${esc(name)}</span>
      <span class="cls__go">Записаться ${ARROW}</span>
    </button></li>`).join('') + (PARTIAL[day] ? `<li class="classes__empty">${PARTIAL[day]}</li>` : '');
}
tabs.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) showDay(Number(t.dataset.day)); });
tabs.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const cur = $$('.tab', tabs).findIndex((t) => t.getAttribute('aria-selected') === 'true');
  const next = (cur + (e.key === 'ArrowRight' ? 1 : 6)) % 7;
  showDay(next); $$('.tab', tabs)[next].focus();
});
showDay(today);

// Расписание из Google Формы (schedule-sheet.js); без ссылки остаётся SCHEDULE выше
if (window.loadSheetSchedule) loadSheetSchedule(SCHEDULE).then((r) => {
  if (!r) return;
  SCHEDULE.splice(0, 7, ...r.schedule);
  r.touched.forEach((d) => { delete PARTIAL[d]; });
  const cur = $$('.tab', tabs).findIndex((t) => t.getAttribute('aria-selected') === 'true');
  showDay(cur < 0 ? today : cur);
});

/* ---------------------------------------------------------------------
   Запись в WhatsApp
   --------------------------------------------------------------------- */
const sheet = $('#booking');
const form = $('.sheet__form', sheet);
const selProgram = $('[data-select="program"]', sheet);
const selSlot = $('[data-select="slot"]', sheet);
const preview = $('[data-preview]', sheet);

selProgram.innerHTML = '<option value="">Подскажите, что выбрать</option>' +
  PROGRAMS.map((p, i) => `<option value="${i}">${esc(p.name)}</option>`).join('');

function fillSlots(programIdx, slot) {
  const opts = ['<option value="">Договоримся в переписке</option>'];
  if (programIdx !== '') {
    const name = PROGRAMS[programIdx].name;
    SCHEDULE.forEach((list, day) => (list || []).forEach(([time, n]) => {
      if (n === name) opts.push(`<option value="${day}|${time}">${DAYS_FULL[day][0].toUpperCase() + DAYS_FULL[day].slice(1)}, ${time}</option>`);
    }));
  }
  selSlot.innerHTML = opts.join('');
  selSlot.value = slot && [...selSlot.options].some((o) => o.value === slot) ? slot : '';
}
selProgram.addEventListener('change', () => { fillSlots(selProgram.value); preview.hidden = true; });
selSlot.addEventListener('change', () => { preview.hidden = true; });

function message() {
  const name = form.name.value.trim();
  const p = selProgram.value === '' ? null : PROGRAMS[selProgram.value].name;
  const [day, time] = selSlot.value ? selSlot.value.split('|') : [];
  let text = `Здравствуйте!${name ? ` Меня зовут ${name}.` : ''} `;
  text += p ? `Хочу записаться на «${p}»` : 'Хочу записаться на тренировку, подскажите направление';
  if (day !== undefined) text += ` ${DAYS_ACC[day]} в ${time}`;
  return text + '.';
}

function openBooking(programIdx = '', slot = '') {
  selProgram.value = programIdx === '-1' ? '' : programIdx;
  fillSlots(selProgram.value, slot);
  preview.hidden = true;
  if (typeof sheet.showModal === 'function') sheet.showModal();
  else sheet.setAttribute('open', '');
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-book]');
  if (b) openBooking(b.dataset.program ?? '', b.dataset.slot ?? '');
  if (e.target.closest('[data-close]')) sheet.close();
});
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = message();
  if (SITE.demo) {
    $('[data-preview-text]', sheet).textContent = text;
    preview.hidden = false;
    preview.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return;
  }
  window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  sheet.close();
});

/* ---------------------------------------------------------------------
   Плавное появление и кнопка записи на телефоне
   --------------------------------------------------------------------- */
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.section, .final').forEach((s) => { s.classList.add('reveal'); io.observe(s); });
}

const sticky = $('.sticky');
const heroCta = $('.hero__cta');
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([en]) => sticky.classList.toggle('is-on', !en.isIntersecting)).observe(heroCta);
}
