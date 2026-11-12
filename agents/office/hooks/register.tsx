// Пиксельный офис агентов Ilya Web Design.
// 1) В каждой сессии, где первым сообщением запущен агент («Ты агент из agents/0X-....md»),
//    мод сам пишет его статус в agents/data/status/<агент>.json:
//    ход начался — «работает», закончился — «ждёт», ошибка или отказ — «проблема».
// 2) Панель «Мои агенты» (команда /office) раз в несколько секунд читает эти файлы
//    и agents/data/crm.csv и рисует офис с человечками и сводкой по клиентам.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AgentState, AgentStatus, Crm, Snapshot } from '../types'

const PANE = 'office'
const STATUS_DIR = 'agents/data/status'
const CRM = 'agents/data/crm.csv'

const AGENTS = [
  { id: 'lidy', name: 'Лиды', shirt: '#e24a4a', hair: '#3a2416' },
  { id: 'demo', name: 'Демо', shirt: '#4a8be2', hair: '#e8c06a' },
  { id: 'publikaciya', name: 'Публикация', shirt: '#3fbf7f', hair: '#1c1c1c' },
  { id: 'teksty', name: 'Тексты', shirt: '#e2b84a', hair: '#7a3b1e' },
  { id: 'svodka', name: 'Сводка', shirt: '#b44ae2', hair: '#2b2b2b' },
] as const

const role = atom({ plugin: 'ilya-office', key: 'role' } as const, null, { shape: 'role-1' })
const EMPTY: Snapshot = { agents: [], crm: null, at: 0 }
const snap = atom({ plugin: 'ilya-office', key: 'snap' } as const, EMPTY, { shape: 'snap-1' })

const ROLE_RE = /agents[\\/]0\d-([a-z]+)\.md/i


async function writeStatus($: EngineInterface, state: AgentState, text: string) {
  const id = await read($, role)
  if (!id) return
  const ts = await $.clock.now()
  await $.fs.write(`${STATUS_DIR}/${id}.json`, JSON.stringify({ state, text, ts }))
}

async function refresh($: EngineInterface) {
  const agents: AgentStatus[] = []
  for (const a of AGENTS) {
    const path = `${STATUS_DIR}/${a.id}.json`
    try {
      if (await $.fs.exists(path)) {
        const j = JSON.parse(String(await $.fs.read(path)))
        agents.push({ id: a.id, state: j.state, text: String(j.text || ''), ts: Number(j.ts) || 0 })
        continue
      }
    } catch { /* битый файл — как выключенный */ }
    agents.push({ id: a.id, state: 'выключен', text: 'Сессия не запущена', ts: 0 })
  }
  let crm: Crm | null = null
  try {
    if (await $.fs.exists(CRM)) {
      const lines = String(await $.fs.read(CRM)).split(/\r?\n/).filter(l => l.trim())
      const head = (lines[0] || '').split(';')
      const col = head.findIndex(h => h.trim() === 'статус')
      const st = lines.slice(1).map(l => (l.split(';')[col] || '').trim())
      const n = (x: string) => st.filter(v => v === x).length
      crm = { total: st.length, fresh: n('новый'), sent: n('написали'), replied: n('ответил'), demo: n('демо') + n('ждём оплату'), paid: n('оплачено') }
    }
  } catch { crm = null }
  const at = await $.clock.now()
  await update($, snap, () => ({ agents, crm, at }))
}

