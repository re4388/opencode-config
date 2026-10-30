async page => {
  const A = { station: '24.98965,121.31476', arts: '25.01752,121.29883' };
  const t = [['station','佳樂精緻蛋糕專賣店',24.992343,121.313999]];
  const out=[];
  for (const [k,name,lat,lng] of t) {
    await page.goto('https://www.google.com/maps/dir/'+A[k]+'/'+lat+','+lng+'/data=!4m2!4m1!3e2?hl=zh-TW');
    await page.waitForTimeout(4500);
    out.push({name, txt: await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,500))});
  }
  return out;
}
