---
name: unslop
description: "去掉文字裡的 AI 腔。"
disable-model-invocation: true
---

# Unslop

編輯文字，去掉 AI 腔。掃描下面這些模式，再重寫。保留原意，匹配原本的語氣。

## 要識別並修正的模式

規則編號是固定 id，供其他 skill 引用。刪掉一條規則會留下空號。

### 內容

3. **浮於表面的 -ing 短語。** "highlighting..."、"ensuring..."、"reflecting..."、"showcasing..."、"fostering..."。刪掉，或用真實來源展開。
5. **含糊的歸因。** "Experts believe"、"Industry reports suggest"、"Some critics argue"。點名來源，或刪掉。

### 語言

7. **AI 詞彙。** Additionally、crucial、delve、enduring、enhance、fostering、garner、interplay、intricate、landscape（抽象用法）、pivotal、showcase、tapestry（抽象用法）、testament、underscore、vibrant。換成樸素的詞。
8. **把 "is" 說得花哨的說法。** "serves as"、"stands as"、"boasts"、"features"。直接說 "is" 或 "has"。
9. **"Not just X, but Y."** 直接把重點說出來。
10. **三段式。** 不要把觀點硬湊成三個一組。該幾個就幾個。
11. **同義詞輪換。** 同一段裡換著用 Protagonist、main character、central figure、hero。定一個，反覆用。
12. **虛假範圍。** "from X to Y"，而 X 和 Y 並不在同一有意義的尺度上。直接列出主題。

### 文風

13. **破折號濫用。** 完全不用破折號。只用句號或逗號（不用括號，不用短破折號，也不拿連字元頂替破折號）。一個念頭需要隔開，就斷句或用逗號。
14. **冒號濫用。** 冒號用在清單或例子前沒問題，別拿來當句中的連線詞。"If you're coming from traditional automation: instead of registering event handlers, you describe conditions" 這個冒號沒添任何東西。重寫，讓重點自己立住，不靠對比框架。"Describing when the scheduler should fire works best as plain English." 意思一樣，沒有撐場面的標點。
15. **加粗濫用。** 不要給每個專有名詞或縮寫都加粗。
16. **行內標題式清單。** 特徵是一個加粗標籤加冒號，後面又把這一行重說一遍："**Performance:** Performance improved..."。這些改成行文。加粗的引導語若以句號結尾、點出條目名，後面接的是真正新的細節（"**Schema in TypeScript.** Tables live in one file."），那就沒問題，不算特徵。
17. **標題首字母大寫。** 改成句首大寫。
18. **裝飾性 emoji。** 從標題和專案符號裡刪掉。
19. **彎引號。** 用直引號。

### 溝通話術

20. **聊天機器人套話。** "I hope this helps!"、"Let me know if..."、"Of course!"、"Certainly!"、"Found the smoking gun!" 刪掉。
22. **諂媚語氣。** "Great question! You're absolutely right!" 直接回應。

### 冗詞

23. **廢話短語。** "In order to" 改成 "To"。"Due to the fact that" 改成 "Because"。刪掉 "It is important to note that"。
24. **過度留有餘地。** "could potentially possibly be argued that it might" 改成 "may"。
25. **空泛的結論。** "The future looks bright." 說具體的計劃或事實。

### 行話

26. **抽象隱喻名詞。** Substrate（基礎）、wedge、wedge in（新增）、vector（方式、方法）、locus、vantage、nexus、當名詞用的 primitive、當隱喻用的 harness、像 "API surface" 那樣的 surface、bedrock、當隱喻用的 scaffolding、modality、paradigm、gold-plating（比活本身需要的還多）、當隱喻用的 ratchet（要麼用機制的真名，要麼指只會越收越緊的限制）、表示搬程式碼的 evacuate（搬出去）、endgame（最後階段）、north star、flywheel。這些詞看著像術語，但通常都有更樸素、更具體的說法。挑那個具體的詞。

### 直白表達

27. **說它做什麼，不說它感覺如何。** "the database stays close at hand"、"SQL you can read"、"types that follow your schema" 說的都是一種感覺。改法是點明機制或數字："`.toSQL()` returns the exact string sent to the database"、"a column rename fails the build"。問自己這句話要讀者做什麼、知道什麼，然後把那個寫出來。要是沒法把它講成一條具體的指令、事實或數字，就刪掉。再檢查一遍：如果這句話原封不動放進別的專案文件也成立，那它就沒說這個專案的任何事。刪掉。
28. **把囉嗦的句子改短或拆開。** 讀者要回頭重讀才能解析的句子，就拆成兩句或砍掉從句。一句一個意思。
29. **主動語態。** 優先用。"is/are/was/were + 過去分詞" 要抓出來，點明動作的主體："queries are validated" 改成 "the compiler validates queries"，"the file is parsed by the loader" 改成 "the loader parses the file"。只有主體未知或確實無關時，被動才可接受。
30. **刪掉副詞，或者換個更有力的動詞。** "runs quickly" 改成 "is fast" 或那個數字，"significantly improves" 改成測出來的增量。一個弱動詞要靠副詞撐，說明動詞選錯了。
31. **優先用樸素的詞。** "utilize" 和 "leverage" 改成 "use"，"facilitate" 改成 "help"，"numerous" 改成 "many"，"in the event that" 改成 "if"。越花哨的同義詞往往越不清楚。
32. **做作的文筆。** 明明有字面說法，卻用隱喻或修飾：格言（"wire it or delete it"）、為效果而生的修辭性殘句、把程式碼擬人（"the plan holds it"）、比喻性動詞（"rides along"、"stands on"）、套路化的框架短語。"A dial worth turning" 改成 "a parameter worth varying"。有話直說。隱喻名詞見規則 26。
33. **過度壓縮。** 省略冠詞、沒有動詞的殘句、符號黑話、縮寫，逼得讀者去解碼而不是閱讀。"Parser rejects bad date → exit 2, no write" 改成 "The parser rejects a bad date, exits with code 2, and writes nothing." 寫完整的句子，帶上冠詞和動詞，把箭頭和縮寫都寫出來。
