/* =====================================================================
   ИЛЬЯ, портфолио.
   Анимации: GSAP + ScrollTrigger, плавный скролл: Lenis, 3D: studio.js.
   Если библиотеки или WebGL недоступны, сайт остаётся рабочим.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. ДАННЫЕ
   --------------------------------------------------------------------- */
const ME = { whatsapp: '77057266334', telegram: 'pharmacyonhome' };

const WORKS = [
  { name: 'ҚАЙРАҚ', meta: 'Барбершоп / Рудный / концепт', img: 'assets/works/kairak-hero-desk.jpg',
    d: '3D-бритва раскрывается и складывается при скролле. Прайс с записью в один клик и онлайн-запись к мастеру через WhatsApp.',
    tags: ['3D', 'Three.js', 'Запись онлайн'], url: 'https://claude.ai/artifact/9sYkTim85oLc2P84thS9Ts' },
  { name: 'Tobyl Coffee', meta: 'Кофейня / Костанай / концепт', img: 'assets/works/tobyl-hero-desk.jpg',
    d: 'Бумажный стакан растворяется, а в прозрачном собирается айс-латте: лёд, молоко, эспрессо. Меню с корзиной и заказ навынос.',
    tags: ['3D', 'Меню и корзина', 'Заказ навынос'], url: 'https://claude.ai/artifact/JsNQnq3R5jACb9dfAZfBJC' },
  { name: 'Шаңырақ', meta: 'Ресторан казахской кухни / концепт', img: 'assets/works/shanyraq-glow-desk.jpg',
    d: 'Юрта собирается на скролле от шаңырақа до войлока. В меню блюдо видно сквозь шаңырақ, бронь стола и банкетов.',
    tags: ['3D', 'Бронь столов', 'Банкеты'], url: 'https://claude.ai/artifact/27nk9rXHgBoAyRY6PbLo3G' },
  { name: 'Ақ Тіс Clinic', meta: 'Стоматология / Костанай / концепт', img: 'assets/works/aktis-hero-desk.jpg',
    d: 'Под курсором зуб просвечивается рентгеном. На скролле сканер находит кариес, пломба твердеет под лампой, вкручивается имплант.',
    tags: ['3D', 'Рентген под курсором', 'Запись к врачу'], url: 'https://claude.ai/artifact/VS7sfS2c8Efv7HTLoguEvJ' },
  { name: 'TORQUE 52', meta: 'Автосервис / Рудный / концепт', img: 'assets/works/torque-hero-desk.jpg',
    d: 'Тормозной узел крутится от скролла и раскаляется, если листать быстро. Потом разбирается по винтику с ценой каждой детали.',
    tags: ['3D', 'Калькулятор ремонта', 'Запись'], url: 'https://claude.ai/artifact/3DTwwoFgYSKrRnNbac27Xg' },
  { name: 'Pulse Arena', meta: 'Фитнес-клуб / Костанай / концепт', img: 'assets/works/pulse-hero-desk.jpg',
    d: 'Гиря в облаке частиц, которое бьётся в ритме сердца, и живая ЭКГ. На скролле четыре зоны пульса, расписание и запись на пробную.',
    tags: ['3D', 'Расписание', 'Пробная тренировка'], url: 'https://claude.ai/artifact/X5RTX6m4Q3CvjxUSNHSuX6' },
];

const MORE = [
  { name: 'Picasso', niche: 'Стоматология', city: 'Рудный', url: 'https://claude.ai/artifact/15kZKXwZHyX1qtpFpQwC9o' },
  { name: 'Barber Room', niche: 'Шаблон для барбершопов и салонов', city: 'Казахстан', url: 'https://claude.ai/artifact/Fc13geJN5BaRokCebDvZuf' },
  { name: 'Soprano Barbershop', niche: 'Барбершоп', city: 'Рудный', url: 'https://claude.ai/artifact/8CTeCKfzyGoA2sVEQXhned' },
  { name: 'NRD Clinic', niche: 'Детская стоматология', city: 'Астана', url: 'https://claude.ai/artifact/5biNjpER24VseRpZBusHyT' },
  { name: 'Династия', niche: 'Семейная стоматология', city: 'Алматы', url: 'https://claude.ai/artifact/62sW9RHHtvy8DZiKnxcvHT' },
  { name: 'English NU school', niche: 'Школа английского', city: 'Костанай', url: 'https://claude.ai/artifact/AjphzRTK59ivr7FnFmSrkV' },
  { name: 'AutoBaza', niche: 'Запчасти для иномарок', city: 'Рудный', url: 'https://claude.ai/artifact/B6cy2Dga8v8x9b4PJs51yG' },
  { name: 'Rise Clothes', niche: 'Каталог одежды под предзаказ', city: 'Казахстан', url: 'https://claude.ai/artifact/QhKiz3uhUywXAGbjDJSpF9' },
  { name: 'Beer & Burger', niche: 'Бургерная', city: 'Демо', url: 'https://claude.ai/artifact/YEwDTMM3uGqARRWt7BZqTh' },
];

