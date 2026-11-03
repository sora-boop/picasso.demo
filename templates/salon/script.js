'use strict';

/* =====================================================================
   1. ДАННЫЕ КЛИЕНТА
   Под нового клиента меняется только этот блок. Всё, что здесь
   не указано, берётся из пресета ниже (тексты, услуги, фото, цвета).
   ===================================================================== */
const CONFIG = {
  preset: 'barber',                  // 'barber' | 'hair' | 'beauty'

  name: '',                          // название клиента; пусто = демо-название пресета
  city: 'Рудный',
  cityIn: 'в Рудном',
  phone: '+7 700 000 00 00',
  whatsapp: '77000000000',           // только цифры, без +
  instagram: 'https://instagram.com/',
  gis: 'https://2gis.kz/rudnyy',     // карточка в 2ГИС
  reviewsUrl: '',                    // вкладка отзывов в 2ГИС; пусто = та же ссылка, что gis
  address: 'ул. Ленина, 1',
  hours: 'Ежедневно с 10:00 до 21:00',
  open: { from: 10, to: 21, step: 30 }, // сетка времени для записи
  rating: '4.9',
  ratingCount: 214,
  years: 6,

  // Перекрыть пресет можно любым полем ниже, например:
  // colors: { bg: '#141210', ink: '#efe9e0', accent: '#c2703d', onAccent: '#141210', scheme: 'dark' },
  // team: [{ name: 'Артём', role: 'Старший барбер, 8 лет', photo: 'assets/my/artem.jpg' }],
  // reviews: [{ text: 'Текст отзыва из 2ГИС', author: 'Имя', date: 'октябрь 2026' }],
};

/* =====================================================================
   2. ПРЕСЕТЫ НИШ
   ===================================================================== */
const A = (preset, file) => `assets/${preset}/${file}.jpg`;

