// One screenshot per .slide of an HTML deck (frontend-slides stage decks or scrolling decks).
// node render_html.js deck.html out_dir   (playwright resolved via NODE_PATH; see render.sh)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [file, out] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(file), { waitUntil: 'networkidle' }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const n = await p.$$eval('.slide', (s) => s.length);
  const active = () => p.evaluate(() => [...document.querySelectorAll('.slide')].findIndex((s) => s.classList.contains('active')));
  for (let i = 0; i < n; i++) {
    if (i > 0) {
      const before = await active();
      await p.keyboard.press('ArrowRight');
      await p.waitForTimeout(300);
      if (before === -1 || (await active()) === before) await p.$$eval('.slide', (s, k) => s[k].scrollIntoView(), i);
    }
    await p.waitForTimeout(1600);                   // let entrance animations finish
    await p.screenshot({ path: path.join(out, `slide-${String(i + 1).padStart(2, '0')}.png`) });
  }
  await b.close();
})();
