# Шаблоны под ниши

Три шаблона под лиды. Каждый — папка из `index.html`, `styles.css`, `script.js` и `assets/`.
Под нового клиента правится **только блок `CONFIG` в начале `script.js`** и подкладываются фото.

| Шаблон | Папка | Пресеты | Лиды |
|---|---|---|---|
| Салон / барбершоп: услуги, мастера, онлайн-запись | `salon/` | `barber`, `beauty` | `barber`: OLDBOY, ARISTOKRAT, Bradobrey. `beauty`: Prestige, «Прованс», «Шик», «Нефертити» |
| Кафе с QR-меню | `cafe/` | один, меню в конфиге | Fumari, Underground |
| Автосервис / фитнес: услуги, цены, заявка | `service/` | `auto`, `fitness` | `auto`: «Гараж», TQS. `fitness`: FITpoint, Nomad |

Для стоматологий шаблон — сайт Imran dent.

## Когда клиент ответил: 10 минут

1. Скопировать папку шаблона в новый репозиторий (например `fumari.demo`).
2. В `script.js` → `CONFIG`:
   - `preset`, `name`, `city`, `phone`, `whatsapp` (только цифры), `address`, `hours`, `gis` (ссылка на карточку 2ГИС), `instagram` (пусто — ссылка пропадёт);
   - `colors` — три цвета бренда: `bg` (фон), `ink` (текст), `accent` (кнопки), плюс `onAccent` (текст на кнопке) и `scheme` (`dark`/`light`);
   - при необходимости `services`, `team`, `facts`, `menu` — формат как в пресете.
3. Скачать 4–6 фото из 2ГИС, положить в `assets/` и прописать пути в `CONFIG.photos`.
4. Открыть `index.html` локально, проверить, залить на GitHub Pages.

Все заявки (запись, бронь, лид) уходят в WhatsApp клиента готовым сообщением. Бэкенд не нужен.

## Фото: что заменить

Пока стоят заглушки `picsum.photos` — **их нужно заменить все**.

**salon/** — `hero` (зал или мастер за работой, горизонтальное, тёмный угол снизу слева), `place` (интерьер, вертикальное), `cut` / `beard` / `care` (крупные планы трёх групп услуг; в beauty: волосы / ногти / брови), плюс `photo` у каждого мастера в `team` (портрет 3:4).

**cafe/** — `hero` (зал вечером), `mood1`–`mood3` (атмосфера: кальян, чай, гости у стола), необязательный `photo` у позиций меню (квадрат).

**service/** — `hero` (вертикальное: бокс с машиной на подъёмнике / зал), `lead` (мастер за работой / тренер с клиентом).

Если в 2ГИС фото слабые, запросы для Unsplash/Pexels:
- барбершоп: `barbershop interior dark`, `barber straight razor closeup`, `beard trim low key`
- салон: `hair salon interior warm light`, `hair coloring closeup`, `manicure closeup minimal`
- кальянная/бар: `hookah lounge dark`, `chinese tea ceremony closeup`, `cocktail bar moody`
- автосервис: `car lift garage`, `mechanic hands engine`, `tire change workshop`
- фитнес: `gym weights low key`, `dumbbell rack dark`, `personal trainer gym`

Свет на всех фото одного сайта должен быть одинаковым: если первое тёмное и контрастное, остальные тоже.

## Особенности

- **salon:** над прайсом за курсором едет фото группы услуг. Кнопка «Выбрать время» у мастера подставляет его в форму записи.
- **cafe:** QR на стол ведёт на `https://адрес/?table=5`. Страница сразу открывается на меню, гость отмечает позиции «+» и показывает экран «Мой выбор» официанту (с номером стола). Табы категорий липкие, полоса едет за активной.
- **service:** прайс — это калькулятор. Отмеченные услуги считаются в сумму («от», если есть минимальные цены) и попадают в заявку.

## Токены

| | salon | cafe | service |
|---|---|---|---|
| Шрифты | Playfair Display 400 + Manrope 400 | Oswald 400 + Golos Text 400 | Wix Madefor Display 500 + Wix Madefor Text 400 |
| Цвета | barber `#11100e / #efe9df / #b8864b`, beauty `#f2ede6 / #1d1a17 / #8a5a44` | `#0f0d0b / #f0e9de / #d9622b` | auto `#0f1011 / #ecebe7 / #f0b429`, fitness `#0c0c0c / #f2f1ee / #ff5b23` |
| Композиция hero | A: фото во весь экран, текст снизу слева | A | C: 60/40, фото в край окна |

Общее: easing `cubic-bezier(.22,1,.36,1)`, кнопки 999px, фото без скруглений, отступы 8/16/24/40/64/104/160.
