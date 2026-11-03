'use strict';

/* =====================================================================
   1. ДАННЫЕ КЛИЕНТА. Под нового клиента меняется только этот блок.
   Всё, что здесь не указано, берётся из пресета ниже.
   ===================================================================== */
const CONFIG = {
  preset: 'auto',                 // 'auto' для автосервиса, 'fitness' для фитнес-клуба

  name: 'ГАРАЖ',
  city: 'Рудный',
  phone: '+7 700 000 00 00',
  whatsapp: '77000000000',        // только цифры, без +
  instagram: 'https://instagram.com/',
  gis: 'https://2gis.kz/rudnyy',
  address: 'ул. Ленина, 1',
  hours: 'Пн–Сб с 9:00 до 20:00',

  // colors: { bg: '#0f1011', ink: '#ecebe7', accent: '#f0b429', onAccent: '#0f1011', scheme: 'dark' },
  // photos: { hero: 'assets/hero.jpg', lead: 'assets/lead.jpg' },
  // services: [...], facts: [...], steps: [...]
};

/* =====================================================================
   2. ПРЕСЕТЫ НИШ
   ===================================================================== */
const PH = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const PRESETS = {
  auto: {
    kind: 'Автосервис',
    colors: { bg: '#0f1011', ink: '#ecebe7', accent: '#f0b429', onAccent: '#0f1011', scheme: 'dark' },
    heroTitle: ['Честный ремонт', 'без доплат потом'],
    heroLead: 'Диагностика, ТО, ходовая и шиномонтаж. Сначала называем цену и показываем неисправность, потом берём ключи.',
    heroCta: 'Рассчитать стоимость',
    heroHint: 'Цена фиксируется до начала работ',
    facts: [
      { v: '12 лет', t: 'ремонтируем машины в городе' },
      { v: '6 мес.', t: 'гарантия на работы и запчасти' },
      { v: '4.8', t: 'средняя оценка в 2ГИС' },
    ],
    pricesTitle: ['Цены', 'без звёздочек'],
    pricesLead: 'Отметьте нужные работы, сумма посчитается сразу. Точную цену мастер назовёт после осмотра, бесплатно.',
    calcCta: 'Записаться на ремонт',
    calcHint: 'Осмотр и смета бесплатно',
    services: [
      { cat: 'Диагностика и ТО', items: [
        { name: 'Компьютерная диагностика', price: 5000 },
        { name: 'Замена масла и фильтра', note: 'работа, без стоимости масла', price: 3000 },
        { name: 'Замена воздушного и салонного фильтров', price: 2000 },
        { name: 'Замена свечей зажигания', price: 4000, from: true },
      ]},
      { cat: 'Ходовая', items: [
        { name: 'Развал-схождение', price: 8000 },
        { name: 'Замена тормозных колодок', note: 'одна ось', price: 6000 },
        { name: 'Ремонт подвески', price: 10000, from: true },
      ]},
      { cat: 'Шиномонтаж', items: [
        { name: 'Сезонная переобувка R13–R16', price: 8000 },
        { name: 'Сезонная переобувка R17–R20', price: 12000 },
        { name: 'Хранение шин, сезон', price: 15000 },
      ]},
    ],
    stepsTitle: ['Как проходит', 'ремонт'],
    steps: [
      { t: 'Заявка', d: 'Оставляете номер, перезваниваем в течение 15 минут и подбираем время.' },
      { t: 'Осмотр', d: 'Смотрим машину при вас и показываем, что именно не так.' },
      { t: 'Смета', d: 'Называем окончательную цену. Без вашего согласия ничего не меняем.' },
      { t: 'Ремонт', d: 'Отдаём машину со старыми деталями и гарантией на 6 месяцев.' },
    ],
    leadTitle: ['Запишитесь', 'на осмотр'],
    leadLead: 'Перезвоним, уточним задачу и предложим ближайшее свободное окно.',
    extraLabel: 'Марка, модель и год',
    leadCta: 'Записаться на осмотр',
    leadHint: 'Перезвоним за 15 минут',
    contactsTitle: ['Приезжайте,', 'кофе за нами'],
    photos: { hero: PH('auto-hero', 1200, 1600), lead: PH('auto-lead', 1200, 1400) },
  },

  fitness: {
    kind: 'Фитнес-клуб',
    colors: { bg: '#0c0c0c', ink: '#f2f1ee', accent: '#ff5b23', onAccent: '#0c0c0c', scheme: 'dark' },
    heroTitle: ['Тело в форме', 'за 12 недель'],
    heroLead: 'Тренажёрный зал, групповые программы и тренеры, которые ведут вас по плану. Первая тренировка бесплатно.',
    heroCta: 'Подобрать абонемент',
    heroHint: 'Пробная тренировка бесплатно',
    facts: [
      { v: '800 м²', t: 'зал с новым оборудованием' },
      { v: '14', t: 'групповых программ в неделю' },
      { v: '6:30', t: 'открываемся до работы' },
    ],
    pricesTitle: ['Абонементы', 'и тренировки'],
    pricesLead: 'Отметьте, что вам интересно, сумма посчитается сразу. Заморозка абонемента до 14 дней бесплатно.',
    calcCta: 'Оставить заявку',
    calcHint: 'Без вступительного взноса',
    services: [
      { cat: 'Абонементы', items: [
        { name: 'Безлимит на месяц', price: 15000 },
        { name: 'Безлимит на 3 месяца', price: 39000 },
        { name: '8 посещений', note: 'действует месяц', price: 10000 },
        { name: 'Дневной безлимит', note: 'до 16:00', price: 11000 },
      ]},
      { cat: 'С тренером', items: [
        { name: 'Персональная тренировка', price: 6000 },
        { name: '10 персональных тренировок', price: 50000 },
        { name: 'Составление программы', price: 8000 },
      ]},
      { cat: 'Дополнительно', items: [
        { name: 'Пробная тренировка', price: 0 },
        { name: 'Аренда шкафчика, месяц', price: 2000 },
      ]},
    ],
    stepsTitle: ['С чего', 'начать'],
    steps: [
      { t: 'Заявка', d: 'Оставляете номер, администратор перезванивает и записывает на пробную.' },
      { t: 'Пробная', d: 'Тренер показывает зал, проверяет технику и спрашивает о цели.' },
      { t: 'План', d: 'Получаете программу на 12 недель и абонемент, который подходит.' },
      { t: 'Контроль', d: 'Каждые 4 недели замеры и корректировка нагрузки.' },
    ],
    leadTitle: ['Запишитесь', 'на пробную'],
    leadLead: 'Перезвоним, ответим на вопросы и подберём удобное время.',
    extraLabel: 'Ваша цель',
    leadCta: 'Записаться на пробную',
    leadHint: 'Ничего не нужно оплачивать',
    contactsTitle: ['Ждём вас', 'в зале'],
    photos: { hero: PH('gym-hero', 1200, 1600), lead: PH('gym-lead', 1200, 1400) },
  },
};

