async page => {
  // ===== CONFIG（每次執行前改這兩行）=====
  const C = {
    query: '小吃',          // 類型關鍵字：小吃 / 餐廳 / 拉麵 …
    origin: '士林捷運站',    // 出發點（地址或地標，必填）
    zoom: 16,
  };
  // =====================================

  // 1. 出發點 → 座標
  await page.goto('https://www.google.com/maps/search/' + encodeURIComponent(C.origin) + '?hl=zh-TW', { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForFunction(() => /@-?[\d.]+,-?[\d.]+/.test(location.href), { timeout: 15000 });
  } catch (e) {}
  const m = (await page.evaluate(() => location.href)).match(/@(-?[\d.]+),(-?[\d.]+)/);
  if (!m) return JSON.stringify({ error: 'geocode failed: ' + C.origin });
  const lat = +m[1], lng = +m[2];

  // 2. 以出發點為中心搜尋
  await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(C.query)}/@${lat},${lng},${C.zoom}z?hl=zh-TW`, { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForSelector('div.Nv2PK', { timeout: 20000 });
  } catch (e) {
    return JSON.stringify({ error: 'no results', query: C.query, origin: C.origin });
  }

  // 3. 滾動載入更多（Google 一次只給幾筆）
  for (let i = 0; i < 10; i++) {
    const n0 = await page.locator('div.Nv2PK').count();
    await page.evaluate(() => {
      const f = document.querySelector('div[role="feed"]');
      const items = f ? f.querySelectorAll(':scope > div') : [];
      items[items.length - 1]?.scrollIntoView({ block: 'end' });
    });
    await page.waitForTimeout(1200);
    if (await page.locator('div.Nv2PK').count() === n0) break;
  }

  // 4. 抽取
  const items = await page.evaluate(() => {
    const out = [];
    for (const card of document.querySelectorAll('div.Nv2PK')) {
      const a = card.querySelector('a.hfpxzc');
      if (!a) continue;
      const lines = card.innerText.split('\n').map(s => s.trim()).filter(Boolean);
      const stat = lines.find(l => /^\d\.\d\([\d,]+\)/.test(l)) || '';
      const m = stat.match(/^(\d\.\d)\(([\d,]+)\)(?:\s*·\s*(\$[\d,-]+))?/);
      const catLine = lines.find(l => l.includes(' · ') && !/^\d\.\d\(/.test(l)) || '';
      const parts = catLine.split('·').map(s => s.trim()).filter(Boolean);
      const href = a.href;
      const cid = href.match(/!1s0x[0-9a-f]+:0x([0-9a-f]+)/i);
      const geo = href.match(/!3d(-?[\d.]+)!4d(-?[\d.]+)/);
      out.push({
        name: (a.getAttribute('aria-label') || lines[0]).split('·')[0].trim(),
        rating: m ? +m[1] : null,
        reviews: m ? +m[2].replace(/,/g, '') : null,
        price: (m && m[3]) || null,
        category: parts[0] || null,
        address: parts.length > 1 ? parts[parts.length - 1] : null,
        cid: cid ? BigInt('0x' + cid[1]).toString() : null,
        lat: geo ? +geo[1] : null,
        lng: geo ? +geo[2] : null,
      });
    }
    return out;
  });

  return JSON.stringify({ query: C.query, origin: { name: C.origin, lat, lng }, count: items.length, items });
}
