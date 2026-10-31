---
name: find-good-eat-nearby
description: 用登入態的 Google 地圖找附近符合條件的餐廳或小吃，逐筆算步行／開車時間，輸出 markdown 表格（店名、評分、評論數、價格、距離、地圖連結）。當使用者說「找附近好吃的」「附近有什麼小吃」「幫我找餐廳」「找 XX 分鐘內走得到的店」「find good food nearby」時使用。
tags: [google-maps, food, nearby, playwright, playwright-cli, markdown]
related_skills: [playwright-cli]
version: 1.1.0
---

# Find Good Eat Nearby

用 playwright-cli 接上使用者已登入的 Chrome，在 Google 地圖搜尋 → 依條件篩選 → 逐筆查路線時間 → 輸出表格。

> 核心教訓：**評論數和價格只在登入態的桌機版出現。** 未登入的桌機版只顯示 `4.8`，沒有 `(5,108)` 也沒有 `$1-200`。所以一律 `attach --extension`，不要用 `open`。

## 何時使用

- 使用者要「附近好吃的」、指定類型（小吃／餐廳／拉麵…）或指定時間距離內可到的店。
- 需要把結果整理成表格，而不是只丟幾個店名。

## 先問清楚（缺一項就問，不要猜）

使用者可能已在 prompt 給了，有就不用再問。

1. **價格區間**：例如 `$1-200`、`$200-400`。對應 Google 價格欄的字串。
2. **類型**：`小吃`、`餐廳`、`拉麵`…（直接當搜尋關鍵字）。
3. **nearby 的定義**：走路 10 分鐘，還是開車 5 分鐘？
4. **好店的標準**：預設是「評分 ≥ 4.0 且評論數 > 1000」；使用者有別的標準就用他的。
5. **playwright-cli 的 extension token**（`PLAYWRIGHT_MCP_EXTENSION_TOKEN`）。
6. **出發點**：地址、地標，或明確說「目前位置」。**必問**，不能省略（見下方陷阱）。

## 流程

### 1. 接上登入中的 Chrome

```bash
PLAYWRIGHT_MCP_EXTENSION_TOKEN=<TOKEN> playwright-cli attach --extension=chrome
```

成功會建立 session `chrome`，之後指令都帶 `-s=chrome`。
**確認登入態生效**：搜尋後卡片要長這樣 `香香小吃 4.9(1,879) · $1-200`。只有 `4.9` 就是沒接到登入態，停下來重接。

### 2. 搜尋並抽出候選

編輯 `scripts/extract.js` 最上面的 CONFIG（query / origin），再執行：

```bash
playwright-cli -s=chrome --raw run-code --filename=scripts/extract.js > /tmp/eat.json
# --raw 會把 JSON 再包一層字串，所以要 loads 兩次
python3 -c "import json;d=json.loads(json.loads(open('/tmp/eat.json').read()));print(d['count'],[i['name'] for i in d['items'][:5]])"
```

腳本會：把 origin 地理編碼成座標 → 以該座標搜尋 → 滾動載入約 40 筆 → 回傳 name / rating / reviews / price / category / address / cid / lat / lng。

### 3. 篩選（agent 自己判斷，不必寫腳本）

從 `/tmp/eat.json` 依序砍：

1. `rating` 低於門檻（預設 4.0）。
2. `reviews` 低於門檻（預設 1000）。
3. `price` 與使用者區間不符（`price` 為 `null` 的先保留，Google 常沒標價）。
4. 類型不對的（例如使用者要小吃，就砍掉牛排、火鍋）。

通常剩 5–15 筆。

### 4. 逐筆算距離

把篩選後的清單貼進 `scripts/routes.js` 的 CONFIG（origin / mode / places），執行：

```bash
playwright-cli -s=chrome --raw run-code --filename=scripts/routes.js
```

`mode` 用 `walking` 或 `driving`。腳本逐筆開 `maps/dir/?api=1` 頁面，讀 `div.XdKEzd` 的第一行（例如 `9 分`、`1.2 公里`），轉成 `minutes`。

再依使用者定義砍掉超時的（走路 10 分鐘就砍 `minutes > 10`）。

### 5. 輸出表格

```markdown
| 店名 | 評分 | 評論數 | 價格 | walk_distance | url |
|---|---|---|---|---|---|
| 香香小吃 | 4.9 | 1,879 | $1-200 | 約 9 分 | [地圖](https://maps.google.com/?cid=14279976957094114078) |
```

- 評論數加千分位。
- 價格用 Google 原字串（可能長成 `$200-600`，照抄不要改）；`null` 填 `—`。
- 開車就把表頭改成 `drive_distance`。
- 連結用 `https://maps.google.com/?cid=<cid>`。**cid 只能從 extract 的 JSON 複製貼上，禁止自己打。** 手打一定打錯，使用者點進去會是別家店或空白。
- 輸出前跑一次 `scripts/verify-links.js`（見下方驗證），每列都要 `ok: true`。

## 已知陷阱

| 陷阱 | 症狀 | 解法 |
|---|---|---|
| 沒接登入態 | 卡片只有 `4.9`，沒有 `(1,879)` 和 `$1-200` | 一定要 `attach --extension`，並先驗證一筆卡片長相 |
| 省略 origin | 距離暴衝成「2 小時 54 分 / 12.2 公里」 | origin 一律帶入；「你的位置」在沒授權時不可信 |
| 多目的地 | 只給總時間，不給每段時間 | 一個地點開一次路線頁，別用 `waypoints` |
| 讀到上一筆的時間 | 連續查詢時第二筆的時間跟第一筆一樣 | 每筆先 `page.goto('about:blank')` 再開路線頁（routes.js 已內建） |
| 名稱尾綴 | `香香小吃·開啟過的連結` | 取 aria-label `·` 前的部分 |
| 分類／地址抓錯 | 抓到 `4.9(1,879)` 那行 | 只取「含 `·` 且不是評分行」的列，最後一段是地址 |
| 價格缺漏 | `price: null` | 填 `—`，不要自己編 |
| 等太久 | 頁面卡住、指令 timeout | 每筆之間 `page.waitForFunction` 等 `div.XdKEzd` 出現，不要固定 sleep 很久 |
| 手打 cid | 使用者點連結進到別家店或空白頁，店名對不上 | cid 一律從 extract 的 JSON 複製；輸出前跑 `scripts/verify-links.js`，全部 `ok` 才回覆 |

## 驗證成功條件

- `extract.js` 回傳 `count > 0`，且至少一筆 `reviews` 不是 `null`。
- `routes.js` 的 `minutes` 是合理值（走路 3–30 分）；出現整小時就是 origin 沒帶到。
- **每一列**連結都要驗證（不是抽一列）：把要輸出的 `{ name, cid }` 貼進 `scripts/verify-links.js` 執行，回傳 `allOk: true` 才能回覆。

```bash
playwright-cli -s=chrome --raw run-code --filename=scripts/verify-links.js
# allOk 是 false 就停下來查 cid，不要輸出
```

## 注意事項

- **不要把 token 寫進 SKILL.md 或 git**，每次從使用者輸入或環境變數帶入。
- `--raw` 的輸出是 JSON 字串再包一層，Python 要 `json.loads` 兩次。
- Google 有時把價格標成 `$200-600`（不是整齊的級距），照抄即可。
- 每筆路線約 2–4 秒；15 筆大約一分鐘，不要中途中斷。
- 回覆時附上：使用的條件（價格／類型／距離定義／評分與評論門檻）、表格、以及被砍掉幾筆。