const PROCESS = [
  { t: 'Структура', time: 'день 1', d: 'Разбираю ваш бизнес и конкурентов. Собираю каркас: какие блоки, в каком порядке и что должен сделать посетитель.' },
  { t: 'Дизайн', time: 'дни 1–2', d: 'Шрифты, цвета и фото по смыслу. Показываю первый экран, и только после вашего «да» рисую остальное.' },
  { t: 'Код', time: 'дни 2–4', d: 'Пишу код сам, без конструкторов. 3D, анимации, запись и заказы в WhatsApp, быстрая загрузка на телефоне.' },
  { t: 'Запуск', time: 'день 5', d: 'Домен, хостинг, карточка в 2ГИС и Google. Код и доступы передаю вам полностью.' },
];

const PILLARS = [
  { t: 'Под вашу нишу', d: 'Рисую с нуля под бизнес и город. Никаких шаблонов, которые уже стоят у соседей.' },
  { t: 'Сначала телефон', d: 'Почти все клиенты приходят с телефона, поэтому проверяю сайт в первую очередь на нём.' },
  { t: 'Заявки в WhatsApp', d: 'Запись, заказ и бронь приходят готовым сообщением, без CRM и лишних кабинетов.' },
  { t: 'Всё ваше', d: 'Код, домен и доступы оформляю на вас. Никакой привязки к подписке.' },
];

const PRICES = [
  { t: 'Лендинг', cost: 'от 20 000 ₸', time: '4–5 дней', d: 'Одна страница, которая ведёт к заявке: услуги, цены, отзывы и запись в WhatsApp.' },
  { t: 'Сайт для бизнеса', cost: 'от 35 000 ₸', time: '4–5 дней', d: 'Несколько разделов, меню или каталог, онлайн-запись, карточки мастеров и врачей.' },
  { t: 'Сайт с 3D', cost: 'от 45 000 ₸', time: '4–5 дней', d: 'Ваш продукт в 3D и анимации на скролле, как в работах выше. Запоминается с первого экрана.', acc: true },
  { t: 'Поддержка', cost: 'договоримся', time: 'после запуска', d: 'Правки, новые цены и акции, помощь с хостингом.' },
];

const CALC = {
  type: [
    { v: 'Лендинг', price: 20000 },
    { v: 'Сайт для бизнеса', price: 35000 },
    { v: 'Сайт с 3D', price: 45000 },
  ],
  extras: [
    { v: 'Онлайн-запись' },
    { v: 'Меню или каталог с корзиной' },
    { v: 'Казахская версия' },
    { v: 'Анимации на скролле', no3d: true },
    { v: 'Тексты под ключ' },
    { v: 'Подбор фото' },
  ],
  speed: [
    { v: 'Обычные', days: [4, 5], k: 1, note: '4–5 дней' },
    { v: 'Срочно', days: [2, 3], k: 1.2, note: '2–3 дня, +20%' },
  ],
};

