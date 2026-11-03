'use strict';

/* =====================================================================
   1. ДАННЫЕ КЛИЕНТА. Под нового клиента меняется только этот блок.
   Всё, что здесь не указано, берётся из пресета ниже.
   ===================================================================== */
const CONFIG = {
  preset: 'barber',               // 'barber' для барбершопа, 'beauty' для салона красоты

  name: 'OLDBOY',
  city: 'Рудный',
  cityIn: 'в Рудном',             // для заголовка вкладки: «барбершоп в Рудном»
  phone: '+7 700 000 00 00',
  whatsapp: '77000000000',        // только цифры, без +
  instagram: 'https://instagram.com/',
  gis: 'https://2gis.kz/rudnyy',  // ссылка на карточку в 2ГИС
  address: 'ул. Ленина, 1',
  hours: 'Ежедневно с 10:00 до 21:00',
  slots: { from: 10, to: 21, step: 30 }, // сетка времени в форме записи

  // Цвета бренда. Раскомментируйте, чтобы перекрыть пресет.
  // colors: { bg: '#11100e', ink: '#efe9df', accent: '#b8864b', onAccent: '#11100e', scheme: 'dark' },

  // Фото: положите файлы в assets/ и пропишите пути. Без этого стоят заглушки.
  // photos: { hero: 'assets/hero.jpg', place: 'assets/place.jpg', cut: 'assets/cut.jpg', beard: 'assets/beard.jpg', care: 'assets/care.jpg' },

  // Мастера и услуги тоже можно перекрыть здесь: team: [...], services: [...]
};

/* =====================================================================
   2. ПРЕСЕТЫ НИШ
   ===================================================================== */
