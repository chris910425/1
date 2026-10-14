/* ===========================================
   FSC ICONS + CHARACTERS
   Line icons on a 48×48 grid (stroke = currentColor, 2.2px).
   Class "a"  = accent fill part, class "as" = accent stroke part.
   Characters use a 120×160 grid and fill-based drawing.
   Usage in a deck: <i data-icon="bus"></i> or <i data-icon="alice"></i>
   Label lookup: FSC_ICONS[name].label
   =========================================== */
window.FSC_ICONS = (function () {
    const I = (label, group, body, vb = '0 0 48 48') => ({ label, group, body, vb });
    const C = (label, body) => ({ label, group: 'character', body, vb: '0 0 120 160', character: true });

    /* Shared character parts */
    const shoulders = (cls = 'body') => `<path class="${cls}" d="M18 160v-20c0-20 18-32 42-32s42 12 42 32v20z"/>`;
    const head = '<circle class="skin" cx="60" cy="64" r="28"/>';
    const eyes = '<circle class="ink" cx="50" cy="66" r="3"/><circle class="ink" cx="70" cy="66" r="3"/>';
    const smile = '<path class="line" d="M52 78q8 6 16 0"/>';

    return {
        /* ---------- Finance & institutions ---------- */
        bank: I('Bank', 'finance', '<path d="M6 18 24 7l18 11z"/><path d="M11 22v13M19 22v13M29 22v13M37 22v13M8 35h32M6 40h36"/><circle class="a" cx="24" cy="14" r="2.4"/>'),
        coin: I('Coin', 'finance', '<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="11.5"/><path class="a" d="m24 16 6 8-6 8-6-8z"/>'),
        wallet: I('Wallet', 'finance', '<rect x="6" y="13" width="36" height="27" rx="3"/><path d="M10 13 31 6l3 7"/><path d="M42 22H31a5 5 0 0 0 0 10h11"/><circle class="a" cx="31" cy="27" r="2"/>'),
        card: I('Bank card', 'finance', '<rect x="5" y="11" width="38" height="26" rx="3"/><path d="M5 18h38M25 31h12"/><rect class="a" x="10" y="24" width="8" height="6" rx="1"/>'),
        vault: I('Vault', 'finance', '<rect x="7" y="6" width="34" height="34" rx="3"/><circle cx="24" cy="23" r="9"/><path d="M24 14v4M24 28v4M15 23h4M29 23h4M12 40v3M36 40v3"/><circle class="a" cx="24" cy="23" r="2.6"/>'),
        key: I('Private key', 'finance', '<circle cx="15" cy="24" r="7.5"/><path d="M22.5 24H42M36 24v6M41 24v5"/><circle class="a" cx="15" cy="24" r="2.4"/>'),
        lock: I('Lock', 'finance', '<rect x="10" y="21" width="28" height="21" rx="3"/><path d="M16 21v-6a8 8 0 0 1 16 0v6M24 33v4"/><circle class="a" cx="24" cy="31" r="2.6"/>'),
        shield: I('Security', 'finance', '<path d="M24 5 39 11v12c0 10-7 17-15 20-8-3-15-10-15-20V11z"/><path class="as" d="m17 24 5 5 9-10"/>'),
        exchange: I('Exchange', 'finance', '<path d="M8 17h30M31 10l7 7-7 7M40 31H10M17 24l-7 7 7 7"/>'),
        growth: I('Growth', 'finance', '<path d="M7 7v34h34"/><path class="as" d="m12 33 9-10 7 6 12-14M34 15h6v6"/>'),
        contract: I('Smart contract', 'finance', '<path d="M12 5h17l9 9v29H12z"/><path d="M29 5v9h9M17 21h14M17 27h14M17 33h7"/><circle class="a" cx="32" cy="36" r="3.6"/>'),
        qr: I('QR payment', 'finance', '<rect x="7" y="7" width="13" height="13"/><rect x="28" y="7" width="13" height="13"/><rect x="7" y="28" width="13" height="13"/><path d="M28 28h5v5h-5zM36 36h5v5h-5zM36 28h5M28 41h3"/><rect class="a" x="11" y="11" width="5" height="5"/>'),
        globe: I('Cross-border', 'finance', '<circle cx="24" cy="24" r="17"/><ellipse cx="24" cy="24" rx="7" ry="17"/><path d="M7 24h34M10 15h28M10 33h28"/>'),
        block: I('Block / token', 'finance', '<path d="M24 6 40 15v18L24 42 8 33V15z"/><path d="M8 15l16 9 16-9M24 24v18"/><path class="a" d="M24 6 40 15 24 24 8 15z" opacity=".9"/>'),
        kyc: I('KYC / identity', 'finance', '<rect x="6" y="10" width="36" height="28" rx="3"/><circle cx="17" cy="22" r="4"/><path d="M11 32c1-4.5 11-4.5 12 0M27 20h10M27 26h10M27 32h6"/><circle class="a" cx="37" cy="32" r="2"/>'),
        regulator: I('Regulator', 'finance', '<path d="M24 6v34M14 40h20M10 12h28"/><path d="M10 12 5 24h10zM38 12l-5 12h10z"/><path class="a" d="M5 24a5 3 0 0 0 10 0zM33 24a5 3 0 0 0 10 0z"/><circle cx="24" cy="8" r="2"/>'),

        /* ---------- Law ---------- */
        gavel: I('Gavel', 'law', '<path d="M17 8l11 11M11 14l11 11M14 11l11 11"/><rect x="13" y="6" width="8" height="18" rx="2" transform="rotate(-45 17 15)"/><path d="M23 21l14 14"/><path d="M6 42h18M9 42v-4h12v4"/><path class="as" d="M30 40h12"/>'),
        court: I('Court', 'law', '<path d="M5 17 24 6l19 11z"/><path d="M9 21v15M17 21v15M31 21v15M39 21v15M6 17h36M6 40h36M4 44h40"/><circle class="a" cx="24" cy="12.5" r="2.4"/>'),
        justice: I('Scales of justice', 'law', '<path d="M24 6v34M16 42h16M10 12h28"/><path d="M10 12 4 26M10 12l6 14M38 12l-6 14M38 12l6 14"/><path d="M3 26a7 4 0 0 0 14 0zM31 26a7 4 0 0 0 14 0z"/><circle class="a" cx="24" cy="8" r="2.6"/>'),
        statute: I('Statute book', 'law', '<path d="M10 6h24a4 4 0 0 1 4 4v32H14a4 4 0 0 1-4-4z"/><path d="M10 38a4 4 0 0 1 4-4h24"/><path class="as" d="M27 13c-1.5-2-6-2-6 1s6 2 6 5-4.5 3-6 1M21 16c-2 1-2 3 0 4"/>'),
        section: I('Section §', 'law', '<path d="M30 10c-2-4-12-4-12 2s12 4 12 11-10 7-12 3M18 18c-4 2-4 7 1 9M30 26c4 2 4 7-1 9-3 1-9 1-11-3"/>'),
        quill: I('Quill / signature', 'law', '<path d="M40 6C26 8 16 18 13 32l3 3c14-3 24-13 26-27z"/><path d="M13 32l-4 10M20 28l12-12"/><path class="as" d="M6 42c4-3 7 1 10-1s4-4 7-2 4 2 6 1"/>'),
        seal: I('Seal / stamp', 'law', '<path d="M18 6h12v8a6 6 0 0 1-6 6 6 6 0 0 1-6-6z"/><path d="M14 20h20l3 8H11z"/><rect x="9" y="28" width="30" height="5" rx="1"/><path class="as" d="M10 40h28"/>'),
        contractsign: I('Signed contract', 'law', '<path d="M10 4h18l8 8v32H10z"/><path d="M28 4v8h8M15 16h14M15 21h16M15 26h12"/><path class="as" d="M15 36c3-4 5 1 8-1s3-3 5-1 3 1 4 0"/>'),
        handcuffs: I('Handcuffs', 'law', '<circle cx="13" cy="30" r="8"/><circle cx="35" cy="30" r="8"/><path d="M13 22v-5M35 22v-5M13 17h22"/><path class="as" d="M19 14l2 3-2 3M29 14l-2 3 2 3"/>'),
        fingerprint: I('Fingerprint', 'law', '<path d="M12 18a13 13 0 0 1 24 0M10 26c0-8 6-14 14-14s14 6 14 14v3M16 40c-2-4-2-9-2-13a10 10 0 0 1 20 0v4M22 42c-2-5-3-10-3-15a5 5 0 0 1 10 0c0 5 1 9 3 13"/><path class="as" d="M24 27c0 6 1 11 4 16"/>'),
        evidence: I('Evidence', 'law', '<circle cx="20" cy="20" r="12"/><path d="M29 29l13 13"/><path d="M14 20h12M20 14v12"/><circle class="a" cx="20" cy="20" r="2.4"/>'),
        briefcase: I('Briefcase', 'law', '<rect x="5" y="14" width="38" height="26" rx="3"/><path d="M17 14v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 25h38"/><rect class="a" x="21" y="22" width="6" height="6" rx="1"/>'),
        lawbooks: I('Law library', 'law', '<rect x="6" y="10" width="8" height="32" rx="1"/><rect x="16" y="6" width="8" height="36" rx="1"/><path d="M27 12l7-2 8 30-7 2z"/><path d="M6 16h8M6 36h8M16 12h8M16 36h8"/><path class="as" d="M4 44h40"/>'),
        copyright: I('Copyright / IP', 'law', '<circle cx="24" cy="24" r="17"/><path d="M30 18a8 8 0 1 0 0 12"/><circle class="a" cx="38" cy="10" r="3"/>'),
        privacy: I('Privacy / data', 'law', '<path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z"/><circle cx="24" cy="24" r="6"/><path class="as" d="M8 40 40 8"/>'),
        compliance: I('Compliance', 'law', '<rect x="9" y="6" width="30" height="36" rx="3"/><path d="M17 6v-2h14v2M15 18l3 3 5-6M27 18h8M15 30l3 3 5-6M27 30h8"/><circle class="a" cx="36" cy="38" r="3"/>'),

        /* ---------- Life in Singapore ---------- */
        hawker: I('Hawker food', 'life', '<path d="M6 25h36c0 9.5-8 16-18 16S6 34.5 6 25z"/><path d="M28 21 40 7M32 22 44 10M15 18c-2-3 2-5 0-8M21 18c-2-3 2-5 0-8"/><path class="a" d="M12 25c2-4.5 7-6.5 12-6.5S34 20.5 36 25z"/>'),
        kopi: I('Kopi', 'life', '<path d="M10 18h24v12a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10z"/><path d="M34 21h3a5 5 0 0 1 0 10h-3M6 43h32M18 13c-2-2 2-4 0-7M26 13c-2-2 2-4 0-7"/><path class="as" d="M13 22h18"/>'),
        crab: I('Chilli crab', 'life', '<ellipse class="a" cx="24" cy="28" rx="12" ry="8"/><ellipse cx="24" cy="28" rx="12" ry="8"/><path d="m13 25-6-6 3-6M35 25l6-6-3-6M14 33l-5 4M34 33l5 4M17 35l-3 5M31 35l3 5M21 20v-3M27 20v-3"/>'),
        durian: I('Durian', 'life', '<path d="m24 8 4 5 6-2v6l6 3-4 5 4 5-6 3v6l-6-2-4 5-4-5-6 2v-6l-6-3 4-5-4-5 6-3v-6l6 2z"/><path d="M24 8V3"/><circle class="a" cx="24" cy="25" r="3"/>'),
        bus: I('Bus', 'life', '<rect x="9" y="5" width="30" height="34" rx="4"/><path d="M13 10h22v8H13zM13 23h22v7H13z"/><circle cx="16" cy="41" r="3"/><circle cx="32" cy="41" r="3"/><path class="a" d="M9 32.5h30v2.5H9z"/>'),
        mrt: I('MRT', 'life', '<path d="M12 6h24a4 4 0 0 1 4 4v22a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V10a4 4 0 0 1 4-4z"/><path d="M12 12h24v10H12zM14 38l-4 6M34 38l4 6M12 42h24"/><circle class="a" cx="15" cy="30" r="2.2"/><circle class="a" cx="33" cy="30" r="2.2"/>'),
        hdb: I('HDB flat', 'life', '<path d="M10 42V8h16v34M26 42V18h12v24M5 42h38M14 13h3M20 13h3M14 19h3M20 19h3M14 25h3M14 31h3M20 31h3M14 37h3M20 37h3M30 23h4M30 29h4M30 35h4"/><rect class="a" x="19.5" y="23.5" width="4" height="4"/>'),
        mbs: I('Marina Bay', 'life', '<path d="M11 42V17h6v25M21 42V17h6v25M31 42V17h6v25M4 42h40M6 44h36" /><path class="as" d="M5 14c6-3 32-3 38 0"/>'),
        supertree: I('Gardens by the Bay', 'life', '<path d="M24 42V22M20 42h8M9 9l15 13 15-13M17 9l7 13 7-13"/><path class="as" d="M8 9h32"/>'),
        study: I('Study / NTU life', 'life', '<path d="M4 18 24 9l20 9-20 9z"/><path d="M12 22v9c0 3 6 6 12 6s12-3 12-6v-9M40 20v12"/><circle class="a" cx="40" cy="34" r="2.4"/>'),
        laptop: I('Laptop', 'life', '<rect x="10" y="11" width="28" height="20" rx="1.5"/><path d="M4 36h40l-3 4H7z"/><path class="as" d="M15 18h10M15 23h16"/>'),
        rain: I('Rain', 'life', '<path d="M6 24a18 18 0 0 1 36 0z"/><path d="M24 24v14a4 4 0 0 1-8 0M10 32l-2 4M38 32l-2 4M31 35l-2 4"/><path class="a" d="M24 6a18 18 0 0 1 18 18H30C30 14 27 8 24 6z" opacity=".9"/>'),
        sun: I('Heat', 'life', '<circle class="a" cx="24" cy="24" r="8"/><circle cx="24" cy="24" r="8"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.5 10.5l4 4M33.5 33.5l4 4M37.5 10.5l-4 4M14.5 33.5l-4 4"/>'),
        transit: I('Transit card', 'life', '<rect x="5" y="12" width="30" height="22" rx="3"/><path d="M10 28h10M38 18c3 3 3 9 0 12M42 14.5c5 5 5 14 0 19"/><rect class="a" x="10" y="17" width="7" height="5" rx="1"/>'),
        phone: I('Phone apps', 'life', '<rect x="14" y="5" width="20" height="38" rx="3"/><path d="M21 9h6"/><rect class="a" x="18" y="14" width="5" height="5" rx="1"/><path d="M26 14h4v5h-4zM18 22h5v5h-5zM26 22h4v5h-4z"/>'),
        hive: I('The Hive (NTU)', 'life', '<path d="M20 7h7v35h-7zM23.5 7v35"/><path d="M6 16c0-2 12-2 12 0v5c0 2-12 2-12 0zM6.5 24c0-2 11-2 11 0v5c0 2-11 2-11 0zM7.5 32c0-2 9-2 9 0v5c0 2-9 2-9 0zM29 10c0-5 13-5 13 0v6c0 2-13 2-13 0zM29 20c0-2 13-2 13 0v6c0 2-13 2-13 0zM30 30c0-2 11-2 11 0v6c0 2-11 2-11 0z"/><path class="as" d="M7 13c2-3 4-3 5-1 1-3 4-3 6 0"/>'),
        plane: I('Travel / Changi', 'life', '<path d="M21 6c0-2 6-2 6 0v12l15 8v4l-15-4v9l5 4v3l-8-2-8 2v-3l5-4v-9L6 30v-4l15-8z"/><path class="as" d="M21 18h6"/>'),

        /* ---------- Characters (Alice & Bob convention) ---------- */
        alice: C('Alice', `<path class="ink" d="M30 98V62a30 30 0 0 1 60 0v36H78V66H42v32z"/>${shoulders()}${head}<path class="ink" d="M32 60c4-16 16-24 28-24s24 8 28 24c-10-2-22-8-28-16-6 8-18 14-28 16z"/>${eyes}${smile}<circle class="accent" cx="60" cy="122" r="5"/>`),
        bob: C('Bob', `${shoulders()}${head}<path class="ink" d="M33 58a27 27 0 0 1 54 0c-7-7-15-10-27-10s-20 3-27 10z"/><circle class="line" cx="50" cy="66" r="8"/><circle class="line" cx="70" cy="66" r="8"/><path class="line" d="M58 66h4"/><circle class="ink" cx="50" cy="66" r="2.5"/><circle class="ink" cx="70" cy="66" r="2.5"/>${smile}<path class="accent" d="M50 112h20l-10 12z"/>`),
        eve: C('Eve', `<path class="ink" d="M22 160V100c0-40 17-64 38-64s38 24 38 64v60z"/>${shoulders('body ink-body')}${head}<rect class="ink" x="40" y="60" width="17" height="10" rx="3"/><rect class="ink" x="63" y="60" width="17" height="10" rx="3"/><path class="line" d="M57 64h6M54 80h12"/><path class="accent" d="M48 30a14 14 0 0 1 24 0l-12 6z"/>`),
        trent: C('Trent (bank)', `${shoulders()}${head}<path class="line" d="M33 62c0-12 4-20 9-24M87 62c0-12-4-20-9-24"/>${eyes}${smile}<path class="line" d="M44 110l16 8 16-8"/><path class="accent" d="M60 118l-6 9 6 22 6-22z"/>`),
        mallory: C('Mallory', `${shoulders()}${head}<path class="ink" d="M30 52h60l-6-12H36z"/><path class="ink" d="M44 40l4-12h24l4 12z"/>${eyes}<path class="line" d="M52 80q8-5 16 0M44 58l12 4M76 58l-12 4"/><circle class="accent" cx="60" cy="126" r="5"/>`)
    };
})();