const FAQ = [
  { q: 'Сколько стоит сайт?', a: 'Лендинг от 20 000 ₸, сайт для бизнеса от 35 000 ₸, сайт с 3D от 45 000 ₸. Примерную цену можно посчитать в калькуляторе выше, точную назову после короткого разговора.' },
  { q: 'Сколько времени займёт работа?', a: 'Обычно 4–5 дней, срочно 2–3 дня с наценкой 20%. Срок фиксирую в начале, и на каждом этапе вы видите результат.' },
  { q: 'У меня нет текстов и фото. Это проблема?', a: 'Нет. Напишу тексты по вашим ответам и подберу фото по смыслу. Если есть свои снимки, используем их: живые фото работают лучше стоковых.' },
  { q: 'Сайт будет нормально работать на телефоне?', a: 'Да. Почти все ваши клиенты придут с телефона, поэтому проверяю сайт в первую очередь на iPhone и Android.' },
  { q: 'Кто занимается доменом и хостингом?', a: 'Я. Помогу купить домен, настрою хостинг и оформлю всё на вас, чтобы сайт принадлежал вам, а не подрядчику.' },
  { q: 'Работаете с другими городами?', a: 'Да, по всему Казахстану. Общаемся в WhatsApp или Telegram, если удобнее — созвонимся по телефону.' },
];

const NICHES = ['Салон или барбершоп', 'Кафе или ресторан', 'Медицина', 'Автосервис', 'Обучение', 'Магазин', 'Другое'];

/* ---------------------------------------------------------------------
   2. УТИЛИТЫ
   --------------------------------------------------------------------- */
