/* ===========================================
   FSC — FRONTEND SLIDES COMPONENT LIBRARY (behavior)
   Usage: <div class="fsc" data-fsc="chain" ...></div>
   - Mounts every [data-fsc] element on load.
   - Plays a component when its .slide becomes .visible
     (or when scrolled into view if it is not inside a slide).
   - API: FSC.play(el), FSC.update(el, data), FSC.mountAll(root)
   Data for charts lives in a child
   <script type="application/json"> so it can be swapped for real data.
   =========================================== */
(function () {
    const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const R = {};
    let uid = 0;                // unique ids for SVG defs
    const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3; };
    const rnd = (seed) => () => { seed = (seed * 1103515245 + 12345) >>> 0; return ((seed >>> 16) & 32767) / 32767; };          // registry: name -> { mount(el), play(el)? , total(el)? }
    const timers = new WeakMap();

    /* ---------- helpers ---------- */
    const h = (tag, attrs = {}, html = '') => {
        const e = document.createElement(tag);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        if (html) e.innerHTML = html;
        return e;
    };
    const SVGNS = 'http://www.w3.org/2000/svg';
    const svgEl = (tag, attrs = {}) => {
        const e = document.createElementNS(SVGNS, tag);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        return e;
    };
    const readJSON = (el) => {
        const s = el.querySelector('script[type="application/json"]');
        try { return s ? JSON.parse(s.textContent) : null; } catch (e) { console.warn('FSC: bad JSON in', el); return null; }
    };
    // Deterministic pseudo-hash so demos look stable between renders
    const fakeHash = (seed, len = 4) => {
        let x = (seed * 2654435761) >>> 0, out = '';
        for (let i = 0; i < len * 2; i++) { x = (x * 1103515245 + 12345) >>> 0; out += '0123456789abcdef'[(x >>> 16) & 15]; }
        return '0x' + out.slice(0, len) + '…' + out.slice(len);
    };
    const fmt = (v, unit = '') => (Math.abs(v) >= 1000 ? v.toLocaleString('en-US') : +v.toFixed(2)) + unit;
    const niceMax = (v) => { const p = Math.pow(10, Math.floor(Math.log10(v))); return Math.ceil(v / p * 1.1) * p; };

    /* ---------- core ---------- */
    function mount(el) {
        const c = R[el.dataset.fsc];
        if (!c) return console.warn('FSC: unknown component', el.dataset.fsc);
        if (el._fscSource === undefined) el._fscSource = el.innerHTML;   // keep authored content for re-mounts
        el.innerHTML = el._fscSource;
        el.classList.add(c.inline ? 'fsc-inline' : 'fsc', 'fsc-' + (c.cls || el.dataset.fsc));
        el.classList.remove('is-playing', 'is-done');
        c.mount(el);
        el._fscMounted = true;
        if (REDUCED) finish(el);
    }
    function finish(el) { el.classList.remove('is-playing'); el.classList.add('is-done'); const c = R[el.dataset.fsc]; c.final && c.final(el); }
    function play(el) {
        if (!el._fscMounted) mount(el);
        if (REDUCED) return finish(el);
        (timers.get(el) || []).forEach(clearTimeout);
        timers.set(el, []);
        el.classList.remove('is-playing', 'is-done');
        void el.offsetWidth;                       // restart CSS animations
        el.classList.add('is-playing');
        const c = R[el.dataset.fsc];
        c.play && c.play(el, (fn, ms) => timers.get(el).push(setTimeout(fn, ms)));
    }
    function update(el, data) {
        const s = el._fscSource !== undefined ? h('div', {}, el._fscSource) : el;
        let js = s.querySelector('script[type="application/json"]');
        if (!js) { js = h('script', { type: 'application/json' }); s.appendChild(js); }
        js.textContent = JSON.stringify(data);
        el._fscSource = s.innerHTML;
        mount(el); play(el);
    }
    function mountAll(root = document) {
        // Shorthands: <i data-icon="bus"> and <span data-fx="underline"> become components
        root.querySelectorAll('[data-icon]:not([data-fsc])').forEach((e) => { e.dataset.fsc = 'icon'; });
        root.querySelectorAll('[data-fx]:not([data-fsc])').forEach((e) => { e.dataset.fsc = 'fx'; });
        root.querySelectorAll('[data-fsc]').forEach(mount);
    }

    /* Auto-play: on slide visibility, or on scroll-into-view outside decks */
    function wire(root = document) {
        mountAll(root);
        root.querySelectorAll('.slide').forEach((slide) => {
            const run = () => slide.classList.contains('visible') && slide.querySelectorAll('[data-fsc]').forEach(play);
            new MutationObserver((m) => m.some((r) => r.oldValue && !r.oldValue.includes('visible')) && run())
                .observe(slide, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
            run();
        });
        const loose = [...root.querySelectorAll('[data-fsc]')].filter((e) => !e.closest('.slide'));
        if (loose.length) {
            const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { play(e.target); io.unobserve(e.target); } }), { threshold: 0.4 });
            loose.forEach((e) => io.observe(e));
        }
    }

    /* ===========================================
       COMPONENTS
       =========================================== */

    /* --- CHAIN APPEND ---
       data-count="4" data-start="1024"  (last block is accent)
       Optional children <b>labels</b> are ignored; use data-labels="Genesis|…" to name blocks. */
    R.chain = {
        mount(el) {
            const n = +(el.dataset.count || 4), start = +(el.dataset.start || 1024);
            const labels = (el.dataset.labels || '').split('|').filter(Boolean);
            const row = h('div', { class: 'row' });
            for (let i = 0; i < n; i++) {
                if (i) row.appendChild(h('div', { class: 'lnk', style: `--i:${i}` }));
                const b = h('div', { class: 'blk' + (i === n - 1 ? ' accent' : ''), style: `--i:${i}` },
                    `<b>${labels[i] || '#' + (start + i)}</b><div><span class="k">prev</span> ${i ? fakeHash(start + i - 1) : '0x0000…0000'}</div><div><span class="k">hash</span> ${fakeHash(start + i)}</div>`);
                row.appendChild(b);
            }
            el.innerHTML = ''; el.appendChild(row);
        }
    };

    /* --- TRANSACTION LIFECYCLE ---
       data-steps="Sign:Wallet signs tx|Mempool:Waits for inclusion|…"  (Label:caption) */
    R.tx = {
        mount(el) {
            const steps = (el.dataset.steps || 'Sign:Wallet signs the tx|Broadcast:Enters the mempool|Validate:Validator checks it|Include:Packed into a block|Final:Irreversible').split('|').map((s) => s.split(':'));
            const n = steps.length, step = 0.75;
            el.style.setProperty('--n', n); el.style.setProperty('--step', step + 's'); el.style.setProperty('--dur', (n - 1) * step + 's');
            el.innerHTML = `<div class="track"><div class="fill"></div><div class="dot"></div></div>
                <div class="stations">${steps.map(([t, c], i) => `<div class="st" style="--i:${i}"><i></i><b>${t}</b>${c ? `<span>${c}</span>` : ''}</div>`).join('')}</div>`;
        }
    };

    /* --- NETWORK GOSSIP ---
       data-nodes="14" data-caption="Block propagation" ; origin node is accent. */
    R.gossip = {
        mount(el) {
            const n = Math.min(+(el.dataset.nodes || 14), 20), W = 880, H = 440;
            // golden-angle spiral layout, stretched to the box: deterministic and evenly spread
            const pts = Array.from({ length: n }, (_, i) => {
                const r = Math.sqrt((i + 0.5) / n), a = i * 2.399963;
                return [W / 2 + Math.cos(a) * r * (W / 2 - 40), H / 2 + Math.sin(a) * r * (H / 2 - 30)];
            });
            const d2 = (a, b) => (pts[a][0] - pts[b][0]) ** 2 + (pts[a][1] - pts[b][1]) ** 2;
            const edges = new Set();
            pts.forEach((_, i) => pts.map((_, j) => j).filter((j) => j !== i).sort((a, b) => d2(i, a) - d2(i, b)).slice(0, 3)
                .forEach((j) => edges.add(i < j ? i + '-' + j : j + '-' + i)));
            const adj = pts.map(() => []);
            [...edges].forEach((e) => { const [a, b] = e.split('-').map(Number); adj[a].push(b); adj[b].push(a); });
            const origin = +(el.dataset.origin || n - 1), hop = pts.map(() => Infinity); hop[origin] = 0;
            const q = [origin];
            while (q.length) { const u = q.shift(); adj[u].forEach((v) => { if (hop[v] === Infinity) { hop[v] = hop[u] + 1; q.push(v); } }); }
            const maxHop = Math.max(...hop.filter(isFinite));
            const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' });
            [...edges].forEach((e) => {
                const [a, b] = e.split('-').map(Number);
                const attrs = { x1: pts[a][0], y1: pts[a][1], x2: pts[b][0], y2: pts[b][1] };
                svg.appendChild(svgEl('line', attrs));
                // "hot" overlay drawn from the earlier-reached node outward
                const [s, t] = hop[a] <= hop[b] ? [a, b] : [b, a];
                if (hop[t] === hop[s] + 1) svg.appendChild(svgEl('line', { class: 'hot', pathLength: 1, x1: pts[s][0], y1: pts[s][1], x2: pts[t][0], y2: pts[t][1], style: `--d:${hop[s]}` }));
            });
            pts.forEach(([x, y], i) => {
                svg.appendChild(svgEl('circle', { class: 'ring' + (i === origin ? ' origin-ring' : ''), cx: x, cy: y, r: 13, style: `--d:${hop[i]}` }));
                svg.appendChild(svgEl('circle', { class: 'node' + (i === origin ? ' origin' : ''), cx: x, cy: y, r: 13, style: `--d:${hop[i]}` }));
            });
            el.innerHTML = '';
            el.appendChild(svg);
            el.appendChild(h('div', { class: 'cap' }, `<span>${el.dataset.caption || 'Block propagation'}</span><span><b>${n}</b> nodes · <b>${maxHop}</b> hops</span>`));
        }
    };

    /* --- MERKLE TREE ---
       data-leaves="Tx1|Tx2|…" (power of two: 4 or 8). Root is accent. */
    R.merkle = {
        mount(el) {
            const leaves = (el.dataset.leaves || 'Tx1|Tx2|Tx3|Tx4|Tx5|Tx6|Tx7|Tx8').split('|');
            const levels = [leaves];
            while (levels[levels.length - 1].length > 1) {
                const prev = levels[levels.length - 1], next = [];
                for (let i = 0; i < prev.length; i += 2) next.push(prev.length === 2 ? 'Root' : 'H' + (levels.length) + '·' + (i / 2 + 1));
                levels.push(next);
            }
            const W = 900, H = 500, L = levels.length, bw = Math.min(96, W / leaves.length - 16), bh = 54;
            const y = (l) => H - 40 - l * ((H - 80) / (L - 1)) - bh / 2;
            const x = (l, i) => (W / levels[l].length) * (i + 0.5);
            const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' });
            let seed = 7;
            for (let l = 1; l < L; l++) levels[l].forEach((_, i) => [2 * i, 2 * i + 1].forEach((c) => {
                svg.appendChild(svgEl('path', { pathLength: 1, d: `M${x(l - 1, c)} ${y(l - 1)} V${(y(l - 1) + y(l) + bh) / 2} H${x(l, i)} V${y(l) + bh}`, style: `--l:${l}` }));
            }));
            levels.forEach((lv, l) => lv.forEach((name, i) => {
                const w = l === L - 1 ? 200 : bw, g = svgEl('g', { class: 'n' + (l === L - 1 ? ' root' : ''), style: `--l:${l}` });
                g.appendChild(svgEl('rect', { x: x(l, i) - w / 2, y: y(l), width: w, height: bh }));
                const t = svgEl('text', { x: x(l, i), y: y(l) + (l === 0 ? bh / 2 : 19) }); t.textContent = name; g.appendChild(t);
                if (l > 0) { const hh = svgEl('text', { class: 'h', x: x(l, i), y: y(l) + 38 }); hh.textContent = fakeHash(seed++, 3); g.appendChild(hh); }
                svg.appendChild(g);
            }));
            el.innerHTML = ''; el.appendChild(svg);
        }
    };

    /* --- HASH REVEAL (text effect) ---
       data-text="Trustless." data-size="120px" ; shows a fake digest under the word
       unless data-digest="off". */
    R.hash = {
        mount(el) {
            const text = el.dataset.text || el.textContent.trim() || 'Trustless.';
            el.dataset.text = text;
            if (el.dataset.size) el.style.setProperty('--size', el.dataset.size);
            el.innerHTML = `<div class="word">${text}</div>` + (el.dataset.digest === 'off' ? '' : `<div class="digest mono">sha256 → <b>${fakeHash(text.length * 97, 10)}</b></div>`);
        },
        play(el, later) {
            const word = el.querySelector('.word'), text = el.dataset.text, hex = '0123456789abcdef', dur = 1300, t0 = performance.now();
            const tick = (t) => {
                const p = (t - t0) / dur;
                if (p >= 1 || !el.classList.contains('is-playing')) { word.textContent = text; return; }
                word.innerHTML = [...text].map((ch, i) => (ch === ' ' || p > (i + 1) / text.length * 0.85 + 0.15) ? ch
                    : `<span class="sc">${hex[(Math.random() * 16) | 0]}</span>`).join('');
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        },
        final(el) { const w = el.querySelector('.word'); if (w) w.textContent = el.dataset.text; }
    };

    /* --- TERMINAL ---
       Children: <p data-cmd>command</p> lines are typed; other <p> are output.
       Add class="hl" to ONE output line for the accent. data-title="zsh — sepolia" */
    R.term = {
        cls: 'term',
        mount(el) {
            const lines = [...el.querySelectorAll('p')].map((p) => p.outerHTML).join('');
            el.innerHTML = `<div class="bar"><i></i><i></i><i></i><span>${el.dataset.title || 'terminal'}</span></div><div class="body">${lines}</div>`;
            el.querySelectorAll('.body p').forEach((p) => { p.dataset.full = p.textContent; });
        },
        play(el, later) {
            const ps = [...el.querySelectorAll('.body p')];
            ps.forEach((p) => { p.textContent = ''; p.style.visibility = 'hidden'; });
            const caret = h('span', { class: 'caret' });
            let t = 300;
            ps.forEach((p) => {
                const full = p.dataset.full;
                if (p.hasAttribute('data-cmd')) {
                    later(() => { p.style.visibility = 'visible'; p.appendChild(caret); }, t);
                    for (let i = 1; i <= full.length; i++) later(() => { p.textContent = full.slice(0, i); p.appendChild(caret); }, t += 32);
                    t += 350;
                } else {
                    later(() => { p.style.visibility = 'visible'; p.textContent = full; p.appendChild(caret); }, t += 140);
                }
            });
        },
        final(el) { el.querySelectorAll('.body p').forEach((p) => { p.style.visibility = 'visible'; p.textContent = p.dataset.full; }); }
    };
    R.terminal = R.term;

    /* --- SPECTRUM ---
       data-left="Centralized" data-right="Decentralized"
       Children: <i data-pos="0.25">Tokenized deposits</i> ; add data-hl to ONE item. */
    R.spec = {
        cls: 'spec',
        mount(el) {
            const items = [...el.querySelectorAll('i[data-pos]')].map((i) => ({ p: +i.dataset.pos, t: i.innerHTML, hl: i.hasAttribute('data-hl') })).sort((a, b) => a.p - b.p);
            el.innerHTML = `<div class="lane"><div class="axis"></div>${items.map((it, k) =>
                `<div class="mk ${k % 2 ? 'down' : 'up'}${it.hl ? ' hl' : ''}" style="--p:${it.p};--i:${k}"><div class="stem"></div><i></i><span>${it.t}</span></div>`).join('')}</div>
                <div class="ends"><span>← ${el.dataset.left || 'Centralized'}</span><span>${el.dataset.right || 'Decentralized'} →</span></div>`;
        }
    };
    R.spectrum = R.spec;

    /* --- CHARTS (shared frame) ---
       JSON: { "labels": [...], "series": [{ "name": "...", "values": [...], "highlight": true }],
               "unit": "%", "highlight": "LabelName" (bar/doughnut) } */
    function frame(el, W, H, pad) {
        const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' });
        const json = el.querySelector('script[type="application/json"]');
        el.innerHTML = ''; if (json) el.appendChild(json); el.appendChild(svg);
        return svg;
    }
    function gridY(svg, max, unit, x0, x1, y0, y1, ticks = 4) {
        const g = svgEl('g', { class: 'grid' }), ax = svgEl('g', { class: 'axis-l' });
        for (let i = 0; i <= ticks; i++) {
            const y = y1 - (y1 - y0) * i / ticks;
            g.appendChild(svgEl('line', { x1: x0, x2: x1, y1: y, y2: y }));
            const t = svgEl('text', { x: x0 - 14, y }); t.textContent = fmt(max * i / ticks, unit); ax.appendChild(t);
        }
        svg.append(g, ax);
    }

    R.line = {
        cls: 'chart',
        mount(el) {
            const d = readJSON(el) || { labels: ['2021', '2022', '2023', '2024', '2025', '2026'], unit: ' bn', series: [
                { name: 'Stablecoins', values: [5, 140, 125, 160, 230, 290], highlight: true },
                { name: 'Tokenized deposits', values: [0, 1, 4, 12, 30, 62] }] };
            const W = 900, H = 500, x0 = 90, x1 = W - 30, y0 = 30, y1 = H - 60;
            const svg = frame(el, W, H);
            const max = niceMax(Math.max(...d.series.flatMap((s) => s.values)));
            gridY(svg, max, d.unit || '', x0, x1, y0, y1);
            const X = (i) => x0 + (x1 - x0) * i / (d.labels.length - 1), Y = (v) => y1 - (y1 - y0) * v / max;
            const axb = svgEl('g', { class: 'axis-b' });
            d.labels.forEach((l, i) => { const t = svgEl('text', { x: X(i), y: y1 + 34 }); t.textContent = l; axb.appendChild(t); });
            svg.appendChild(axb);
            d.series.forEach((s) => {
                const pts = s.values.map((v, i) => `${X(i)},${Y(v)}`);
                if (s.highlight) svg.appendChild(svgEl('path', { class: 'area', d: `M${X(0)},${y1} L${pts.join(' L')} L${X(s.values.length - 1)},${y1} Z` }));
                svg.appendChild(svgEl('path', { class: 'ln' + (s.highlight ? ' hl' : ''), pathLength: 1, d: 'M' + pts.join(' L') }));
                const lx = X(s.values.length - 1), ly = Y(s.values[s.values.length - 1]);
                if (s.highlight) svg.appendChild(svgEl('circle', { class: 'pt', cx: lx, cy: ly, r: 7 }));
                const t = svgEl('text', { class: 'val' + (s.highlight ? ' hl' : ''), x: lx - 10, y: ly - 18, 'text-anchor': 'end' });
                t.textContent = `${s.name} · ${fmt(s.values[s.values.length - 1], d.unit || '')}`; t.style.textAnchor = 'end';
                svg.appendChild(t);
            });
        }
    };

    R.bar = {
        cls: 'chart',
        mount(el) {
            const d = readJSON(el) || { labels: ['Bitcoin', 'Ethereum', 'Polygon', 'Solana', 'Avalanche'], unit: '', highlight: 'Solana',
                series: [{ name: 'TPS (observed)', values: [7, 15, 190, 1050, 120] }] };
            const vals = d.series[0].values, W = 900, H = 500, x0 = 90, x1 = W - 20, y0 = 40, y1 = H - 60;
            const svg = frame(el, W, H);
            const max = niceMax(Math.max(...vals));
            gridY(svg, max, d.unit || '', x0, x1, y0, y1);
            const slot = (x1 - x0) / vals.length, bw = Math.min(110, slot * 0.58);
            const axb = svgEl('g', { class: 'axis-b' });
            vals.forEach((v, i) => {
                const cx = x0 + slot * (i + 0.5), top = y1 - (y1 - y0) * v / max, hl = d.labels[i] === d.highlight;
                svg.appendChild(svgEl('rect', { class: 'bar' + (hl ? ' hl' : ''), x: cx - bw / 2, y: top, width: bw, height: y1 - top, style: `--i:${i}` }));
                const t = svgEl('text', { class: 'val' + (hl ? ' hl' : ''), x: cx, y: top - 14, style: `--i:${i}` }); t.textContent = fmt(v, d.unit || ''); svg.appendChild(t);
                const l = svgEl('text', { x: cx, y: y1 + 34 }); l.textContent = d.labels[i]; axb.appendChild(l);
            });
            svg.appendChild(axb);
        }
    };

    R.doughnut = {
        cls: 'chart',
        mount(el) {
            const d = readJSON(el) || { labels: ['Community', 'Ecosystem fund', 'Team', 'Investors', 'Treasury'], unit: '%', highlight: 'Community',
                center: '1B', centerLabel: 'TOTAL SUPPLY', series: [{ values: [38, 22, 18, 14, 8] }] };
            const vals = d.series[0].values, total = vals.reduce((a, b) => a + b, 0);
            const W = 900, H = 500, cx = 250, cy = 250, r = 170;
            const svg = frame(el, W, H);
            // ink shades for non-highlighted slices; highlight gets the accent
            const shades = ['var(--ink)', 'var(--muted)', 'color-mix(in srgb, var(--muted) 55%, var(--paper))', 'color-mix(in srgb, var(--muted) 30%, var(--paper))', 'var(--rule)'];
            let acc = 0, k = 0;
            const g = svgEl('g', { transform: `rotate(-90 ${cx} ${cy})` });
            const leg = svgEl('g', { class: 'legend' });
            vals.forEach((v, i) => {
                const pct = v / total * 100, hl = d.labels[i] === d.highlight, col = hl ? 'var(--accent)' : shades[k++ % shades.length];
                g.appendChild(svgEl('circle', { class: 'seg', cx, cy, r, pathLength: 100, stroke: col, 'stroke-dashoffset': -acc, style: `--v:${Math.max(pct - 0.6, 0.1)};--i:${i}` }));
                acc += pct;
                const ly = 110 + i * 62;
                leg.appendChild(svgEl('rect', { x: 540, y: ly - 10, width: 20, height: 20, fill: col }));
                const t = svgEl('text', { x: 576, y: ly }); t.textContent = d.labels[i]; leg.appendChild(t);
                const tv = svgEl('text', { class: 'val' + (hl ? ' hl' : ''), x: 870, y: ly, 'text-anchor': 'end', style: `--i:${i}` });
                tv.textContent = fmt(v, d.unit || ''); tv.style.textAnchor = 'end'; tv.style.dominantBaseline = 'central'; leg.appendChild(tv);
            });
            svg.append(g, leg);
            const c1 = svgEl('text', { class: 'center-big', x: cx, y: cy - 8 }); c1.textContent = d.center || fmt(total, d.unit || '');
            const c2 = svgEl('text', { class: 'center-small', x: cx, y: cy + 44 }); c2.textContent = d.centerLabel || '';
            svg.append(c1, c2);
        }
    };


    /* ===========================================
       ICONS, CHARACTERS, SCENES (needs icons.js)
       =========================================== */
    const ICONS = () => window.FSC_ICONS || {};
    // Returns an <svg> string for an icon or character. Line icons draw in; characters rise in.
    function iconSVG(name, extra = '') {
        const ic = ICONS()[name];
        if (!ic) return `<svg class="fsc-ico-svg" viewBox="0 0 48 48"><text x="4" y="28" font-size="10">${name}?</text></svg>`;
        return `<svg class="fsc-ico-svg ${ic.character ? 'char-svg' : 'line-ico'} ${extra}" viewBox="${ic.vb}" aria-label="${ic.label}" role="img">${ic.body}</svg>`;
    }
    // Mark every stroke of a line icon for draw-in, using its real length (pathLength is unreliable on rect/circle)
    function prepDraw(scope) {
        scope.querySelectorAll('svg.line-ico').forEach((svg) => svg.querySelectorAll('path,rect,circle,ellipse').forEach((n) => {
            if (n.classList.contains('a')) return;
            let len = 0; try { len = n.getTotalLength(); } catch (e) {}
            n.classList.add('dr'); n.style.setProperty('--len', Math.ceil(len || 200) + 1);
        }));
    }

    /* --- ICON (inline) ---  <i data-icon="bank" data-size="96px"></i> */
    R.icon = {
        inline: true,
        mount(el) {
            if (el.dataset.size) el.style.setProperty('--s', el.dataset.size);
            el.innerHTML = iconSVG(el.dataset.icon);
            prepDraw(el);
        }
    };

    /* --- ICON SET (grid with labels) ---
       data-icons="bank|coin|wallet" data-cols="5" data-size="72px" data-labels="off"
       Works for characters too: data-icons="alice|bob|eve|trent" */
    R.iconset = {
        mount(el) {
            const names = (el.dataset.icons || 'bank|coin|wallet|vault|contract').split('|');
            if (el.dataset.size) el.style.setProperty('--s', el.dataset.size);
            el.style.setProperty('--cols', el.dataset.cols || Math.min(names.length, 5));
            el.innerHTML = `<div class="set">${names.map((n, i) => `<figure style="--i:${i}">${iconSVG(n)}${el.dataset.labels === 'off' ? '' : `<figcaption>${(ICONS()[n] || {}).label || n}</figcaption>`}</figure>`).join('')}</div>`;
            prepDraw(el);
        }
    };

    /* --- ACTORS (Alice & Bob scene) ---
       data-left="alice" data-right="bob" data-middle="trent|eve|mallory|none"
       data-item="coin" (any icon) data-note="5 tDEP" data-caption="Alice pays Bob through her bank"
       data-eve-note="Eve sees only ciphertext"
       Middle = trent: item routes through Trent (trusted third party / bank).
       Middle = eve or mallory: item goes direct; they watch from below. */
    R.actors = {
        mount(el) {
            const L = el.dataset.left || 'alice', Rt = el.dataset.right || 'bob', M = el.dataset.middle || 'none';
            const via = M === 'trent', spy = M === 'eve' || M === 'mallory';
            const W = 1400, H = 600, cw = 180, ch = 240, top = 90, ly = 250;
            const xa = 340, xb = 1060, xm = 700;
            el.style.setProperty('--xa', xa + 'px'); el.style.setProperty('--xb', xb + 'px'); el.style.setProperty('--xm', xm + 'px');
            el.style.setProperty('--yl', ly + 'px'); el.style.setProperty('--ym', '70px');
            el.style.setProperty('--tdur', via ? '3.4s' : '2.4s');
            const person = (n, x, y, i, cls = '', k = 1) => `<g class="actor ${cls}" style="--i:${i}"><svg class="char-svg" x="${x}" y="${y}" width="${cw * k}" height="${ch * k}" viewBox="0 0 120 160">${(ICONS()[n] || {}).body || ''}</svg>
                <text class="name" x="${x + cw * k / 2}" y="${y + ch * k + 38}">${(ICONS()[n] || { label: n }).label}</text></g>`;
            const chip = `<g class="item ${via ? 'via' : ''}"><circle r="46" class="chip"/><svg x="-28" y="-28" width="56" height="56" viewBox="0 0 48 48" class="fsc-ico-svg line-ico chip-ico">${(ICONS()[el.dataset.item || 'coin'] || {}).body || ''}</svg>${el.dataset.note ? `<text class="note" y="-66">${el.dataset.note}</text>` : ''}</g>`;
            let lines = '', mid = '';
            if (via) {
                lines = `<path class="route" pathLength="1" d="M${70 + cw + 10} ${ly} H${xm - cw / 2 - 20}"/><path class="route r2" pathLength="1" d="M${xm + cw / 2 + 20} ${ly} H${W - 70 - cw - 10}"/>`;
                mid = person(M, xm - cw / 2, top, 1) + `<path class="tick" pathLength="1" d="M${xm + 60} ${top + 20} l10 10 20-22"/>`;
            } else {
                lines = `<path class="route" pathLength="1" d="M${70 + cw + 10} ${ly} H${W - 70 - cw - 10}"/>`;
                if (spy) mid = `<path class="tap" pathLength="1" d="M${xm} ${ly + 8} V${340}"/>` + person(M, xm - cw * 0.4, 310, 1, 'spy', 0.8) +
                    `<text class="eve-note" x="${xm + cw * 0.5 + 10}" y="${430}">${el.dataset.eveNote || (M === 'eve' ? 'Eve is listening…' : 'Mallory tampers…')}</text>`;
            }
            el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${lines}${person(L, 70, top, 0)}${mid}${person(Rt, W - 70 - cw, top, 2, 'receiver')}
                <circle class="arrive" cx="${xb + 40}" cy="${ly}" r="30"/>${chip}</svg>${el.dataset.caption ? `<p class="cap">${el.dataset.caption}</p>` : ''}`;
            prepDraw(el);
        }
    };

    /* ===========================================
       TEXT EFFECTS: <span data-fx="underline">word</span>
       Hand-drawn (Rough Notation): underline | circle | highlight | strike (data-to="new") | box | bracket | crossed
       Others: type | words
       | cycle (data-words="a|b|c", stops on last) | scramble | count (data-to, data-dec, data-prefix, data-suffix)
       Effects use the accent: one per slide.
       =========================================== */
    /* Hand-drawn effects use Rough Notation (vendor/rough-notation.js, MIT).
       Its positions are measured in screen pixels, so we divide by the stage scale. */
    const RN_TYPES = { underline: 'underline', circle: 'circle', highlight: 'highlight', strike: 'strike-through', box: 'box', bracket: 'bracket', crossed: 'crossed-off' };
    function accentColor(el, alpha) {
        const c = getComputedStyle(el).getPropertyValue('--accent').trim() || '#2445ff';
        if (alpha == null || !/^#[0-9a-f]{6}$/i.test(c)) return c;
        const n = parseInt(c.slice(1), 16);
        return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
    }
    function roughAnnotate(el, animate) {
        if (el._rn) { el._rn.remove(); el._rn = null; }
        if (!window.RoughNotation) return;
        const kind = el.dataset.fx, t = el.querySelector('.fx-t'), fs = parseFloat(getComputedStyle(el).fontSize) || 40;
        const opts = {
            type: RN_TYPES[kind], animate, animationDuration: kind === 'highlight' ? 900 : 800, iterations: 2,
            color: kind === 'highlight' ? accentColor(el, 0.42) : accentColor(el),
            strokeWidth: Math.max(2, fs * 0.055), padding: kind === 'circle' ? fs * 0.18 : kind === 'box' ? fs * 0.1 : 2, multiline: kind === 'highlight' || kind === 'underline'
        };
        if (kind === 'bracket') opts.brackets = (el.dataset.brackets || 'left,right').split(',');
        const ann = RoughNotation.annotate(t, opts);
        ann.svgRect = (svg, r) => {   // undo the stage/frame transform scale
            const s = svg.getBoundingClientRect(), k = s.width / 100 || 1;
            return { x: ((r.x || r.left) - (s.x || s.left)) / k, y: ((r.y || r.top) - (s.y || s.top)) / k, w: r.width / k, h: r.height / k };
        };
        el._rn = ann; ann.show();
    }

    R.fx = {
        inline: true,
        mount(el) {
            const kind = el.dataset.fx, text = el.dataset.text || el.textContent;
            el.dataset.text = text; el.classList.add('fx-' + kind);
            if (kind === 'strike') el.innerHTML = `<span class="fx-old"><span class="fx-t">${text}</span></span>${el.dataset.to ? ` <span class="fx-to">${el.dataset.to}</span>` : ''}`;
            else if (kind === 'words') el.innerHTML = (/\s/.test(text.trim()) ? text.trim().split(/\s+/) : [...text.trim()]).map((w, i) => `<span class="fx-w" style="--i:${i}">${w}</span>`).join(/\s/.test(text.trim()) ? ' ' : '');
            else if (kind === 'cycle') { const ws = (el.dataset.words || text).split('|'); el.dataset.words = ws.join('|'); el.innerHTML = `<span class="fx-c">${ws[0]}</span>`; }
            else if (kind === 'count') el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || '');
            else el.innerHTML = `<span class="fx-t">${text}</span>`;
        },
        play(el, later) {
            const kind = el.dataset.fx, text = el.dataset.text, t = el.querySelector('.fx-t');
            if (RN_TYPES[kind]) { if (el._rn) { el._rn.remove(); el._rn = null; } later(() => roughAnnotate(el, true), 300); return; }
            if (kind === 'type') {
                t.textContent = ''; const caret = h('span', { class: 'caret' }); t.after(caret);
                [...text].forEach((_, i) => later(() => { t.textContent = text.slice(0, i + 1); }, 200 + i * 45));
                later(() => caret.remove(), 200 + text.length * 45 + 1200);
            } else if (kind === 'scramble') {
                const hex = '0123456789abcdef', t0 = performance.now(), dur = 1100;
                const tick = (now) => { const p = (now - t0) / dur; if (p >= 1) { t.textContent = text; return; }
                    t.innerHTML = [...text].map((c, i) => c === ' ' || p > (i + 1) / text.length * .85 + .15 ? c : `<span class="sc">${hex[(Math.random() * 16) | 0]}</span>`).join('');
                    requestAnimationFrame(tick); };
                requestAnimationFrame(tick);
            } else if (kind === 'cycle') {
                const ws = el.dataset.words.split('|'), c = el.querySelector('.fx-c');
                ws.forEach((w, i) => i && later(() => { c.classList.remove('in'); void c.offsetWidth; c.textContent = w; c.classList.add('in'); if (i === ws.length - 1) c.classList.add('last'); }, 400 + i * 1100));
            } else if (kind === 'count') {
                const to = parseFloat(el.dataset.to || text), dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1400;
                const f = (v) => (el.dataset.prefix || '') + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.suffix || '');
                const tick = (now) => { const p = Math.min((now - t0) / dur, 1); el.textContent = f(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(tick); };
                requestAnimationFrame(tick);
            }
        },
        final(el) {
            const k = el.dataset.fx;
            if (RN_TYPES[k]) roughAnnotate(el, false);
            if (k === 'type' || k === 'scramble') el.querySelector('.fx-t').textContent = el.dataset.text;
            if (k === 'cycle') { const ws = el.dataset.words.split('|'); const c = el.querySelector('.fx-c'); c.textContent = ws[ws.length - 1]; c.classList.add('last'); }
            if (k === 'count') { const dec = +(el.dataset.dec || 0); el.textContent = (el.dataset.prefix || '') + parseFloat(el.dataset.to).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.suffix || ''); }
        }
    };

    /* ===========================================
       CANDLESTICK CHART
       JSON: { "ohlc": [[open, high, low, close], …], "labels": ["Mon", …] (optional, shown sparsely),
               "volume": [ … ] (optional), "ma": 7 (moving-average period, optional),
               "unit": "$", "highlight": 23 (candle index, or "last"), "note": "ETF news" (label on highlight),
               "source": "Illustrative" }
       Up candles hollow, down candles filled (works in print and for colorblind viewers);
       the highlighted candle is the accent.
       =========================================== */
    R.candle = {
        cls: 'chart',
        mount(el) {
            let d = readJSON(el);
            if (!d) {   // illustrative random walk
                let p = 62000, x = 11; const ohlc = [], vol = [];
                for (let i = 0; i < 36; i++) {
                    x = (x * 1103515245 + 12345) >>> 0; const r1 = ((x >>> 16) & 1023) / 1023;
                    x = (x * 1103515245 + 12345) >>> 0; const r2 = ((x >>> 16) & 1023) / 1023;
                    const drift = i < 14 ? -0.004 : i < 22 ? 0.002 : 0.009;
                    const o = p, c = o * (1 + drift + (r1 - 0.5) * 0.04), hi = Math.max(o, c) * (1 + r2 * 0.012), lo = Math.min(o, c) * (1 - (1 - r2) * 0.012);
                    ohlc.push([o, hi, lo, c].map((v) => Math.round(v))); vol.push(Math.round(400 + r2 * 900 + (i === 23 ? 1400 : 0))); p = c;
                }
                d = { ohlc, volume: vol, ma: 7, unit: '$', highlight: 23, note: 'News breaks', source: 'Illustrative data' };
            }
            const W = 1000, H = 520, x0 = 10, x1 = W - 110, y0 = 30, y1 = d.volume ? 360 : 460, v0 = 384, v1 = 460;
            const svg = frame(el, W, H), n = d.ohlc.length;
            const hiV = Math.max(...d.ohlc.map((c) => c[1])), loV = Math.min(...d.ohlc.map((c) => c[2])), padV = (hiV - loV) * 0.08;
            const top = hiV + padV, bot = loV - padV, Y = (v) => y1 - (y1 - y0) * (v - bot) / (top - bot);
            const slot = (x1 - x0) / n, bw = Math.max(4, slot * 0.62), X = (i) => x0 + slot * (i + 0.5);
            const hl = d.highlight === 'last' ? n - 1 : d.highlight;
            // grid + right axis
            const g = svgEl('g', { class: 'grid' }), ax = svgEl('g', { class: 'axis-l' });
            for (let i = 0; i <= 4; i++) {
                const v = bot + (top - bot) * i / 4, y = Y(v);
                g.appendChild(svgEl('line', { x1: x0, x2: x1, y1: y, y2: y }));
                const t = svgEl('text', { x: W - 8, y }); t.textContent = (d.unit === '$' ? '$' : '') + Math.round(v).toLocaleString('en-US') + (d.unit && d.unit !== '$' ? d.unit : ''); ax.appendChild(t);
            }
            svg.append(g, ax);
            const maxVol = d.volume ? Math.max(...d.volume) : 1;
            d.ohlc.forEach(([o, hi, lo, c], i) => {
                const up = c >= o, cls = 'cd ' + (up ? 'up' : 'down') + (i === hl ? ' hl' : '');
                const grp = svgEl('g', { class: cls, style: `--i:${i}` });
                grp.appendChild(svgEl('line', { class: 'wick', x1: X(i), x2: X(i), y1: Y(hi), y2: Y(lo) }));
                const yt = Y(Math.max(o, c)), yb = Y(Math.min(o, c));
                grp.appendChild(svgEl('rect', { class: 'body', x: X(i) - bw / 2, y: yt, width: bw, height: Math.max(2, yb - yt) }));
                svg.appendChild(grp);
                if (d.volume) svg.appendChild(svgEl('rect', { class: 'vol' + (i === hl ? ' hl' : ''), x: X(i) - bw / 2, y: v1 - (v1 - v0) * d.volume[i] / maxVol, width: bw, height: (v1 - v0) * d.volume[i] / maxVol, style: `--i:${i}` }));
            });
            if (d.ma) {
                const pts = d.ohlc.map((_, i) => i < d.ma - 1 ? null : d.ohlc.slice(i - d.ma + 1, i + 1).reduce((a, c) => a + c[3], 0) / d.ma)
                    .map((v, i) => v == null ? null : `${X(i)},${Y(v)}`).filter(Boolean);
                svg.appendChild(svgEl('path', { class: 'ma', pathLength: 1, d: 'M' + pts.join(' L'), style: `--n:${n}` }));
            }
            // last price tag
            const last = d.ohlc[n - 1][3], ty = Y(last), tag = svgEl('g', { class: 'tag', style: `--n:${n}` });
            tag.appendChild(svgEl('rect', { x: x1 + 4, y: ty - 15, width: 104, height: 30 }));
            const tt = svgEl('text', { x: x1 + 56, y: ty }); tt.textContent = (d.unit === '$' ? '$' : '') + last.toLocaleString('en-US'); tag.appendChild(tt);
            svg.appendChild(tag);
            if (hl != null && d.note) {
                const nt = svgEl('g', { class: 'cnote', style: `--n:${n}` }), ny = Y(d.ohlc[hl][1]) - 20;
                nt.appendChild(svgEl('line', { x1: X(hl), x2: X(hl), y1: ny, y2: ny - 26 }));
                const t = svgEl('text', { x: X(hl), y: ny - 36 }); t.textContent = d.note; nt.appendChild(t);
                svg.appendChild(nt);
            }
            if (d.labels) {
                const axb = svgEl('g', { class: 'axis-b' }), step = Math.ceil(n / 6);
                d.labels.forEach((l, i) => { if (i % step) return; const t = svgEl('text', { x: X(i), y: H - 22 }); t.textContent = l; axb.appendChild(t); });
                svg.appendChild(axb);
            }
            if (d.source) { const s = svgEl('text', { class: 'src', x: x0, y: H - 4 }); s.textContent = d.source; svg.appendChild(s); }
        }
    };


    /* ===========================================
       CHAIN LOOP (continuous)
       New blocks are mined on the right (accent), link to the previous block,
       and the whole chain glides left forever while the slide is visible.
       data-start="1024" data-speed="1.3" (seconds per block) data-mode="bg" (faint, no accent, slower)
       Ambient motion: max one per slide (see BRAND.md).
       =========================================== */
    R.chainloop = {
        mount(el) {
            el.classList.toggle('bg', el.dataset.mode === 'bg');
            el.innerHTML = '<div class="track"></div>';
            const BW = +(el.dataset.block || 220), LW = 64, slot = BW + LW;
            el._cl = { BW, LW, slot, next: +(el.dataset.start || 1024), shift: 0 };
            el.style.setProperty('--bw', BW + 'px'); el.style.setProperty('--lw', LW + 'px');
            const visible = Math.ceil((el.offsetWidth || 1600) / slot) + 1;
            for (let k = 0; k < visible - 1; k++) R.chainloop.add(el, false);
        },
        add(el, live) {
            const st = el._cl, track = el.querySelector('.track'), idx = st.next - (+(el.dataset.start || 1024)), x = idx * st.slot, n = st.next++;
            if (idx > 0) {
                const ln = h('div', { class: 'lnk' + (live ? ' live' : ''), style: `left:${x - st.LW}px` });
                track.appendChild(ln);
            }
            track.querySelectorAll('.blk.accent').forEach((b) => b.classList.remove('accent'));
            const b = h('div', { class: 'blk' + (live ? ' live accent' : ''), style: `left:${x}px`, 'data-idx': idx },
                `<b>#${n}</b><div><span class="k">prev</span> ${idx ? fakeHash(n - 1) : '0x0000…0000'}</div><div><span class="k">hash</span> <span class="hv">${live ? 'mining…' : fakeHash(n)}</span></div>`);
            track.appendChild(b);
            if (live) setTimeout(() => { const hv = b.querySelector('.hv'); if (hv) hv.textContent = fakeHash(n); }, 350);
            return idx;
        },
        play(el, later) {
            if (!el._cl) R.chainloop.mount(el);
            const st = el._cl, track = el.querySelector('.track'), speed = +(el.dataset.speed || (el.classList.contains('bg') ? 2 : 1.3)) * 1000;
            const slide = el.closest('.slide');
            const step = () => {
                if (!el.isConnected || !el.classList.contains('is-playing') || (slide && !slide.classList.contains('visible'))) return;
                R.chainloop.add(el, true);
                // keep the newest block about one slot from the right edge
                const lastIdx = st.next - 1 - (+(el.dataset.start || 1024));
                const target = Math.max(0, (lastIdx + 1) * st.slot - el.offsetWidth + st.slot * 0.6);
                later(() => { track.style.transform = `translateX(${-target}px)`; }, speed * 0.35);
                // drop blocks that scrolled off the left edge
                later(() => track.querySelectorAll('.blk, .lnk').forEach((n) => { if (parseFloat(n.style.left) < target - st.slot * 1.5) n.remove(); }), speed * 0.95);
                later(step, speed);
            };
            later(step, 300);
        }
    };

    /* ===========================================
       MAPS (need geo.js): sgmap · sgdots · mrt · flight
       Real outlines from Natural Earth (public domain). Places use real lat/lon.
       =========================================== */
    const GEO = () => window.FSC_GEO || { sg: [], region: [] };
    // Fit lon/lat into a W×H box (equirectangular, corrected for latitude)
    function projector(box, W, H, pad) {
        const [x0, x1, y0, y1] = box, k = Math.cos(((y0 + y1) / 2) * Math.PI / 180);
        const s = Math.min((W - 2 * pad) / ((x1 - x0) * k), (H - 2 * pad) / (y1 - y0));
        const ox = (W - (x1 - x0) * k * s) / 2, oy = (H - (y1 - y0) * s) / 2;
        const f = (lon, lat) => [ox + (lon - x0) * k * s, oy + (y1 - lat) * s];
        f.kmPerPx = 111.32 / s; return f;
    }
    // Smooth closed outline (Catmull-Rom → Bézier)
    function smoothPath(pts) {
        const n = pts.length, P = (i) => pts[(i + n) % n]; let d = `M${P(0)[0].toFixed(1)} ${P(0)[1].toFixed(1)}`;
        for (let i = 0; i < n; i++) {
            const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
            d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
        }
        return d + 'Z';
    }
    const SG_BOX = [103.6, 104.05, 1.22, 1.48];
    const SG_PLACES = [
        { name: 'NTU', lat: 1.3483, lon: 103.6831, note: 'Home base', side: 'top' },
        { name: 'Jurong East', lat: 1.3331, lon: 103.7423, side: 'bottom' },
        { name: 'Orchard', lat: 1.3048, lon: 103.8318, side: 'right' },
        { name: 'Chinatown', lat: 1.2836, lon: 103.8443, side: 'left' },
        { name: 'Marina Bay', lat: 1.2834, lon: 103.8607, side: 'bottom' },
        { name: 'Changi Airport', lat: 1.3644, lon: 103.9915, side: 'top' }];
    const haversine = (a, b) => { const r = (d) => d * Math.PI / 180, dl = r(b.lat - a.lat), dn = r(b.lon - a.lon);
        const h = Math.sin(dl / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dn / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
    function moveAlong(path, dot, dur, later, delay, done) {
        const L = path.getTotalLength();
        later(() => { const t0 = performance.now(); dot.style.opacity = 1;
            const tick = (now) => { const p = Math.min((now - t0) / dur, 1), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2, pt = path.getPointAtLength(e * L);
                const pt2 = path.getPointAtLength(Math.min(L, e * L + 1)); dot.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI})`);
                if (p < 1) requestAnimationFrame(tick); else done && done(); };
            requestAnimationFrame(tick); }, delay);
    }

    /* --- SGMAP: island outline + pins + route ---
       JSON: { "places": [{ "name", "lat", "lon", "note"?, "side"?: "left|right|top|bottom" }], "route": true, "title"?: "My week" } */
    R.sgmap = {
        cls: 'map',
        mount(el) {
            const d = Object.assign({ places: SG_PLACES, route: true }, readJSON(el) || {});
            const W = 1200, H = 700, pr = projector(SG_BOX, W, H, 40);
            const svg = frame(el, W, H);
            const g = svgEl('g', { class: 'grat' });
            for (let lon = 103.6; lon <= 104.05; lon += 0.05) { const [x] = pr(lon, 1.3); g.appendChild(svgEl('line', { x1: x, x2: x, y1: 0, y2: H })); }
            for (let lat = 1.2; lat <= 1.5; lat += 0.05) { const [, y] = pr(103.8, lat); g.appendChild(svgEl('line', { x1: 0, x2: W, y1: y, y2: y })); }
            svg.appendChild(g);
            svg.appendChild(svgEl('path', { class: 'island', pathLength: 1, d: smoothPath(GEO().sg.map(([x, y]) => pr(x, y))) }));
            const pts = d.places.map((p) => pr(p.lon, p.lat));
            if (d.route && pts.length > 1) {
                let path = `M${pts[0][0]} ${pts[0][1]}`;
                for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i], mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.hypot(bx - ax, by - ay) * 0.18; path += `Q${mx.toFixed(1)} ${my.toFixed(1)} ${bx} ${by}`; }
                svg.appendChild(svgEl('path', { class: 'route', pathLength: 1, d: path }));
                const dot = svgEl('g', { class: 'traveller' }); dot.appendChild(svgEl('circle', { r: 9 })); svg.appendChild(dot);
            }
            d.places.forEach((p, i) => {
                const [x, y] = pts[i], side = p.side || 'right', g2 = svgEl('g', { class: 'pin' + (i === 0 ? ' home' : ''), style: `--i:${i}`, transform: `translate(${x} ${y})` });
                g2.appendChild(svgEl('circle', { class: 'ring', r: 16 })); g2.appendChild(svgEl('circle', { class: 'core', r: 7 }));
                const off = { right: [22, 8, 'start'], left: [-22, 8, 'end'], top: [0, p.note ? -50 : -28, 'middle'], bottom: [0, 42, 'middle'] }[side];
                const t = svgEl('text', { class: 'pname', x: off[0], y: off[1], 'text-anchor': off[2] }); t.textContent = p.name; g2.appendChild(t);
                if (p.note) { const n = svgEl('text', { class: 'pnote', x: off[0], y: off[1] + 22, 'text-anchor': off[2] }); n.textContent = p.note; g2.appendChild(n); }
                svg.appendChild(g2);
            });
            // scale bar + north arrow
            const km = 5, px = km / pr.kmPerPx / Math.cos(1.35 * Math.PI / 180);
            const sb = svgEl('g', { class: 'scale', transform: `translate(${W - 60 - px} ${H - 40})` });
            sb.appendChild(svgEl('path', { d: `M0 0V-8M0 0H${px.toFixed(1)}V-8` })); const st = svgEl('text', { x: px / 2, y: -14, 'text-anchor': 'middle' }); st.textContent = `${km} km`; sb.appendChild(st); svg.appendChild(sb);
            const na = svgEl('g', { class: 'scale', transform: `translate(${W - 60} 60)` }); na.appendChild(svgEl('path', { d: 'M0 -26L9 6L0 0L-9 6Z', class: 'north' })); const nt = svgEl('text', { y: 30, 'text-anchor': 'middle' }); nt.textContent = 'N'; na.appendChild(nt); svg.appendChild(na);
            if (d.title) { const tt = svgEl('text', { class: 'mtitle', x: 40, y: 56 }); tt.textContent = d.title; svg.appendChild(tt); }
        },
        play(el, later) {
            const route = el.querySelector('.route'), dot = el.querySelector('.traveller');
            if (route && dot) { dot.style.opacity = 0; moveAlong(route, dot, 3200, later, 2400); }
        },
        final(el) { const dot = el.querySelector('.traveller'); if (dot) dot.style.opacity = 0; }
    };

    /* --- SGDOTS: dot-matrix island, rippling out from home ---
       JSON: { "home": { "lat", "lon" }, "places": [{ "name", "lat", "lon" }], "spacing": 13, "caption": "..." } */
    R.sgdots = {
        cls: 'map',
        mount(el) {
            const d = Object.assign({ home: SG_PLACES[0], places: SG_PLACES.slice(0, 1).concat(SG_PLACES.slice(4)), spacing: 13 }, readJSON(el) || {});
            const W = 1200, H = 700, pr = projector(SG_BOX, W, H, 40), poly = GEO().sg.map(([x, y]) => pr(x, y));
            const inside = (x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
            const svg = frame(el, W, H), [hx, hy] = pr(d.home.lon, d.home.lat), sp = d.spacing;
            let maxD = 0; const dots = [];
            for (let y = sp / 2; y < H; y += sp) for (let x = sp / 2 + ((y / sp) % 2 ? sp / 2 : 0); x < W; x += sp) if (inside(x, y)) { const dd = Math.hypot(x - hx, y - hy); maxD = Math.max(maxD, dd); dots.push([x, y, dd]); }
            const g = svgEl('g', { class: 'dots' });
            dots.forEach(([x, y, dd]) => g.appendChild(svgEl('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 3.4, style: `--t:${(dd / maxD).toFixed(3)}` })));
            svg.appendChild(g);
            d.places.forEach((p, i) => {
                const [x, y] = pr(p.lon, p.lat), dd = Math.hypot(x - hx, y - hy), gg = svgEl('g', { class: 'hot' + (i === 0 ? ' home' : ''), transform: `translate(${x} ${y})`, style: `--t:${(dd / maxD).toFixed(3)}` });
                gg.appendChild(svgEl('circle', { class: 'pulse', r: 10 })); gg.appendChild(svgEl('circle', { class: 'core', r: 8 }));
                const t = svgEl('text', { x: 0, y: -24, 'text-anchor': 'middle' }); t.textContent = p.name; gg.appendChild(t); svg.appendChild(gg);
            });
            if (d.caption) { const c = svgEl('text', { class: 'mtitle', x: 40, y: H - 36 }); c.textContent = d.caption; svg.appendChild(c); }
        }
    };

    /* --- MRT: schematic line journey with a moving train ---
       JSON: { "line": "East–West Line", "color"?: "#009645", "caption"?: "NTU → City Hall · about 55 min",
               "stations": [{ "name", "code"?, "note"? }] } */
    R.mrt = {
        cls: 'map',
        mount(el) {
            const d = Object.assign({ line: 'East–West Line', caption: 'Pioneer → City Hall', stations: [
                { name: 'Pioneer', code: 'EW28', note: 'Bus from NTU' }, { name: 'Boon Lay', code: 'EW27' }, { name: 'Jurong East', code: 'EW24', note: 'Change for NS' },
                { name: 'Clementi', code: 'EW23' }, { name: 'Buona Vista', code: 'EW21' }, { name: 'Outram Park', code: 'EW16' }, { name: 'Raffles Place', code: 'EW14' }, { name: 'City Hall', code: 'EW13' }] }, readJSON(el) || {});
            const W = 1600, H = 420, x0 = 90, x1 = W - 90, y = 230, n = d.stations.length, X = (i) => x0 + (x1 - x0) * i / (n - 1);
            const svg = frame(el, W, H);
            if (d.color) el.style.setProperty('--line', d.color);
            const head = svgEl('g', { class: 'mrt-head' });
            head.appendChild(svgEl('rect', { x: x0 - 10, y: 40, width: 18, height: 18, rx: 4, class: 'chip' }));
            const ht = svgEl('text', { x: x0 + 20, y: 55 }); ht.textContent = d.line; head.appendChild(ht);
            const cp = svgEl('text', { x: x1 + 10, y: 55, 'text-anchor': 'end', class: 'cap' }); cp.textContent = d.caption || ''; head.appendChild(cp); svg.appendChild(head);
            svg.appendChild(svgEl('path', { class: 'track', d: `M${x0} ${y}H${x1}` }));
            const run = svgEl('path', { class: 'run', d: `M${x0} ${y}H${x1}`, pathLength: 1 }); svg.appendChild(run);
            d.stations.forEach((s, i) => {
                const g = svgEl('g', { class: 'stn', style: `--i:${i};--n:${n}`, transform: `translate(${X(i)} ${y})` });
                g.appendChild(svgEl('circle', { r: 15 }));
                const up = i % 2 === 0, nm = svgEl('text', { class: 'sname', y: up ? -42 : 58, 'text-anchor': 'middle' }); nm.textContent = s.name; g.appendChild(nm);
                if (s.code) { const c = svgEl('text', { class: 'scode', y: up ? -72 : 84, 'text-anchor': 'middle' }); c.textContent = s.code; g.appendChild(c); }
                if (s.note) { const no = svgEl('text', { class: 'snote', y: up ? 58 : -42, 'text-anchor': 'middle' }); no.textContent = s.note; g.appendChild(no); }
                svg.appendChild(g);
            });
            const train = svgEl('g', { class: 'train' }); train.appendChild(svgEl('rect', { x: -26, y: -11, width: 52, height: 22, rx: 11 })); svg.appendChild(train);
            el._mrt = { X, y, n }; el.style.setProperty('--mrt-dur', ((n - 1) * 0.78) + 's');
        },
        play(el, later) {
            const { X, y, n } = el._mrt, train = el.querySelector('.train'), stns = el.querySelectorAll('.stn'), seg = 520, stop = 260;
            stns.forEach((s) => s.classList.remove('passed')); train.setAttribute('transform', `translate(${X(0)} ${y})`); stns[0].classList.add('passed');
            let t = 900;
            for (let i = 1; i < n; i++) {
                const a = X(i - 1), b = X(i), start = t;
                later(() => { const t0 = performance.now(); const tick = (now) => { const p = Math.min((now - t0) / seg, 1), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
                    train.setAttribute('transform', `translate(${a + (b - a) * e} ${y})`); if (p < 1) requestAnimationFrame(tick); else stns[i].classList.add('passed'); }; requestAnimationFrame(tick); }, start);
                t += seg + stop;
            }
        },
        final(el) { const { X, y, n } = el._mrt; el.querySelector('.train').setAttribute('transform', `translate(${X(n - 1)} ${y})`); el.querySelectorAll('.stn').forEach((s) => s.classList.add('passed')); }
    };

    /* --- FLIGHT: arc from home to Singapore over a real SE-Asia map, distance counts up ---
       JSON: { "from": { "name", "lat", "lon" }, "to": { "name", "lat", "lon" }, "caption"?: "..." }
       Default origin is an example (Taipei): always set "from" to the presenter's real home. */
    R.flight = {
        cls: 'map',
        mount(el) {
            const d = Object.assign({ from: { name: 'Taipei', lat: 25.03, lon: 121.56 }, to: { name: 'Singapore', lat: 1.29, lon: 103.85 } }, readJSON(el) || {});
            const lons = [d.from.lon, d.to.lon], lats = [d.from.lat, d.to.lat];
            const box = [Math.min(...lons) - 9, Math.max(...lons) + 9, Math.min(...lats) - 7, Math.max(...lats) + 6];
            const W = 1200, H = 760, pr = projector(box, W, H, 0), svg = frame(el, W, H);
            const g = svgEl('g', { class: 'grat' });
            for (let lon = Math.ceil(box[0] / 5) * 5; lon <= box[1]; lon += 5) { const [x] = pr(lon, 0); g.appendChild(svgEl('line', { x1: x, x2: x, y1: 0, y2: H })); }
            for (let lat = Math.ceil(box[2] / 5) * 5; lat <= box[3]; lat += 5) { const [, yy] = pr(0, lat); g.appendChild(svgEl('line', { x1: 0, x2: W, y1: yy, y2: yy })); }
            svg.appendChild(g);
            const land = svgEl('g', { class: 'land' });
            GEO().region.forEach((poly) => land.appendChild(svgEl('path', { d: 'M' + poly.map(([x, y]) => pr(x, y).map((v) => v.toFixed(1)).join(' ')).join('L') + 'Z' })));
            svg.appendChild(land);
            const A = pr(d.from.lon, d.from.lat), B = pr(d.to.lon, d.to.lat), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, len = Math.hypot(B[0] - A[0], B[1] - A[1]);
            const nx = -(B[1] - A[1]) / len, ny = (B[0] - A[0]) / len, bend = len * 0.28 * (nx > 0 ? 1 : -1);
            const arc = svgEl('path', { class: 'arc', pathLength: 1, d: `M${A[0]} ${A[1]}Q${mx + nx * bend} ${my + ny * bend} ${B[0]} ${B[1]}` }); svg.appendChild(arc);
            [[A, d.from, 'from'], [B, d.to, 'to']].forEach(([p, info, cls]) => { const gg = svgEl('g', { class: 'end ' + cls, transform: `translate(${p[0]} ${p[1]})` });
                gg.appendChild(svgEl('circle', { class: 'ring', r: 16 })); gg.appendChild(svgEl('circle', { class: 'core', r: 8 }));
                const t = svgEl('text', { x: 24, y: 8 }); t.textContent = info.name; gg.appendChild(t); svg.appendChild(gg); });
            const plane = svgEl('g', { class: 'plane' }); plane.appendChild(svgEl('path', { d: 'M18 0L-6 -4L-14 -16L-18 -16L-12 -3L-20 -2L-24 -8L-27 -8L-24 0L-27 8L-24 8L-20 2L-12 3L-18 16L-14 16L-6 4Z' })); svg.appendChild(plane);
            const km = Math.round(haversine(d.from, d.to));
            const box2 = svgEl('g', { class: 'dist', transform: `translate(40 ${H - 50})` });
            const big = svgEl('text', { class: 'km' }); big.textContent = '0 km'; box2.appendChild(big);
            const cap = svgEl('text', { class: 'kcap', y: -86 }); cap.textContent = d.caption || `${d.from.name} → ${d.to.name}`; box2.appendChild(cap); svg.appendChild(box2);
            el._km = km;
        },
        play(el, later) {
            const arc = el.querySelector('.arc'), plane = el.querySelector('.plane'), big = el.querySelector('.km'), km = el._km;
            plane.style.opacity = 0; moveAlong(arc, plane, 2600, later, 900);
            later(() => { const t0 = performance.now(); const tick = (now) => { const p = Math.min((now - t0) / 2600, 1); big.textContent = Math.round(km * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US') + ' km'; if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }, 900);
        },
        final(el) { el.querySelector('.km').textContent = el._km.toLocaleString('en-US') + ' km'; el.querySelector('.plane').style.opacity = 0; }
    };

    /* ===========================================
       LAW: contract (clauses → signature → seal) · scales (two sides weighed)
       =========================================== */
    /* --- CONTRACT ---
       data-title="Token Purchase Agreement" data-party="Alice & Bob" data-seal="EXECUTED" data-hl="2" (clause to highlight, 1-based)
       Children: <li>clause text</li> … */
    R.contract = {
        mount(el) {
            const items = [...el.querySelectorAll('li')].map((li) => li.innerHTML);
            const clauses = items.length ? items : ['The Issuer mints tokens 1:1 against deposits held.', 'Tokens are transferable only between verified wallets.', 'Redemption settles within one business day.', 'This agreement is governed by the laws of Singapore.'];
            const hl = +(el.dataset.hl || 2);
            const sig = 'M8 46c10-30 18-38 22-30s-10 34-4 30 14-36 22-32-6 28 2 26 10-18 16-18 2 14 8 12 12-10 18-8';
            el.innerHTML = `<div class="paper"><div class="ctop"><span class="mono">${el.dataset.ref || 'AGREEMENT No. 0x7e1c'}</span><span class="mono">${el.dataset.date || '14 Oct 2026'}</span></div>
                <h4>${el.dataset.title || 'Token Purchase Agreement'}</h4><p class="parties">${el.dataset.party || 'between Alice and Bob'}</p>
                <ol>${clauses.map((c, i) => `<li class="${i + 1 === hl ? 'hl' : ''}" style="--i:${i}"><span class="cn">§ ${i + 1}</span><span>${c}</span></li>`).join('')}</ol>
                <div class="sign"><svg viewBox="0 0 200 60" class="sig"><path pathLength="1" d="${sig}"/></svg><span class="sline">${el.dataset.signer || 'Signed: Alice'}</span></div>
                <div class="seal"><svg viewBox="0 0 120 120"><defs><path id="sealc${++uid}" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0"/></defs>
                <circle cx="60" cy="60" r="56"/><circle cx="60" cy="60" r="34"/><text><textPath href="#sealc${uid}" textLength="268" lengthAdjust="spacing">${el.dataset.seal || 'EXECUTED'} · ${el.dataset.seal || 'EXECUTED'} · </textPath></text>
                <path class="tick" d="M46 60l10 10 18-22"/></svg></div></div>`;
        }
    };

    /* --- SCALES ---
       JSON: { "left": { "label": "Innovation", "items": ["Faster settlement", "…"], "weight": 3 },
               "right": { "label": "Protection", "items": ["…"], "weight": 2 }, "caption"?: "…" }
       The beam tips toward the heavier side (weight defaults to item count). */
    R.scales = {
        mount(el) {
            const d = Object.assign({ left: { label: 'Innovation', items: ['Instant settlement', 'Programmable money', 'Open access'] }, right: { label: 'Protection', items: ['Investor safeguards', 'AML / KYC'] } }, readJSON(el) || {});
            const wl = d.left.weight ?? d.left.items.length, wr = d.right.weight ?? d.right.items.length;
            el.style.setProperty('--tilt', Math.max(-12, Math.min(12, (wr - wl) * 5)) + 'deg');
            const side = (s, cls) => `<div class="pan-wrap ${cls}"><div class="chain"></div><div class="pan"><div class="chips">${s.items.map((t, i) => `<span style="--i:${i}">${t}</span>`).join('')}</div></div><div class="plabel">${s.label}</div></div>`;
            el.innerHTML = `<div class="stage"><div class="post"></div><div class="base"></div><div class="beam">${side(d.left, 'l')}${side(d.right, 'r')}<i class="pivot"></i></div></div>${d.caption ? `<p class="cap">${d.caption}</p>` : ''}`;
        }
    };

    /* ===========================================
       BOTANICALS: fine-line botanical illustrations (not florals-cute: ink, thin lines)
       data-name="laurel | olive | eucalyptus | fern | wildflower | orchid"  data-flip="x" (mirror)
       Draw-in: stems first, then leaves grow along them.
       =========================================== */
    function leafPath(len, w) { return `M0 0C${len * .3} ${-w} ${len * .7} ${-w} ${len} 0C${len * .7} ${w} ${len * .3} ${w} 0 0Z`; }
    function botanicalSVG(name) {
        const r = rnd(name.length * 131 + 7); let out = '', k = 0;
        const leaf = (x, y, ang, len, w, extra = '') => `<g class="lf" style="--k:${k++}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})"><path class="blade${extra}" d="${leafPath(len, w)}"/><path class="rib" d="M${len * .08} 0L${len * .85} 0"/></g>`;
        const stem = (p0, p1, p2, p3) => `<path class="stem" pathLength="1" d="M${p0}C${p1} ${p2} ${p3}"/>`;
        const along = (P, t) => [bez(P[0][0], P[1][0], P[2][0], P[3][0], t), bez(P[0][1], P[1][1], P[2][1], P[3][1], t)];
        const tang = (P, t) => { const a = along(P, t), b = along(P, Math.min(1, t + .01)); return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; };
        const branch = (P, n, len, w, spread, opts = {}) => {
            out += stem(...P.map((p) => p.join(' ')));
            for (let i = 1; i <= n; i++) {
                const t = (opts.from ?? .08) + (1 - (opts.from ?? .08)) * i / (n + 1), [x, y] = along(P, t), a = tang(P, t), sc = opts.taper ? 1 - t * .45 : 1;
                out += leaf(x, y, a - spread, len * sc * (.85 + r() * .3), w * sc);
                if (opts.pairs || i % 2) out += leaf(x, y, a + spread, len * sc * (.85 + r() * .3), w * sc);
            }
            if (opts.tip !== false) { const [x, y] = along(P, 1); out += leaf(x, y, tang(P, .99), len * .8, w * .8); }
        };
        if (name === 'laurel') {   // wreath: two mirrored arcs of paired leaves
            const arc = (dir) => { const P = [[200, 380], [200 + dir * 150, 360], [200 + dir * 170, 140], [200 + dir * 60, 40]]; branch(P, 11, 46, 13, 38, { pairs: true, taper: true }); };
            arc(-1); arc(1);
            out += `<path class="stem" pathLength="1" d="M170 382c10 12 50 12 60 0M185 384l-14 22M215 384l14 22"/>`;
            return { vb: '0 0 400 420', out };
        }
        if (name === 'olive') {
            const P = [[30, 370], [140, 300], [230, 170], [370, 60]]; branch(P, 14, 74, 9, 32, { taper: true });
            [[.35, 1], [.52, -1], [.7, 1]].forEach(([t, s2]) => { const [x, y] = along(P, t), a = tang(P, t) + 90 * s2;
                const ox = x + Math.cos(a * Math.PI / 180) * 22, oy = y + Math.sin(a * Math.PI / 180) * 22;
                out += `<g class="lf" style="--k:${k++}"><path class="stem thin" d="M${x.toFixed(1)} ${y.toFixed(1)}L${ox.toFixed(1)} ${oy.toFixed(1)}"/><ellipse class="fruit" cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" rx="9" ry="12" transform="rotate(${a.toFixed(0)} ${ox.toFixed(1)} ${oy.toFixed(1)})"/></g>`; });
            return { vb: '0 0 400 420', out };
        }
        if (name === 'eucalyptus') {
            const P = [[60, 20], [120, 140], [90, 260], [190, 400]];
            out += stem(...P.map((p) => p.join(' ')));
            for (let i = 0; i < 11; i++) { const t = .06 + i * .085, [x, y] = along(P, t), a = tang(P, t) + (i % 2 ? 70 : -70), sz = 30 + r() * 8;
                out += `<g class="lf" style="--k:${k++}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)})"><path class="blade" d="M0 0C${sz * .2} ${-sz * .8} ${sz * 1.2} ${-sz * .8} ${sz * 1.2} 0S${sz * .2} ${sz * .8} 0 0Z"/><path class="rib" d="M2 0L${sz * 1.05} 0"/></g>`; }
            return { vb: '0 0 300 420', out };
        }
        if (name === 'fern') {
            const P = [[40, 400], [90, 260], [180, 120], [330, 40]]; out += stem(...P.map((p) => p.join(' ')));
            for (let i = 0; i < 24; i++) { const t = .05 + i * .038, [x, y] = along(P, t), a = tang(P, t), L = 70 * (1 - t * .8);
                [-1, 1].forEach((sd) => { const ang = a + sd * 62; out += `<g class="lf" style="--k:${k++}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})"><path class="blade" d="M0 0C${L * .2} ${-L * .16} ${L * .8} ${-L * .1} ${L} 0C${L * .8} ${L * .1} ${L * .2} ${L * .16} 0 0Z"/></g>`; });
            }
            return { vb: '0 0 400 420', out };
        }
        if (name === 'wildflower') {
            const stems = [[[120, 410], [118, 300], [100, 200], [80, 90]], [[150, 410], [160, 320], [200, 220], [230, 130]], [[135, 410], [140, 330], [150, 260], [160, 190]]];
            stems.forEach((P, si) => { out += stem(...P.map((p) => p.join(' ')));
                const [x, y] = P[3];
                for (let i = 0; i < 9; i++) { const a = -90 + (i - 4) * 18, L = 26 + r() * 10, ex = x + Math.cos(a * Math.PI / 180) * L, ey = y + Math.sin(a * Math.PI / 180) * L * .7;
                    out += `<g class="lf" style="--k:${k++}"><path class="stem thin" d="M${x} ${y}L${ex.toFixed(1)} ${ey.toFixed(1)}"/><circle class="bud" cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="${si === 2 ? 5 : 3.5}"/></g>`; }
                out += leaf(P[1][0], P[1][1], si % 2 ? -40 : -140, 60, 8);
            });
            [[100, 410, -100], [170, 410, -75], [140, 410, -88]].forEach(([x, y, a]) => out += `<g class="lf" style="--k:${k++}" transform="translate(${x} ${y}) rotate(${a})"><path class="blade" d="${leafPath(150, 5)}"/></g>`);
            return { vb: '0 0 320 420', out };
        }
        // orchid: Vanda Miss Joaquim spray (Singapore's national flower), drawn as fine line art
        const P = [[60, 410], [80, 280], [140, 170], [260, 70]]; out += stem(...P.map((p) => p.join(' ')));
        [[.45, 1], [.7, .85], [.95, .7]].forEach(([t, sc]) => { const [x, y] = along(P, t), s3 = 46 * sc;
            let f = `<g class="lf flower" style="--k:${k++}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(tang(P, t) - 60).toFixed(1)})">`;
            [0, 72, 144, 216, 288].forEach((a) => f += `<path class="blade" transform="rotate(${a})" d="M0 0C${s3 * .25} ${-s3 * .35} ${s3 * .85} ${-s3 * .35} ${s3} 0C${s3 * .85} ${s3 * .35} ${s3 * .25} ${s3 * .35} 0 0Z"/>`);
            f += `<path class="blade lip" transform="rotate(108)" d="M0 0C${s3 * .4} ${-s3 * .6} ${s3 * 1.25} ${-s3 * .7} ${s3 * 1.1} 0C${s3 * 1.25} ${s3 * .7} ${s3 * .4} ${s3 * .6} 0 0Z"/><circle class="bud" r="5"/></g>`;
            out += f; });
        [[.12, -150], [.22, -30]].forEach(([t, a]) => { const [x, y] = along(P, t); out += leaf(x, y, a, 120, 14); });
        return { vb: '0 0 340 420', out };
    }
    R.botanical = {
        mount(el) {
            const name = el.dataset.name || 'olive', { vb, out } = botanicalSVG(name);
            el.classList.toggle('flip', el.dataset.flip === 'x');
            el.innerHTML = `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${out}</svg>`;
        }
    };

    window.FSC = { play, update, mount, mountAll, wire, registry: R, iconSVG };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => wire());
    else wire();
})();
