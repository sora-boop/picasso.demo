'use strict';

/* =====================================================================
   1. ДАННЫЕ КЛИЕНТА. Под нового клиента меняется только этот блок.
   QR на столе ведёт на адрес сайта с ?table=N, например
   https://site.kz/?table=5. Страница сразу откроется на меню,
   а в «Моём выборе» будет номер стола.
   ===================================================================== */
const CONFIG = {
  name: 'FUMARI',
  kind: 'Кальянная',
  city: 'Рудный',
  phone: '+7 700 000 00 00',
  whatsapp: '77000000000',          // только цифры, без +
  instagram: 'https://instagram.com/',
  gis: 'https://2gis.kz/rudnyy',
  address: 'ул. Ленина, 1',
  hours: 'Ежедневно с 14:00 до 02:00',
  slots: { from: 14, to: 25, step: 30 }, // 25 = 01:00 следующего дня

  colors: { bg: '#0f0d0b', ink: '#f0e9de', accent: '#d9622b', onAccent: '#0f0d0b', scheme: 'dark' },

  heroTitle: ['Долгие вечера', 'и густой дым'],
  heroLead: 'Авторские кальяны, китайский чай и кухня до последнего гостя. Меню открывается прямо с этой страницы.',
  heroHint: 'Кухня работает до 01:00',
  menuLead: 'Отмечайте позиции плюсом и покажите выбор официанту. Цены указаны в тенге.',
  reserveTitle: ['Забронируйте стол', 'на сегодня'],
  reserveLead: 'Пятница и суббота расписаны заранее. Оставьте заявку, администратор подтвердит стол в WhatsApp.',
  contactsTitle: ['Где нас', 'найти'],

  // Фото: положите файлы в assets/ и замените пути.
  photos: {
    hero:  'https://picsum.photos/seed/lounge-hero/2000/1300',
    mood1: 'https://picsum.photos/seed/lounge-m1/1400/1000',
    mood2: 'https://picsum.photos/seed/lounge-m2/900/1200',
    mood3: 'https://picsum.photos/seed/lounge-m3/1200/1200',
  },

  /* Меню. photo у позиции не обязателен. tag: 'хит', 'новинка', 'острое'. */
  menu: [
    { cat: 'Кальяны', note: 'Время курения около 1,5 часа. Замена чаши 3 000 ₸.', items: [
      { name: 'Классический', desc: 'Один или два вкуса на выбор, табак средней крепости', price: 6000, tag: 'хит' },
      { name: 'Премиум', desc: 'Табак Tangiers или Darkside, крепость под вас', price: 8000 },
      { name: 'На грейпфруте', desc: 'Чаша из свежего фрукта', price: 9000, photo: 'https://picsum.photos/seed/menu-h3/300/300' },
      { name: 'Безникотиновый', desc: 'Паста на основе чайного листа', price: 6500 },
    ]},
    { cat: 'Чай', note: 'Чайники на 800 мл, заварим повторно бесплатно.', items: [
      { name: 'Да Хун Пао', desc: 'Утёсный улун, тёплый и обволакивающий', meta: '800 мл', price: 3500 },
      { name: 'Молочный улун', meta: '800 мл', price: 3000 },
      { name: 'Облепиховый', desc: 'Облепиха, мёд, апельсин', meta: '800 мл', price: 2800, tag: 'хит' },
      { name: 'Шу пуэр', meta: '800 мл', price: 3200 },
    ]},
    { cat: 'Лимонады', items: [
      { name: 'Маракуйя и базилик', meta: '1 л', price: 3200, tag: 'новинка' },
      { name: 'Клубника и мята', meta: '1 л', price: 3000 },
      { name: 'Тархун', meta: '1 л', price: 2800 },
    ]},
    { cat: 'Кухня', items: [
      { name: 'Цезарь с курицей', desc: 'Романо, пармезан, гренки, соус на анчоусах', meta: '280 г', price: 3200, photo: 'https://picsum.photos/seed/menu-k1/300/300' },
      { name: 'Паста карбонара', meta: '320 г', price: 3400 },
      { name: 'Бургер с говядиной', desc: 'Котлета 180 г, чеддер, картофель фри', meta: '420 г', price: 3600, photo: 'https://picsum.photos/seed/menu-k3/300/300' },
      { name: 'Крылья баффало', desc: 'Сельдерей и соус блю чиз', meta: '350 г', price: 3300, tag: 'острое' },
      { name: 'Сырные палочки', meta: '200 г', price: 1900 },
    ]},
    { cat: 'Десерты', items: [
      { name: 'Чизкейк Нью-Йорк', meta: '140 г', price: 1800 },
      { name: 'Фондан с мороженым', meta: '160 г', price: 2100 },
    ]},
  ],
};

