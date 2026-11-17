/* =====================================================================
   ReForma: демо чат-бота для WhatsApp.
   Сценарный бот без ИИ: меню, цены, расписание, направления, адрес,
   вопрос администратору и запись (направление → время → имя → подтверждение).
   Данные берутся из ../data.js (общие с сайтом).
   ===================================================================== */

const $ = (q, r = document) => r.querySelector(q);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const chat = $('[data-chat]');
const form = $('[data-compose]');
const input = form.text;
const adminList = $('[data-admin]');
const adminCount = $('[data-count]');
const status = $('[data-status]');

const ADDRESS = 'Костанай, проспект Абая, 161';
const MAP = 'https://2gis.kz/kostanay/search/%D0%90%D0%B1%D0%B0%D1%8F%20161';
const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

let state = 'menu';
let draft = {};
let busy = false;
let requests = 0;

/* ---------------------------------------------------------------------
   Даты и расписание
   --------------------------------------------------------------------- */
const todayIdx = () => (new Date().getDay() + 6) % 7;            // 0 — понедельник
const now = () => new Date().toTimeString().slice(0, 5);

// ближайшая дата для дня недели и времени: «среда, 19 ноября»
function nextDate(day, time) {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  let add = (day - todayIdx() + 7) % 7;
  if (add === 0 && time && time <= now()) add = 7;
  d.setDate(d.getDate() + add);
  const label = add === 0 ? 'сегодня' : add === 1 ? 'завтра' : DAYS_FULL[day];
  return `${label}, ${d.getDate()} ${MON[d.getMonth()]}`;
}

function slotsFor(name) {
  const out = [];
  SCHEDULE.forEach((list, day) => (list || []).forEach(([time, n]) => { if (n === name) out.push({ day, time }); }));
  // ближайшие сначала
  const t = todayIdx(); const n = now();
  const dist = (s) => { let a = (s.day - t + 7) % 7; if (a === 0 && s.time <= n) a = 7; return a * 1440 + Number(s.time.slice(0, 2)) * 60 + Number(s.time.slice(3)); };
  return out.sort((a, b) => dist(a) - dist(b));
}

/* ---------------------------------------------------------------------
   Отрисовка сообщений
   --------------------------------------------------------------------- */
// *жирный*, [текст](ссылка), переносы строк
function fmt(text) {
  return esc(text)
    .replace(/\*([^*\n]+)\*/g, '<b>$1</b>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n/g, '<br>');
}

function scroll() { chat.scrollTo({ top: chat.scrollHeight, behavior: reduce ? 'auto' : 'smooth' }); }

function bubble(who, text) {
  const row = document.createElement('div');
  row.className = `msg msg--${who}`;
  row.innerHTML = `<div class="msg__b">${fmt(text)}<span class="msg__t">${now()}${who === 'me' ? '<i class="ticks" aria-hidden="true"></i>' : ''}</span></div>`;
  chat.append(row);
  scroll();
  return row;
}

function disableOld() {
  chat.querySelectorAll('.btns:not(.is-used) button').forEach((b) => { b.disabled = true; });
  chat.querySelectorAll('.btns:not(.is-used)').forEach((b) => b.classList.add('is-used'));
}

const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));

// сообщение бота: печатает, потом текст и кнопки
async function bot(text, buttons = []) {
  busy = true;
  status.textContent = 'печатает…';
  const typing = document.createElement('div');
  typing.className = 'msg msg--bot';
  typing.innerHTML = '<div class="msg__b typing" aria-label="Бот печатает"><i></i><i></i><i></i></div>';
  chat.append(typing); scroll();
  await wait(Math.min(1300, 450 + text.length * 6));
  typing.remove();
  const row = bubble('bot', text);
  if (buttons.length) {
    const box = document.createElement('div');
    box.className = 'btns';
    box.innerHTML = buttons.map(([label, value], i) => `<button type="button" data-i="${i}">${esc(label)}</button>`).join('');
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || b.disabled || busy) return;
      const [label, value] = buttons[Number(b.dataset.i)];
      disableOld();
      bubble('me', label);
      handle(value, label);
    });
    row.append(box);
    scroll();
  }
  status.textContent = 'бот · отвечает сразу';
  busy = false;
}

/* ---------------------------------------------------------------------
   Разделы
   --------------------------------------------------------------------- */
const MENU = [['📅 Записаться', 'book'], ['💳 Цены', 'prices'], ['🗓 Расписание', 'schedule'], ['🏃‍♀️ Направления', 'programs'], ['📍 Адрес и часы', 'address'], ['👩‍💼 Администратор', 'admin']];
const BACK = ['Меню', 'menu'];

function greet() {
  state = 'menu';
  return bot('Здравствуйте! 👋 Это *ReForma*, фитнес-студия на Абая, 161.\nЯ бот студии и отвечаю сразу. Что подсказать?', MENU);
}
function menu() { state = 'menu'; return bot('Чем ещё помочь?', MENU); }

