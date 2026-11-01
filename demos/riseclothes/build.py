#!/usr/bin/env python3
"""Generate demos/riseclothes/index.html from the item list taken from t.me/riseclothes."""
import sys, urllib.parse

OUT = sys.argv[1]
MGR = "ssslondonssslondon"

# (post id, brand, model in English as in the channel, Russian type, price KZT)
ITEMS = [
    (4200, "Number Nine", "Jacket", "Куртка", 65000),
    (4213, "Number Nine", "Long sleeve", "Лонгслив", 25000),
    (4212, "Hysteric Glamour", "Long sleeve", "Лонгслив", 15000),
    (4210, "Jean Paul Gaultier", "Long sleeve", "Лонгслив", 15000),
    (4209, "Balmain", "Tank top", "Майка", 50000),
    (4208, "Enfants Riches Déprimés", "T-shirt", "Футболка", 22000),
    (4207, "Dior", "Hoodie", "Худи", 25000),
    (4205, "Raf Simons", "T-shirt", "Футболка", 20000),
    (4204, "Dior", "Sweater", "Свитер", 25000),
    (4202, "Diesel", "Jacket", "Куртка", 25000),
    (4201, "Hysteric Glamour", "Zip hoodie", "Зип-худи", 27000),
    (4199, "Rick Owens", "Sweater", "Свитер", 27000),
    (4198, "Number Nine", "Zip hoodie", "Зип-худи", 33000),
    (4197, "Vivienne Westwood", "T-shirt", "Футболка", 15000),
    (4196, "Vivienne Westwood", "T-shirt", "Футболка", 15000),
    (4195, "Hysteric Glamour", "T-shirt", "Футболка", 13000),
    (4193, "Enfants Riches Déprimés", "Sneakers", "Кеды", 37000),
]

NB = " "

def price(p):
    return f"{p:,}".replace(",", NB) + NB + "₸"

def slug(b):
    return b.lower().replace(" ", "-").replace("é", "e")

def tg(text):
    return f"https://t.me/{MGR}?text=" + urllib.parse.quote(text)

ARROW = ('<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'
         '<path d="M7 17 17 7M8 7h9v9"/></svg>')

brands = {}
for it in ITEMS:
    brands.setdefault(it[1], []).append(it)
order = sorted(brands, key=lambda b: (-len(brands[b]), b))

# ---- catalog tiles
tiles = []
for i, (pid, brand, model, ru, p) in enumerate(ITEMS):
    msg = f"Здравствуйте! Хочу оформить предзаказ: {brand} {model}, {price(p)} (№{pid}). Подскажите по размеру и сроку."
    tiles.append(f'''      <li class="item{' item--big' if i == 0 else ''} rise" data-brand="{slug(brand)}" style-d="{i}">
        <a class="item__link" href="{tg(msg)}" target="_blank" rel="noopener">
          <span class="item__media"><img src="assets/{pid}.jpg" alt="{brand}, {ru.lower()}" width="450" height="450" loading="lazy"></span>
          <span class="item__meta">
            <span class="item__no">№{NB}{pid}</span>
            <span class="item__brand">{brand}</span>
            <span class="item__type">{ru}</span>
            <span class="item__price">{price(p)}</span>
          </span>
          <span class="item__cta">Оформить предзаказ {ARROW}</span>
        </a>
      </li>''')
tiles = "\n".join(t.replace(' style-d="', ' data-i="') for t in tiles)

# ---- filters
filters = ['        <button class="chip is-active" type="button" data-filter="all" aria-pressed="true">Все <span>17</span></button>']
for b in order:
    filters.append(f'        <button class="chip" type="button" data-filter="{slug(b)}" aria-pressed="false">{b} <span>{len(brands[b])}</span></button>')
filters = "\n".join(filters)

# ---- brand index (signature interaction)
rows = []
for n, b in enumerate(order, 1):
    first = brands[b][0][0]
    lo = min(x[4] for x in brands[b])
    rows.append(f'''      <li>
        <button class="index__row" type="button" data-filter="{slug(b)}" data-preview="assets/{first}.jpg">
          <span class="index__n">{n:02d}</span>
          <span class="index__name">{b}</span>
          <span class="index__count">{len(brands[b])}{NB}шт.</span>
          <span class="index__from">от{NB}{price(lo)}</span>
        </button>
      </li>''')
rows = "\n".join(rows)

hello = tg("Здравствуйте! Пишу с сайта Rise Clothes, хочу уточнить по вещам.")

