import { spawn } from "node:child_process"
import { Plugin } from "@opencode/plugin/tui"

const tabID = process.env.HERDR_TAB_ID
const herdr = process.env.HERDR_BIN_PATH ?? "herdr"

export default Plugin.define({
  id: "herdr-tab-title",
  setup(context) {
    if (process.env.HERDR_ENV !== "1" || !tabID) return
    return context.data.on("session.renamed", ({ data }) => {
      if (context.ui.router.current()?.sessionID !== data.sessionID) return
      spawn(herdr, ["tab", "rename", tabID, data.title], { stdio: "ignore" })
    })
  },
})
