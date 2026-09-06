// import type { Plugin } from "@opencode-ai/plugin"

// export const Lesson3SecretGuard: Plugin = async ({ $ }) => {
//   const isSensitive = (target: string) =>
//     target.includes(".env") ||
//     target.includes("secrets") ||
//     target.includes("credentials")

//   const getTarget = (input, output) => {
//     if (input.tool === "read") return output.args.filePath
//     if (input.tool === "grep") return output.args.pattern
//     if (input.tool === "bash") return output.args.command
//     return null
//   }

//   return {
//     "tool.execute.before": async (input, output) => {
//       const target = getTarget(input, output)
//       if (target && isSensitive(target)) {
//         await $`echo "[BLOCKED] ${input.tool}: ${target}" >> /tmp/opencode-plugin-lesson3.log`
//         throw new Error(`SECRET-GUARD: 攔截 ${input.tool} 存取敏感路徑`)
//       }
//     },
//   }
// }