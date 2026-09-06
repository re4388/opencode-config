// import { type Plugin, tool } from "@opencode-ai/plugin"

// export const Lesson4WordCount: Plugin = async () => {
//   return {
//     tool: {
//       wordcount: tool({
//         description: "計算一段文字有幾個單字",
//         args: {
//           text: tool.schema.string().describe("要計算的文字"),
//           count_chars: tool.schema.boolean().optional().describe("是否也回傳字元數"),
//         },
//         async execute(args, context) {
//           const { directory } = context
//           const words = args.text.trim().split(/\s+/).filter(Boolean).length
//           const extra = args.count_chars ? `（字元數：${args.text.length})` : ""
//           return `「${args.text}」共 ${words} 個字${extra}(cwd: ${directory})`
//         },
//       }),
//     },
//   }
// }