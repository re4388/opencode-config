---
name: technical-writing
description: "分層技術寫作標準：Diátaxis 結構、Google 開發者文風、STE 指令、Global English 句法。用於 /technical-writing，或寫、審文件、RFC、readme、PR 描述或 commit message 時。"
disable-model-invocation: true
---

# 技術寫作

寫到讓疲憊的工程師第一遍就讀懂。四層都用上。

**適用範圍。** 「句子寫給讀者」「一次只說一件事」「不讓句子有兩種讀法」三節的細則，加上改寫示例，是為英文寫的：`the`／`a`、serial comma、`only` 的位置、`-ing` 形式，中文沒有對應規則。寫中文文件時，套用「刪掉每個不幹活的字」「錯開節奏」「先選定體裁」，以及 STE 的一句一事、主動語態、補主詞。

有三條規則壓在各層上面：

- **刪掉每個不幹活的字。** 某個詞拿掉以後句子還在，這個詞就刪。"In order to" 就是 "to"。"It is important to note that" 等於沒說。
- **用短的、日常的詞。** 用 "use"，不用 "utilize"。用 "help"，不用 "facilitate"。用 "do"，不用 "perform"。長詞得靠更精確，才配佔這個長度。
- **一條規則把句子寫差了，就換一種改法，或者別動。** 每條都遵守、讀起來卻像機器寫的，這句就失敗了。

程式碼庫就是詞表。寫真實的符號、檔案、flag 或命令名，不要換成同義詞，也不要用一段描述去代替。

不要自造行話。用開發者會說出口的詞："move"、"delete"、"a budget that only decreases"，而不是 "evacuate"、"ratchet"、"endgame"。有名字的模式可以用，文件第一次出現時要說清它是什麼意思。發現新的違規說法和該換成的詞，就在回覆裡提議加進 `unslop` 的 abstract-metaphor 規則，並附上 diff。不要改那個 skill。

## 錯開節奏

一份文件可以每層都照做，讀起來仍然像機器寫的：句句切得很短，通篇沒有判斷，也沒有具體事實。

- 有意把句子寫成不一樣的長度。短句把一個判斷釘住。長句帶上一件事實，連同它的條件或後果。
- 一句一個意思，並不是一句一個長度。把裝著兩個意思的句子拆開。只裝著一個意思的長句留著。
- 體裁允許的地方，寫出你的看法。explanation 就是在權衡，所以寫你的判斷，不要只列利弊。reference 保持平直。
- 要具體。不要寫 "schema changes can cause issues"，要寫 "a column rename fails the build"。

## 先選定體裁（Diátaxis）

一份文件只選一種體裁。兩個問題就能定：內容是在指導行動（doing），還是幫助理解（thinking）？它服務的是學習，還是幹活？

- 行動 + 學習：**tutorial**。
- 行動 + 工作：**how-to**。
- 理解 + 工作：**reference**。
- 理解 + 學習：**explanation**。

整篇文件或單個句子，都用這套座標來判斷。

**Tutorial：邊做邊學。** 學習者做成，責任在你。開頭說學習者會做出什麼，不要說他們會 "learn" 什麼。每一步都儘早、反覆地給出看得見的結果。告訴他們應該看到什麼：預期的輸出、提示符的變化、那一行日誌。解釋壓到一個從句，再加一個連結。保持具體。用 "we"，寫成命令："First, do x. Now, do y."

**How-to：通向目標的步驟。** 解決一個人手頭的問題，不是機器能執行的那個操作。預設讀者會做，跳過教學。只寫動作：不跑題，不鋪背景，不為了完整而完整。這些放到連結裡。允許分叉和取捨："If you want x, do y." 指南用任務來命名："How to calibrate the radar array"，不要 "Radar array calibration"。

**Reference：供查閱的事實。** 只描述。不發指令，不勸說，不給看法。寫得平直、完整、確定。事實、選項、限制和錯誤都直接寫，不留退路。結構和所描述的東西一致，程式碼和文件就能對著找。材料放在讀者會去找的地方。能從程式碼生成的，就從程式碼生成。

**Explanation：講清楚為什麼。** 一個收好邊界的題目，離開產品也能讀。每個標題都該經得住前面加一個隱式的 "About..."。錨定在一個真實的「為什麼」上。給出上下文：設計決定、來歷、約束、替代方案。只有這裡可以寫看法。

不要混用體裁：tutorial 裡不放 reference 表，reference 裡不要手把手帶著走，how-to 裡不爭論。拆開，再用連結連上。

## 句子寫給讀者（Google developer style）

