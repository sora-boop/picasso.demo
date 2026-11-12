/* =====================================================================
   Расписание из Google Формы.
   Студия заполняет Google Форму, ответы падают в Google Таблицу,
   таблица опубликована как CSV, сайт читает её при открытии страницы.

   Поля формы (названия вопросов важны — ищем по началу слова):
     «Действие»     — Добавить / Убрать
     «День недели»  — флажки: Понедельник … Воскресенье (можно несколько)
     «Время»        — вопрос типа «Время» или текст «08:00»
     «Направление»  — раскрывающийся список с направлениями студии

   Ответы применяются по порядку поверх расписания из script.js:
   «Добавить» на занятое время — заменяет занятие (так и «изменить»),
   «Убрать» — удаляет занятие в этот день и время.
   Если ссылки нет или таблица не открылась — остаётся расписание из script.js.
   ===================================================================== */

// Ссылка: Таблица → Файл → Поделиться → Опубликовать в интернете → лист с ответами → CSV
const SCHEDULE_SHEET_CSV = '';

(function () {
  const DAY_KEYS = ['пон', 'вто', 'сре', 'чет', 'пят', 'суб', 'вос'];

  // CSV с кавычками и переносами внутри ячеек
  function parseCSV(text) {
    const rows = []; let row = []; let cell = ''; let q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((x) => x.trim()));
  }

  // «8:00:00», «08:00», «8.00», «8:00:00 PM» → «08:00»
  function parseTime(s) {
    const m = String(s).match(/(\d{1,2})[:.](\d{2})/);
    if (!m) return null;
    let h = Number(m[1]);
    if (/pm/i.test(s) && h < 12) h += 12;
    if (/am/i.test(s) && h === 12) h = 0;
    if (h > 23) return null;
    return `${String(h).padStart(2, '0')}:${m[2]}`;
  }

  function parseDays(s) {
    const low = String(s).toLowerCase();
    return DAY_KEYS.map((k, i) => (low.includes(k) ? i : -1)).filter((i) => i >= 0);
  }

  function apply(base, rows) {
    const sched = base.map((d) => (d ? d.map((x) => x.slice()) : null));
    const touched = new Set();
    const head = rows[0].map((h) => h.trim().toLowerCase());
    const col = (w) => head.findIndex((h) => h.startsWith(w));
    const cA = col('действ'); const cD = col('день'); const cT = col('врем'); const cP = col('направл');
    if (cD < 0 || cT < 0) return null;

    rows.slice(1).forEach((r) => {
      const remove = cA >= 0 && /убра|удал/i.test(r[cA] || '');
      const time = parseTime(r[cT] || '');
      const name = cP >= 0 ? (r[cP] || '').trim() : '';
      if (!time || (!remove && !name)) return;
      parseDays(r[cD]).forEach((day) => {
        const list = (sched[day] || []).filter(([t]) => t !== time);
        if (!remove) list.push([time, name]);
        list.sort((a, b) => a[0].localeCompare(b[0]));
        sched[day] = list;
        touched.add(day);
      });
    });
    return { schedule: sched, touched };
  }

  // Вызывается из script.js: loadSheetSchedule(SCHEDULE).then(...)
  // Возвращает { schedule, touched } или null, если таблицы нет / не открылась.
  window.loadSheetSchedule = async function (base) {
    if (!SCHEDULE_SHEET_CSV) return null;
    try {
      const url = SCHEDULE_SHEET_CSV + (SCHEDULE_SHEET_CSV.includes('?') ? '&' : '?') + 't=' + Date.now();
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null;
      const rows = parseCSV(await res.text());
      return rows.length > 1 ? apply(base, rows) : null;
    } catch (e) {
      return null;
    }
  };
  window.__scheduleSheetTest = { parseCSV, parseTime, parseDays, apply };
})();
