# opencode-config

個人 OpenCode 設定備份。遠端：`https://github.com/re4388/opencode-config`

## 密鑰規則

這個 repo 不含任何密鑰。

2026-10-30 清理過一次。當時有 4 個密鑰進入未推送的 commit。我用 `git filter-repo` 改寫本機歷史，再推送。全部歷史通過 `gitleaks` 掃描，結果 `no leaks found`。

不要提交這些東西：

- `service.json`（已加入 `.gitignore`）
- 含 `apiKey`、`token`、`password` 的檔案
- `bk/` 裡的舊設定，除非已改成環境變數

## service.json 是什麼

它是 OpenCode v2 背景服務的 Basic Auth 密碼。不是 OpenCode 模型 API 的密鑰。

- 設定檔：`~/.config/opencode/service.json`。密碼來源，已被 git 忽略。
- 註冊檔：`~/.local/state/opencode/service.json`。記錄執行中服務的 url、pid、version。
- 服務：`opencode serve --service`，監聽 `http://127.0.0.1:49374`。
- 帳號固定是 `opencode`。密碼是設定檔的 `password` 欄位。
- 服務只綁 `127.0.0.1`，只有本機能連。

讀出密碼：

```sh
opencode service get password
```

這個指令會輸出 43 個字元的密碼。客戶端拿這個密碼做 Basic Auth。沒帶密碼呼叫 `/api/info` 會回 `401`。帶正確密碼會回 `200`。

不要把帳號密碼直接寫在 `curl -u user:pass` 範例裡。`gitleaks` 會把它當成外洩密鑰。

換密碼：

```sh
opencode service set password '<新密碼>'
opencode service restart
```

`service.json` 只留本機，不進 git。刪掉它不會弄壞 repo。

## 需要的環境變數

啟動 OpenCode 前，shell 要有這些變數：

- `API_KEY_9ROUTER`：正式設定 `opencode.jsonc` 需要。少了它，9router provider 會失敗。
- `FIRECRAWL_API_KEY`：只有還原 `bk/a1.json` 時需要。
- `NOTION_TOKEN`：只有還原 `bk/a1.json` 時需要。

檢查方式：

```sh
printenv API_KEY_9ROUTER
```

2026-10-30 檢查時，`~/.zshrc`、`~/.zprofile`、`~/.config/zsh` 都沒有 `API_KEY_9ROUTER`。如果你沒設在別的地方，要補上。

正式設定檔在：

```
/Users/re4388/.config/opencode/opencode.jsonc
```

## bk/ 備份檔

`bk/` 是舊設定備份。裡面的 `apiKey` 已改成 `{env:...}`。還原任何 `bk/` 檔案前，先設好對應的環境變數。否則該 provider 或 MCP 會失敗。

## 這次清理的步驟

1. 備份整個 repo，含 `.git`。
2. 用 `git filter-repo` 改寫 8 個本機 commit。
3. 把 4 個密鑰換成 `***REMOVED***`。
4. 把 `service.json` 移出版本控制，加入 `.gitignore`。
5. 把 `bk/*` 備份檔改成讀環境變數。
6. 用 `gitleaks` 掃描全部歷史。
7. 推送。

## 日常檢查

提交前跑一次：

```sh
gitleaks git --no-banner .
```

看到 `no leaks found` 再推送。