const PRESETS = {
  /* ---------------- барбершоп ---------------- */
  barber: {
    kind: 'Барбершоп',
    demoName: 'Barber Room',
    worksTitle: 'Атмосфера и работы',
    colors: { bg: '#141210', ink: '#efe9e0', accent: '#c2703d', onAccent: '#141210', scheme: 'dark' },
    heroTitle: ['Стрижка, борода', 'и горячее бритьё'],
    heroLead: 'Мужские стрижки любой сложности, оформление бороды и королевское бритьё. Свободное время видно сразу при записи.',
    heroHint: 'Без предоплаты, ответим за 10 минут',
    about: 'Мы не торопим гостей и не спорим с вашими волосами. Час в кресле, честный совет мастера и стрижка, которая красиво отрастает.',
    mastersCount: 4,
    servicesLead: 'Цены фиксированные, время указано с мытьём головы и укладкой. Нажмите на услугу, чтобы записаться.',
    services: [
      { cat: 'Стрижки', photo: A('barber', 'svc-1'), items: [
        { name: 'Мужская стрижка', time: 45, price: 5000 },
        { name: 'Стрижка машинкой', note: 'одна насадка', time: 30, price: 3500 },
        { name: 'Удлинённая стрижка', time: 60, price: 6000 },
        { name: 'Детская стрижка', note: 'до 12 лет', time: 40, price: 3500 },
        { name: 'Отец и сын', time: 80, price: 8000 },
      ]},
      { cat: 'Борода и бритьё', photo: A('barber', 'svc-2'), items: [
        { name: 'Оформление бороды', time: 30, price: 4000 },
        { name: 'Стрижка и борода', time: 75, price: 8000 },
        { name: 'Королевское бритьё', note: 'горячее полотенце, опасная бритва', time: 40, price: 5000 },
        { name: 'Бритьё головы', time: 30, price: 4000 },
      ]},
      { cat: 'Уход и камуфляж', photo: A('barber', 'svc-3'), items: [
        { name: 'Камуфляж седины', time: 30, price: 4000 },
        { name: 'Камуфляж бороды', time: 20, price: 3000 },
        { name: 'Чёрная маска', time: 15, price: 2000 },
        { name: 'Удаление волос воском', note: 'нос или уши', time: 10, price: 1500 },
      ]},
    ],
    works: [
      { src: A('barber', 'work-1'), caption: 'Классика с бородой' },
      { src: A('barber', 'work-2'), caption: 'Наш зал' },
      { src: A('barber', 'work-3'), caption: 'Инструмент' },
      { src: A('barber', 'work-4'), caption: 'Кресла у окна' },
      { src: A('barber', 'work-5'), caption: 'Вечерняя смена' },
      { src: A('barber', 'work-6'), caption: 'Работа в четыре руки' },
    ],
    teamLead: 'Выберите мастера, и он сразу подставится в форму записи.',
    team: [
      { name: 'Артём', role: 'Старший барбер, 8 лет опыта', photo: A('barber', 'master-1') },
      { name: 'Данияр', role: 'Барбер, фейды и текстура', photo: A('barber', 'master-2') },
      { name: 'Руслан', role: 'Барбер, бороды и бритьё', photo: A('barber', 'master-3') },
    ],
    bookTitle: ['Запишитесь', 'за минуту'],
    bookLead: 'Выберите услугу, мастера и время. Заявка уйдёт администратору в WhatsApp, он подтвердит запись.',
    reviewsTitle: ['Нам доверяют', 'свою голову'],
    contactsTitle: ['Ждём вас', 'в гости'],
    photos: { hero: A('barber', 'hero'), place: A('barber', 'place') },
  },

  /* ---------------- парикмахерская ---------------- */
  hair: {
    kind: 'Парикмахерская',
    demoName: 'Hair Studio',
    worksTitle: 'Работы мастеров',
    colors: { bg: '#f3efe9', ink: '#211d19', accent: '#8c5a3c', onAccent: '#f7f3ee', scheme: 'light' },
    heroTitle: ['Стрижка и цвет', 'без сюрпризов'],
    heroLead: 'Стрижки, окрашивание и укладки для всей семьи. Мастер подберёт цвет и форму под ваш тип волос и образ жизни.',
    heroHint: 'Без предоплаты, ответим за 10 минут',
    about: 'Работаем на профессиональной косметике и честно говорим, что подойдёт именно вам. Сложное окрашивание начинаем только после консультации.',
    mastersCount: 6,
    servicesLead: 'Цена окрашивания зависит от длины и густоты волос, мастер назовёт её до начала работы. Нажмите на услугу, чтобы записаться.',
    services: [
      { cat: 'Стрижки', photo: A('hair', 'svc-1'), items: [
        { name: 'Женская стрижка, короткие волосы', time: 60, price: 5000 },
        { name: 'Женская стрижка, средние и длинные', time: 75, price: 7000 },
        { name: 'Мужская стрижка', time: 45, price: 4000 },
        { name: 'Детская стрижка', note: 'до 12 лет', time: 40, price: 3000 },
        { name: 'Стрижка чёлки', time: 15, price: 1500 },
      ]},
      { cat: 'Окрашивание', photo: A('hair', 'svc-2'), items: [
        { name: 'Окрашивание корней', time: 120, price: 12000, from: true },
        { name: 'Окрашивание в один тон', time: 150, price: 15000, from: true },
        { name: 'Сложное окрашивание', note: 'airtouch, балаяж, шатуш', time: 300, price: 35000, from: true },
        { name: 'Тонирование', time: 60, price: 9000, from: true },
      ]},
      { cat: 'Укладки', photo: A('hair', 'svc-3'), items: [
        { name: 'Укладка феном', time: 45, price: 5000 },
        { name: 'Локоны', time: 60, price: 7000 },
        { name: 'Вечерняя причёска', time: 90, price: 12000, from: true },
      ]},
      { cat: 'Уход', photo: A('hair', 'svc-4'), items: [
        { name: 'Восстанавливающий уход', time: 45, price: 8000 },
        { name: 'Кератиновое выпрямление', time: 180, price: 25000, from: true },
        { name: 'Мытьё и сушка', time: 20, price: 2500 },
      ]},
    ],
    works: [
      { src: A('hair', 'work-1'), caption: 'Пучок с плетением' },
      { src: A('hair', 'work-2'), caption: 'Мягкие локоны' },
      { src: A('hair', 'work-3'), caption: 'Блонд и укладка' },
      { src: A('hair', 'work-4'), caption: 'Окрашивание в фольгу' },
      { src: A('hair', 'work-5'), caption: 'Стрижка по мокрым волосам' },
      { src: A('hair', 'work-6'), caption: 'Укладка брашингом' },
    ],
    teamLead: 'Выберите мастера, и он сразу подставится в форму записи.',
    team: [
      { name: 'Алина', role: 'Стилист-колорист, 10 лет опыта', photo: A('hair', 'master-1') },
      { name: 'Ксения', role: 'Мастер причёсок и укладок', photo: A('hair', 'master-2') },
      { name: 'Мадина', role: 'Парикмахер-стилист, 6 лет опыта', photo: A('hair', 'master-3') },
    ],
    bookTitle: ['Запишитесь', 'за минуту'],
    bookLead: 'Выберите услугу, мастера и время. Заявка уйдёт администратору в WhatsApp, он подтвердит запись.',
    reviewsTitle: ['Возвращаются', 'к своему мастеру'],
    contactsTitle: ['Ждём вас', 'в салоне'],
    photos: { hero: A('hair', 'hero'), place: A('hair', 'place') },
  },

  /* ---------------- салон красоты ---------------- */
  beauty: {
    kind: 'Салон красоты',
    demoName: 'Beauty Room',
    worksTitle: 'Работы мастеров',
    colors: { bg: '#f5f0ed', ink: '#2a2022', accent: '#9e5258', onAccent: '#f8f3f1', scheme: 'light' },
    heroTitle: ['Маникюр, брови', 'и уход за лицом'],
    heroLead: 'Ногти, брови, ресницы и косметология в одном салоне. Стерильный инструмент, проверенные материалы и запись онлайн.',
    heroHint: 'Без предоплаты, ответим за 10 минут',
    about: 'Каждый инструмент проходит стерилизацию в сухожаре, а покрытие держится три недели без сколов. Если нет, переделаем бесплатно.',
    mastersCount: 5,
    servicesLead: 'Цены указаны за работу с материалами. Нажмите на услугу, чтобы записаться.',
    services: [
      { cat: 'Ногти', photo: A('beauty', 'svc-1'), items: [
        { name: 'Маникюр без покрытия', time: 45, price: 4000 },
        { name: 'Маникюр с покрытием гель-лак', time: 90, price: 7000 },
        { name: 'Наращивание ногтей', time: 150, price: 12000, from: true },
        { name: 'Педикюр с покрытием', time: 90, price: 9000 },
        { name: 'Снятие покрытия', time: 20, price: 1500 },
      ]},
      { cat: 'Брови и ресницы', photo: A('beauty', 'svc-2'), items: [
        { name: 'Коррекция бровей', time: 20, price: 3000 },
        { name: 'Коррекция и окрашивание', time: 40, price: 4500 },
        { name: 'Ламинирование бровей', time: 60, price: 7000 },
        { name: 'Ламинирование ресниц', time: 60, price: 8000 },
        { name: 'Наращивание ресниц', time: 120, price: 10000, from: true },
      ]},
      { cat: 'Уход за лицом', photo: A('beauty', 'svc-3'), items: [
        { name: 'Чистка лица', note: 'комбинированная', time: 75, price: 12000 },
        { name: 'Уходовая процедура', time: 60, price: 10000 },
        { name: 'Пилинг', time: 45, price: 9000, from: true },
      ]},
    ],
    works: [
      { src: A('beauty', 'work-1'), caption: 'Черепаховый дизайн' },
      { src: A('beauty', 'work-2'), caption: 'Френч с акцентом' },
      { src: A('beauty', 'work-3'), caption: 'Пастель и блёстки' },
      { src: A('beauty', 'work-4'), caption: 'Нюдовое покрытие' },
      { src: A('beauty', 'work-5'), caption: 'Палитра покрытий' },
      { src: A('beauty', 'work-6'), caption: 'Короткий нюд' },
    ],
    teamLead: 'Выберите мастера, и он сразу подставится в форму записи.',
    team: [
      { name: 'Дана', role: 'Косметолог, 7 лет опыта', photo: A('beauty', 'master-1') },
      { name: 'Мария', role: 'Мастер маникюра и педикюра', photo: A('beauty', 'master-2') },
      { name: 'Айгерим', role: 'Бровист и визажист', photo: A('beauty', 'master-3') },
    ],
    bookTitle: ['Запишитесь', 'за минуту'],
    bookLead: 'Выберите услугу, мастера и время. Заявка уйдёт администратору в WhatsApp, он подтвердит запись.',
    reviewsTitle: ['Приходят', 'по рекомендации'],
    contactsTitle: ['Ждём вас', 'в салоне'],
    photos: { hero: A('beauty', 'hero'), place: A('beauty', 'place') },
  },
};

