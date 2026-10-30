async page => {
  const A = { station: '24.98965,121.31476', arts: '25.01752,121.29883' };
  const targets = [
    ['station', '佳樂精緻蛋糕專賣店', 24.9966722, 121.3126437],
  ];
  const out = [];
  for (const [k, name, lat, lng] of targets) {
    await page.goto('https://www.google.com/maps/dir/' + A[k] + '/' + lat + ',' + lng + '/data=!4m2!4m1!3e2?hl=zh-TW');
    await page.waitForTimeout(4000);
    const txt = await page.evaluate(() => document.body.innerText.replace(/\n+/g, ' | ').slice(0, 600));
    out.push({ name, txt });
  }
  return out;
}
