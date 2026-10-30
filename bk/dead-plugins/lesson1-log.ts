// import type { Plugin } from "@opencode-ai/plugin"

// export const Lesson1Log: Plugin = async ({ $ }) => {
//   const log = (msg: string) => $`echo ${msg} >> /tmp/opencode-plugin-lesson1.log`

//   await log("plugin initialized")

//   return {
//     "tool.execute.after": async (input) => {
//       await log(`tool executed: ${input.tool}`)
//     },
//     "shell.env": async (input, output) => {
//       await log(`shell started at: ${input.cwd}`)
//     },
//   }
// }