/* =====================================================================
   3. ДВИЖОК. Ниже ничего менять не нужно.
   ===================================================================== */
const P = PRESETS[CONFIG.preset] || PRESETS.barber;
const S = {
  ...P, ...CONFIG,
  colors: { ...P.colors, ...(CONFIG.colors || {}) },
  photos: { ...P.photos, ...(CONFIG.photos || {}) },
};
S.name = CONFIG.name || P.demoName;

const $  = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* неразрывные пробелы: после коротких слов и между числом и единицей */
const SHORT = /(^|[\s(])(в|во|на|с|со|к|ко|у|о|об|и|а|но|из|за|по|до|от|не|для|без|при)\s+/giu;
const nb = (s) => String(s)
  .replace(SHORT, '$1$2 ').replace(SHORT, '$1$2 ')
  .replace(/(\d)\s+(?=[^\s\d])/g, '$1 ');
const plural = (n, one, few, many) => {
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? few : many;
};
const money = (n) => Math.round(n).toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₸';
const price = (it) => (it.from ? 'от ' : '') + money(it.price);
const dur = (m) => {
  const h = Math.floor(m / 60), r = m % 60;
  return h ? `${h} ч${r ? ' ' + r + ' мин' : ''}` : `${r} мин`;
};
const waLink = (text) => `https://wa.me/${S.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;
const ICON = {
  arrow: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>',
};

/* ---------- цвета и мета ---------- */
const rs = document.documentElement.style;
rs.setProperty('--bg', S.colors.bg);
rs.setProperty('--ink', S.colors.ink);
rs.setProperty('--accent', S.colors.accent);
rs.setProperty('--on-accent', S.colors.onAccent);
rs.setProperty('color-scheme', S.colors.scheme);
document.title = `${S.name}, ${S.kind.toLowerCase()} ${S.cityIn || 'в ' + S.city}`;
$('meta[name="description"]').content = `${S.name}: ${S.heroLead}`;

/* производные тексты */
S.footer = S.footer || `${S.kind}, ${S.city}, ${new Date().getFullYear()}`;
S.reviewsLead = S.reviewsLead || `${S.ratingCount} ${plural(S.ratingCount, 'оценка', 'оценки', 'оценок')} в 2ГИС. Почитайте, что пишут гости, прежде чем записаться.`;
S.facts = S.facts || [
  { v: S.rating, t: 'средняя оценка в 2ГИС' },
  { v: `${S.years} ${plural(S.years, 'год', 'года', 'лет')}`, t: `работаем ${S.cityIn || 'в ' + S.city}` },
  { v: String(S.mastersCount), t: `${plural(S.mastersCount, 'мастер', 'мастера', 'мастеров')} в команде` },
  { v: `${S.open.from}:00 – ${S.open.to}:00`, t: 'принимаем без выходных' },
];

/* ---------- простые подстановки ---------- */
$$('[data-bind]').forEach((el) => { const v = S[el.dataset.bind]; if (v != null) el.textContent = nb(v); });
$$('[data-lines]').forEach((el) => { el.innerHTML = (S[el.dataset.lines] || []).map((l) => esc(nb(l))).join('<br>'); });
$$('[data-photo]').forEach((el) => { el.src = S.photos[el.dataset.photo]; });
const HREF = {
  tel: 'tel:' + S.phone.replace(/[^\d+]/g, ''),
  wa: waLink(),
  gis: S.gis,
  reviews: S.reviewsUrl || S.gis,
  instagram: S.instagram,
};
$$('[data-href]').forEach((el) => { const v = HREF[el.dataset.href]; if (v) el.href = v; else el.remove(); });

/* ---------- цифры ---------- */
$('[data-list="facts"]').innerHTML = S.facts.map((f, i) =>
  `<div class="fact rise" data-d="${100 + i * 50}"><dt>${esc(f.v)}</dt><dd>${esc(nb(f.t))}</dd></div>`).join('');

/* ---------- услуги ---------- */
const flat = [];                       // все услуги подряд, индекс = id
S.services.forEach((g, gi) => g.items.forEach((it) => { it.g = gi; it.id = flat.length; flat.push(it); }));

$('[data-list="tabs"]').innerHTML = S.services.map((g, gi) =>
  `<button class="tab" type="button" role="tab" id="tab-${gi}" aria-controls="panel-${gi}" aria-selected="${gi === 0}">${esc(g.cat)}</button>`).join('');

$('[data-list="services"]').innerHTML = S.services.map((g, gi) => `
  <div class="svc-panel" role="tabpanel" id="panel-${gi}" aria-labelledby="tab-${gi}"${gi ? ' hidden' : ''}>
    ${g.note ? `<p class="svc-panel__note">${esc(nb(g.note))}</p>` : ''}
    ${g.items.map((it) => `
      <button class="row" type="button" data-service="${it.id}">
        <span class="row__name">${esc(nb(it.name))}${it.note ? `<span class="row__note">${esc(nb(it.note))}</span>` : ''}</span>
        <span class="row__time">${it.time ? dur(it.time) : ''}</span>
        <span class="row__price">${price(it)}</span>
        ${ICON.arrow}
      </button>`).join('')}
  </div>`).join('');

/* сигнатура: фото категории открывается шторкой */
const photoBox = $('.services__photo');
const [imgBack, imgFront] = $$('img', photoBox);
S.services.forEach((g) => { const im = new Image(); im.src = g.photo; }); // прогрев
imgBack.src = S.services[0].photo;
let photoNow = S.services[0].photo;
const swapPhoto = (src) => {
  if (src === photoNow) return;
  if (reduce) { imgBack.src = src; photoNow = src; return; }
  imgFront.className = 'is-front';
  imgFront.src = src;
  const open = () => requestAnimationFrame(() => requestAnimationFrame(() => imgFront.classList.add('is-open')));
  imgFront.decode ? imgFront.decode().then(open, open) : open();
  const prev = src;
  photoNow = src;
  setTimeout(() => { if (photoNow === prev) { imgBack.src = prev; } }, 1250);
};

const tabs = $$('.tab');
const selectTab = (gi, focus) => {
  tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === gi)));
  $$('.svc-panel').forEach((p, k) => { p.hidden = k !== gi; });
  swapPhoto(S.services[gi].photo);
  if (focus) tabs[gi].focus();
};
tabs.forEach((t, gi) => {
  t.addEventListener('click', () => selectTab(gi));
  t.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (d) { e.preventDefault(); selectTab((gi + d + tabs.length) % tabs.length, true); }
  });
});

/* ---------- работы ---------- */
$('[data-list="works"]').innerHTML = S.works.map((w, i) => `
  <figure class="work rise" data-d="${Math.min(i, 5) * 50}">
    <div class="work__img"><img src="${esc(w.src)}" alt="${esc(w.caption || '')}" loading="lazy"></div>
    ${w.caption ? `<figcaption>${esc(nb(w.caption))}</figcaption>` : ''}
  </figure>`).join('');
const track = $('.works__track');
const [prevBtn, nextBtn] = $$('[data-scroll]');
const syncArrows = () => {
  prevBtn.disabled = track.scrollLeft < 8;
  nextBtn.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
};
$$('[data-scroll]').forEach((b) => b.addEventListener('click', () => {
  const step = ($('.work', track)?.offsetWidth || 300) + 4;
  track.scrollBy({ left: step * Number(b.dataset.scroll), behavior: reduce ? 'auto' : 'smooth' });
}));
track.addEventListener('scroll', () => requestAnimationFrame(syncArrows), { passive: true });
addEventListener('resize', syncArrows);
syncArrows();

/* ---------- мастера ---------- */
$('[data-list="team"]').innerHTML = S.team.map((m, i) => `
  <article class="master rise" data-d="${i * 50}">
    <div class="master__photo"><img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy"></div>
    <h3 class="master__name">${esc(m.name)}</h3>
    <p class="master__role">${esc(nb(m.role))}</p>
    <button class="master__go" type="button" data-master="${esc(m.name)}">Записаться к мастеру ${ICON.arrow}</button>
  </article>`).join('');

/* ---------- отзывы ---------- */
$('.stars').innerHTML = ICON.star.repeat(5);
$('[data-list="reviews"]').innerHTML = (S.reviews || []).map((r, i) => `
  <blockquote class="quote rise" data-d="${i * 50}">
    <p>${esc(nb(r.text))}</p>
    <footer>${esc(r.author)}${r.date ? `, ${esc(r.date)}` : ''}, 2ГИС</footer>
  </blockquote>`).join('');

/* =====================================================================
   ОНЛАЙН-ЗАПИСЬ
   ===================================================================== */
const form = $('#booking');
const state = { service: flat[0].id, master: 'Любой мастер', day: 0, time: '' };

/* услуги в select */
const sel = form.elements.service;
sel.innerHTML = S.services.map((g) => `<optgroup label="${esc(g.cat)}">${
  g.items.map((it) => `<option value="${it.id}">${esc(it.name)}, ${price(it).replace(/ /g, ' ')}</option>`).join('')
}</optgroup>`).join('');

/* мастера */
const chipsMaster = $('[data-chips="master"]');
chipsMaster.innerHTML = ['Любой мастер', ...S.team.map((m) => m.name)]
  .map((n) => `<button class="chip" type="button" data-v="${esc(n)}" aria-pressed="false">${esc(n)}</button>`).join('');

/* дни: 7 ближайших */
const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
const dayTitle = (i) => (i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : `${WD[days[i].getDay()]}, ${days[i].getDate()}`);
const dayLong = (i) => `${i === 0 ? 'сегодня, ' : i === 1 ? 'завтра, ' : ''}${days[i].getDate()} ${MON[days[i].getMonth()]}`;
const chipsDay = $('[data-chips="day"]');
chipsDay.innerHTML = days.map((d, i) =>
  `<button class="chip" type="button" data-v="${i}" aria-pressed="false">${dayTitle(i)}<small>${d.getDate()} ${MON[d.getMonth()].slice(0, 3)}</small></button>`).join('');

/* время: доступные слоты с учётом длительности услуги и текущего часа */
const chipsTime = $('[data-chips="time"]');
const toHM = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const renderTimes = () => {
  const svc = flat[state.service];
  const close = S.open.to * 60;
  const now = new Date();
  const nowMin = state.day === 0 ? now.getHours() * 60 + now.getMinutes() + 30 : -1;
  const slots = [];
  for (let t = S.open.from * 60; t + Math.min(svc.time || 30, 60) <= close; t += S.open.step) slots.push(t);
  chipsTime.innerHTML = slots.map((t) =>
    `<button class="chip" type="button" data-v="${toHM(t)}" aria-pressed="${toHM(t) === state.time}"${t < nowMin ? ' disabled' : ''}>${toHM(t)}</button>`).join('');
  const picked = $(`[data-v="${state.time}"]`, chipsTime);
  if (!picked || picked.disabled) state.time = '';
  if (!slots.some((t) => t >= nowMin) && state.day === 0) { pick('day', 1); }
};

const pressOnly = (box, v) => $$('.chip', box).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.v === String(v))));
function pick(key, v) {
  state[key] = key === 'day' ? Number(v) : key === 'service' ? Number(v) : v;
  if (key === 'service') sel.value = String(v);
  if (key === 'master') pressOnly(chipsMaster, v);
  if (key === 'day') { pressOnly(chipsDay, v); renderTimes(); }
  if (key === 'service') renderTimes();
  if (key === 'time') pressOnly(chipsTime, v);
  renderSummary();
}
chipsMaster.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) pick('master', c.dataset.v); });
chipsDay.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) pick('day', c.dataset.v); });
chipsTime.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c && !c.disabled) pick('time', c.dataset.v); });
sel.addEventListener('change', () => pick('service', sel.value));

/* итог */
const sumText = $('.summary__text');
const sumPrice = $('.summary__price');
function renderSummary() {
  const svc = flat[state.service];
  const parts = [svc.name, state.master === 'Любой мастер' ? 'любой свободный мастер' : `мастер ${state.master}`,
    state.time ? `${dayLong(state.day)} в ${state.time}` : `${dayLong(state.day)}, время не выбрано`];
  sumText.textContent = nb(parts.join(', '));
  sumPrice.textContent = price(svc);
}

/* маска телефона: +7 (700) 000-00-00 */
const phone = form.elements.phone;
phone.addEventListener('input', () => {
  let d = phone.value.replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  phone.value = '+7' + (p[0] ? ` (${p[0]}` : '') + (p[0].length === 3 ? ')' : '') + (p[1] ? ` ${p[1]}` : '') + (p[2] ? `-${p[2]}` : '') + (p[3] ? `-${p[3]}` : '');
});
phone.addEventListener('focus', () => { if (!phone.value) phone.value = '+7 '; });
phone.addEventListener('blur', () => { if (phone.value.replace(/\D/g, '').length <= 1) phone.value = ''; });

/* отправка */
const err = $('.booking__error');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = form.elements;
  const problems = [];
  if (!state.time) problems.push('время');
  if (!f.name.value.trim()) problems.push('имя');
  if (f.phone.value.replace(/\D/g, '').length < 11) problems.push('телефон');
  f.name.closest('.field').classList.toggle('is-bad', !f.name.value.trim());
  f.phone.closest('.field').classList.toggle('is-bad', f.phone.value.replace(/\D/g, '').length < 11);
  if (problems.length) {
    err.hidden = false;
    err.textContent = nb(`Осталось указать: ${problems.join(', ')}`);
    (problems[0] === 'время' ? chipsTime : problems[0] === 'имя' ? f.name : f.phone).scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    return;
  }
  err.hidden = true;
  const svc = flat[state.service];
  window.open(waLink([
    `Здравствуйте! Хочу записаться в ${S.name}.`,
    `Услуга: ${svc.name} (${price(svc).replace(/ /g, ' ')})`,
    `Мастер: ${state.master}`,
    `Когда: ${dayLong(state.day)}, ${state.time}`,
    `Имя: ${f.name.value.trim()}`,
    `Телефон: ${f.phone.value}`,
  ].join('\n')), '_blank', 'noopener');
});

/* связка с остальной страницей */
const toBooking = () => $('#book').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
document.addEventListener('click', (e) => {
  const row = e.target.closest('[data-service]');
  if (row) { pick('service', row.dataset.service); toBooking(); return; }
  const m = e.target.closest('[data-master]');
  if (m) { pick('master', m.dataset.master); toBooking(); }
});

pick('master', 'Любой мастер');
pick('day', 0);
pick('service', flat[0].id);

/* =====================================================================
   ШАПКА И ПОЯВЛЕНИЕ
   ===================================================================== */
const bar = $('.bar');
new IntersectionObserver(([en]) => bar.classList.toggle('is-shown', !en.isIntersecting), { threshold: 0, rootMargin: '-40% 0px 0px 0px' })
  .observe($('.hero'));

$$('[data-d]').forEach((el) => el.style.setProperty('--d', el.dataset.d + 'ms'));
requestAnimationFrame(() => requestAnimationFrame(() => $$('[data-reveal-now]').forEach((el) => el.classList.add('is-in'))));
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
}), { rootMargin: '0px 0px -12% 0px' });
$$('[data-reveal]').forEach((el) => io.observe(el));