export const register: Register = on => {
  // ---------- статус агента этой сессии ----------
  on('prompt.submit', async ($, e, next) => {
    const id = ROLE_RE.exec(e.text)?.[1]?.toLowerCase()
    if (id && AGENTS.some(a => a.id === id)) {
      await update($, role, () => id)
    }
    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    await writeStatus($, 'работает', 'Работает над задачей')
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (!e.agentId) {
      const bad = e.reason === 'error' || e.reason === 'refusal'
      const first = (e.answer || '').replace(/\s+/g, ' ').trim().slice(0, 90)
      await writeStatus($, bad ? 'проблема' : 'ждёт', bad ? 'Ошибка, загляните в сессию' : first || 'Готово, ждёт задачу')
    }
    return next(e)
  })

  // ---------- панель ----------
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'office', description: 'Открыть пиксельный офис агентов' })
    if (await $.fs.exists('agents')) {
      void $.ui.open({ id: PANE, title: 'Мои агенты' })
      await refresh($)
      $.clock.every(4000, () => refresh($))
    }
    return next(e)
  })

  on('command.run', { command: 'office' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Мои агенты' })
    await refresh($)
    return { text: 'Офис открыт.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const ui = $.ui.resolve(e) as Record<string, any>
    const { Box, Text } = ui
    const s = await read($, snap)
    const crm = s.crm
    const problems = s.agents.filter(a => a.state === 'проблема').length
    const ago = (ts: number) => {
      if (!ts) return ''
      const m = Math.round((Date.now() - ts) / 60000)
      return m < 1 ? 'только что' : m < 60 ? `${m} мин назад` : `${Math.round(m / 60)} ч назад`
    }
    return (
      <Box flexDirection="column" gap={1}>
        {ui.Svg
          ? <ui.Svg source={officeSvg(s.agents)} alt={`Офис: ${s.agents.map(a => `${nameOf(a.id)} — ${a.state}`).join(', ')}`} isInteractive />
          : <Text dimColor>Пиксельный офис виден в приложении Claude на компьютере.</Text>}
        {problems > 0 && <Text color="red">Есть проблемы: {problems}</Text>}
        {s.agents.map(a => (
          <Text dimColor={a.state === 'выключен'}>
            {dot(a.state)} {nameOf(a.id)}: {a.state}{a.ts ? `, ${ago(a.ts)}` : ''}{a.text && a.state !== 'выключен' ? ` — ${a.text}` : ''}
          </Text>
        ))}
        {crm
          ? <Text>Клиенты: всего {crm.total} / новых {crm.fresh} / написали {crm.sent} / ответили {crm.replied} / демо {crm.demo} / оплачено {crm.paid}</Text>
          : <Text dimColor>crm.csv пока нет: запустите агента «Лиды».</Text>}
      </Box>
    )
  })
}

const nameOf = (id: string) => AGENTS.find(a => a.id === id)?.name ?? id
const dot = (st: AgentState) => (st === 'работает' ? '●' : st === 'проблема' ? '▲' : st === 'ждёт' ? '○' : '·')

// ---------- пиксель-арт ----------
const r = (x: number, y: number, w: number, h: number, c: string, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${extra}/>`

function person(x: number, y: number, shirt: string, hair: string): string {
  // x, y — левый верх головы; 10 пикселей в ширину
  return [
    r(x + 1, y, 8, 3, hair), r(x, y + 1, 1, 3, hair), r(x + 9, y + 1, 1, 3, hair),
    r(x + 1, y + 3, 8, 6, '#f1c7a1'),
    r(x + 3, y + 5, 1, 1, '#2a1a12'), r(x + 6, y + 5, 1, 1, '#2a1a12'),
    r(x + 4, y + 7, 2, 1, '#c98a6a'),
    r(x - 1, y + 9, 12, 9, shirt), r(x - 2, y + 11, 1, 6, shirt), r(x + 11, y + 11, 1, 6, shirt),
    r(x - 2, y + 17, 2, 2, '#f1c7a1'), r(x + 10, y + 17, 2, 2, '#f1c7a1'),
  ].join('')
}

function desk(x: number, y: number, a: (typeof AGENTS)[number], st: AgentStatus | undefined): string {
  const state = st?.state ?? 'выключен'
  const on = state !== 'выключен'
  const screen = state === 'проблема' ? '#ff5a5a' : state === 'работает' ? '#7fe3ff' : on ? '#3a6a7a' : '#2a2a2a'
  const parts: string[] = []
  // человечек за столом (если агент запущен)
  if (on) parts.push(person(x + 25, y - 22, a.shirt, a.hair))
  // стол и монитор
  parts.push(r(x, y, 60, 5, '#8a4f2a'), r(x, y + 5, 60, 2, '#6a3a1e'), r(x + 3, y + 7, 3, 12, '#6a3a1e'), r(x + 54, y + 7, 3, 12, '#6a3a1e'))
  parts.push(r(x + 6, y - 12, 18, 12, '#1d1d24'), r(x + 8, y - 10, 14, 8, screen), r(x + 13, y, 4, 1, '#1d1d24'))
  if (state === 'работает') {
    parts.push(`<rect x="${x + 10}" y="${y - 8}" width="6" height="1" fill="#1d4a5a"><animate attributeName="width" values="2;10;6;12;4" dur="1.6s" repeatCount="indefinite"/></rect>`)
    parts.push(`<rect x="${x + 10}" y="${y - 5}" width="8" height="1" fill="#1d4a5a"><animate attributeName="width" values="8;3;11;6" dur="2.1s" repeatCount="indefinite"/></rect>`)
  }
  if (state === 'ждёт') parts.push(`<text x="${x + 38}" y="${y - 26}" font-family="monospace" font-size="7" fill="#d9d4ff">z<animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite"/></text>`)
  if (state === 'проблема') parts.push(r(x + 38, y - 34, 7, 9, '#ff3b3b'), `<text x="${x + 40}" y="${y - 27}" font-family="monospace" font-size="8" font-weight="bold" fill="#fff">!</text>`)
  // табличка с именем
  const w = a.name.length * 4.6 + 8
  const lc = state === 'работает' ? '#3ddc84' : state === 'проблема' ? '#ff4a4a' : state === 'ждёт' ? '#f2c94c' : '#8a8a8a'
  parts.push(r(x + 30 - w / 2, y + 22, w, 9, '#f6f1e6'), r(x + 30 - w / 2, y + 22, 2, 9, lc))
  parts.push(`<text x="${x + 30 - w / 2 + 4}" y="${y + 29}" font-family="monospace" font-size="7" fill="#2a2030">${a.name}</text>`)
  return parts.join('')
}

