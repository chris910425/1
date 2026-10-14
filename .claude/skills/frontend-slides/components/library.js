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

    // Scale a hand-drawn template path (pairs of numbers only) to the word's real box, so strokes stay even
    function fxGeom(el) {
        el.querySelectorAll('.fx-svg').forEach((svg) => {
            const host = svg.parentElement, fs = parseFloat(getComputedStyle(host).fontSize) || 40;
            const [, , vw, vh] = svg.dataset.vb.split(' ').map(Number), k = svg.classList;
            const tw = host.querySelector('.fx-t') ? host.querySelector('.fx-t').offsetWidth : host.offsetWidth;
            const w = k.contains('o') ? tw * 1.16 : tw * 1.06, h = k.contains('o') ? fs * 1.5 : k.contains('u') ? fs * 0.3 : fs * 0.22;
            svg.setAttribute('width', w); svg.setAttribute('height', h); svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
            let i = 0;
            const d = svg.dataset.d.replace(/-?\d*\.?\d+/g, (n) => (+n * (i++ % 2 ? h / vh : w / vw)).toFixed(1));
            const path = svg.querySelector('path'); path.setAttribute('d', d);
            path.style.strokeWidth = Math.max(3, fs * 0.075);
            path.style.setProperty('--len', Math.ceil(path.getTotalLength()) + 1);
        });
    }

    /* ===========================================
       TEXT EFFECTS: <span data-fx="underline">word</span>
       underline | circle | highlight | strike (data-to="new") | type | words
       | cycle (data-words="a|b|c", stops on last) | scramble | count (data-to, data-dec, data-prefix, data-suffix)
       Effects use the accent: one per slide.
       =========================================== */
    R.fx = {
        inline: true,
        mount(el) {
            const kind = el.dataset.fx, text = el.dataset.text || el.textContent;
            el.dataset.text = text; el.classList.add('fx-' + kind);
            const svg = (vb, d, cls) => `<svg class="fx-svg ${cls}" data-vb="${vb}" data-d="${d}" aria-hidden="true"><path/></svg>`;
            if (kind === 'underline') el.innerHTML = `<span class="fx-t">${text}</span>` + svg('0 0 100 12', 'M2 8C22 3 48 10 70 6S92 4 98 6', 'u');
            else if (kind === 'circle') el.innerHTML = `<span class="fx-t">${text}</span>` + svg('0 0 100 60', 'M86 10C66 0 18 2 6 22c-10 18 18 34 52 32 30-2 44-16 38-30C92 12 70 6 52 6', 'o');
            else if (kind === 'strike') el.innerHTML = `<span class="fx-old"><span class="fx-t">${text}</span>${svg('0 0 100 10', 'M2 6C30 4 70 7 98 4', 's')}</span>${el.dataset.to ? ` <span class="fx-to">${el.dataset.to}</span>` : ''}`;
            else if (kind === 'words') el.innerHTML = text.trim().split(/\s+/).map((w, i) => `<span class="fx-w" style="--i:${i}">${w}</span>`).join(' ');
            else if (kind === 'cycle') { const ws = (el.dataset.words || text).split('|'); el.dataset.words = ws.join('|'); el.innerHTML = `<span class="fx-c">${ws[0]}</span>`; }
            else if (kind === 'count') el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || '');
            else el.innerHTML = `<span class="fx-t">${text}</span>`;
        },
        play(el, later) {
            fxGeom(el);
            const kind = el.dataset.fx, text = el.dataset.text, t = el.querySelector('.fx-t');
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
            fxGeom(el);
            const k = el.dataset.fx;
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

    window.FSC = { play, update, mount, mountAll, wire, registry: R, iconSVG };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => wire());
    else wire();
})();
