async page => {
  const out = {};
  for (const q of ['桃園車站', '桃園藝文特區', '桃園展演中心']) {
    await page.goto('https://www.google.com/maps/search/' + encodeURIComponent(q) + '?hl=zh-TW');
    await page.waitForTimeout(3000);
    out[q] = await page.evaluate(() => {
      const res = [...document.querySelectorAll('a[href*="/maps/place/"]')].map(a => {
        const m = a.href.match(/!3d(-?[\d.]+)!4d(-?[\d.]+)/);
        return { name: (a.getAttribute('aria-label') || '').trim(), lat: m && +m[1], lng: m && +m[2] };
      }).filter(r => r.lat);
      return res.slice(0, 3);
    });
  }
  return out;
}
