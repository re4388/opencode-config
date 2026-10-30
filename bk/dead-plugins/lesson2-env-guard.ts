// import type { Plugin } from "@opencode-ai/plugin";

// export const Lesson2EnvGuard: Plugin = async () => {
//   return {
//     "tool.execute.before": async (input, output) => {
//       if (input.tool === "read" && output.args.filePath.includes(".env")) {
//         throw new Error("ENV-GUARD: 拒絕讀取 .env 檔案(lesson2 攔截）");
//       }
//     },
//   };
// };
