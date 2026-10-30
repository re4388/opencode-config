async page => {
  const queries = [
    { q: '伴手禮', c: '24.9893,121.3169' },
    { q: '名產店', c: '24.9893,121.3169' },
    { q: '糕餅店', c: '24.9893,121.3169' },
    { q: '伴手禮', c: '24.9931,121.3021' },
    { q: '名產店', c: '24.9931,121.3021' },
    { q: '糕餅店', c: '24.9931,121.3021' },
  ];
  const all = [];
  for (const { q, c } of queries) {
    await page.goto('https://www.google.com/maps/search/' + encodeURIComponent(q) + '/@' + c + ',16z?hl=zh-TW');
    await page.waitForTimeout(3500);
    const feed = page.locator('div[role="feed"]');
    if (await feed.count()) {
      for (let i = 0; i < 10; i++) {
        await feed.evaluate(el => el.scrollBy(0, 4000));
        await page.waitForTimeout(900);
        if (await feed.evaluate(el => /您已瀏覽到/.test(el.innerText))) break;
      }
      const rows = await feed.evaluate(el => [...el.querySelectorAll('div.Nv2PK')].map(c => {
        const a = c.querySelector('a[href*="/maps/place/"]');
        const m = a && a.href.match(/!3d(-?[\d.]+)!4d(-?[\d.]+)/);
        const lines = (c.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
        return {
          name: lines[0] || '',
          rating: (lines.find(s => /^\d\.\d\(\d/.test(s.replace(/,/g, ''))) || '').replace(/,/g, ''),
          info: lines.find(s => s.includes('·')) || '',
          lat: m ? +m[1] : null,
          lng: m ? +m[2] : null,
        };
      }).filter(r => r.name));
      rows.forEach(r => all.push({ ...r, q, c }));
    }
  }
  const seen = new Set();
  return all.filter(r => { const k = r.name; if (seen.has(k)) return false; seen.add(k); return true; });
}