const $  = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SHORT = /(^|[\s(])(в|во|на|с|со|к|ко|у|о|об|и|а|но|из|за|по|до|от|не|для|без|при|как|что)\s+/giu;
const nb = (s) => String(s).replace(SHORT, '$1$2 ').replace(SHORT, '$1$2 ').replace(/(\d)\s+(?=[^\s\d])/g, '$1 ');
const money = (n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ');
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (t) => t * t * (3 - 2 * t);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
// телефон или планшет вертикально: одна колонка, 3D по центру, работы списком
const MOBILE_Q = '(max-width: 760px), (max-width: 1100px) and (orientation: portrait)';
const isMobile = () => matchMedia(MOBILE_Q).matches;
// ровно противоположное условие: закреплённые работы с 3D-экраном
const DESK_Q = '(min-width: 1101px), (min-width: 761px) and (orientation: landscape)';
const pad2 = (n) => String(n).padStart(2, '0');
const ARROW = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';
const PLUS = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

/* ---------------------------------------------------------------------
   3. РАЗМЕТКА ИЗ ДАННЫХ
   --------------------------------------------------------------------- */
document.documentElement.style.setProperty('--n', WORKS.length);
$('.works__total').textContent = pad2(WORKS.length);

$('[data-list="process"]').innerHTML = PROCESS.map((s, i) => `
  <li class="pstep">
    <span class="pstep__n" aria-hidden="true">${pad2(i + 1)}</span>
    <h3>${esc(s.t)}</h3>
    <span class="pstep__time">${esc(nb(s.time))}</span>
    <p>${esc(nb(s.d))}</p>
  </li>`).join('');
$('[data-list="process-labels"]').innerHTML = PROCESS.map((s, i) => `<span${i ? '' : ' class="is-on"'}>${esc(s.t)}</span>`).join('');

$('[data-list="works"]').innerHTML = WORKS.map((w, i) => `
  <article class="work">
    <div class="work__img"><img src="${esc(w.img)}" alt="Первый экран сайта ${esc(w.name)}" loading="lazy"></div>
    <span class="work__meta">${pad2(i + 1)} / ${esc(nb(w.meta))}</span>
    <h3>${esc(w.name)}</h3>
    <p>${esc(nb(w.d))}</p>
    <div class="tags">${w.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    <div class="cta-row">
      <a class="btn btn--line btn--sm magnetic" href="${esc(w.url)}" target="_blank" rel="noopener" data-cursor="Открыть">
        <span class="btn__fill" aria-hidden="true"></span><span class="btn__label">Открыть сайт</span>${ARROW}
      </a>
    </div>
  </article>`).join('');
$('[data-list="works-labels"]').innerHTML = WORKS.map((w, i) => `<span${i ? '' : ' class="is-on"'}>${esc(w.name)}</span>`).join('');

$('[data-list="more"]').innerHTML = MORE.map((m) => `
  <li><a class="more__row" href="${esc(m.url)}" target="_blank" rel="noopener" data-cursor="Открыть">
    <span class="more__name">${esc(m.name)}<span class="more__niche">${esc(nb(m.niche))}</span></span>
    <span class="more__city">${esc(m.city)}</span>
    <span class="more__go" aria-hidden="true">${ARROW}</span>
  </a></li>`).join('');

$('[data-list="pillars"]').innerHTML = PILLARS.map((p, i) => `
  <li class="pillar" data-fade>
    <span class="pillar__n">${pad2(i + 1)}</span>
    <h3>${esc(nb(p.t))}</h3>
    <p>${esc(nb(p.d))}</p>
  </li>`).join('');

$('[data-list="prices"]').innerHTML = PRICES.map((p) => `
  <div class="price" data-fade>
    <h3>${esc(p.t)}</h3>
    <span class="price__cost${p.acc ? ' price__cost--acc' : ''}">${esc(nb(p.cost))}</span>
    <p class="price__note">${esc(nb(p.d))}</p>
    <span class="price__time">${esc(nb(p.time))}</span>
  </div>`).join('');

$('[data-list="faq"]').innerHTML = FAQ.map((f, i) => `
  <div class="qa">
    <button class="qa__q" type="button" aria-expanded="false" aria-controls="qa-${i}">${esc(nb(f.q))}<span class="qa__icon" aria-hidden="true">${PLUS}</span></button>
    <div class="qa__a" id="qa-${i}" role="region"><div><p>${esc(nb(f.a))}</p></div></div>
  </div>`).join('');
$('.faq__list').addEventListener('click', (e) => {
  const b = e.target.closest('.qa__q');
  if (!b) return;
  const qa = b.parentElement;
  const open = !qa.classList.contains('is-open');
  qa.classList.toggle('is-open', open);
  b.setAttribute('aria-expanded', String(open));
});

/* ---------------------------------------------------------------------
   4. КАЛЬКУЛЯТОР
   --------------------------------------------------------------------- */
const calc = { type: 0, extras: new Set(), speed: 0 };
const chip = (v, i, extra = '') => `<button class="chip" type="button" data-i="${i}" aria-pressed="false">${esc(v)}${extra}</button>`;
const boxType = $('[data-chips="type"]'), boxExtras = $('[data-chips="extras"]'), boxSpeed = $('[data-chips="speed"]');
boxType.innerHTML = CALC.type.map((t, i) => chip(t.v, i, `<small>${money(t.price)} ₸</small>`)).join('');
boxExtras.innerHTML = CALC.extras.map((t, i) => chip(t.v, i)).join('');
boxSpeed.innerHTML = CALC.speed.map((t, i) => chip(t.v, i, t.note ? `<small>${t.note}</small>` : '')).join('');
const numEl = $('.calc__num');
let shownPrice = CALC.type[0].price;
function calcTotal() {
  // допы на цену не влияют: их обсуждаем в переписке
  const sp = CALC.speed[calc.speed];
  const price = Math.round((CALC.type[calc.type].price * sp.k) / 500) * 500; // срочно +20%
  const [d0, d1] = sp.days;
  return { price, d0, d1 };
}
function renderCalc() {
  const pressSet = (box, fn) => $$('.chip', box).forEach((c) => c.setAttribute('aria-pressed', String(fn(Number(c.dataset.i)))));
  pressSet(boxType, (i) => i === calc.type);
  pressSet(boxExtras, (i) => calc.extras.has(i));
  pressSet(boxSpeed, (i) => i === calc.speed);
  // в сайте с 3D анимации уже включены
  $$('.chip', boxExtras).forEach((c) => { const e = CALC.extras[Number(c.dataset.i)]; c.hidden = !!(e.no3d && calc.type === 2); });
  const { price, d0, d1 } = calcTotal();
  $('.calc__time').textContent = `Срок ${d0}–${d1} ${d1 < 5 ? 'дня' : 'дней'}. Допы обсудим в переписке`;
  const from = shownPrice;
  shownPrice = price;
  if (window.gsap && !reduce) {
    const o = { v: from };
    window.gsap.to(o, { v: price, duration: 0.9, ease: 'expo.out', onUpdate: () => { numEl.textContent = money(Math.round(o.v / 500) * 500); } });
  } else numEl.textContent = money(price);
}
boxType.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) { calc.type = Number(c.dataset.i); renderCalc(); } });
boxExtras.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (!c) return; const i = Number(c.dataset.i); calc.extras.has(i) ? calc.extras.delete(i) : calc.extras.add(i); renderCalc(); });
boxSpeed.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) { calc.speed = Number(c.dataset.i); renderCalc(); } });
$('#calc-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const { price, d0, d1 } = calcTotal();
  const extras = [...calc.extras].filter((i) => !(CALC.extras[i].no3d && calc.type === 2)).map((i) => CALC.extras[i].v);
  const text = [
    'Здравствуйте, Илья! Посчитал сайт на вашем калькуляторе:',
    `Тип: ${CALC.type[calc.type].v}`,
    `Добавить: ${extras.length ? extras.join(', ') : 'ничего'}`,
    `Сроки: ${CALC.speed[calc.speed].v.toLowerCase()}`,
    `Примерно: ${money(price).replace(/ /g, ' ')} ₸, ${d0}–${d1} ${d1 < 5 ? 'дня' : 'дней'}`,
  ].join('\n');
  window.open(`https://wa.me/${ME.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});
renderCalc();

/* ---------------------------------------------------------------------
   5. ЗАЯВКА
   --------------------------------------------------------------------- */
const form = $('#contact-form');
const boxNiche = $('[data-chips="niche"]');
let niche = '';
boxNiche.innerHTML = NICHES.map((n, i) => chip(n, i)).join('');
boxNiche.addEventListener('click', (e) => {
  const c = e.target.closest('.chip');
  if (!c) return;
  niche = NICHES[Number(c.dataset.i)];
  $$('.chip', boxNiche).forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
});
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
  const miss = [!okName && 'имя', !okPhone && 'телефон'].filter(Boolean);
  f.name.closest('.field').classList.toggle('is-bad', !okName);
  f.phone.closest('.field').classList.toggle('is-bad', !okPhone);
  if (miss.length) { err.hidden = false; err.textContent = nb(`Осталось указать: ${miss.join(' и ')}`); return; }
  err.hidden = true;
  const text = [
    'Здравствуйте, Илья! Хочу сайт.',
    niche && `Ниша: ${niche}`,
    f.about.value.trim() && `О бизнесе: ${f.about.value.trim()}`,
    `Имя: ${f.name.value.trim()}`,
    `Телефон: ${f.phone.value}`,
  ].filter(Boolean).join('\n');
  window.open(`https://wa.me/${ME.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

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
function splitWords(el) {
  const words = el.textContent.split(/ +/);
  el.innerHTML = words.map((w) => `<span class="word">${esc(w)}</span>`).join(' ');
  return $$('.word', el);
}
$$('[data-split], [data-reveal]').forEach(splitChars);
const manifestWords = splitWords($('[data-words]'));

/* ---------------------------------------------------------------------
   7. 3D-СЦЕНА
   --------------------------------------------------------------------- */
let studio = null;
const stage = $('.stage');
async function initStudio() {
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('no webgl');
    const mod = await import('./studio.js');
    await Promise.all([document.fonts.load('500 40px "Wix Madefor Display"'), document.fonts.load('400 20px "Wix Madefor Text"')]);
    studio = mod.createStudio(stage, { mobile: isMobile(), layerImage: 'assets/works/tobyl-hero-desk.jpg', works: WORKS.map((w) => w.img) });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
  }
}

const BASE = { x: 0, y: 0, z: 0, rx: 0.28, ry: -0.55, rz: 0, scale: 1, explode: 1, wire: 1, fill: 0, accent: 0, code: 0, screen: 0, grid: 1, idle: 1, alpha: 1 };
const S = (o) => ({ ...BASE, ...o });
function keyStates() {
  const m = isMobile();
  // на планшете вертикально экран шире телефона: объект растёт вместе с ним
  const f = m ? Math.min(1.6, Math.max(1, (innerWidth / innerHeight) / 0.46)) : 1;
  const pos = m ? { x: 0, y: innerHeight < 700 ? 0.02 : 0.22, scale: 0.4 * f } : { x: 1.6, y: 0.05, scale: 0.88 };
  const launch = { explode: 0, wire: 0, fill: 1, code: 0, screen: 1, rx: 0.1, ry: -0.24, idle: 0.3 };
  // позиции подобраны под 16:9; на экранах уже (iPad горизонтально, 4:3) сдвигаем и уменьшаем
  const d = m ? 1 : Math.min(1, (innerWidth / innerHeight) / 1.6);
  const fit = (states) => (m ? states : Object.fromEntries(Object.entries(states).map(([k, o]) => [k, { ...o, x: o.x * d, scale: o.scale * d }])));
  return fit({
    intro: S(m ? { y: -3.4, scale: 0.4 * f, rx: 0.9, grid: 0 } : { x: 1.5, y: -4, scale: 0.9, rx: 0.9, grid: 0 }),
    hero: S(m ? { x: 0, y: 0.6, scale: 0.4 * f, accent: 1 } : { x: 1.85, y: -0.3, scale: 0.86, accent: 1 }),
    p0: S({ ...pos }),
    p1: S({ ...pos, fill: 1, wire: 0.25, ry: -0.5 }),
    p2: S({ ...pos, fill: 1, wire: 0, explode: 0.12, code: 1, ry: -0.38, idle: 0.5 }),
    p3: S({ ...pos, ...launch, ...(m ? {} : { x: 1.4, scale: 0.86 }) }),
    works: m ? S({ ...pos, ...launch, alpha: 0, y: 3 }) : S({ x: 1.32, y: 0.02, scale: 0.86, ...launch }),
    gone: S({ x: m ? 0 : 1.2, y: 4.2, scale: 0.6, ...launch, alpha: 0, grid: 0.4 }),
  });
}
const mixState = (a, b, t) => Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] - a[k]) * t]));
const pageY = (el) => el.getBoundingClientRect().top + scrollY;

