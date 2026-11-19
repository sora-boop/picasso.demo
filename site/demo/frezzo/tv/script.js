/* =====================================================================
   FREZZO TV. Данные экранов и их показ.
   Позже эти списки будут приходить из формы клиента, а не из файла.
   ===================================================================== */

/* слайды экрана 1. align: где текст, по тихой зоне фото */
const SLIDES = [
  { img: '../assets/coldbrew.jpg', label: 'Specials', title: ['Freddo', 'Cappuccino'], sub: 'Eiskalt aufgeschäumt, wie in Griechenland', price: '4,30 €', align: 'right' },
  { img: '../assets/flatwhite.jpg', label: 'Coffee', title: ['Flat', 'White'], sub: 'Doppelter Espresso und samtige Milch', price: '4,40 €', align: 'left' },
  { img: '../assets/caramel.jpg', label: 'Eisbecher', title: ['Frezzo', 'Becher'], sub: '3 Kugeln, Sahne und Topping nach Wahl', price: '7,50 €', split: true },
  { img: '../assets/matcha.jpg', label: 'Specials', title: ['Matcha', 'Latte'], sub: 'Auch mit Erdbeere, Himbeere oder Mango', price: '4,30 €', align: 'right' },
  { img: '../assets/cones.jpg', label: 'Gelato', title: ['Schoko', 'Gelato'], sub: 'Italienisches Eis, jeden Tag frisch', price: '1,80 €', pre: '1 Kugel', split: true },
  { img: '../assets/v60.jpg', label: 'Coffee', title: ['Caffè', 'Lungo'], sub: 'Länger extrahiert, mild und rund', price: '3,30 €', align: 'left' },
];
const SLIDE_MS = 8000;

/* прайс экрана 2: две страницы, сменяются сами.
   элемент: [название, цена, пояснение] */
const BOARD = [
  { foot: 'Extra Shot +1,00 € / Geeist +0,40 € / Pflanzliche Milch +0,50 € / Sahne +0,30 €', cols: [
    [{ title: 'Coffee', items: [
      ['Espresso', '2,30'], ['Espresso Doppio', '3,70'], ['Espresso Macchiato', '2,50'], ['Doppio Macchiato', '3,90'],
      ['Cortado Natural', '3,60'], ['Flat White', '4,40'], ['Caffè Lungo', '3,30'], ['Grande Caffè Lungo', '4,30'],
      ['Cappuccino', '3,70'], ['Grande Cappuccino', '4,70'], ['Caffè Latte', '4,10'], ['Latte Macchiato', '4,10'],
    ]}],
    [{ title: 'Specials & Fresh', items: [
      ['Matcha Latte', '4,30'], ['Frucht Matcha Latte', '6,30', 'Erdbeere / Himbeere / Mango'], ['Heiße Schokolade', '4,30', 'dunkel oder hell'],
      ['Chai Latte', '4,30'], ['Tee-Auswahl', '3,80'], ['Minz-Ingwertee', '4,30', 'frisch aufgegossen'],
      ['Affogato', '3,80'], ['Freddo Cappuccino', '4,30'], ['Frappé', '4,80'],
    ]}],
  ]},
  { foot: 'Toppings +0,50 €: Schokosoße / Erdbeersoße / Karamellsoße / bunte Streusel / Oreo Crunch / Haselnuss Crunch / weiße Schokoraspeln', cols: [
    [{ title: 'Gelato', items: [
      ['Eine Kugel', '1,80'], ['2 Kugeln', '3,60'], ['3 Kugeln', '5,40'], ['Sahne extra', '+0,80'],
    ]}],
    [{ title: 'Eisbecher', items: [
      ['Frezzo Becher', '7,50', '3 Kugeln, Sahne, Topping'], ['Unser Liebling', '7,50', '3 Kugeln, Sahne, Erdbeersoße'],
      ['Cookies Dream', '7,80', '3 Kugeln, Sahne, Oreo Crunch'], ['Schoko Deluxe', '7,80', '3 Kugeln, Sahne, Schokosoße, Brownie'],
      ['Mango Dream', '7,80', '3 Kugeln, Sahne, Mangosoße'], ['Berry Love', '7,80', '3 Kugeln, Sahne, Beeren'],
    ]}],
  ]},
];
const PAGE_MS = 16000;
const BOARD_PHOTOS = [['../assets/flatwhite.jpg', '../assets/matcha.jpg'], ['../assets/cones.jpg', '../assets/caramel.jpg']];