html = f'''<!DOCTYPE html>
<html lang="ru" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rise Clothes — вещи Number Nine, Rick Owens, Hysteric Glamour под предзаказ</title>
  <meta name="description" content="Rise Clothes: 17 вещей Number Nine, Rick Owens, Hysteric Glamour, Vivienne Westwood и других брендов под предзаказ. Заказ через Telegram.">
  <script>document.documentElement.classList.replace('no-js', 'js');</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- HERO: scheme B, typography behind the object -->
  <section class="hero" id="top">
    <header class="bar">
      <a class="logo rise" href="#top" data-d="300">Rise{NB}Clothes</a>
      <nav class="nav rise" data-d="420" aria-label="Разделы">
        <a href="#catalog">Каталог</a>
        <a href="#brands">Бренды</a>
        <a href="#order">Как заказать</a>
      </nav>
    </header>

    <h1 class="sr-only">Rise Clothes — вещи Number Nine, Rick Owens, Hysteric Glamour и&nbsp;других брендов под предзаказ</h1>
    <p class="hero__word hero__word--1" aria-hidden="true"><span class="rise" data-d="900">Rise</span></p>
    <p class="hero__word hero__word--2" aria-hidden="true"><span class="rise" data-d="980">Clothes</span></p>

    <figure class="hero__object">
      <div class="hero__object-inner rise" data-d="760">
        <img src="assets/hero-jacket.png" alt="Куртка Number Nine из каталога" width="380" height="450">
        <span class="hero__shadow" aria-hidden="true"></span>
      </div>
    </figure>

    <div class="hero__copy">
      <p class="hero__lead rise" data-d="1040">Number Nine, Rick Owens, Hysteric&nbsp;Glamour<br>и&nbsp;ещё 7&nbsp;брендов. Каждая вещь под&nbsp;предзаказ.</p>
      <div class="hero__actions rise" data-d="1200">
        <a class="btn btn--solid" href="#catalog"><span class="btn__fill" aria-hidden="true"></span><span class="btn__label">Смотреть 17&nbsp;вещей</span></a>
        <p class="assure">Заказ через чат в&nbsp;Telegram</p>
      </div>
    </div>
  </section>

  <!-- CATALOG -->
  <section class="catalog" id="catalog">
    <div class="catalog__head">
      <h2 class="h2 rise">Каталог</h2>
      <p class="catalog__note rise" data-d="100">Фото и&nbsp;цены из&nbsp;канала <a href="https://t.me/riseclothes" target="_blank" rel="noopener">@riseclothes</a>. Нажмите на&nbsp;вещь, и&nbsp;откроется чат с&nbsp;менеджером, где уже написан номер вещи.</p>
    </div>
    <div class="filters rise" data-d="150" role="group" aria-label="Фильтр по бренду">
{filters}
    </div>
    <ul class="grid" role="list">
{tiles}
    </ul>
  </section>

  <!-- BRAND INDEX: the page's single signature interaction (cursor preview) -->
  <section class="index" id="brands">
    <h2 class="h2 rise">Бренды</h2>
    <ul class="index__list" role="list">
{rows}
    </ul>
    <img class="index__preview" src="assets/{brands[order[0]][0][0]}.jpg" alt="" aria-hidden="true">
  </section>

  <!-- ORDER -->
  <section class="order" id="order">
    <h2 class="h2 rise">Как заказать</h2>
    <ol class="steps" role="list">
      <li class="step rise" data-d="0"><span class="step__n">01</span><h3 class="step__t">Выберите вещь</h3><p>В&nbsp;каталоге у&nbsp;каждой вещи свой номер, по&nbsp;нему менеджер сразу её&nbsp;найдёт.</p></li>
      <li class="step rise" data-d="100"><span class="step__n">02</span><h3 class="step__t">Напишите в&nbsp;Telegram</h3><p>Кнопка откроет чат с&nbsp;<a href="https://t.me/{MGR}" target="_blank" rel="noopener">@{MGR}</a> с&nbsp;готовым текстом заказа.</p></li>
      <li class="step rise" data-d="200"><span class="step__n">03</span><h3 class="step__t">Уточните детали</h3><p>Размер, срок предзаказа, оплату и&nbsp;доставку менеджер подтвердит в&nbsp;переписке.</p></li>
    </ol>
    <div class="order__cta rise" data-d="300">
      <a class="btn btn--line" href="{hello}" target="_blank" rel="noopener"><span class="btn__fill" aria-hidden="true"></span><span class="btn__label">Написать менеджеру {ARROW}</span></a>
      <p class="assure">Отзывы покупателей в&nbsp;<a href="https://t.me/risereviews1" target="_blank" rel="noopener">@risereviews1</a></p>
    </div>
  </section>

  <footer class="foot">
    <p class="foot__logo">Rise{NB}Clothes</p>
    <ul class="foot__links" role="list">
      <li><a href="https://t.me/riseclothes" target="_blank" rel="noopener">Telegram-канал</a></li>
      <li><a href="https://instagram.com/riseclothes__" target="_blank" rel="noopener">Instagram</a></li>
      <li><a href="https://www.tiktok.com/@__riseclothes" target="_blank" rel="noopener">TikTok</a></li>
      <li><a href="https://t.me/risereviews1" target="_blank" rel="noopener">Отзывы</a></li>
    </ul>
    <p class="foot__note">Демо-версия сайта. Фото и&nbsp;цены взяты из&nbsp;Telegram-канала на&nbsp;1&nbsp;ноября 2026.</p>
  </footer>

  <script src="script.js" defer></script>
</body>
</html>
'''
open(OUT, "w", encoding="utf-8").write(html)
print("ok", OUT)
