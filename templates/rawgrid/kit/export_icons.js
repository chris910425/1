// Export the component library's icons (components/icons.js) as PPT Master icon libraries:
//   .claude/skills/ppt-master/templates/icons/fsc-line/<name>.svg   (recolourable line icons)
//   .claude/skills/ppt-master/templates/icons/fsc-char/<name>.svg   (Alice, Bob… keep their colours)
// node templates/rawgrid/kit/export_icons.js
const fs = require('fs'), path = require('path');
global.window = {};
require(path.resolve(__dirname, '../../../.claude/skills/frontend-slides/components/icons.js'));
const I = window.FSC_ICONS;
const base = path.resolve(__dirname, '../../../.claude/skills/ppt-master/templates/icons');
const INK = '#0A0A0A', PAPER = '#FFFFFF', ACC = '#F2D4CF';
for (const d of ['fsc-line', 'fsc-char']) fs.mkdirSync(path.join(base, d), { recursive: true });
let nl = 0, nc = 0;
for (const [name, v] of Object.entries(I)) {
  let body = v.body;
  if (v.character) {
    const map = {
      'body ink-body': `fill="${INK}"`, body: `fill="${PAPER}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"`,
      skin: `fill="${PAPER}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"`, ink: `fill="${INK}"`,
      line: `fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"`, accent: `fill="${ACC}"`,
    };
    body = body.replace(/class="([^"]+)"/g, (m, c) => map[c] || '');
    fs.writeFileSync(path.join(base, 'fsc-char', name + '.svg'),
      `<!--\nlabel: ${v.label}\ngroup: ${v.group}\nsource: Slide Studio component library\n-->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.vb}" data-icon-style="preserve-color">\n  ${body}\n</svg>\n`);
    nc++;
  } else {
    body = body.replace(/class="a"/g, 'fill="currentColor" stroke="none"').replace(/class="as"/g, '').replace(/class="dr"/g, '');
    fs.writeFileSync(path.join(base, 'fsc-line', name + '.svg'),
      `<!--\nlabel: ${v.label}\ngroup: ${v.group}\nsource: Slide Studio component library\n-->\n<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">\n  ${body}\n</svg>\n`);
    nl++;
  }
}
console.log(`fsc-line: ${nl} icons, fsc-char: ${nc} characters -> ${base}`);