const PH = (seed, w = 1600, h = 1000) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const PRESETS = {
  barber: {
    kind: 'Барбершоп',
    colors: { bg: '#11100e', ink: '#efe9df', accent: '#b8864b', onAccent: '#11100e', scheme: 'dark' },
    heroTitle: ['Чистая стрижка', 'и ровная борода'],
    heroLead: 'Мастера с опытом от 5 лет, горячее полотенце и кофе, пока ждёте. Запись онлайн занимает минуту.',
    heroHint: 'Подтвердим запись за 10 минут',
    intro: 'Мы не торопимся и не спорим с вашими волосами. Час в кресле, честный совет мастера и стрижка, которая красиво отрастает.',
    facts: [
      { v: '4.9', t: 'рейтинг в 2ГИС' },
      { v: '6 лет', t: 'работаем в городе' },
      { v: '40 000', t: 'стрижек сделано' },
    ],
    servicesLead: 'Цены фиксированные. Время указано с мытьём головы и укладкой.',
    services: [
      { cat: 'Стрижки', photo: 'cut', items: [
        { name: 'Мужская стрижка', time: 45, price: 5000 },
        { name: 'Стрижка машинкой', time: 30, price: 3500 },
        { name: 'Детская стрижка', note: 'до 12 лет', time: 40, price: 3500 },
        { name: 'Стрижка и борода', time: 75, price: 8000 },
      ]},
      { cat: 'Борода и бритьё', photo: 'beard', items: [
        { name: 'Моделирование бороды', time: 30, price: 4000 },
        { name: 'Королевское бритьё', note: 'горячее полотенце, опасная бритва', time: 40, price: 5000 },
        { name: 'Камуфляж седины', time: 30, price: 4000 },
      ]},
      { cat: 'Уход', photo: 'care', items: [
        { name: 'Чёрная маска', time: 15, price: 2000 },
        { name: 'Укладка', time: 15, price: 1500 },
      ]},
    ],
    teamLead: 'Выберите мастера, и мы подставим его в форму записи.',
    team: [
      { name: 'Артём', role: 'Старший барбер, 8 лет опыта', photo: PH('barber-m1', 900, 1200) },
      { name: 'Данияр', role: 'Барбер, фейды и классика', photo: PH('barber-m2', 900, 1200) },
      { name: 'Руслан', role: 'Барбер, бороды и бритьё', photo: PH('barber-m3', 900, 1200) },
      { name: 'Илья', role: 'Барбер, детские стрижки', photo: PH('barber-m4', 900, 1200) },
    ],
    bookTitle: ['Выберите время,', 'остальное за нами'],
    bookLead: 'Заявка уйдёт администратору в WhatsApp. Он подтвердит время или предложит ближайшее свободное окно.',
    contactsTitle: ['Ждём вас', 'в гости'],
    photos: { hero: PH('barber-hero', 2000, 1300), place: PH('barber-place', 1400, 1700), cut: PH('barber-cut', 600, 750), beard: PH('barber-beard', 600, 750), care: PH('barber-care', 600, 750) },
  },

  beauty: {
    kind: 'Салон красоты',
    colors: { bg: '#f2ede6', ink: '#1d1a17', accent: '#8a5a44', onAccent: '#f7f2ec', scheme: 'light' },
    heroTitle: ['Красота, которая', 'держится неделями'],
    heroLead: 'Стрижки, окрашивание, маникюр и уход в одном салоне. Выберите мастера и время, а мы подтвердим запись в WhatsApp.',
    heroHint: 'Ответим в течение 15 минут',
    intro: 'Работаем на профессиональной косметике, стерилизуем инструмент после каждого гостя и честно говорим, что подойдёт именно вам.',
    facts: [
      { v: '4.9', t: 'рейтинг в 2ГИС' },
      { v: '9 лет', t: 'работаем в городе' },
      { v: '12', t: 'мастеров в команде' },
    ],
    servicesLead: 'Итоговая цена окрашивания зависит от длины и густоты волос. Мастер назовёт её до начала работы.',
    services: [
      { cat: 'Волосы', photo: 'cut', items: [
        { name: 'Женская стрижка', time: 60, price: 6000 },
        { name: 'Окрашивание в один тон', time: 120, price: 15000, from: true },
        { name: 'Сложное окрашивание', note: 'airtouch, шатуш, балаяж', time: 240, price: 30000, from: true },
        { name: 'Укладка', time: 45, price: 5000 },
      ]},
      { cat: 'Ногти', photo: 'beard', items: [
        { name: 'Маникюр с покрытием', time: 90, price: 7000 },
        { name: 'Педикюр с покрытием', time: 100, price: 9000 },
        { name: 'Снятие и уход', time: 40, price: 3000 },
      ]},
      { cat: 'Брови и ресницы', photo: 'care', items: [
        { name: 'Коррекция и окрашивание бровей', time: 40, price: 4000 },
        { name: 'Ламинирование ресниц', time: 60, price: 8000 },
      ]},
    ],
    teamLead: 'Выберите мастера, и мы подставим его в форму записи.',
    team: [
      { name: 'Алина', role: 'Стилист-колорист', photo: PH('beauty-m1', 900, 1200) },
      { name: 'Мария', role: 'Мастер маникюра', photo: PH('beauty-m2', 900, 1200) },
      { name: 'Дана', role: 'Бровист и лешмейкер', photo: PH('beauty-m3', 900, 1200) },
    ],
    bookTitle: ['Выберите время,', 'остальное за нами'],
    bookLead: 'Заявка уйдёт администратору в WhatsApp. Он подтвердит время или предложит ближайшее свободное окно.',
    contactsTitle: ['Ждём вас', 'в салоне'],
    photos: { hero: PH('beauty-hero', 2000, 1300), place: PH('beauty-place', 1400, 1700), cut: PH('beauty-hair', 600, 750), beard: PH('beauty-nails', 600, 750), care: PH('beauty-brows', 600, 750) },
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
S.footer = S.footer || `${S.kind}, ${S.city}, ${new Date().getFullYear()}`;

const $  = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* неразрывные пробелы после коротких слов и между числом и единицей */
const SHORT = /(^|[\s(])(в|во|на|с|со|к|ко|у|о|об|и|а|но|из|за|по|до|от|не|для|без)\s+/giu;
const nb = (s) => String(s).replace(SHORT, '$1$2 ').replace(SHORT, '$1$2 ').replace(/(\d)\s+(?=[^\s\d])/g, '$1 ');
const money = (n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₸';
const price = (it) => (it.from ? 'от ' : '') + money(it.price);
const mins  = (m) => (m >= 60 ? `${Math.floor(m / 60)} ч${m % 60 ? ' ' + (m % 60) + ' мин' : ''}` : `${m} мин`);
const imgSrc = (key) => S.photos[key] || key;
const waLink = (text) => `https://wa.me/${S.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';

/* цвета */
const root = document.documentElement.style;
root.setProperty('--bg', S.colors.bg);
root.setProperty('--ink', S.colors.ink);
root.setProperty('--accent', S.colors.accent);
root.setProperty('--on-accent', S.colors.onAccent);
root.setProperty('color-scheme', S.colors.scheme);

/* мета */
document.title = `${S.name}, ${S.kind.toLowerCase()} ${S.cityIn || 'в ' + S.city}`;
$('meta[name="description"]').content = `${S.name}: ${S.heroLead}`;

/* простые подстановки */
$$('[data-bind]').forEach((el) => { const v = S[el.dataset.bind]; if (v != null) el.textContent = nb(v); });
$$('[data-lines]').forEach((el) => { el.innerHTML = (S[el.dataset.lines] || []).map((l) => esc(nb(l))).join('<br>'); });
$$('[data-photo]').forEach((el) => { el.src = imgSrc(el.dataset.photo); });
const HREF = { tel: 'tel:' + S.phone.replace(/[^\d+]/g, ''), wa: waLink(), gis: S.gis, instagram: S.instagram };
$$('[data-href]').forEach((el) => {
  const v = HREF[el.dataset.href];
  if (v) el.href = v; else el.remove();
});

/* факты */
$('[data-list="facts"]').innerHTML = S.facts.map((f, i) =>
  `<div class="fact rise" data-d="${100 + i * 50}"><dt>${esc(nb(f.v))}</dt><dd>${esc(nb(f.t))}</dd></div>`).join('');

/* услуги */
$('[data-list="services"]').innerHTML = S.services.map((g, gi) => `
  <div class="svc-group rise" data-d="${gi * 100}" data-photo-key="${esc(g.photo || '')}">
    <h3 class="svc-group__title">${esc(nb(g.cat))}</h3>
    <div class="svc-group__items">
      ${g.items.map((it) => `
        <div class="svc">
          <span class="svc__name">${esc(nb(it.name))}${it.note ? `<span class="svc__note">${esc(nb(it.note))}</span>` : ''}</span>
          <span class="svc__time">${it.time ? mins(it.time) : ''}</span>
          <span class="svc__price">${price(it)}</span>
        </div>`).join('')}
    </div>
  </div>`).join('');

/* мастера */
$('[data-list="team"]').innerHTML = S.team.map((m, i) => `
  <article class="master rise" data-d="${i * 50}">
    <div class="master__photo"><img src="${esc(imgSrc(m.photo))}" alt="${esc(m.name)}" loading="lazy"></div>
    <div class="master__info">
      <h3>${esc(m.name)}</h3>
      <p class="master__role">${esc(nb(m.role))}</p>
      <button class="master__pick" type="button" data-master="${esc(m.name)}">Выбрать время ${ARROW}</button>
    </div>
  </article>`).join('');

/* опции формы */
const opt = (v, t = v) => `<option value="${esc(v)}">${esc(t)}</option>`;
$('[data-options="services"]').innerHTML = S.services.map((g) =>
  `<optgroup label="${esc(g.cat)}">${g.items.map((it) => opt(it.name, `${it.name}, ${price(it).replace(/ /g, ' ')}`)).join('')}</optgroup>`).join('');
$('[data-options="team"]').innerHTML = opt('Любой свободный') + S.team.map((m) => opt(m.name)).join('');
const slots = [];
for (let t = S.slots.from * 60; t < S.slots.to * 60; t += S.slots.step) {
  slots.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
}
$('[data-options="slots"]').innerHTML = slots.map((s) => opt(s)).join('');

const form = $('#book-form');
const dateInput = form.elements.date;
const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
dateInput.min = today;
dateInput.value = today;

/* выбор мастера из карточки */
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-master]');
  if (!b) return;
  form.elements.master.value = b.dataset.master;
  $('#book').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});

/* отправка в WhatsApp */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = form.elements;
  const bad = ['name', 'phone', 'date'].filter((k) => !f[k].value.trim());
  $$('.field', form).forEach((el) => el.classList.toggle('is-bad', bad.some((k) => el.contains(f[k]))));
  $('.form__error', form).hidden = !bad.length;
  if (bad.length) { f[bad[0]].focus(); return; }

  const date = new Date(f.date.value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' });
  const text = [
    `Здравствуйте! Хочу записаться в ${S.name}.`,
    `Услуга: ${f.service.value}`,
    `Мастер: ${f.master.value}`,
    `Когда: ${date}, ${f.time.value}`,
    `Имя: ${f.name.value.trim()}`,
    `Телефон: ${f.phone.value.trim()}`,
  ].join('\n');
  window.open(waLink(text), '_blank', 'noopener');
});

/* появление */
$$('[data-d]').forEach((el) => el.style.setProperty('--d', el.dataset.d + 'ms'));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
requestAnimationFrame(() => requestAnimationFrame(() => $$('[data-reveal-now]').forEach((el) => el.classList.add('is-in'))));
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
}), { rootMargin: '0px 0px -12% 0px' });
$$('[data-reveal]').forEach((el) => io.observe(el));

/* сигнатура: фото группы услуг следует за курсором */
const peek = $('.peek');
if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const peekImg = $('img', peek);
  let x = 0, y = 0, raf = 0, want = '';
  const place = () => {
    raf = 0;
    const w = peek.offsetWidth, h = peek.offsetHeight;
    const px = Math.min(x + 32, innerWidth - w - 16);
    const py = Math.max(16, Math.min(y - h / 2, innerHeight - h - 16));
    peek.style.translate = `${px}px ${py}px`;
  };
  $$('.svc-group').forEach((g) => {
    g.addEventListener('pointerenter', (e) => {
      const key = g.dataset.photoKey;
      if (!key) return;
      const src = imgSrc(key);
      x = e.clientX; y = e.clientY;
      if (!peek.classList.contains('is-on')) {
        peek.style.transition = 'none'; place(); peek.offsetWidth; peek.style.transition = '';
      }
      want = src;
      const probe = new Image();
      probe.onload = () => { if (want !== src) return; peekImg.src = src; peek.classList.add('is-on'); };
      probe.src = src; // битое фото не показываем вовсе
    });
    g.addEventListener('pointerleave', () => { want = ''; peek.classList.remove('is-on'); });
    g.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(place); });
  });
} else {
  peek.remove();
}
