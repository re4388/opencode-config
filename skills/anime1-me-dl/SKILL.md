---
name: anime1-me-dl
version: "1.0.0"
description: Download anime episodes from anime1.me / anime1.pw using the globally-installed anime1-cli (npm package anime1-cli). Use when the user wants to download an anime episode or series from anime1.me, search the catalogue, or resolve a video URL from that domain.
argument-hint: "<anime title or URL> [episode range]"
allowed-tools: Bash
user-invocable: true
---

# /anime1-me-dl

Downloads anime from anime1.me / anime1.pw via the `anime1` CLI (`npm i -g anime1-cli`, Node 20+ only; the CLI itself needs no ffmpeg/yt-dlp/Python). Files land in `<--out dir>/<series-title>/<series> [NN].mp4`. If `anime1` is missing, install it with `npm install -g anime1-cli`. The mirror-site path below does use `ffmpeg` (only to remux HLS output to mp4).

**Output folder: always `/Users/re4388/Downloads/vid_dl`.** Every video download in this skill goes there (`mkdir -p` it if missing). Do not use the CLI default `./downloads` and do not invent another path. That folder is the user's existing media library: only add new subfolders, never move, rename or delete what is already in it. (`~/downloads` and `~/Downloads` are the same directory on macOS.)

## Two flows

**A. From an episode/category URL** (works for both anime1.me and anime1.pw):

```bash
# single episode
anime1 https://anime1.me/15651 --out /Users/re4388/Downloads/vid_dl

# whole category/season, every episode, into a folder
anime1 "https://anime1.pw/?cat=60" --all --out /Users/re4388/Downloads/vid_dl

# multiple URLs at once
anime1 https://anime1.me/15651 https://anime1.pw/349 --out /Users/re4388/Downloads/vid_dl
```

**B. Browse/search the catalogue first** (anime1.me only — it publishes the whole catalogue as JSON; anime1.pw has no catalogue, use flow A):

```bash
# find the series and its [cat-id]
anime1 --search "<title keyword>" --list
# →  [874] 86－不存在的戰區－ — 1-23

# download every episode
anime1 --cat 874 --all --out /Users/re4388/Downloads/vid_dl

# download with year/season filters
anime1 --year 2025 --season summer --search "frieren" --all --out /Users/re4388/Downloads/vid_dl
```

Series titles differ per site (Taiwan / China / Japanese name). When the user's title returns nothing, retry with another translation and with title fragments, then scan `anime1 --year <YYYY> --list` by eye. When you report, say which name the site uses. `連載中(N)` means still airing: report "currently N episodes", never "finished".

## Other sites the CLI cannot parse (anime1.in, mmov.io)

`anime1-cli` only accepts anime1.me / anime1.pw. For other mirrors, extract the m3u8 yourself and download it with `scripts/hls-to-mp4.mjs` (parallel segments, retries, resume, optional `--mp4`).

**Take the slug from the site's search page; never rebuild it from the pinyin.** A guessed slug 404s on a single letter (`qi-miao` vs `qiao-miao`). Search `https://anime1.in/?s=<urlencoded-title>`, read the `href` of a result, and drop the trailing `-100NN000` to get the slug. Episode URLs are `<slug>-100<NN>000` (two-digit episode), which is fine for filling gaps, but when the count is uncertain or the show has specials (`11.5`) read the episode list off the series page — an integer loop silently skips specials.

```bash
OUT=/Users/re4388/Downloads/vid_dl; mkdir -p "$OUT"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

# 1. find the slug (and see what the site calls the show)
curl -sS -A "$UA" "https://anime1.in/?s=<urlencoded-title>" | rg -o 'href="/[0-9]{4}-[^"]+"' | sort -u

# 2. anime1.in: episode page → <iframe src="/_player_x_/<id>"> → that player page has
#    <source src="https://.../index.m3u8"> (AES-128 handled automatically)
PID=$(curl -sS -A "$UA" "<episode-url>" | rg -o '/_player_x_/[0-9]+' | head -1)
M3U8=$(curl -sS -A "$UA" "https://anime1.in$PID" | rg -o 'https://[^"]+\.m3u8' | head -1)
ANIME1_UA="$UA" node scripts/hls-to-mp4.mjs "$M3U8" "$OUT/<title>/<title> [01]" --mp4
```

**mmov.io: try plain curl first.** A desktop-UA curl returns 200 and the m3u8 is already in the page; only a 403 justifies the headed-Chrome detour.

```bash
# search:  /vodsearch/-------------.html?wd=<urlencoded>   → results are /vod/<id>.html
# detail:  /vod/<id>.html                                  → episode links /vodplay/<id>/<line>-<ep>.html
# play:    /vodplay/<id>/1-1.html  contains  videoSrc = 'https://.../index.m3u8'
# The homepage <form> posts to Google; there is no usable in-site search form.
curl -sSL -A "$UA" "https://hk.mmov.io/vodplay/<id>/1-1.html" | rg -o "videoSrc = '[^']+'"

# only if curl 403s: real headed Chrome
playwright-cli open --browser=chrome --headed "https://hk.mmov.io/vodplay/<id>/3-1.html"
playwright-cli --raw eval "() => { const s=[...document.querySelectorAll('script')].map(x=>x.textContent).find(t=>t&&t.includes('videoSrc')); return s.match(/videoSrc = '([^']+)'/)?.[1]; }"
playwright-cli close
```