function prices() {
  state = 'menu';
  const text = PRICES.map((p) => `*${p.t}*\n${p.rows.map(([k, v]) => `• ${k} — ${v}`).join('\n')}`).join('\n\n');
  return bot(`💳 Абонементы на месяц:\n\n${text}`, [['📅 Записаться', 'book'], BACK]);
}

function programs() {
  state = 'menu';
  return bot(`У нас ${PROGRAMS.length} направлений:\n${PROGRAMS.map((p) => `• *${p.name}* — ${p.d.toLowerCase().replace(/\.$/, '')}`).join('\n')}`, [['📅 Записаться', 'book'], ['💳 Цены', 'prices'], BACK]);
}

function address() {
  state = 'menu';
  return bot(`📍 ${ADDRESS}\n🕗 Ежедневно 8:00–22:00, по предварительной записи\n📞 +7 705 215 56 25\n\n[Открыть на карте 2ГИС](${MAP})`, [['📅 Записаться', 'book'], BACK]);
}

function scheduleAsk() {
  state = 'schedule';
  const t = todayIdx();
  const btns = [['Сегодня', `day:${t}`], ['Завтра', `day:${(t + 1) % 7}`]];
  DAYS.forEach((d, i) => { if (i !== t && i !== (t + 1) % 7) btns.push([d, `day:${i}`]); });
  return bot('На какой день показать расписание?', btns);
}

function scheduleDay(day) {
  state = 'menu';
  const list = SCHEDULE[day];
  const title = nextDate(day).replace(/^./, (c) => c.toUpperCase());
  if (!list) return bot(`${title}: расписание уточняется. Напишите администратору, он подскажет.`, [['👩‍💼 Администратор', 'admin'], ['Другой день', 'schedule'], BACK]);
  const extra = PARTIAL[day] ? '\n…и другие занятия, уточняйте у администратора.' : '';
  return bot(`🗓 *${title}*\n${list.map(([t, n]) => `${t} — ${n}`).join('\n')}${extra}`, [['📅 Записаться', 'book'], ['Другой день', 'schedule'], BACK]);
}

function admin() {
  state = 'admin';
  return bot('Напишите вопрос одним сообщением, я передам администратору. Он ответит в рабочее время, с 8:00 до 22:00.');
}

/* ---------------------------------------------------------------------
   Запись
   --------------------------------------------------------------------- */
function bookStart(programIdx) {
  draft = {};
  if (programIdx !== undefined) return bookProgram(programIdx);
  state = 'book_program';
  return bot('На какое направление записать?', [...PROGRAMS.map((p, i) => [p.name, `prog:${i}`]), ['Не знаю, подскажите', 'prog:-1']]);
}

function bookProgram(i) {
  draft.program = i >= 0 ? PROGRAMS[i].name : null;
  if (!draft.program) {
    draft.slot = null;
    state = 'book_name';
    return bot('Хорошо, администратор подберёт направление под вашу цель. Как вас зовут?');
  }
  const slots = slotsFor(draft.program).slice(0, 6);
  state = 'book_slot';
  const btns = slots.map((s) => [`${DAYS[s.day]} ${s.time}`, `slot:${s.day}|${s.time}`]);
  btns.push(['Другое время', 'slot:']);
  return bot(slots.length
    ? `*${draft.program}*. Ближайшие занятия, когда удобно?`
    : `*${draft.program}*: время уточнит администратор. Выберите «Другое время».`, btns);
}

function bookSlot(v) {
  if (v) { const [day, time] = v.split('|'); draft.slot = { day: Number(day), time }; } else draft.slot = null;
  state = 'book_name';
  return bot('Отлично! Как вас зовут?');
}

function slotText() {
  return draft.slot ? `${nextDate(draft.slot.day, draft.slot.time)}, ${draft.slot.time}` : 'время подберёт администратор';
}

function bookName(name) {
  draft.name = name.trim().slice(0, 40).replace(/^./, (c) => c.toUpperCase());
  state = 'book_confirm';
  return bot(`Проверьте заявку:\n\n🏃‍♀️ ${draft.program || 'направление подскажет администратор'}\n🗓 ${slotText()}\n👤 ${draft.name}\n📞 номер возьмём из WhatsApp\n\nВсё верно?`,
    [['✅ Подтвердить', 'confirm'], ['Изменить', 'book'], ['Отмена', 'cancel']]);
}

async function bookConfirm() {
  state = 'menu';
  addRequest('Запись', `${draft.program || 'Подобрать направление'} · ${slotText()}`, draft.name);
  await bot(`Готово! ✅ Заявка у администратора, он подтвердит время в этом чате.\n\nБез предоплаты. Возьмите удобную форму, воду и полотенце.`, [BACK]);
}

/* ---------------------------------------------------------------------
   Панель администратора (демо)
   --------------------------------------------------------------------- */