let keys = [];
const worksBox = { top: 0, len: 1 };
function buildKeys() {
  const K = keyStates();
  const vh = innerHeight;
  const pr = $('.process'), wk = $('.works');
  const top = pageY(pr), len = Math.max(1, pr.offsetHeight - vh);
  const at = (p) => top + len * p;
  worksBox.top = pageY(wk);
  worksBox.len = Math.max(1, wk.offsetHeight - vh);
  keys = [
    [0, K.hero],
    [vh * 0.15, K.hero],
    [top, K.p0],
    [at(0.12), K.p0],
    [at(0.32), K.p1],
    [at(0.42), K.p1],
    [at(0.62), K.p2],
    [at(0.7), K.p2],
    [at(0.9), K.p3],
    [top + pr.offsetHeight - vh * 0.1, K.p3],
    [worksBox.top, K.works],
    [worksBox.top + worksBox.len, K.works],
    [worksBox.top + wk.offsetHeight - vh * 0.1, K.gone],
    [document.documentElement.scrollHeight, K.gone],
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
    countEl.textContent = pad2(Math.round(progress * 100));
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
  await initStudio(); target = 0.85;
  await new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
  target = 1;
  await new Promise((r) => setTimeout(r, Math.max(0, (reduce ? 0 : 1300) - (performance.now() - t0))));
  await new Promise((r) => { const w = () => (shown.p >= 1 || reduce ? r() : requestAnimationFrame(w)); w(); });

  const steps = $$('.pstep');
  const plabels = $$('[data-list="process-labels"] span');
  const works = $$('.work');
  const wlabels = $$('[data-list="works-labels"] span');

  if (!hasAnim) {
    loader.remove();
    document.body.classList.remove('is-loading');
    manifestWords.forEach((w) => { w.style.opacity = 1; });
    steps.forEach((s, i) => { s.style.opacity = i === 3 ? 1 : 0; });
    works.forEach((s, i) => { s.style.opacity = i === 0 || isMobile() ? 1 : 0; });
    if (studio) { buildKeys(); studio.jump(keyStates().hero); }
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
  });

  const heroChars = $$('.hero__word .split-char');
  if (!reduce) {
    g.set(heroChars, { yPercent: 118 });
    g.set('.hero [data-fade], .nav', { autoAlpha: 0, y: 24, filter: 'blur(14px)' });
  }

  /* 3D: вступление смешивается со скроллом; на экране работа текущего слайда */
  const intro = { k: reduce ? 1 : 0 };
  const K0 = keyStates();
  let workIdx = 0;
  const update = () => {
    if (!studio) return;
    const s = mixState(K0.intro, scrollState(scrollY), smooth(intro.k));
    if (!isMobile() && scrollY > worksBox.top - innerHeight * 0.5) s.ry += (workIdx % 2 ? 0.1 : -0.04);
    studio.setState(s);
    studio.setVisible(s.alpha > 0.002 || s.grid > 0.01);
  };
  if (studio) { buildKeys(); studio.jump(K0.intro); update(); }

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
  if (studio) addEventListener('pointermove', (e) => studio.setMouse((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)), { passive: true });

  if (!reduce) {
    $$('[data-reveal]').forEach((el) => {
      g.from($$('.split-char', el), { yPercent: 118, duration: 1.1, ease: 'expo.out', stagger: 0.03, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('[data-fade]').forEach((el) => {
      if (el.closest('.hero')) return;
      // opacity, а не autoAlpha: элемент остаётся доступен с клавиатуры до того, как до него докрутили
      g.from(el, { opacity: 0, y: 28, filter: 'blur(14px)', duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    g.to(manifestWords, { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: '.manifest__text', start: 'top 78%', end: 'bottom 45%', scrub: true } });
    g.from('.more__row', { y: 30, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.more__list', start: 'top 82%' } });
    $$('.chips', $('.calc')).forEach((box) => g.from($$('.chip', box), { y: 18, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.04, scrollTrigger: { trigger: box, start: 'top 90%' } }));
    g.from('.qa', { y: 24, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.faq__list', start: 'top 85%' } });
    g.from('.foot__word .split-char', { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.foot__word', start: 'top 95%' } });
    if (isMobile()) $$('.work__img').forEach((el) => g.from(el, { clipPath: 'inset(100% 0 0 0)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
  } else {
    manifestWords.forEach((w) => { w.style.opacity = 1; });
  }

  /* переключатель слайдов в закреплённых сценах */
  // focusable: скрытые слайды остаются доступны с клавиатуры (только прозрачность),
  // а мышь проходит сквозь них благодаря классу is-current
  function switcher(items, labels, onChange, focusable) {
    let current = 0;
    const A = focusable ? 'opacity' : 'autoAlpha';
    g.set(items, { [A]: 0, y: 40 });
    g.set(items[0], { [A]: 1, y: 0 });
    items.forEach((el, j) => el.classList.toggle('is-current', j === 0));
    return (i) => {
      if (i === current) return;
      const dir = i > current ? 1 : -1;
      g.to(items[current], { [A]: 0, y: -40 * dir, filter: 'blur(10px)', duration: 0.6, ease: 'expo.out', overwrite: true });
      g.fromTo(items[i], { [A]: 0, y: 40 * dir, filter: 'blur(10px)' }, { [A]: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out', overwrite: true });
      items.forEach((el, j) => el.classList.toggle('is-current', j === i));
      labels.forEach((l, j) => l.classList.toggle('is-on', j === i));
      current = i;
      onChange && onChange(i);
    };
  }
  const showStep = switcher(steps, plabels);
  ST.create({
    trigger: '.process', start: 'top top', end: 'bottom bottom',
    onUpdate: (self) => {
      g.set('.process .rail__progress i', { scaleX: self.progress });
      showStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999)));
    },
  });

  const mm = g.matchMedia();
  mm.add(DESK_Q, () => {
    const showWork = switcher(works, wlabels, (i) => {
      workIdx = i;
      $('.works__cur').textContent = pad2(i + 1);
      if (studio) studio.setWork(i);
      update();
    }, true);
    const t = ST.create({
      trigger: '.works', start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => {
        g.set('.works .rail__progress i', { scaleX: self.progress });
        showWork(Math.min(works.length - 1, Math.floor(self.progress * works.length * 0.999)));
      },
    });
    // клавиатура: ссылка работы в фокусе — прокручиваем к её слайду, чтобы она была на экране
    const onFocus = (e) => {
      const w = e.target.closest('.work');
      if (!w) return;
      const i = works.indexOf(w);
      const y = t.start + (t.end - t.start) * ((i + 0.5) / works.length);
      if (lenis) lenis.scrollTo(y, { immediate: true }); else scrollTo(0, y);
      showWork(i);
    };
    $('.works__list').addEventListener('focusin', onFocus);
    return () => { t.kill(); $('.works__list').removeEventListener('focusin', onFocus); g.set(works, { clearProps: 'all' }); };
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