/* =====================================================================
   2. ДВИЖОК. Ниже ничего менять не нужно.
   ===================================================================== */
const S = CONFIG;
S.footer = S.footer || `${S.kind}, ${S.city}, ${new Date().getFullYear()}`;

const $  = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SHORT = /(^|[\s(])(в|во|на|с|со|к|ко|у|о|об|и|а|но|из|за|по|до|от|не|для|без)\s+/giu;
const nb = (s) => String(s).replace(SHORT, '$1$2 ').replace(SHORT, '$1$2 ').replace(/(\d)\s+(?=[^\s\d])/g, '$1 ');
const money = (n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₸';
const waLink = (text) => `https://wa.me/${S.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PLUS  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const MINUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>';

/* цвета и мета */
const rs = document.documentElement.style;
rs.setProperty('--bg', S.colors.bg);
rs.setProperty('--ink', S.colors.ink);
rs.setProperty('--accent', S.colors.accent);
rs.setProperty('--on-accent', S.colors.onAccent);
rs.setProperty('color-scheme', S.colors.scheme);
document.title = `${S.name}, меню`;
$('meta[name="description"]').content = `${S.name}: ${S.heroLead}`;

/* подстановки */
$$('[data-bind]').forEach((el) => { const v = S[el.dataset.bind]; if (v != null) el.textContent = nb(v); });
$$('[data-lines]').forEach((el) => { el.innerHTML = (S[el.dataset.lines] || []).map((l) => esc(nb(l))).join('<br>'); });
$$('[data-photo]').forEach((el) => { el.src = S.photos[el.dataset.photo]; });
const HREF = { tel: 'tel:' + S.phone.replace(/[^\d+]/g, ''), wa: waLink(), gis: S.gis, instagram: S.instagram };
$$('[data-href]').forEach((el) => { const v = HREF[el.dataset.href]; if (v) el.href = v; else el.remove(); });

/* номер стола из QR */
const table = new URLSearchParams(location.search).get('table');
if (table) $$('.table-tag').forEach((el) => { el.textContent = `Стол ${table}`; el.hidden = false; });

/* меню */
const items = {};
S.menu.forEach((c, ci) => c.items.forEach((it, ii) => { it.id = `${ci}-${ii}`; items[it.id] = it; }));

$('[data-list="tabs"]').innerHTML = S.menu.map((c, ci) =>
  `<button class="tab" type="button" role="tab" aria-selected="${ci === 0}" data-target="cat-${ci}">${esc(c.cat)}</button>`).join('');

$('[data-list="menu"]').innerHTML = S.menu.map((c, ci) => `
  <section class="cat" id="cat-${ci}" data-reveal aria-labelledby="cat-${ci}-t">
    <div class="cat__head">
      <h3 class="rise" id="cat-${ci}-t">${esc(nb(c.cat))}</h3>
      ${c.note ? `<p class="cat__note rise d-100">${esc(nb(c.note))}</p>` : ''}
    </div>
    <ul class="dishes">
      ${c.items.map((it, ii) => `
      <li class="dish rise${it.photo ? ' dish--photo' : ''}" data-d="${Math.min(ii, 8) * 50}">
        ${it.photo ? `<img class="dish__img" src="${esc(it.photo)}" alt="" loading="lazy">` : ''}
        <div>
          <div class="dish__name">${esc(nb(it.name))}${it.tag ? `<span class="dish__tag">${esc(it.tag)}</span>` : ''}</div>
          ${it.desc ? `<p class="dish__desc">${esc(nb(it.desc))}</p>` : ''}
          ${it.meta ? `<span class="dish__meta">${esc(nb(it.meta))}</span>` : ''}
        </div>
        <div class="dish__side">
          <span class="dish__price">${money(it.price)}</span>
          <span class="qty" data-id="${it.id}">
            <button class="qty__minus" type="button" aria-label="Убрать: ${esc(it.name)}">${MINUS}</button>
            <span class="qty__n" aria-live="polite"></span>
            <button class="qty__plus" type="button" aria-label="Добавить: ${esc(it.name)}">${PLUS}</button>
          </span>
        </div>
      </li>`).join('')}
    </ul>
  </section>`).join('');

/* табы: клик, активная категория, скользящая полоса */
const track = $('.tabs__track');
const bar = $('.tabs__bar');
const tabs = $$('.tab');
const cats = $$('.cat');
let active = -1;

const moveBar = () => {
  const t = tabs[active];
  if (!t) return;
  bar.style.transform = `translateX(${t.offsetLeft - track.scrollLeft}px) scaleX(${t.offsetWidth})`;
};
const setActive = (i) => {
  if (i === active) return;
  active = i;
  tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
  const t = tabs[i];
  const want = t.offsetLeft - (track.clientWidth - t.offsetWidth) / 2;
  track.scrollTo({ left: want, behavior: reduce ? 'auto' : 'smooth' });
  moveBar();
};
const syncActive = () => {
  const line = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tabs-h')) + 80;
  let i = 0;
  cats.forEach((c, k) => { if (c.getBoundingClientRect().top <= line) i = k; });
  setActive(i);
};
tabs.forEach((t, i) => t.addEventListener('click', () => {
  cats[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}));
track.addEventListener('scroll', moveBar, { passive: true });
addEventListener('scroll', () => requestAnimationFrame(syncActive), { passive: true });
addEventListener('resize', moveBar);
document.fonts.ready.then(() => { active = -1; syncActive(); });

/* «Мой выбор» */
const KEY = `menu:${S.name}`;
let pick = {};
try { pick = JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (e) { pick = {}; }
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(pick)); } catch (e) { /* приватный режим */ } };
const plural = (n, a, b, c) => (n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c);

const tray = $('.tray');
const sheet = $('.sheet');
const render = () => {
  let count = 0, sum = 0;
  $$('.qty').forEach((q) => {
    const n = pick[q.dataset.id] || 0;
    q.classList.toggle('has', n > 0);
    $('.qty__n', q).textContent = n || '';
  });
  const rows = Object.entries(pick).filter(([id, n]) => n > 0 && items[id]);
  rows.forEach(([id, n]) => { count += n; sum += n * items[id].price; });
  tray.hidden = count === 0;
  $('.tray__count').textContent = `${count} ${plural(count, 'позиция', 'позиции', 'позиций')}`;
  $('.tray__sum').textContent = money(sum);
  $('.sheet__list').innerHTML = rows.map(([id, n]) =>
    `<li><span><b>${n}&times;</b>${esc(items[id].name)}</span><span>${money(n * items[id].price)}</span></li>`).join('');
  $('.sheet__sum').textContent = money(sum);
  if (!count && sheet.open) sheet.close();
};
document.addEventListener('click', (e) => {
  const b = e.target.closest('.qty button');
  if (!b) return;
  const id = b.parentElement.dataset.id;
  pick[id] = Math.max(0, (pick[id] || 0) + (b.classList.contains('qty__plus') ? 1 : -1));
  if (!pick[id]) delete pick[id];
  save(); render();
});
$('.tray__open').addEventListener('click', () => sheet.showModal());
$('[data-close]', sheet).addEventListener('click', () => sheet.close());
$('[data-clear]', sheet).addEventListener('click', () => { pick = {}; save(); render(); });
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
render();

/* бронь */
const opt = (v, t = v) => `<option value="${esc(v)}">${esc(t)}</option>`;
const slots = [];
for (let t = S.slots.from * 60; t < S.slots.to * 60; t += S.slots.step) {
  slots.push(`${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
}
$('[data-options="slots"]').innerHTML = slots.map((s) => opt(s)).join('');
$('[data-options="guests"]').innerHTML = [1, 2, 3, 4, 5, 6, 8, 10].map((n) => opt(n, `${n} ${plural(n, 'гость', 'гостя', 'гостей')}`)).join('');
const form = $('#reserve-form');
form.elements.guests.value = '2';
const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
form.elements.date.min = today;
form.elements.date.value = today;
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = form.elements;
  const bad = ['name', 'phone', 'date'].filter((k) => !f[k].value.trim());
  $$('.field', form).forEach((el) => el.classList.toggle('is-bad', bad.some((k) => el.contains(f[k]))));
  $('.form__error', form).hidden = !bad.length;
  if (bad.length) { f[bad[0]].focus(); return; }
  const date = new Date(f.date.value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' });
  window.open(waLink([
    `Здравствуйте! Хочу забронировать стол в ${S.name}.`,
    `Когда: ${date}, ${f.time.value}`,
    `Гостей: ${f.guests.value}`,
    `Имя: ${f.name.value.trim()}`,
    `Телефон: ${f.phone.value.trim()}`,
  ].join('\n')), '_blank', 'noopener');
});

/* появление */
$$('[data-d]').forEach((el) => el.style.setProperty('--d', el.dataset.d + 'ms'));
requestAnimationFrame(() => requestAnimationFrame(() => $$('[data-reveal-now]').forEach((el) => el.classList.add('is-in'))));
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
}), { rootMargin: '0px 0px -10% 0px' });
$$('[data-reveal]').forEach((el) => io.observe(el));

/* гость пришёл по QR: сразу к меню */
if (table && !location.hash) {
  requestAnimationFrame(() => $('#menu').scrollIntoView({ behavior: 'auto' }));
}