function officeSvg(list: AgentStatus[]): string {
  const by = (id: string) => list.find(a => a.id === id)
  const parts: string[] = []
  // стена и пол
  parts.push(r(0, 0, 320, 92, '#3b2f6b'), r(0, 88, 320, 4, '#2c2352'))
  parts.push(r(0, 92, 320, 108, '#b5653a'))
  for (let i = 0; i < 6; i++) parts.push(r(0, 104 + i * 16, 320, 1, '#9a5230'))
  for (let i = 0; i < 12; i++) parts.push(r(((i * 53) % 320), 92 + ((i * 7) % 6) * 16, 1, 16, '#9a5230'))
  // окно со звёздами
  parts.push(r(236, 14, 52, 38, '#1b1a3a'), r(234, 12, 56, 2, '#e8e2f6'), r(234, 52, 56, 2, '#e8e2f6'), r(234, 12, 2, 42, '#e8e2f6'), r(288, 12, 2, 42, '#e8e2f6'), r(261, 12, 2, 42, '#e8e2f6'), r(234, 32, 56, 2, '#e8e2f6'))
  for (const [sx, sy] of [[242, 20], [255, 26], [270, 18], [280, 40], [246, 44]] as const) parts.push(`<rect x="${sx}" y="${sy}" width="1" height="1" fill="#fff"><animate attributeName="opacity" values="1;0.2;1" dur="${2 + (sx % 3)}s" repeatCount="indefinite"/></rect>`)
  // доска с графиком
  parts.push(r(140, 18, 60, 40, '#f4f1ea'), r(140, 58, 60, 3, '#8a8a8a'))
  for (const [i, h, c] of [[0, 14, '#e24a4a'], [1, 22, '#3fbf7f'], [2, 18, '#3fbf7f'], [3, 28, '#3fbf7f']] as const) parts.push(r(150 + i * 11, 52 - h, 6, h, c))
  // вешалка-полка и коробки, растение, лампа
  parts.push(r(22, 20, 22, 60, '#f4f1ea'), r(28, 30, 10, 12, '#e8d3b0'))
  parts.push(r(96, 64, 12, 22, '#3e8a4a'), r(94, 82, 16, 8, '#a8562a'))
  parts.push(r(300, 66, 10, 4, '#e8d3b0'), r(304, 70, 2, 20, '#6a6a6a'))
  // столы: два ряда
  const spots: [number, number][] = [[18, 118], [130, 118], [242, 118], [74, 162], [186, 162]]
  AGENTS.forEach((a, i) => { const [dx, dy] = spots[i] ?? [0, 0]; parts.push(desk(dx, dy, a, by(a.id))) })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="640" height="400" shape-rendering="crispEdges">${parts.join('')}</svg>`
}
