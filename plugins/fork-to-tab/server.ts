import { Plugin } from "@opencode/plugin"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

const run = promisify(execFile)
const json = async (file: string, args: string[]) => JSON.parse((await run(file, args)).stdout)

export default Plugin.define({
  id: "fork-to-tab",
  async setup(ctx) {
    await ctx.command.transform((editor) => {
      editor.add({
        name: "fork-to-tab",
        description: "Fork this session into a new herdr tab",
        execute: async ({ sessionID, text }) => {
          // No ctx.session.fork in the plugin API; the HTTP endpoint is the only fork path.
          // Never execFileSync here: the server event loop must stay free for the nested CLI.
          const { data: forked } = await json("opencode", ["api", "post", `/api/session/${sessionID}/fork`, "--data", "{}"])
          const title = text?.trim() || forked.title
          const tab = await json("herdr", [
            "tab", "create",
            "--cwd", forked.location?.directory ?? ctx.location.directory,
            "--label", title,
            "--focus",
          ])
          await run("herdr", ["pane", "run", tab.result.root_pane.pane_id, `opencode --session ${forked.id}`])
        },
      })
    })
  },
})