- `hls-to-mp4.mjs` reads `ANIME1_UA` from the environment; pass it or the CDN may reject the generic UA.
- The output base must NOT carry an extension (`".../<title> [01]"`); `--mp4` only remuxes when the downloader produced a `.ts`.
- m3u8 URLs may contain raw Chinese path segments (`.../第01集/index.m3u8`). Pass them as-is; do not percent-encode.
- Skip episodes that already exist (`[ -s "$base.mp4" ] && continue`) so a re-run resumes instead of refetching the season.
- A batch script must print `OK n/N`, list the failed episodes, and `exit 1` when any failed. A retry-then-skip loop still exits 0, so "completed" alone proves nothing.
- Both sites: dead/round-robin CDN IPs make single segments fail; `hls-to-mp4.mjs` retries, and re-running resumes from cached parts.
- anime1.in marks dead episodes with `播放失效` and **still answers HTTP 200** — check the HTML for `播放失效` / `/_player_x_/`, not the status code. If a whole season is dead there, stop retrying and change mirror (this run: anime1.in's Re:Zero season 1 was all dead → mmov.io had it).
- If a mirror is dead, don't stop: try another source line on the same page (不同線路: `/3-`=飛快雲, `/8-`=高清, `/7-`=快車, `/5-`=櫻花, `/6-`=閃電, `/4-`=非凡, …), then another mirror entirely.

## Useful flags

| Flag | Effect |
|------|--------|
| `--all` | download all episodes without prompting (required for non-interactive use) |
| `--out <dir>` | output dir — always pass `/Users/re4388/Downloads/vid_dl` (CLI default `./downloads` is not used) |
| `--cat <id>` | jump straight to a category id, skip browsing |
| `--year` / `--season` | filter by spring\|summer\|autumn\|winter (or 春/夏/秋/冬) |
| `--search <text>` | filter series list by title |
| `--extract` | print resolved video URLs + cookies only, no download |
| `--list` | print catalogue and exit |
| `--connections <n>` | connections per file (default 6, max 8; CDN throttles ~1MB/s per connection) |
| `--concurrency <n>` | episodes in parallel (default 1, max 4) |
| `--min-interval <ms>` | min delay between requests (default 250) |
| `--user-agent <ua>` / `--cf-clearance <cookie>` | fix Cloudflare 403 — copy both from the user's browser |

## Rules

- Always download into `/Users/re4388/Downloads/vid_dl` (pass `--out`, or `OUT=` for the m3u8 script).
- Run long batches in the background (`background: true`) and wait for the completion notification; the default foreground timeout kills a season download. Don't poll.
- Non-interactive: always pass `--all` (the interactive prompts need a TTY the agent doesn't have).
- Resolve the cat id via `--search <title> --list` instead of guessing URLs.
- Note the series name may include full-width dashes and specials (e.g. `11.5`); don't "fix" filenames.
- When a season comes from a different mirror, reuse the folder name anime1-cli already produced for the same show (`:` becomes `_`, e.g. `Re_從零開始的異世界生活 第二季`) so the seasons sort together.
- HLS `.m3u8` streams are handled automatically (segments fetched, AES-128 decrypted, stitched) — no ffmpeg needed.
- If Cloudflare 403s, ask the user for a browser User-Agent and `cf_clearance` cookie, then retry with `--user-agent` and `--cf-clearance`.
- `✗ fetch failed` on every episode of a series (others fine): the CDN host has an AAAA record but the machine has no working IPv6, and Node's IPv6 auto-fallback times out at the 250ms default. Rerun with `NODE_OPTIONS='--network-family-autoselection-attempt-timeout=1000'`.
- Always verify the result, not just the "✓ saved"/exit 0: file count must match the episode count; `ffprobe -v error -show_entries format=duration -of default=nw=1 <file>` should be non-empty/sane; a raw `.ts` must start with sync byte `0x47` (`xxd -l 1 -p <file>`). A single stalled segment can leave a short, playable-looking file.
- Download one episode first and keep its duration as the baseline. When most episodes agree and a few are clearly longer, those are extended first/final episodes, not corrupt files.
- Check the stream layer once per series: `ffprobe -v error -show_entries stream=codec_type,codec_name,width,height -of default=nw=1 <file>` tells you whether a subtitle track and 1080p video are actually there. File count and duration cannot.
- Verify against the exact list you just wrote, never `for d in *` over the shared media library: the user's other shows sit in the same folder and show up as false failures. State in the report that existing folders were left alone.
- `cd` into the folder before any `*.mp4` glob — zsh aborts the whole command on an unmatched glob.
