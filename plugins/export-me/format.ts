export type Part = { type: string; text?: string }

export type Message = {
  type: string
  text?: string
  files?: { mime?: string }[]
  content?: Part[]
}

export type Info = {
  id: string
  title?: string
  model: { providerID: string; id: string }
  location?: { directory?: string }
  time: { created: number }
}

const pad2 = (n: number) => String(n).padStart(2, "0")

export function stamp(ms: number) {
  const d = new Date(ms)
  return pad2(d.getMonth() + 1) + pad2(d.getDate()) + pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds())
}

export function safeTitle(title?: string) {
  return (
    (title ?? "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[/\\:*?"<>|]/g, "")
      .replace(/[\u0000-\u001f]/g, "")
      .replace(/^[._]+|[._]+$/g, "")
      .slice(0, 60) || "untitled"
  )
}

export function body(messages: Message[]) {
  const blocks: string[] = []
  for (const m of messages) {
    if (m.type === "user") {
      const parts = [m.text?.trim() ?? ""]
      if ((m.files ?? []).some((f) => f.mime?.startsWith("image/"))) parts.push("[image]")
      const text = parts.filter(Boolean).join("\n\n")
      if (text) blocks.push(`## User\n\n${text}`)
    } else if (m.type === "assistant") {
      const text = (m.content ?? [])
        .filter((c) => c.type === "text")
        .map((c) => c.text ?? "")
        .join("\n\n")
        .trim()
      if (text) blocks.push(`## Assistant\n\n${text}`)
    }
  }
  return blocks.join("\n\n")
}

export function markdown(info: Info, messages: Message[]) {
  const d = new Date(info.time.created)
  const created = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  const head = [
    `# ${info.title?.trim() || "untitled"}`,
    "",
    `- session: ${info.id}`,
    `- directory: ${info.location?.directory ?? ""}`,
    `- model: ${info.model.providerID}/${info.model.id}`,
    `- created: ${created}`,
  ]
  return [head.join("\n"), body(messages)].filter(Boolean).join("\n\n") + "\n"
}