/* ---------------------------------------------------------------------
   общее
   --------------------------------------------------------------------- */
const $ = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const page = document.body.dataset.page;
const framed = window.self !== window.top;

/* сцена 1920×1080 вписывается в любой экран */
function fit() {
  const st = $('#stage');
  if (!st) return;
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  st.style.transform = `scale(${k}) translate(-50%, -50%)`;
}
if (page) {
  fit();
  addEventListener('resize', fit);
  // на телевизоре: клик открывает полный экран, курсор прячется
  if (!framed) {
    document.addEventListener('click', () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {}); });
    let idle;
    addEventListener('pointermove', () => { document.body.classList.remove('is-idle'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('is-idle'), 2000); });
    // раз в 10 минут подтягиваем новые цены
    setTimeout(() => location.reload(), 10 * 60 * 1000);
  }
}

/* ---------------------------------------------------------------------
   экран 1: промо
   --------------------------------------------------------------------- */
function promo() {
  const host = $('#slides');
  const wipe = document.createElement('div');
  wipe.className = 'wipe';
  wipe.setAttribute('aria-hidden', 'true');
  // три мазка цветов Frezzo: розовый, бирюзовый, жёлтый
  wipe.innerHTML = `<svg viewBox="0 0 400 100" preserveAspectRatio="none"><path fill="#ffd21f" d="M40 0 H250 Q262 10 254 20 Q268 32 256 46 Q270 60 258 72 Q266 86 250 100 H40 Q30 90 38 78 Q26 64 36 50 Q24 36 34 22 Q26 10 40 0Z"/><path fill="#19c6c6" d="M80 0 H290 Q302 10 294 20 Q308 32 296 46 Q310 60 298 72 Q306 86 290 100 H80 Q70 90 78 78 Q66 64 76 50 Q64 36 74 22 Q66 10 80 0Z"/><path fill="#ff2e88" d="M120 0 H330 Q342 10 334 20 Q348 32 336 46 Q350 60 338 72 Q346 86 330 100 H120 Q110 90 118 78 Q106 64 116 50 Q104 36 114 22 Q106 10 120 0Z"/><circle cx="352" cy="30" r="5" fill="#ff2e88"/><circle cx="364" cy="64" r="3" fill="#ff2e88"/></svg>`;
  $('#stage').append(wipe);

  host.innerHTML = SLIDES.map((s) => {
    let i = 0;
    const title = s.title.map((ln) => `<span class="ln">${[...ln].map((c) => `<span class="ch" style="--i:${i++}">${esc(c)}</span>`).join('')}</span>`).join('');
    const cls = ['slide', s.split ? 'slide--split' : '', s.align === 'right' ? 'slide--right' : ''].join(' ');
    return `<div class="${cls}">
      <div class="slide__media">${s.video ? `<video src="${esc(s.video)}" muted loop playsinline preload="auto"></video>` : `<img src="${esc(s.img)}" alt="">`}</div>
      <div class="slide__blur"></div>
      <div class="slide__text">
        <span class="label">${esc(s.label)}</span>
        <h2 class="slide__title" aria-label="${esc(s.title.join(' '))}">${title}</h2>
        <p class="slide__sub">${esc(s.sub)}</p>
        <span class="tag">${s.pre ? `<small>${esc(s.pre)}</small>` : ''}${esc(s.price)}</span>
      </div>
    </div>`;
  }).join('');
  // style="--i" выше задаёт только индекс задержки букв, без оформления

  const slides = $$('.slide', host);
  const bars = $('#progress');
  bars.innerHTML = SLIDES.map(() => '<span><i></i></span>').join('');
  const segs = $$('span', bars);
  bars.style.setProperty('--dur', SLIDE_MS + 'ms');

  let cur = -1;
  function show(n) {
    const prev = slides[cur];
    const next = slides[n];
    const v = $('video', next); if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    segs.forEach((s, j) => { s.classList.toggle('is-done', j < n); s.classList.remove('is-now'); });
    void bars.offsetWidth;
    segs[n].classList.add('is-now');
    if (!prev || reduce) {
      slides.forEach((s) => s.classList.remove('is-on', 'is-out'));
      next.classList.add('is-on');
    } else {
      // мазок закрывает экран, под ним меняется слайд
      wipe.classList.remove('is-go'); void wipe.offsetWidth; wipe.classList.add('is-go');
      setTimeout(() => {
        prev.classList.remove('is-on');
        next.classList.add('is-on');
      }, 620);
    }
    cur = n;
  }
  show(Math.min(slides.length - 1, Number(new URLSearchParams(location.search).get('s')) || 0));
  setInterval(() => show((cur + 1) % slides.length), SLIDE_MS);
}