- 用 "you" 稱呼讀者，用現在時。"Will" 只用於確實以後才發生的事。
- 寫明誰做什麼："the compiler checks"，不要 "is checked"。只有不知道是誰做的，或者誰做的並不重要時，才用被動。
- 指令寫成命令："Click Submit." 事實就照直說。**絕不**寫 "should be done"。
- 條件放在指令前面："To delete the document, click Delete."
- 常見情況放前面，例外放後面。
- 口氣像一個懂行的朋友。不用套話，不用比喻。指令裡不寫 "please"。步驟裡**絕不**寫 "simply"、"easy"、"quickly"。要是真簡單，讀者就不會在這兒。
- 不要預先宣佈（"we will soon support..."）。連續的句子不要用同一個短語開頭。
- 連結文字要說出點進去是什麼：頁面標題，或一句短描述。**絕不**寫 "click here"。頁上留一句上下文，好過鏈到別處。
- 標題寫出結論，不只是話題（"Pick the mode first"，不是 "Modes"）。用 sentence case（句首大寫，其餘小寫）。任務標題是不帶主語的動詞短語（"Create an instance"）。概念標題是名詞短語。每頁一個 h1，不跳級。
- 有先後順序用編號列表，其餘用專案符號。列表前面用一個完整的句子引出。各項結構保持一致。
- 程式碼用等寬字型。介面元素用粗體。用序列逗號（serial comma）。去掉 "etc."，並事先說明這份列表並不全。

## 一次只說一件事（STE 規則）

- 一個句子一條指令。其餘地方，一個句子一個意思。
- 指令長過大約 20 個詞，其他句子長過大約 25 個詞，就拆開。
- 警告或條件放在它約束的那一步前面："If hot oil touches your skin, injuries can occur."
- 留下 "the" 和 "a"。"Remove backup file" 有兩種讀法。"Remove the backup file" 只有一種。
- 每個詞只給一個意思、一件工作，然後一直這麼用。"check" 要是檢查，就不要再用它表示制止。
- 每個動作選定一個詞：用 "start"，不要這裡寫 "start"、那裡寫 "initiate"。
- 步驟寫成直接的命令，**絕不**寫成敘述或被動："Install the component"，不要 "the component must be installed"。
- 能不用 "-ing" 形式就不用。

## 不讓句子有兩種讀法（Global English）

- "only"、"not" 這類詞緊貼著它們修飾的那個詞。"only fails on growth" 和 "fails only on growth" 說的不是一回事。
- 拆開一長串名詞："the proto import budget check script" 改成 "the script that checks the proto-import budget"。
- 每個 "it"、"they"、"this" 都指向一個顯而易見的東西。拿不準就把名詞再說一遍。**絕不**用 "this" 或 "which" 去指整句。
- 不要丟掉動詞："Phase 1 moves the converters and Phase 2 the runtime" 讓 Phase 2 缺了動詞。給它補上。
- 留下表示結構的小詞，例如 "Ensure that the switch is off" 裡的 "that"。**絕不**拿清楚去換字數。
- 並列時，省掉冠詞會讀錯，就把冠詞再寫一遍。兩樣東西寫成 "the client and the host"，不要寫成 "the client and host"。
- 一個句子裡 "and" 或 "or" 可能有兩種切法時，寫明它們連的是哪幾部分。"Both...and"、"either...or"、"if...then" 都是現成的消歧寫法。
- 用句號，不用分號。em dash（破折號）改成另一句。
- 括號裡要麼是一個完整的語法單位，要麼單獨成句。**絕不**用 "(s)" 表示複數。
- 不用斜槓：寫 "a, b, or both"，不要寫 "a/b" 或 "and/or"。
- 每樣東西，通篇只用一個名字。同一件事寫成 "the gate"、"the ratchet" 和 "the budget check"，讀者會學成三件事。沒改過的，不要來回換說法。
- 不用習語、口語、拉丁文縮寫和隱喻。

## 口氣與倉庫約定

- 本 skill 碰到的每份文件都過一遍 **unslop** 的規則（`~/.agents/skills/unslop/SKILL.md`；它是使用者顯式觸發的 skill，直接讀檔套用）。那套規則負責這些 slop 模式：AI 詞彙、填充詞、留退路、格式上的痕跡。
- PR 描述和 commit message 也是寫作。除了 Diátaxis，每一層都適用。PR 正文是一份簡報，評審者不到一分鐘就能讀完。不要貼上多代理執行日誌、SHA 列表或指標表。鏈到它們。
- 產品介面文案不是文件。那些按產品自己的文案規範來寫。
- 程式碼片段用 tab 縮排。寫真實路徑。每個計數或目錄樹的說法，在把它合進去的那個 commit 上必須為真，並附上重新生成它的命令。

## 改寫示例

改寫前：

> Configuration of the proto import ratchet budget script parameters is performed via budget.json. Note that it's important to remember that running with --write, which updates the committed budget to reflect the current count, should only be done when lowering it. If exceeded, CI fails.

改寫後：

> `budget.mjs` reads the committed budget from `budget.json` and counts the files that import protos. If the count exceeds the budget, CI fails. Run `budget.mjs --write` only to lower the budget.
