async page => {
  const feed = page.locator('div[role="feed"]');
  for (let i = 0; i < 10; i++) {
    await feed.evaluate(el => el.scrollBy(0, 4000));
    await page.waitForTimeout(1000);
    const done = await feed.evaluate(el => /您已瀏覽到/.test(el.innerText));
    if (done) break;
  }
  return await feed.evaluate(el => {
    const cards = [...el.querySelectorAll('div.Nv2PK')];
    const rows = cards.map(c => {
      const a = c.querySelector('a[href*="/maps/place/"]');
      const href = a ? a.href : '';
      const m = href.match(/!3d(-?[\d.]+)!4d(-?[\d.]+)/);
      const lines = (c.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
      return {
        name: lines[0] || '',
        rating: (lines.find(s => /^\d\.\d\(\d/.test(s.replace(/,/g, ''))) || '').replace(/,/g, ''),
        info: lines.find(s => s.includes('·')) || '',
        lat: m ? +m[1] : null,
        lng: m ? +m[2] : null,
      };
    }).filter(r => r.name);
    return rows;
  });
}
