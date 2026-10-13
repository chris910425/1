/* ===========================================
   FSC — FRONTEND SLIDES COMPONENT LIBRARY (behavior)
   Usage: <div class="fsc" data-fsc="chain" ...></div>
   - Mounts every [data-fsc] element on load.
   - Plays a component when its .slide becomes .visible
     (or when scrolled into view if it is not inside a slide).
   - API: FSC.play(el), FSC.update(el, data), FSC.mountAll(root)
   Data for charts/heatmap lives in a child
   <script type="application/json"> so it can be swapped for real data.
   =========================================== */
(function () {
    const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const R = {};          // registry: name -> { mount(el), play(el)? , total(el)? }
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
        if (!el._fscSource) el._fscSource = el.innerHTML;   // keep authored content for re-mounts
        el.innerHTML = el._fscSource;
        el.classList.add('fsc', 'fsc-' + (c.cls || el.dataset.fsc));
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
    function mountAll(root = document) { root.querySelectorAll('[data-fsc]').forEach(mount); }

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

    /* --- HEATMAP ---
       JSON: { "rows": ["Mon",…], "cols": 24, "colLabels": ["00h","06h","12h","18h","24h"],
               "values": [[0..1,…],…], "low": "Low gas", "high": "High gas" }
       Values are 0..1 (normalize your data). Omit "values" for a demo pattern. */
    R.heat = {
        cls: 'heat',
        mount(el) {
            const d = Object.assign({ rows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], cols: 24, colLabels: ['00h', '06h', '12h', '18h', '24h'], low: 'Low', high: 'High' }, readJSON(el) || {});
            const vals = d.values || d.rows.map((_, r) => Array.from({ length: d.cols }, (_, c) => {
                const day = r < 5 ? 1 : 0.55, peak = Math.exp(-((c - 15) ** 2) / 18) * 0.85 + Math.exp(-((c - 9) ** 2) / 10) * 0.35;
                return Math.min(1, Math.max(0.04, day * peak + 0.08 * (((r * 31 + c * 17) % 7) / 7)));
            }));
            const json = el.querySelector('script[type="application/json"]');
            el.innerHTML = '';
            if (json) el.appendChild(json);
            const rows = h('div', { class: 'rows', style: `grid-template-rows:repeat(${d.rows.length},1fr)` }, d.rows.map((r) => `<div>${r}</div>`).join(''));
            const grid = h('div', { class: 'grid', style: `grid-template-columns:repeat(${d.cols},1fr);grid-template-rows:repeat(${d.rows.length},1fr)` });
            vals.forEach((row, r) => row.forEach((v, c) => grid.appendChild(h('div', {
                class: 'cell', style: `--d:${((r + c) / (d.rows.length + d.cols)).toFixed(3)};background:color-mix(in srgb, var(--accent) ${Math.round(v * 100)}%, var(--panel))`, title: `${d.rows[r]} ${c}: ${v}`
            }))));
            el.append(rows, grid,
                h('div', { class: 'cols' }, d.colLabels.map((l) => `<span>${l}</span>`).join('')),
                h('div', { class: 'legend' }, `<span>${d.low}</span><span class="ramp"></span><span>${d.high}</span>`));
        }
    };
    R.heatmap = R.heat;

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

    window.FSC = { play, update, mount, mountAll, wire, registry: R };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => wire());
    else wire();
})();
