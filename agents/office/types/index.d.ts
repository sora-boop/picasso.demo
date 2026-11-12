export type AgentState = 'работает' | 'ждёт' | 'проблема' | 'выключен'
export type AgentStatus = { id: string; state: AgentState; text: string; ts: number }
export type Crm = { total: number; fresh: number; sent: number; replied: number; demo: number; paid: number }
export type Snapshot = { agents: AgentStatus[]; crm: Crm | null; at: number }

declare module 'claude-code' {
  interface PluginState {
    'ilya-office': {
      role: Shaped<string | null>
      snap: Shaped<Snapshot>
    }
  }
}
