/* ===========================================
   FSC MOTION STYLES (behavior). Load after library.js.
   <div data-fsc="motion" data-style="particles" data-text="BLOCK 1024" data-sub="…"></div>
   Styles: particles liquid holo neon wireframe glass kinetic iso clay ascii
           mesh comic flap vhs halftone bauhaus pixel blueprint deco brutal
   data-text: main words. kinetic and flap take several messages split by "|".
   Loops run only while the element is on screen (and its slide is visible).
   =========================================== */
(function () {
    if (!window.FSC) return console.warn('FSC motion: load library.js first');
    const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SVGNS = 'http://www.w3.org/2000/svg';
    let uid = 0;
    const S = {};                                     // style name -> { text, sub, build(el,o), frame?(el,t,dt) }
    const css = (el, v, d) => (getComputedStyle(el).getPropertyValue(v).trim() || d);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const rnd = (seed) => () => { seed = (seed * 1103515245 + 12345) >>> 0; return ((seed >>> 16) & 32767) / 32767; };

    /* Canvas that tracks its box size (CSS px; drawn at device pixel ratio) */
    function canvas(el, cls = '') {
        const c = document.createElement('canvas');
        if (cls) c.className = cls;
        el.appendChild(c);
        const ctx = c.getContext('2d');
        const fit = () => {
            const w = el.clientWidth || 640, h = el.clientHeight || 360, r = Math.min(2, devicePixelRatio || 1);
            c.width = Math.round(w * r); c.height = Math.round(h * r);
            ctx.setTransform(r, 0, 0, r, 0, 0);
            c._w = w; c._h = h;
            c.onfit && c.onfit(w, h);
        };
        new ResizeObserver(fit).observe(el);
        fit();
        return { c, ctx };
    }
    // Measure SVG paths for draw-on animations
    const measure = (root) => root.querySelectorAll('.d, .ray, .fr').forEach((p) => p.style.setProperty('--len', Math.ceil(p.getTotalLength ? p.getTotalLength() : 1000)));

    /* On-screen tracking: pauses CSS animations and JS loops when off-screen */
    const io = new IntersectionObserver((es) => es.forEach((e) => {
        e.target._msOn = e.isIntersecting;
        e.target.classList.toggle('ms-off', !e.isIntersecting);
    }), { threshold: 0.01 });

    FSC.registry.motion = {
        mount(el) {
            const name = el.dataset.style, s = S[name];
            if (!s) return console.warn('FSC motion: unknown style', name);
            cancelAnimationFrame(el._msRaf);
            el.className = el.className.replace(/\bms-\S+/g, '').trim();
            el.classList.add('ms-' + name);
            el.innerHTML = '';
            const o = { text: el.dataset.text || s.text, sub: el.dataset.sub !== undefined ? el.dataset.sub : s.sub };
            el._ms = { t: 0, o };
            s.build(el, o);
            io.observe(el);
        },
        play(el) {
            const s = S[el.dataset.style];
            if (!s || !s.frame || REDUCED) return;
            cancelAnimationFrame(el._msRaf);
            let last = performance.now();
            const slide = el.closest('.slide');
            const tick = (now) => {
                if (!el.isConnected) return;
                el._msRaf = requestAnimationFrame(tick);
                const dt = Math.min(0.05, (now - last) / 1000); last = now;
                if (el._msOn === false || (slide && !slide.classList.contains('visible'))) return;
                el._ms.t += dt;
                s.frame(el, el._ms.t, dt);
            };
            el._msRaf = requestAnimationFrame(tick);
        },
        final(el) { const s = S[el.dataset.style]; if (s && s.frame) { el._ms.t = s.still || 3; s.frame(el, el._ms.t, 0.016); } }
    };

    /* 1. PARTICLES: dots fly in to form the words, hold, burst, repeat */
    S.particles = {
        text: 'BLOCK 1024', sub: '',
        build(el, o) {
            const { c, ctx } = canvas(el);
            el._p = { c, ctx, pts: [] };
            c.onfit = (w, h) => {
                const off = document.createElement('canvas'); off.width = w; off.height = h;
                const g = off.getContext('2d');
                let fs = h * 0.34; g.font = `900 ${fs}px ${css(el, '--font-display', 'sans-serif')}`;
                const tw = g.measureText(o.text).width; if (tw > w * 0.86) { fs *= (w * 0.86) / tw; g.font = `900 ${fs}px ${css(el, '--font-display', 'sans-serif')}`; }
                g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.text, w / 2, h / 2);
                const data = g.getImageData(0, 0, w, h).data, gap = Math.max(3, Math.round(w / 210)), pts = [], R = rnd(7);
                for (let y = 0; y < h; y += gap) for (let x = 0; x < w; x += gap) if (data[(y * w + x) * 4 + 3] > 128)
                    pts.push({ tx: x, ty: y, x: R() * w, y: R() * h, vx: 0, vy: 0, a: R() < 0.12 });
                el._p.pts = pts; el._p.gap = gap;
            };
            c.onfit(c._w, c._h);
        },
        still: 4,
        frame(el, t) {
            const { c, ctx, pts, gap } = el._p, w = c._w, h = c._h, ph = t % 7, ink = css(el, '--ink', '#111'), acc = css(el, '--accent', '#24f');
            ctx.clearRect(0, 0, w, h);
            const burst = ph > 5.2;
            for (const p of pts) {
                if (burst) { if (!p.b) { const ang = Math.atan2(p.ty - h / 2, p.tx - w / 2) + (Math.random() - 0.5); p.vx = Math.cos(ang) * (4 + Math.random() * 8); p.vy = Math.sin(ang) * (4 + Math.random() * 8); p.b = 1; } p.vx *= 0.97; p.vy *= 0.97; }
                else { p.b = 0; const wob = Math.sin(t * 2 + p.tx * 0.05) * 0.6; p.vx = (p.vx + (p.tx + wob - p.x) * 0.06) * 0.8; p.vy = (p.vy + (p.ty - p.y) * 0.06) * 0.8; }
                p.x += p.vx; p.y += p.vy;
                ctx.fillStyle = p.a ? acc : ink;
                ctx.fillRect(p.x, p.y, gap * 0.62, gap * 0.62);
            }
        }
    };

    /* 2. LIQUID MORPH: blobs merge and split (SVG goo filter) */
    S.liquid = {
        text: 'Liquid', sub: '',
        build(el, o) {
            const id = 'msgoo' + (++uid);
            el.innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><filter id="${id}"><feGaussianBlur in="SourceGraphic" stdDeviation="22"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"/></filter></defs><g filter="url(#${id})" fill="${css(el, '--accent', '#2445ff')}">${'<circle/>'.repeat(7)}</g></svg><div class="ms-center"><b>${esc(o.text)}</b></div>`;
            el._c = [...el.querySelectorAll('circle')];
        },
        frame(el, t) {
            el._c.forEach((c, i) => {
                const k = i === 0, a = t * (0.5 + i * 0.13) + i * 2.1, r = k ? 190 + Math.sin(t * 1.3) * 20 : 70 + (i % 3) * 30;
                const d = k ? 0 : 230 + Math.sin(t * 0.9 + i) * 150;
                c.setAttribute('cx', 800 + Math.cos(a) * d * 1.3); c.setAttribute('cy', 450 + Math.sin(a * 1.2) * d * 0.7); c.setAttribute('r', r);
            });
        }
    };

    /* 3. HOLOGRAPHIC: iridescent card tilting, with a light sheen */
    S.holo = {
        text: 'HOLO PASS', sub: 'MSBT · NTU · 2026',
        build(el, o) { el.innerHTML = `<div class="hc"><div class="chip"></div><b>${esc(o.text)}</b><i>${esc(o.sub)}</i></div>`; }
    };

    /* 4. NEON GLOW: flickering tube sign */
    S.neon = {
        text: 'Open Late', sub: 'SINGAPORE',
        build(el, o) { el.innerHTML = `<div class="tube"></div><div class="ms-center"><div><b>${esc(o.text)}</b><i>${esc(o.sub)}</i></div></div>`; }
    };

    /* 5. WIREFRAME 3D: rotating icosahedron over a moving grid floor */
    S.wireframe = {
        text: 'WIREFRAME', sub: '',
        build(el, o) {
            const { c, ctx } = canvas(el); el._w = { c, ctx };
            const f = (1 + Math.sqrt(5)) / 2, V = [[-1, f, 0], [1, f, 0], [-1, -f, 0], [1, -f, 0], [0, -1, f], [0, 1, f], [0, -1, -f], [0, 1, -f], [f, 0, -1], [f, 0, 1], [-f, 0, -1], [-f, 0, 1]];
            const E = []; for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) { const d = Math.hypot(V[i][0] - V[j][0], V[i][1] - V[j][1], V[i][2] - V[j][2]); if (Math.abs(d - 2) < 0.01) E.push([i, j]); }
            el._w.V = V; el._w.E = E;
            el.insertAdjacentHTML('beforeend', `<div class="ms-cap">${esc(o.text)}</div>`);
        },
        frame(el, t) {
            const { c, ctx, V, E } = el._w, w = c._w, h = c._h, ink = css(el, '--ink', '#111'), acc = css(el, '--accent', '#24f');
            ctx.clearRect(0, 0, w, h);
            // floor grid (perspective)
            const hor = h * 0.62; ctx.strokeStyle = ink; ctx.lineWidth = 1;
            for (let i = -12; i <= 12; i++) { ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.moveTo(w / 2 + i * w * 0.02, hor); ctx.lineTo(w / 2 + i * w * 0.16, h); ctx.stroke(); }
            for (let k = 0; k < 10; k++) { const z = ((k + (t * 0.8) % 1) / 10); const y = hor + (h - hor) * z * z; ctx.globalAlpha = 0.08 + z * 0.25; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
            // icosahedron
            const ay = t * 0.6, ax = t * 0.33, s = Math.min(w, h) * 0.2, cx = w / 2, cy = h * 0.42;
            const P = V.map(([x, y, z]) => { let X = x * Math.cos(ay) + z * Math.sin(ay), Z = -x * Math.sin(ay) + z * Math.cos(ay), Y = y * Math.cos(ax) - Z * Math.sin(ax); Z = y * Math.sin(ax) + Z * Math.cos(ax); const k = 4 / (4 + Z); return [cx + X * s * k, cy + Y * s * k, Z]; });
            ctx.lineWidth = 1.6;
            E.forEach(([i, j]) => { const back = P[i][2] + P[j][2] > 0; ctx.globalAlpha = back ? 0.25 : 0.95; ctx.strokeStyle = back ? ink : acc; ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(P[j][0], P[j][1]); ctx.stroke(); });
            ctx.globalAlpha = 1; ctx.fillStyle = acc; P.forEach((p) => { if (p[2] < 0) { ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 7); ctx.fill(); } });
        }
    };

    /* 6. GLASSMORPHISM: frosted panes over drifting colour */
    S.glass = {
        text: '2.48 ETH', sub: 'Wallet',
        build(el, o) {
            el.innerHTML = `<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
              <div class="pane p1"><small>${esc(o.sub)}</small><b>${esc(o.text)}</b><div class="bars">${[40, 70, 55, 90, 65, 100, 80].map((v, i) => `<span style="height:${v}%;animation-delay:${-i * 0.4}s"></span>`).join('')}</div></div>
              <div class="pane p2"><small>Gas</small><b style="font-size:4cqw">12 gwei</b></div>`;
        }
    };

    /* 7. KINETIC TYPE: lines rise in, hold, leave (data-text "Build|Ship|Repeat.") */
    S.kinetic = {
        text: 'Build.|Ship.|Repeat.', sub: '',
        build(el, o) { el.innerHTML = `<div class="lines">${o.text.split('|').map((w, i) => `<span class="ln"><span style="--i:${i}">${esc(w)}</span></span>`).join('')}</div><div class="bar"></div>`; }
    };

    /* 8. ISOMETRIC: blocks drop into a 3×3 stack (a little blockchain city) */
    S.iso = {
        text: 'ISOMETRIC', sub: '',
        build(el, o) {
            const acc = css(el, '--accent', '#2445ff'), ink = css(el, '--ink', '#111');
            const W = 130, H = 75, D = 100, cubes = [];
            const cube = (gx, gy, gz, i, top) => {
                const x = 800 + (gx - gy) * W, y = 400 + (gx + gy) * H - gz * D;
                return `<g class="cube" style="--i:${i}"><polygon points="${x},${y - H} ${x + W},${y} ${x},${y + H} ${x - W},${y}" fill="${top}"/><polygon points="${x - W},${y} ${x},${y + H} ${x},${y + H + D} ${x - W},${y + D}" fill="${acc}"/><polygon points="${x + W},${y} ${x},${y + H} ${x},${y + H + D} ${x + W},${y + D}" fill="${ink}" fill-opacity=".85"/><polygon points="${x + W},${y} ${x},${y + H} ${x},${y + H + D} ${x + W},${y + D}" fill="${acc}" fill-opacity=".55"/></g>`;
            };
            const hgt = [[1, 2, 1], [2, 3, 1], [1, 1, 2]]; let i = 0;
            for (let s = 0; s <= 4; s++) for (let gx = 0; gx < 3; gx++) { const gy = s - gx; if (gy < 0 || gy > 2) continue; for (let z = 0; z < hgt[gy][gx]; z++) cubes.push(cube(gx, gy, z, i++, z === hgt[gy][gx] - 1 && gx === 1 && gy === 1 ? '#ffffff' : css(el, '--panel', '#e8e7e1'))); }
            el.innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">${cubes.join('')}</svg><div class="ms-cap">${esc(o.text)}</div>`;
        }
    };

    /* 9. CLAY 3D: soft squishy shapes bouncing */
    S.clay = {
        text: 'Clay', sub: '',
        build(el, o) { el.innerHTML = `<div class="floor"></div><div class="c c1" style="--i:0"></div><div class="c c2" style="--i:1"></div><div class="c c3" style="--i:2"></div><div class="ms-center"><b>${esc(o.text)}</b></div>`; }
    };

    /* 10. ASCII ART: spinning donut made of characters */
    S.ascii = {
        text: 'ASCII', sub: '',
        build(el, o) {
            el.innerHTML = '<div class="wrap"><pre></pre></div>';
            const pre = el.querySelector('pre');
            const fit = () => { const h = el.clientHeight || 360, w = el.clientWidth || 640, rows = 40, fs = h / rows; pre.style.fontSize = fs + 'px'; el._a = { pre, rows, cols: Math.floor(w / (fs * 0.6)), word: o.text.toUpperCase() }; };
            new ResizeObserver(fit).observe(el); fit();
        },
        frame(el, t) {
            const { pre, rows, cols, word } = el._a; if (!cols) return;
            if (el._a.last && t - el._a.last < 0.045) return; el._a.last = t;
            const A = t * 1.1, B = t * 0.6, out = new Array(rows * cols).fill(' '), z = new Array(rows * cols).fill(0), ch = '.,-~:;=!*#$@';
            const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B), sc = rows * 0.9;
            for (let j = 0; j < 6.28; j += 0.07) for (let i = 0; i < 6.28; i += 0.02) {
                const c = Math.sin(i), d = Math.cos(j), e = Math.sin(A), f = Math.sin(j), g = Math.cos(A), hh = d + 2, D = 1 / (c * hh * e + f * g + 5), l = Math.cos(i), m = Math.cos(B), n = Math.sin(B), tt = c * hh * g - f * e;
                const x = Math.floor(cols / 2 + sc * 0.85 * D * (l * hh * m - tt * n)), y = Math.floor(rows / 2 + sc * 0.5 * D * (l * hh * n + tt * m)), o = x + cols * y;
                const N = Math.floor(8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n));
                if (y >= 0 && y < rows && x >= 0 && x < cols && D > z[o]) { z[o] = D; out[o] = ch[Math.max(0, N)] || '.'; }
            }
            const wr = rows - 3, wc = Math.floor((cols - word.length) / 2);
            for (let k = 0; k < word.length; k++) out[wr * cols + wc + k] = '\u0000' + word[k];
            let s = '';
            for (let k = 0; k < out.length; k++) { const v = out[k]; s += v[0] === '\u0000' ? `<span class="hi">${esc(v[1])}</span>` : v; if ((k + 1) % cols === 0) s += '\n'; }
            pre.innerHTML = s;
        }
    };

    /* 11. GRADIENT MESH: soft colour fields drifting */
    S.mesh = {
        text: 'Gradient', sub: '',
        build(el, o) { el.innerHTML = `<div class="m m1"></div><div class="m m2"></div><div class="m m3"></div><div class="m m4"></div><svg class="grain"><filter id="msn${++uid}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2"/></filter><rect width="100%" height="100%" filter="url(#msn${uid})"/></svg><div class="ms-center"><b>${esc(o.text)}</b></div>`; }
    };

    /* 12. COMIC BOOK: POW burst, speech bubble, halftone and action lines */
    S.comic = {
        text: 'POW!', sub: 'Gas fees?!',
        build(el, o) {
            const pts = []; for (let k = 0; k < 28; k++) { const r = k % 2 ? 38 : 50, a = (k / 28) * Math.PI * 2; pts.push(`${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`); }
            el.innerHTML = `<div class="rays"></div><svg class="burst" viewBox="0 0 100 100"><polygon points="${pts.join(' ')}" fill="#ff3b30" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg><div class="pow">${esc(o.text)}</div>${o.sub ? `<div class="bubble">${esc(o.sub)}</div>` : ''}`;
        }
    };

    /* 13. SPLIT-FLAP: airport departure board (data-text "MSG ONE|MSG TWO") */
    S.flap = {
        text: 'DEPARTURES|SINGAPORE|NTU  0830', sub: 'GATE B12',
        build(el, o) {
            const msgs = o.text.toUpperCase().split('|'), n = Math.max(...msgs.map((m) => m.length));
            el.innerHTML = `<div class="lbl">${esc(o.sub)}</div><div class="board">${'<div class="t"><span> </span></div>'.repeat(n)}</div>`;
            el._f = { tiles: [...el.querySelectorAll('.t')], msgs: msgs.map((m) => m.padEnd(n)), cur: Array(n).fill(' '), k: -1, next: 0, tick: 0 };
        },
        still: 2,
        frame(el, t) {
            const f = el._f, CH = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:-.';
            if (t >= f.next) { f.k = (f.k + 1) % f.msgs.length; f.next = t + 3.6; }
            if (t - f.tick < 0.06) return; f.tick = t;
            const target = f.msgs[f.k];
            f.tiles.forEach((tile, i) => {
                if (f.cur[i] === target[i]) return;
                const ci = CH.indexOf(f.cur[i]), ti = CH.indexOf(target[i]);
                f.cur[i] = ti < 0 ? target[i] : CH[(ci + 1 + (i % 3 === 0 ? 1 : 0)) % CH.length];
                if (ti >= 0 && Math.abs(CH.indexOf(f.cur[i]) - ti) <= 1 && CH.indexOf(f.cur[i]) > ti) f.cur[i] = target[i];
                tile.classList.remove('flip'); void tile.offsetWidth; tile.classList.add('flip');
                tile.firstChild.textContent = f.cur[i];
            });
        }
    };

    /* 14. RETRO VHS: RGB split, scanlines, tracking band, noise */
    S.vhs = {
        text: 'REWIND', sub: 'PLAY ▶',
        build(el, o) {
            el.innerHTML = `<div class="osd">${esc(o.sub)}</div><div class="rec">REC</div><div class="ms-center"><b>${esc(o.text)}</b></div><div class="ts">SP 00:00:00</div><div class="scan"></div><div class="track"></div>`;
            const { c, ctx } = canvas(el); el._v = { c, ctx, ts: el.querySelector('.ts') };
        },
        frame(el, t) {
            const { c, ctx, ts } = el._v, w = Math.ceil(c._w / 3), h = Math.ceil(c._h / 3);
            if (!el._v.img || el._v.img.width !== w) el._v.img = ctx.createImageData(w, h);
            const img = el._v.img, d = img.data;
            for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
            ctx.putImageData(img, 0, 0); ctx.drawImage(c, 0, 0, w, h, 0, 0, c._w, c._h);
            const s = Math.floor(t) + 12 * 60 + 47; ts.textContent = `SP ${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
        }
    };

    /* 15. HALFTONE: dot screen with a moving light and ripple */
    S.halftone = {
        text: 'HALFTONE', sub: '',
        build(el, o) { const { c, ctx } = canvas(el); el._h = { c, ctx }; el.insertAdjacentHTML('beforeend', `<div class="ms-cap" style="font-size:clamp(12px,4.4cqw,48px);opacity:1;font-weight:900;letter-spacing:-.02em">${esc(o.text)}</div>`); },
        frame(el, t) {
            const { c, ctx } = el._h, w = c._w, h = c._h, g = Math.max(8, w / 64), ink = css(el, '--ink', '#111'), acc = css(el, '--accent', '#24f');
            ctx.clearRect(0, 0, w, h);
            const lx = w * (0.5 + 0.3 * Math.cos(t * 0.5)), ly = h * (0.45 + 0.25 * Math.sin(t * 0.7));
            for (let y = g / 2; y < h; y += g) for (let x = g / 2 + ((y / g) % 2 ? g / 2 : 0); x < w; x += g) {
                const d = Math.hypot(x - lx, y - ly) / Math.min(w, h), sphere = Math.max(0, 1 - d * 2.2), ripple = 0.5 + 0.5 * Math.sin(d * 18 - t * 3);
                const r = (g / 2) * Math.max(0.06, Math.min(1, sphere * 1.1 + ripple * 0.18));
                ctx.fillStyle = sphere > 0.55 ? acc : ink; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
            }
        }
    };

    /* 16. BAUHAUS: primary-colour geometry turning on a grid */
    S.bauhaus = {
        text: 'bauhaus', sub: '',
        build(el, o) {
            const R_ = '#e23b2e', B = '#1f4e9c', Y = '#f2b705', K = '#151515', C = '#efe7d6';
            const shapes = [
                `background:${B};border-radius:0 0 100% 0`, `background:${Y};border-radius:50%`, `background:${K}`, `background:${R_};border-radius:100% 0 0 0`, `background:linear-gradient(135deg,${Y} 50%,${C} 50%)`, `background:${R_};border-radius:50% 50% 0 0`,
                `background:${K};border-radius:50%;inset:18%`, `background:${R_}`, `background:${B};border-radius:50% 0 50% 0`, `background:${Y};border-radius:0 100% 0 0`, `background:linear-gradient(90deg,${K} 50%,${B} 50%)`, `background:${R_};border-radius:50%;inset:10%`,
                '', '', '', `background:${B};border-radius:0 0 50% 50%`, `background:${K};border-radius:0 0 0 100%`, `background:${Y};border-radius:50%;inset:22%`
            ];
            el.innerHTML = `<div class="grid">${shapes.map((s, i) => s ? `<div class="cell" style="grid-column:${(i % 6) + 1};grid-row:${Math.floor(i / 6) + 1}"><div class="sh" style="${s};--i:${i}"></div></div>` : '').join('')}<div class="title">${esc(o.text)}</div></div>`;
        }
    };

    /* 17. PIXEL ART: 8-bit scene with a jumping hero and spinning coin */
    S.pixel = {
        text: 'PRESS START', sub: '',
        build(el, o) {
            const { c, ctx } = canvas(el); c.style.imageRendering = 'pixelated'; el._px = { c, ctx, buf: document.createElement('canvas') };
            el._px.buf.width = 160; el._px.buf.height = 90;
            el.insertAdjacentHTML('beforeend', `<div class="ms-center" style="align-items:start;padding-top:12cqh"><b style="font:400 3.4cqw/1 'Press Start 2P',monospace;color:#fff;text-shadow:.4cqw .4cqw 0 #222;animation:ms-blink 1.2s steps(1) infinite">${esc(o.text)}</b></div>`);
        },
        frame(el, t) {
            const { c, ctx, buf } = el._px, g = buf.getContext('2d'), W = 160, H = 90, px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
            ['#5ec8ff', '#7fd4ff', '#a4e2ff'].forEach((col, i) => px(0, i * 18, W, 18 + (i === 2 ? 30 : 0), col));
            px(128, 10, 12, 12, '#ffe066'); px(130, 8, 8, 16, '#ffe066'); px(126, 12, 16, 8, '#ffe066');
            const cl = (x, y) => { px(x, y + 3, 20, 5, '#fff'); px(x + 4, y, 10, 4, '#fff'); };
            cl((40 - t * 6) % 200 + (t * 6 > 40 ? 200 : 0) - 20, 16); cl((120 - t * 4) % 200 + (t * 4 > 120 ? 200 : 0) - 20, 28);
            for (let x = -8; x < W + 8; x += 8) { const off = -((t * 30) % 8); px(x + off, 70, 8, 4, '#4caf50'); px(x + off, 74, 8, 16, '#b0663a'); px(x + off + 2, 78, 2, 2, '#8a4b2a'); px(x + off + 5, 84, 2, 2, '#8a4b2a'); }
            [[60, 44], [68, 44], [76, 44]].forEach(([x, y], i) => { px(x, y, 8, 8, i === 1 ? '#f7b733' : '#c8643b'); px(x, y, 8, 1, '#111'); px(x, y + 7, 8, 1, '#111'); if (i === 1) px(x + 3, y + 2, 2, 4, '#111'); });
            const cw = Math.abs(Math.cos(t * 4)) * 6 + 1; px(100 - cw / 2, 50, cw, 8, '#ffd400');
            const jp = (t % 1.6) / 1.6, hy = 62 - Math.max(0, Math.sin(jp * Math.PI)) * 22, hx = 30;
            px(hx, hy - 8, 8, 3, '#e53935'); px(hx + 1, hy - 5, 6, 4, '#ffcc99'); px(hx, hy - 1, 8, 5, '#1e5bd8'); px(hx + 1, hy + 4, 2, 4, '#5d3a1a'); px(hx + 5, hy + 4, 2, 4, '#5d3a1a');
            ctx.imageSmoothingEnabled = false; ctx.drawImage(buf, 0, 0, W, H, 0, 0, c._w, c._h);
        }
    };

    /* 18. BLUEPRINT: a technical drawing that draws itself */
    S.blueprint = {
        text: 'BLOCK  #1024', sub: 'SCALE 1:20',
        build(el, o) {
            el.innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">
              <path class="d" style="--i:0" d="M520 300 L820 200 L1120 300 L820 400 Z"/>
              <path class="d" style="--i:1" d="M520 300 L520 600 L820 700 L820 400"/>
              <path class="d" style="--i:2" d="M1120 300 L1120 600 L820 700"/>
              <path class="d thin" style="--i:3" d="M820 400 L820 250 M670 350 L970 250 M670 250 L970 350"/>
              <circle class="d" style="--i:4" cx="820" cy="300" r="60"/>
              <path class="d thin" style="--i:5" d="M440 300 L440 600 M425 300 L455 300 M425 600 L455 600"/>
              <path class="d thin" style="--i:6" d="M520 760 L820 860 M820 860 L1120 760 M510 745 L530 775 M1110 745 L1130 775"/>
              <path class="d thin" style="--i:7" d="M1150 230 L1240 165 L1500 165"/>
              <text x="1250" y="150" style="--i:8">${esc(o.text)}</text>
              <text x="250" y="460" style="--i:9">H 3.00</text>
              <text x="780" y="890" style="--i:10">W 6.00</text>
              <text x="1275" y="852" style="--i:11">${esc(o.sub)}</text>
              <path class="d thin" style="--i:12" d="M1260 800 L1560 800 L1560 870 L1260 870 Z M1260 820 L1560 820"/>
            </svg>`;
            measure(el);
        }
    };

    /* 19. ART DECO: gold sunburst, stepped frame, shimmering title */
    S.deco = {
        text: 'GATSBY', sub: 'THE ROARING TWENTIES',
        build(el, o) {
            let rays = ''; for (let k = 0; k <= 36; k++) { const a = Math.PI + (k / 36) * Math.PI; rays += `<line class="ray" style="--i:${k}" x1="800" y1="900" x2="${800 + Math.cos(a) * 1100}" y2="${900 + Math.sin(a) * 1100}"/>`; }
            const fr = (i, m) => `<path class="fr" style="--i:${i}" d="M${300 - m} ${170 - m} L${1300 + m} ${170 - m} L${1300 + m} ${730 + m} L${300 - m} ${730 + m} Z"/>`;
            el.innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><g opacity=".55">${rays}</g><rect x="300" y="170" width="1000" height="560" fill="#0c0b09"/>${fr(0, 0)}${fr(1, 18)}${fr(2, 34)}<path class="fr" style="--i:3" d="M560 230 L800 200 L1040 230 M560 670 L800 700 L1040 670"/></svg><div class="ms-center"><div><b>${esc(o.text)}</b><i>${esc(o.sub)}</i></div></div>`;
            measure(el);
        }
    };

    /* 20. NEO-BRUTALISM: thick borders, hard shadows, pieces dropping in */
    S.brutal = {
        text: 'SHIP IT.', sub: '98% FASTER',
        build(el, o) {
            el.innerHTML = `<div class="k count" style="--i:6">20</div><div class="k head" style="--i:0"><b>${esc(o.text)}</b><span></span><span></span></div><div class="k fast" style="--i:1">${esc(o.sub).replace(' ', '<br>')}</div><div class="k star" style="--i:2">★</div><div class="k btn" style="--i:3">CLICK ME</div><div class="k badge" style="--i:4">NEW!</div>`;
        }
    };

    window.FSC_MOTION_STYLES = Object.keys(S);
    // library.js may have wired the page before this file loaded: start any motion already in view
    const kick = () => document.querySelectorAll('[data-fsc="motion"]').forEach((el) => {
        if (!el._fscMounted) FSC.mount(el);
        const sl = el.closest('.slide');
        if (!sl || sl.classList.contains('visible')) FSC.play(el);
    });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(kick)); else kick();
})();
