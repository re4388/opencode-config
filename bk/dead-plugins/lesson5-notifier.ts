// import { type Plugin } from "@opencode-ai/plugin"

// export const Lesson5Notifier: Plugin = async ({ client, $ }) => {
//   return {
//     event: async ({ event }) => {
//       if (event.type !== "session.idle") return

//       await client.app.log({
//         body: {
//           service: "lesson5",
//           level: "info",
//           message: "session idle",
//           extra: { id: event.properties.sessionID },
//         },
//       })

//       await $`osascript -e 'display notification "opencode 回應完成" with title "lesson5"'`
//     },
//   }
// }