/* =====================================================================
   3. ДВИЖОК. Ниже ничего менять не нужно.
   ===================================================================== */
const P = PRESETS[CONFIG.preset] || PRESETS.auto;
const S = {
  ...P, ...CONFIG,
  colors: { ...P.colors, ...(CONFIG.colors || {}) },
  photos: { ...P.photos, ...(CONFIG.photos || {}) },
};
S.footer = S.footer || `${S.kind}, ${S.city}, ${new Date().getFullYear()}`;

const $  = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SHORT = /(^|[\s(])(в|во|на|с|со|к|ко|у|о|об|и|а|но|из|за|по|до|от|не|для|без)\s+/giu;
const nb = (s) => String(s).replace(SHORT, '$1$2 ').replace(SHORT, '$1$2 ').replace(/(\d)\s+(?=[^\s\d])/g, '$1 ').replace(/(\S)–(\S)/g, '$1⁠–⁠$2');
const money = (n) => Math.round(n).toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₸';
const price = (it) => (it.price === 0 ? 'бесплатно' : (it.from ? 'от ' : '') + money(it.price));
const waLink = (text) => `https://wa.me/${S.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

/* цвета и мета */
const rs = document.documentElement.style;
rs.setProperty('--bg', S.colors.bg);
rs.setProperty('--ink', S.colors.ink);
rs.setProperty('--accent', S.colors.accent);
rs.setProperty('--on-accent', S.colors.onAccent);
rs.setProperty('color-scheme', S.colors.scheme);
document.title = `${S.name}, ${S.kind.toLowerCase()}, ${S.city}`;
$('meta[name="description"]').content = `${S.name}: ${S.heroLead}`;

/* подстановки */
$$('[data-bind]').forEach((el) => { const v = S[el.dataset.bind]; if (v != null) el.textContent = nb(v); });
$$('[data-lines]').forEach((el) => { el.innerHTML = (S[el.dataset.lines] || []).map((l) => esc(nb(l))).join('<br>'); });
$$('[data-photo]').forEach((el) => { el.src = S.photos[el.dataset.photo]; });
const HREF = { tel: 'tel:' + S.phone.replace(/[^\d+]/g, ''), wa: waLink(), gis: S.gis, instagram: S.instagram };
$$('[data-href]').forEach((el) => { const v = HREF[el.dataset.href]; if (v) el.href = v; else el.remove(); });

/* факты */
$('[data-list="facts"]').innerHTML = S.facts.map((f, i) =>
  `<div class="fact rise" data-d="${i * 100}"><dt>${esc(nb(f.v))}</dt><dd>${esc(nb(f.t))}</dd></div>`).join('');

/* прайс */
const all = [];
$('[data-list="services"]').innerHTML = S.services.map((g, gi) => `
  <div class="price-group rise" data-d="${gi * 100}">
    <h3>${esc(nb(g.cat))}</h3>
    ${g.items.map((it) => { all.push(it); const id = all.length - 1; return `
    <label class="price-row">
      <input type="checkbox" value="${id}">
      <span class="check">${TICK}</span>
      <span>${esc(nb(it.name))}${it.note ? `<span class="price-row__note">${esc(nb(it.note))}</span>` : ''}</span>
      <span class="price-row__price">${price(it)}</span>
    </label>`; }).join('')}
  </div>`).join('');

/* шаги */
$('[data-list="steps"]').innerHTML = S.steps.map((s, i) => `
  <li class="step rise" data-d="${i * 50}">
    <span class="step__n">${String(i + 1).padStart(2, '0')}</span>
    <h3>${esc(nb(s.t))}</h3>
    <p>${esc(nb(s.d))}</p>
  </li>`).join('');

/* сигнатура: калькулятор, сумма докручивается к новому значению */
const out = $('.calc__sum');
const pickedText = $('.calc__picked');
const formPicked = $('.form__picked');
let shown = 0, anim = 0;
const picked = () => $$('.price-row input:checked').map((i) => all[+i.value]);
const tween = (to) => {
  cancelAnimationFrame(anim);
  if (reduce) { shown = to; out.textContent = money(to); return; }
  const from = shown, t0 = performance.now(), dur = 700;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - k, 4);
    shown = from + (to - from) * e;
    out.textContent = money(shown);
    if (k < 1) anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
};
const recalc = () => {
  const list = picked();
  const sum = list.reduce((a, it) => a + it.price, 0);
  const hasFrom = list.some((it) => it.from);
  tween(sum);
  out.dataset.from = hasFrom ? '1' : '';
  pickedText.textContent = list.length ? nb(`${list.length} в расчёте${hasFrom ? ', часть цен минимальные' : ''}`) : nb('Отметьте услуги в списке');
  formPicked.textContent = list.length ? nb('В заявке: ' + list.map((it) => it.name).join(', ')) : '';
};
document.addEventListener('change', (e) => { if (e.target.closest('.price-row')) recalc(); });

/* заявка */
const form = $('#lead-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = form.elements;
  const bad = ['name', 'phone'].filter((k) => !f[k].value.trim());
  $$('.field', form).forEach((el) => el.classList.toggle('is-bad', bad.some((k) => el.contains(f[k]))));
  $('.form__error', form).hidden = !bad.length;
  if (bad.length) { f[bad[0]].focus(); return; }
  const list = picked();
  const sum = list.reduce((a, it) => a + it.price, 0);
  window.open(waLink([
    `Здравствуйте! Заявка с сайта ${S.name}.`,
    `Имя: ${f.name.value.trim()}`,
    `Телефон: ${f.phone.value.trim()}`,
    f.extra.value.trim() ? `${S.extraLabel}: ${f.extra.value.trim()}` : '',
    list.length ? `Услуги: ${list.map((it) => it.name).join(', ')}` : '',
    list.length ? `Предварительно: ${list.some((it) => it.from) ? 'от ' : ''}${money(sum).replace(/ /g, ' ')}` : '',
  ].filter(Boolean).join('\n')), '_blank', 'noopener');
});

/* появление */
$$('[data-d]').forEach((el) => el.style.setProperty('--d', el.dataset.d + 'ms'));
requestAnimationFrame(() => requestAnimationFrame(() => $$('[data-reveal-now]').forEach((el) => el.classList.add('is-in'))));
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
}), { rootMargin: '0px 0px -10% 0px' });
$$('[data-reveal]').forEach((el) => io.observe(el));
