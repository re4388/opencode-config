import { Plugin } from "@opencode/plugin/tui"
import { createSignal } from "solid-js"

export default Plugin.define({
  id: "cache-read",
  setup(context) {
    // cache read / (cache read + fresh input + cache write), summed over the session
    const percent = (sessionID: string | undefined): string => {
      if (!sessionID) return ""
      const messages = context.data.session.message.list(sessionID) ?? []
      let read = 0
      let fresh = 0
      for (const message of messages) {
        if (message?.type !== "assistant" || !message.tokens) continue
        read += message.tokens.cache?.read ?? 0
        fresh += (message.tokens.input ?? 0) + (message.tokens.cache?.write ?? 0)
      }
      const total = read + fresh
      if (total === 0) return ""
      return `${Math.round((read / total) * 100)}% cached`
    }

    // DeepSeek 充值餘額 (topped_up_balance)，每分鐘重抓一次
    const [balance, setBalance] = createSignal("")
    const loadBalance = async () => {
      const key = globalThis.process?.env?.DEEPSEEK_API_KEY
      if (!key) return
      try {
        const res = await fetch("https://api.deepseek.com/user/balance", {
          headers: { Authorization: `Bearer ${key}` },
        })
        if (!res.ok) return
        const info = (await res.json())?.balance_infos?.[0]
        if (info) setBalance(`${info.currency === "CNY" ? "¥" : "$"}${info.topped_up_balance}`)
      } catch {
        // 斷網或金鑰失效時保持上一個值，不打斷 UI
      }
    }
    void loadBalance()
    const timer = setInterval(loadBalance, 60_000)

    const cleanup = context.ui.slot({
      append: "prompt.footer.status",
      render: (props: { sessionID?: string }) => (
        <text>{[percent(props?.sessionID), balance()].filter(Boolean).join(" · ")}</text>
      ),
    })

    return () => {
      clearInterval(timer)
      cleanup?.()
    }
  },
})
