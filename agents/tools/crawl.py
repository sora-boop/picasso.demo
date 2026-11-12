"""Сбор лидов из открытого справочника spravker.ru по городам Казахстана.

Соблюдает robots.txt: не трогает ?page=, /ajax/, /accounts/.
Кэширует страницы на диск, можно перезапускать.
"""
import base64, csv, hashlib, json, os, re, sys, threading, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from html import unescape

ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(ROOT, 'cache')
os.makedirs(CACHE, exist_ok=True)

CITIES = ['rudnyi', 'kostanai', 'almaty', 'astana', 'karaganda', 'shymkent', 'pavlodar', 'aktobe',
          'petropavlovsk', 'ust-kamenogorsk', 'uralsk', 'taraz', 'aktau', 'atyrau', 'ekibastuz',
          'temirtau', 'zhezkazgan']
NICHES = {
    'салон/барбершоп': ['salony-krasoty', 'parikmaherskie', 'barbershop', 'muzhskaia-parikmakherskaia',
                        'manikiur-shellak', 'evropeiskii-manikiur', 'klassicheskii-manikiur', 'apparatnyi-manikiur',
                        'gelevye-nogti', 'arkhitektura-brovei', 'keratinovoe-vypriamlenie-volos', 'depiliatsiia',
                        'detskie-parikmakherskie', 'blondirovanie', 'britio-opasnoi-britvoi', 'kamufliazh-sediny'],
    'кафе/ресторан': ['kafe', 'restoranyi', 'kofejni', 'kalyan-bar', 'pitstserii', 'sushi-baryi', 'burgernye',
                      'baryi', 'launzh-bary', 'restorany-kazakhskoi-kukhni', 'kofe-s-soboi', 'byistroe-pitanie',
                      'pekarni', 'restorany-s-dostavkoi', 'kafe-s-letnei-terrasoi', 'detskie-kafe'],
    'автосервис': ['avtoservisy-avtotehcentry', 'avtoservis-koreiskikh-avtomobilei',
                   'avtoservis-otechestvennykh-avtomobilei', 'avtoservisy-dlia-iaponskikh-avtomobilei',
                   'avtoservis-dlia-evropeiskikh-avtomobilei', 'avtomoiki', 'avtoelektriki-s-vyezdom',
                   'abrazivnaia-polirovka-kuzova', 'avtoservisy-toyota', 'avtoservisy-hyundai', 'avtoservisy-kia'],
    'фитнес/спорт': ['fitnes-kluby', 'ioga', 'sportivnye-kluby', 'sportivnye-kompleksy', 'fitnes-kluby-s-iogoi'],
    'стоматология': ['stomatologicheskie-kliniki-i-tsentryi', 'lechenie-zubov', 'implantatsiia-zubov',
                     'otbelivanie-zubov', 'protezirovanie-zubov', 'esteticheskaia-stomatologiia',
                     'detskie-stomatologicheskie-kliniki'],
}
CITY_RU = {}
NOT_A_SITE = ('dikidi', 'instagram', 'taplink', '2gis', 'wa.me', 'whatsapp', 'vk.com', 'facebook', 't.me',
              'telegram', 'linktr', 'yclients', 'olx', 'kaspi', 'tiktok', 'youtube', 'ok.ru', 'spravker',
              'mssg.me', 'hipolink', 'bio.link', 'linkin.bio', 'beacons', 'google.com/maps', 'goo.gl', 'yandex')
BOOKING = ('dikidi', 'yclients', 'easyweek', 'sonline', 'booksy', 'altegio')

lock = threading.Lock()
sem = threading.Semaphore(3)
last = {'t': 0.0}


def fetch(url):
    key = hashlib.md5(url.encode()).hexdigest()
    path = os.path.join(CACHE, key + '.html')
    if os.path.exists(path):
        with open(path, encoding='utf-8', errors='replace') as f:
            return f.read()
    with sem:
        with lock:  # глобально не чаще ~3 запросов в секунду
            wait = 0.33 - (time.time() - last['t'])
            if wait > 0:
                time.sleep(wait)
            last['t'] = time.time()
        for attempt in range(3):
            try:
                with urllib.request.urlopen(urllib.request.Request(url), timeout=30) as r:
                    body = r.read().decode('utf-8', errors='replace')
                break
            except urllib.error.HTTPError as e:
                body = '' if e.code == 404 else None
                if e.code == 404:
                    break
            except Exception:
                body = None
            time.sleep(2 * (attempt + 1))
        if body is None:
            return ''
        with open(path, 'w', encoding='utf-8') as f:
            f.write(body)
        return body


ORG_RE = re.compile(r'class="org-widget-header__title-link"[^>]*href="([^"]+\.htm)"|href="([^"]+\.htm)"[^>]*class="org-widget-header__title-link"')


def list_orgs(city, slug):
    html = fetch(f'https://{city}.spravker.ru/{slug}/')
    urls = set()
    for a, b in ORG_RE.findall(html):
        u = a or b
        if u.startswith('/'):
            u = f'https://{city}.spravker.ru{u}'
        urls.add(u)
    return urls


