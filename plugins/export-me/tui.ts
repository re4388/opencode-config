import { Plugin } from "@opencode/plugin/tui"
import { access, mkdir, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { markdown, safeTitle, stamp, type Info, type Message } from "./format"

const DIR = "/Users/re4388/project/personal/myNote/00_inbox/opencode_session"

async function exists(path: string) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export default Plugin.define({
  id: "export-me",
  setup(context) {
    const route = () => context.ui.router.current() as { type: string; sessionID?: string }

    const write = async (sessionID: string) => {
      const response = await context.client.experimental.session.export({ sessionID })
      // client may return the payload directly or wrapped in { data }
      const data = (response as { data?: { info: Info; messages: Message[] } }).data ?? (response as unknown as { info: Info; messages: Message[] })
      if (!data?.info) throw new Error(`unexpected export response: ${JSON.stringify(response).slice(0, 200)}`)
      const info = data.info
      const messages = data.messages
      const base = `${stamp(info.time.created)}_${safeTitle(info.title)}`

      await mkdir(DIR, { recursive: true })
      let path = join(DIR, `${base}.md`)
      for (let i = 2; await exists(path); i++) {
        path = join(DIR, `${stamp(info.time.created)}_${i}_${safeTitle(info.title)}.md`)
      }
      await writeFile(path, markdown(info, messages), "utf8")
      return path
    }

    context.keymap.layer(() => ({
      mode: "global",
      commands: [
        {
          id: "export-me.export",
          title: "Export session to myNote inbox",
          group: "Session",
          slash: { name: "export-me" },
          palette: true,
          enabled: () => route().type === "session",
          run: async () => {
            const sessionID = route().sessionID
            if (!sessionID) return
            try {
              const path = await write(sessionID)
              context.ui.toast.show({ message: `已匯出 ${path.replace(homedir(), "~")}`, variant: "success" })
            } catch (error) {
              context.ui.toast.show({ message: `匯出失敗：${String(error)}`, variant: "error" })
            }
          },
        },
      ],
    }))
  },
})
