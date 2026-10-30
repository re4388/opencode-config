async page => {
  const anchors = [
    { key: 'station', c: '24.98965,121.31476' },
    { key: 'arts', c: '25.01752,121.29883' },
  ];
  const kws = ['伴手禮', '名產', '糕餅', '蛋黃酥', '牛軋糖', '禮盒', '肉乾', '豆干'];
  const all = [];
  for (const a of anchors) {
    for (const q of kws) {
      await page.goto('https://www.google.com/maps/search/' + encodeURIComponent(q) + '/@' + a.c + ',16z?hl=zh-TW');
      await page.waitForTimeout(3000);
      const feed = page.locator('div[role="feed"]');
      if (!(await feed.count())) continue;
      for (let i = 0; i < 8; i++) {
        await feed.evaluate(el => el.scrollBy(0, 4000));
        await page.waitForTimeout(800);
        if (await feed.evaluate(el => /您已瀏覽到/.test(el.innerText))) break;
      }
      const rows = await feed.evaluate(el => [...el.querySelectorAll('div.Nv2PK')].map(c => {
        if (/贊助商廣告/.test(c.innerText)) return null;
        const a = c.querySelector('a[href*="/maps/place/"]');
        const m = a && a.href.match(/!3d(-?[\d.]+)!4d(-?[\d.]+)/);
        const lines = (c.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
        const rat = lines.map(s => s.replace(/,/g, '')).find(s => /^\d\.\d\(\d+\)/.test(s)) || '';
        const rm = rat.match(/^(\d\.\d)\((\d+)\)/) || [];
        return {
          name: lines[0] || '',
          rate: rm[1] ? +rm[1] : null,
          rev: rm[2] ? +rm[2] : null,
          addr: (lines.find(s => s.includes('·') && !/^\d\.\d\(/.test(s)) || '').replace(/^[^·]*·\s*/, ''),
          lat: m ? +m[1] : null,
          lng: m ? +m[2] : null,
          area: 'a',
        };
      }).filter(r => r && r.name && r.lat));
      rows.forEach(r => all.push({ ...r, anchor: a.key, kw: q }));
    }
  }
  const map = new Map();
  for (const r of all) {
    const k = r.name;
    if (!map.has(k)) map.set(k, { ...r, hits: [] });
    map.get(k).hits.push(r.anchor + ':' + r.kw);
  }
  return [...map.values()];
}