def dec(b64):
    try:
        return base64.b64decode(b64 + '=' * (-len(b64) % 4)).decode('utf-8', 'replace')
    except Exception:
        return ''


def block(html, title):
    i = html.find(f'<span class="spec__index-inner">{title}</span>')
    if i < 0:
        return ''
    j = html.find('</dl>', i)
    return html[i:j]


def parse_org(url):
    html = fetch(url)
    if not html:
        return None
    biz = None
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            d = json.loads(m.group(1))
        except Exception:
            continue
        if d.get('@type') == 'LocalBusiness':
            biz = d
    if not biz:
        return None
    phones_block = re.sub(r'<[^>]+>', ' ', block(html, 'Телефон'))
    phones = re.findall(r'(?:\+7|8)\s*\(?\d{3,5}\)?[\s\d-]{5,12}\d', unescape(phones_block))
    tel = biz.get('telephone') or []
    for t in reversed(tel if isinstance(tel, list) else [tel]):
        if isinstance(t, str) and t not in phones:
            phones.insert(0, t)
    phones = list(dict.fromkeys(p.strip() for p in phones))
    site = [dec(x) for x in re.findall(r'data-url="([^"]+)"', block(html, 'Сайт'))]
    social = [dec(x) for x in re.findall(r'data-url="([^"]+)"', block(html, 'Социальные сети'))]
    hours = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', block(html, 'Режим работы'))).replace('Режим работы', '').strip()
    addr = biz.get('address', {})
    return {
        'name': unescape(biz.get('name', '')).strip(),
        'locality': addr.get('addressLocality', ''),
        'address': unescape(addr.get('streetAddress', '')),
        'phones': phones,
        'site': site,
        'social': social,
        'hours': hours,
        'url': url,
    }


MOBILE = re.compile(r'^(?:\+?7|8)(7(?:0\d|47|5\d|6\d|7\d))(\d{7})$')


def norm(p):
    d = re.sub(r'\D', '', p)
    if len(d) == 11 and d[0] in '78':
        d = '7' + d[1:]
    return d


def classify(o):
    allurls = o['site'] + o['social']
    real_sites = [s for s in o['site'] if s and not any(k in s.lower() for k in NOT_A_SITE)]
    booking = [s for s in allurls if any(k in s.lower() for k in BOOKING)]
    wa = sorted({norm(re.sub(r'.*(?:wa\.me|phone=)/?', '', unquote(s)).split('?')[0]) for s in allurls if 'wa.me' in s or 'whatsapp' in s})
    wa = [w for w in wa if len(w) == 11]
    mob = [norm(p) for p in o['phones'] if MOBILE.match(norm(p))]
    wa_nums = list(dict.fromkeys(wa + mob))
    tg = [s for s in allurls if 't.me' in s or 'telegram' in s]
    ig = [s for s in allurls if 'instagram' in s]
    if real_sites:
        prio = 'C: есть сайт'
    elif booking:
        prio = 'A+: нет сайта, есть онлайн-запись'
    elif wa_nums or tg:
        prio = 'A: нет сайта, есть WhatsApp/TG'
    elif o['phones']:
        prio = 'B: нет сайта, только городской'
    else:
        prio = 'D: нет контактов'
    return {
        'priority': prio,
        'whatsapp': ' '.join(f'https://wa.me/{w}' for w in wa_nums),
        'telegram': ' '.join(dict.fromkeys(tg)),
        'instagram': ' '.join(dict.fromkeys(ig)),
        'site': ' '.join(real_sites),
        'booking': ' '.join(dict.fromkeys(booking)),
    }


def unquote(s):
    from urllib.parse import unquote as u
    return u(s)


def main():
    cities = sys.argv[1:] or CITIES
    out = os.path.join(ROOT, 'leads.csv')
    seen = {}
    existing = []
    if os.path.exists(out):
        with open(out, encoding='utf-8') as f:
            existing = list(csv.DictReader(f))
        for r in existing:
            seen[r['spravker']] = r
    for city in cities:
        t0 = time.time()
        jobs = [(n, s) for n, slugs in NICHES.items() for s in slugs]
        with ThreadPoolExecutor(3) as ex:
            lists = list(ex.map(lambda ns: (ns[0], list_orgs(city, ns[1])), jobs))
        org_niche = {}
        for niche, urls in lists:
            for u in urls:
                org_niche.setdefault(u, niche)
        todo = [u for u in org_niche if u not in seen]
        with ThreadPoolExecutor(3) as ex:
            parsed = list(ex.map(parse_org, todo))
        added = 0
        for u, o in zip(todo, parsed):
            if not o:
                continue
            c = classify(o)
            seen[u] = {
                'city_sub': city, 'city': o['locality'], 'niche': org_niche[u], 'name': o['name'],
                'address': o['address'], 'phones': ' ; '.join(o['phones']), **c,
                'hours': o['hours'], 'spravker': u,
            }
            added += 1
        rows = list(seen.values())
        with open(out, 'w', encoding='utf-8', newline='') as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)
        print(f'{city}: listed {len(org_niche)}, new {added}, total {len(rows)}, {time.time() - t0:.0f}s', flush=True)


if __name__ == '__main__':
    main()
