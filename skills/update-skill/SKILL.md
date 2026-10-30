---
name: update-skill
description: "覆盤這次對話，並行開三個評審子代理，把經驗提煉成現有 skill 的一處處修改。用於 /update-skill、「覆盤這次對話」、「把這次的教訓寫回 skill」。跨工作階段的流程檢討用 reflect。"
disable-model-invocation: true
---

# Update Skill

從當前對話裡挖出可複用的經驗，再路由到 skill 的修改上。

使用者說「覆盤這次對話」、"/update-skill"，或要「把這次的經驗寫回 skill」時呼叫。對話很瑣碎、跑了題，或者父代理已經正確照著某個現成 skill 做了，就跳過。一次性的事不算經驗。

跨工作階段找重複流程、決定該不該新增資產，那是 `reflect` skill 的工作。這個 skill 只看這一次對話，改的是已經存在的 skill。

## 1. 匯出當前對話記錄

```bash
opencode session list
opencode session export <session id> > "${TMPDIR:-/tmp}/session-<id>.json"
```

`opencode session list` 列出本專案的工作階段，最新在前。取第一筆的 ID，匯出成 JSON。匯出檔可能很大（數百 KB，含推理與工具輸出），照檔名交給審查者就行。

匯出後核對一下：讀檔案裡第一則 user 訊息，確認跟這次對話的開頭一致。對不上（例如同時有別的工作階段在更新），就往下試第二筆。都對不上，就自己寫一份緊湊的會話摘要代替路徑。

## 2. 並行拉起三個審查者

一條訊息裡發三次 `subagent`，`agent: "general"`，**不指定 `model`**。提示詞裡寫明只讀：不要改檔案，不要寫程式碼、改 skill 或提交。父代理才是動手的那個。

| 視角 | 提示詞模板 |
|---|---|
| 判斷 | `references/judgment-reviewer.md` |
| 工具 | `references/tooling-reviewer.md` |
| 發散 | `references/divergent-reviewer.md` |

每份模板原樣傳入，只在標出的位置替換對話記錄的路徑或摘要。審查者在 `subagent` 的回覆正文裡返回發現。

## 3. 彙總

一次 `subagent` 呼叫，`agent: "general"`，不指定 `model`，同樣寫明只讀。把 `references/synthesizer.md` 原樣傳進去，在標出的位置嵌入每個審查者的完整輸出。它返回一份 Accepted / Rejected / Backlog 列表。

## 4. 檢查是否改由結構來強制

如果 Accepted 裡有一條，用 lint 規則、指令碼、metadata 標記或執行時檢查來強制會更穩，就把它移到 Backlog。skill 正文只寫機制強制不了的東西。

## 5. 應用

先把彙總者完整的 Accepted / Rejected / Backlog 輸出拿給使用者，等明確批准，再應用任何 Accepted 修改。使用者挑一個子集，也可以改路由。skill 一改，以後的每個代理都會受影響。不要自動應用。

Backlog 只寫進回覆，不建單、不寫檔、不自己找地方記。

已批准的每一行，嚴格照它的 Routing 做：

- 現成 skill 的小改（加一行要點、把一句話收緊、改正一個過時的事實）：父代理直接改。
- 現成 skill 的大改（新的一節、一張新的模式表、超過大約 10 行）：交給 `skill-creator` skill，走它的 draft / test / iterate 迴圈。
- `tune description: <skill path>`（skill 在，但該觸發時沒觸發）：交給 `skill-creator`，走它的 description 最佳化迴圈。
- `new skill via skill-creator: <kebab-name>`：建立交給 `skill-creator`。不要現編 skill 的結構。

skill 改在安裝位置：`~/.agents/skills/<name>/`（連到 `llm_skill_0/skills/`）；專案自己的在 `.opencode/skills/`。

環境裡如果自帶 SKILL.md validator，每個改過的 skill 在宣佈完成之前都跑一遍。

## 6. 向使用者摘要

短列表，不要開場白：

- 已應用的修改：`<skill path>`。每條一行，寫改了什麼。
- 新建的 skill：`<skill path>`。每條一行（少見）。
- Backlog（未建單）：每條一行，寫模式與建議的機制。
- 丟掉的：每條駁回的發現一行，附上彙總者給的原因。
