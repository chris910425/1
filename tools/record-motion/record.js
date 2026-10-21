#!/usr/bin/env node
/* Record a motion style (components/motion.js) as an MP4 clip for PowerPoint.

   node tools/record-motion/record.js --style neon --text "Open Late" --sub SINGAPORE \
        [--theme ledger] [--dark] [--seconds 20] [--fps 30] [--size 1920x1080] [--out clips/neon.mp4]

   Frames are rendered one by one with the animation clock frozen (FSC motion seek),
   so the video is smooth whatever the machine speed. Without --seconds the style's
   own loop length is used, so the clip repeats seamlessly. Also writes <out>.png
   (a still for the PowerPoint poster frame). Needs ffmpeg and playwright. */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
    return acc;
}, []));
if (!args.style) { console.error('usage: record.js --style <name> [--text ..] [--sub ..] [--seconds N] [--out file.mp4]'); process.exit(1); }
const ROOT = path.resolve(__dirname, '../..'), LIB = path.join(ROOT, '.claude/skills/frontend-slides');
const [W, H] = String(args.size || '1920x1080').split('x').map(Number), FPS = +(args.fps || 30);
const out = path.resolve(args.out || path.join(ROOT, 'clips', `${args.style}.mp4`));
fs.mkdirSync(path.dirname(out), { recursive: true });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fonts = 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800;900&family=JetBrains+Mono:wght@500;800&family=Bangers&family=Press+Start+2P&family=VT323&family=Limelight&family=Poiret+One&family=Archivo+Black&family=Tilt+Neon&family=Nunito:wght@800;900&family=Josefin+Sans:wght@400;700&family=Noto+Sans+TC:wght@400;700;900&display=swap';
const attr = (k) => (args[k] !== undefined && args[k] !== true ? ` data-${k}="${esc(args[k])}"` : '');
const html = `<!DOCTYPE html><html data-theme="${esc(args.theme || 'ledger')}" class="${args.dark ? 'dark' : ''}"><head><meta charset="utf-8">
<link rel="stylesheet" href="${fonts}">
<link rel="stylesheet" href="file://${LIB}/brand/tokens.css"><link rel="stylesheet" href="file://${LIB}/components/library.css"><link rel="stylesheet" href="file://${LIB}/components/motion.css">
<style>html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden}#m{position:absolute;inset:0}</style></head>
<body><div id="m" data-fsc="motion" data-style="${esc(args.style)}"${attr('text')}${attr('sub')}></div>
<script src="file://${LIB}/components/library.js"></script><script src="file://${LIB}/components/motion.js"></script></body></html>`;
const tmp = path.join(require('os').tmpdir(), `record-motion-${process.pid}.html`);
fs.writeFileSync(tmp, html);

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    page.on('pageerror', (e) => console.error('page error:', e.message));
    await page.goto('file://' + tmp, { waitUntil: 'networkidle' }).catch(() => page.goto('file://' + tmp));
    await page.evaluate(() => document.fonts.ready);
    const loop = await page.evaluate((s) => FSC.registry.motion.loopOf(s), args.style);
    const seconds = +(args.seconds || loop || 10), frames = Math.round(seconds * FPS);
    await page.evaluate(() => { const el = document.getElementById('m'); FSC.mount(el); el._msOn = true; });
    console.log(`recording ${args.style}: ${seconds}s @ ${FPS}fps, ${W}x${H} -> ${path.relative(ROOT, out)}`);

    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < frames; f++) {
        await page.evaluate(([t, dt]) => FSC.registry.motion.seek(document.getElementById('m'), t, dt), [f / FPS, 1 / FPS]);
        const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
        if (f === Math.round(frames * 0.4)) fs.writeFileSync(out.replace(/\.mp4$/, '.png'), await page.screenshot({ type: 'png' }));
        if (f % (FPS * 2) === 0) process.stdout.write(`  ${Math.round((f / frames) * 100)}%\r`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
    await browser.close();
    fs.unlinkSync(tmp);
    console.log(`done: ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1e6).toFixed(1)} MB) + poster .png`);
})();