/* ---------------------------------------------------------------------
   экран 2: прайс
   --------------------------------------------------------------------- */
function board() {
  const RING = '<svg class="item__ring" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true"><path d="M150 8 C60 0 6 18 10 42 C14 70 120 82 182 62 C206 52 196 18 140 10"/></svg>';
  const host = $('#cols');
  host.innerHTML = BOARD.map((pg, pi) => `<div class="page${pi ? '' : ' is-on'}">${pg.cols.map((col, c) => `<div class="col">${col.map((g) => `
    <section class="group">
      <h2 class="group__title">${esc(g.title)}</h2>
      ${g.items.map(([n, p, note]) => `<div class="item"><span class="item__text"><span class="item__name">${esc(n)}</span>${note ? `<span class="item__note">${esc(note)}</span>` : ''}</span><span class="item__dots"></span><span class="item__price">${esc(p)}&nbsp;€${RING}</span></div>`).join('')}
    </section>`).join('')}</div>`).join('')}</div>`).join('');

  const foot = $('#flavours');
  const media = $('#media');
  media.innerHTML = BOARD_PHOTOS.flat().map((s) => `<img src="${esc(s)}" alt="">`).join('');
  const pics = $$('img', media);
  const pages = $$('.page', host);
  let page = 0, h = 0, sub = 0;

  const photo = () => {
    const idx = BOARD_PHOTOS.slice(0, page).flat().length + (sub % BOARD_PHOTOS[page].length);
    pics.forEach((x, j) => x.classList.toggle('is-on', j === idx));
  };
  // цена дня: кружок перебегает по позициям текущей страницы
  const hot = () => {
    const items = $$('.item', pages[page]);
    $$('.item').forEach((x) => x.classList.remove('is-hot'));
    items[(h * 5 + 3) % items.length].classList.add('is-hot');
    h++;
  };
  const showPage = (n) => {
    pages.forEach((p, j) => p.classList.toggle('is-on', j === n));
    page = n; sub = 0;
    foot.textContent = BOARD[n].foot;
    photo();
    setTimeout(hot, 1400);
  };
  showPage(Math.min(pages.length - 1, Number(new URLSearchParams(location.search).get('p')) || 0));
  setInterval(() => showPage((page + 1) % pages.length), PAGE_MS);
  setInterval(() => { sub++; photo(); }, PAGE_MS / 2);
  setInterval(hot, 5000);
}

/* ---------------------------------------------------------------------
   запуск
   --------------------------------------------------------------------- */
if (page === 'promo') promo();
if (page === 'board') board();
document.fonts.ready.then(() => requestAnimationFrame(() => document.body.classList.add('is-in')));
