async page => {
  // ===== CONFIG（把 extract.js 篩選後的清單貼進來）=====
  const C = {
    origin: '士林捷運站',
    mode: 'walking',   // walking | driving
    places: [
      // 範例；每次改成 extract 篩選後的清單
      { name: '香香小吃', lat: 25.0886802, lng: 121.5269996 },
      { name: '越南祥記美食', lat: 25.0892021, lng: 121.5262481 },
    ],
  };
  // ======================================================

  const toMinutes = (s) => {
    const h = s.match(/(\d+)\s*小時/);
    const m = s.match(/(\d+)\s*分/);
    const min = (h ? +h[1] * 60 : 0) + (m ? +m[1] : 0);
    return min || null;
  };

  const out = [];
  for (const p of C.places) {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(C.origin)}&destination=${p.lat},${p.lng}&travelmode=${C.mode}&hl=zh-TW`;
    await page.goto('about:blank');  // 強制重繪，否則會讀到上一筆的舊時間
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    try {
      await page.waitForFunction(() => {
        const el = document.querySelector('div.XdKEzd');
        return el && /\d/.test(el.innerText);
      }, { timeout: 20000 });
    } catch (e) {}
    const txt = await page.evaluate(() => document.querySelector('div.XdKEzd')?.innerText || '');
    const lines = txt.split('\n').map(s => s.trim()).filter(Boolean);
    out.push({
      name: p.name,
      text: lines.slice(0, 2).join(' / '),
      minutes: toMinutes(lines[0] || ''),
    });
  }
  return JSON.stringify(out);
}