function addRequest(type, what, who) {
  requests += 1;
  adminCount.textContent = requests;
  const empty = adminList.querySelector('.admin__empty');
  if (empty) empty.remove();
  const li = document.createElement('li');
  li.className = 'req';
  li.innerHTML = `<span class="req__top"><b>${esc(type)}</b><time>${now()}</time></span><span class="req__what">${esc(what)}</span><span class="req__who">${esc(who)} · номер из WhatsApp</span>`;
  adminList.prepend(li);
}

/* ---------------------------------------------------------------------
   Понимание текста: кнопки и свободные сообщения
   --------------------------------------------------------------------- */
const PROG_KEYS = [['канго', 'Канго джамп'], ['хатх', 'Хатха-йога «Сила и баланс»'], ['йог', 'Йога «Сила и баланс»'], ['джамп', 'Джампинг'],
  ['кардио', 'Кардио и силовая'], ['силов', 'Кардио и силовая'], ['функц', 'Функциональная тренировка'], ['кинезио', 'Кинезио фитнес'],
  ['50', 'Гимнастика 50+'], ['оздоров', 'Оздоровительная гимнастика'], ['зумб', 'Зумба'], ['восточ', 'Восточные танцы'], ['танц', 'Восточные танцы']];

function findProgram(t) {
  const hit = PROG_KEYS.find(([k]) => t.includes(k));
  return hit ? PROGRAMS.findIndex((p) => p.name === hit[1]) : -1;
}

const DAY_WORDS = [['понед', 0], ['вторн', 1], ['сред', 2], ['четв', 3], ['пятн', 4], ['суббот', 5], ['воскр', 6]];

function understand(raw) {
  const t = raw.toLowerCase().replace(/ё/g, 'е');
  const n = t.trim();
  if (/^[1-6]$/.test(n)) return MENU[Number(n) - 1][1];
  if (/спасиб|рахмет|благодар/.test(t)) return 'thanks';
  if (/запис|хочу|пробн|можно прийти|попасть/.test(t)) { const p = findProgram(t); return p >= 0 ? `book:${p}` : 'book'; }
  if (/цен|стоит|стоим|сколько|прайс|абонем|оплат|₸|тенге/.test(t)) return 'prices';
  if (/сегодня/.test(t)) return `day:${todayIdx()}`;
  if (/завтра/.test(t)) return `day:${(todayIdx() + 1) % 7}`;
  const d = DAY_WORDS.find(([k]) => t.includes(k));
  if (d) return `day:${d[1]}`;
  if (/распис|когда|во сколько|время/.test(t)) return 'schedule';
  if (/адрес|где|находит|добрат|карт|2гис|час|работает|открыт/.test(t)) return 'address';
  if (/админ|человек|оператор|менеджер|позвон|связ/.test(t)) return 'admin';
  if (findProgram(t) >= 0) return `book:${findProgram(t)}`;
  if (/направлен|какие|заняти|трениров/.test(t)) return 'programs';
  if (/привет|здравств|салем|сәлем|добр|меню|начать/.test(t)) return 'hello';
  return null;
}

async function handle(value, text = '') {
  const [cmd, arg] = String(value).split(/:(.*)/s);
  switch (cmd) {
    case 'menu': return menu();
    case 'hello': return greet();
    case 'book': return arg !== undefined && arg !== '' ? bookStart(Number(arg)) : bookStart();
    case 'prices': return prices();
    case 'programs': return programs();
    case 'address': return address();
    case 'schedule': return scheduleAsk();
    case 'day': return scheduleDay(Number(arg));
    case 'admin': return admin();
    case 'prog': return bookProgram(Number(arg));
    case 'slot': return bookSlot(arg);
    case 'confirm': return bookConfirm();
    case 'cancel': state = 'menu'; return bot('Хорошо, отменил. Если передумаете, я здесь 🙂', [BACK]);
    case 'thanks': return bot('Пожалуйста! Ждём вас в ReForma 💛', [BACK]);
    default: return null;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || busy) return;
  input.value = '';
  disableOld();
  bubble('me', text);

  if (state === 'book_name') return bookName(text);
  if (state === 'admin') {
    state = 'menu';
    addRequest('Вопрос', text, 'Клиент');
    return bot('Передал администратору ✅ Ответ придёт сюда же.', [BACK]);
  }
  const intent = understand(text);
  if (intent) return handle(intent, text);
  return bot('Я пока не понял 🙏 Выберите пункт меню или напишите номер от 1 до 6. Если нужен человек, нажмите «Администратор».', MENU);
});

$('[data-reset]').addEventListener('click', () => {
  if (busy) return;
  chat.innerHTML = '';
  greet();
});

/* ---------------------------------------------------------------------
   Старт: подтягиваем расписание из Google Формы, если ссылка задана
   --------------------------------------------------------------------- */
(async () => {
  if (window.loadSheetSchedule) {
    const r = await loadSheetSchedule(SCHEDULE);
    if (r) { SCHEDULE.splice(0, 7, ...r.schedule); r.touched.forEach((d) => { delete PARTIAL[d]; }); }
  }
  greet();
})();
