async page => {
  // ===== CONFIG（把要輸出的清單貼進來，cid 直接從 extract 的 JSON 複製）=====
  const C = {
    places: [
      // { name: '香香小吃', cid: '14279976957094114078' },
    ],
  };
  // =====================================================================

  const out = [];
  for (const p of C.places) {
    await page.goto('about:blank');
    await page.goto('https://maps.google.com/?cid=' + p.cid + '&hl=zh-TW', { waitUntil: 'domcontentloaded' });
    try {
      await page.waitForSelector('h1', { timeout: 15000 });
    } catch (e) {}
    const got = await page.evaluate(() => document.querySelector('h1')?.innerText || '');
    const norm = (s) => s.replace(/[\s·・|]/g, '');
    out.push({ name: p.name, got, ok: !!got && norm(got).includes(norm(p.name).split('(')[0]) });
  }
  return JSON.stringify({ allOk: out.every(r => r.ok), results: out });
}
