/* Cantai ao Senhor — interface */
(function () {
  'use strict';
  const C = window.Cantai;
  const CATS = window.CATEGORIAS;

  /* ---------------- utilidades ---------------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const store = {
    get(k, d) { try { const v = localStorage.getItem('cantai:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('cantai:' + k, JSON.stringify(v)); return true; } catch { return false; } }
  };

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('on'), 2400);
  }

  /* ---------------- ícones ---------------- */
  const P = {
    back: '<path d="M15 5l-7 7 7 7"/>',
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    chev: '<path d="m9 5 7 7-7 7"/>',
    star: '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8-4.2-4.1 5.8-.8z"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    music: '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    slides: '<rect x="3" y="4" width="18" height="12" rx="1.8"/><path d="M12 16v4M8 20h8"/><path d="M7.5 8.5h9M7.5 11.5h6"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    share: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12"/>',
    download: '<path d="M12 4v11.5M7.5 11 12 15.5 16.5 11"/><path d="M5 20h14"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
    edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5.5-5.5 4 4 2.5-2.5 4.5 4.5"/>',
    text: '<path d="M5 6h14M5 10h14M5 14h10M5 18h7"/>',
    layers: '<path d="m12 4 9 4.5-9 4.5-9-4.5z"/><path d="m3 13 9 4.5 9-4.5"/>',
    upload: '<path d="M12 16V4.5M7.5 9 12 4.5 16.5 9"/><path d="M5 20h14"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.1"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    paste: '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5V3.5h6v1M9 10h6M9 13.5h6M9 17h4"/>',
    install: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M12 7v7M9 11l3 3 3-3"/>',
    cross: '<path d="M12 3v18M7 8h10"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    folder: '<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>'
  };
  const CAT_P = {
    entrada: '<path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M3 21h18"/><path d="M12 3v5M9.8 5h4.4"/>',
    gota: '<path d="M12 3.5s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 15a2.6 2.6 0 0 0 2.5 2.5"/>',
    gloria: '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/><path d="M9 10l11-2"/>',
    livro: '<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z"/><path d="M12 6.5v13"/>',
    calice: '<path d="M7 3.5h10c0 5-2.2 8-5 8s-5-3-5-8z"/><path d="M12 11.5V18M8 20.5h8M9.5 18h5"/>',
    santo: '<path d="M12 4.5 20 18H4z"/><circle cx="12" cy="13" r="2.4"/>',
    cordeiro: '<path d="M8 3v18"/><path d="M8 4.5h10l-2.5 3.5 2.5 3.5H8"/>',
    hostia: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5v9M7.5 12h9"/>',
    coracao: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    final: '<path d="M13 4h5.5v16H13"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    vela: '<path d="M12 3c1.3 1.6 1.6 2.8 0 4.4-1.6-1.6-1.3-2.8 0-4.4z"/><rect x="9.5" y="9" width="5" height="12" rx="1"/>',
    ostensorio: '<circle cx="12" cy="9" r="3.2"/><path d="M12 2.5v1.8M12 13.7v1.8M5.5 9h1.8M16.7 9h1.8M7.4 4.4l1.3 1.3M15.3 12.3l1.3 1.3M7.4 13.6l1.3-1.3M15.3 5.7l1.3-1.3"/><path d="M12 15.5V20M8.5 21h7"/>',
    chama: '<path d="M12 3c.5 3.5 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2.5 1.5-3.7 2.2-5.6.8 1 1.3 2 1.3 3.4C12 9.5 11 6.5 12 3z"/>',
    coroa: '<path d="M4 18h16M5 18 4 8l4.5 3.5L12 5l3.5 6.5L20 8l-1 10"/>',
    estrela: '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8-4.2-4.1 5.8-.8z"/>',
    nota: '<path d="M10 18V5l9-1.5"/><circle cx="7.5" cy="18" r="2.5"/>',
    maos: '<path d="M11 20.5V12L8.2 8.4a1.4 1.4 0 0 1 2.2-1.7L12 8.6l1.6-1.9a1.4 1.4 0 0 1 2.2 1.7L13 12v8.5"/><path d="M7 20.5h10"/><path d="M12 3v2"/>',
    cruz: '<path d="M12 3v18M7 8h10"/><path d="M5 21h14"/>',
    sol: '<circle cx="12" cy="13" r="4"/><path d="M12 3.5v2.5M5.3 6.3l1.8 1.8M18.7 6.3l-1.8 1.8M3 13h2.5M18.5 13H21"/><path d="M4 20h16"/>'
  };
  const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;
  const catIc = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${CAT_P[n] || CAT_P.nota}</svg>`;
  const CROSS_THUMB = '<svg viewBox="0 0 20 26" aria-hidden="true"><rect x="8.4" y="1" width="3.2" height="24" rx=".6"/><rect x="2.5" y="6.5" width="15" height="3" rx=".6"/></svg>';

  const HERO_SVG = `<svg viewBox="0 0 400 488" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
  <defs>
    <linearGradient id="hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2f63"/><stop offset=".5" stop-color="#0f1d40"/><stop offset="1" stop-color="#0a1428"/></linearGradient>
    <radialGradient id="hg" cx="50%" cy="24%" r="55%"><stop offset="0" stop-color="#f5dca2" stop-opacity=".5"/><stop offset=".3" stop-color="#c99a4f" stop-opacity=".16"/><stop offset="1" stop-color="#c99a4f" stop-opacity="0"/></radialGradient>
    <linearGradient id="hw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5677bd" stop-opacity=".5"/><stop offset=".6" stop-color="#22397a" stop-opacity=".18"/><stop offset="1" stop-color="#1a2c5c" stop-opacity="0"/></linearGradient>
    <linearGradient id="hc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbeac0"/><stop offset=".55" stop-color="#e2bd76"/><stop offset="1" stop-color="#a87a35"/></linearGradient>
    <linearGradient id="hf" x1="0" y1="0" x2="0" y2="1"><stop offset=".42" stop-color="#0a1428" stop-opacity="0"/><stop offset=".78" stop-color="#0a1428" stop-opacity=".88"/><stop offset="1" stop-color="#0a1428"/></linearGradient>
    <filter id="hb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
  </defs>
  <rect width="400" height="488" fill="url(#hs)"/>
  <g fill="none" stroke="#7d98d6" stroke-opacity=".16" stroke-width="1.4">
    <path d="M18 488V200q0-62 50-96 50 34 50 96v288"/><path d="M282 488V200q0-62 50-96 50 34 50 96v288"/>
    <path d="M40 488V214q0-44 28-70 28 26 28 70v274"/><path d="M304 488V214q0-44 28-70 28 26 28 70v274"/>
  </g>
  <path d="M118 488V164Q118 66 200 22q82 44 82 142v324z" fill="url(#hw)"/>
  <g fill="none" stroke="#a9bde8" stroke-opacity=".17" stroke-width="1.2">
    <path d="M118 488V164Q118 66 200 22q82 44 82 142v324"/><path d="M200 22v466M118 236h164M118 330h164"/>
    <circle cx="200" cy="128" r="40"/><circle cx="200" cy="128" r="26"/>
  </g>
  <g fill="#f6dfa8" opacity=".06"><path d="M200 128 112 488h46z"/><path d="M200 128 242 488h46z"/><path d="M200 128 40 488h26z"/><path d="M200 128 334 488h26z"/></g>
  <rect width="400" height="488" fill="url(#hg)"/>
  <g fill="#f3d38f" opacity=".55" filter="url(#hb)"><rect x="193" y="58" width="14" height="156" rx="3"/><rect x="160" y="92" width="80" height="13" rx="3"/></g>
  <g fill="url(#hc)"><rect x="194.5" y="58" width="11" height="156" rx="1.5"/><rect x="161" y="92.5" width="78" height="11" rx="1.5"/></g>
  <rect width="400" height="488" fill="url(#hf)"/>
</svg>`;

  const SONG_ART = `<svg class="art" viewBox="0 0 400 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="as" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#13214a"/><stop offset=".45" stop-color="#3d3561"/><stop offset=".72" stop-color="#bb6a40"/><stop offset=".9" stop-color="#f0b45f"/><stop offset="1" stop-color="#f6cf80"/></linearGradient>
    <radialGradient id="asn" cx="70%" cy="80%" r="45%"><stop offset="0" stop-color="#fff8dc"/><stop offset=".14" stop-color="#ffdc96" stop-opacity=".85"/><stop offset="1" stop-color="#ffb45c" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="400" height="190" fill="url(#as)"/>
  <g fill="#fff3cf" opacity=".08"><path d="M280 152 120 0h26z"/><path d="M280 152 200 0h24z"/><path d="M280 152 290 0h24z"/><path d="M280 152 380 0h26z"/><path d="M280 152 400 60v24z"/><path d="M280 152 0 40v22z"/></g>
  <rect width="400" height="190" fill="url(#asn)"/>
  <path d="M0 164c80-22 168-6 232-10 60-4 110-8 168 6v30H0z" fill="#1a1420"/>
  <path d="M0 178c120-16 236 4 400-6v18H0z" fill="#0d0b14"/>
  <g fill="#110d15"><rect x="277" y="86" width="6" height="70" rx="1"/><rect x="263" y="102" width="34" height="5.5" rx="1"/></g>
</svg>`;

  /* ---------------- dados ---------------- */
  const userSongs = () => store.get('userSongs', []);
  const allSongs = () => [...window.SONGS, ...userSongs()];
  const webSongs = () => store.get('webSongs', {});
  const getSong = id => allSongs().find(s => s.id === id) || webSongs()[id];
  const catOf = id => CATS.find(c => c.id === id) || { id: 'outros', nome: 'Outros Cantos', icon: 'nota' };
  const isUser = s => s && String(s.id).startsWith('u-');
  const isWeb = s => s && String(s.id).startsWith('web-');

  /* ---------------- letras da internet (LRCLIB — lrclib.net) ---------------- */
  const LRCLIB = 'https://lrclib.net/api';
  function saveWebSong(s) {
    const m = webSongs();
    delete m[s.id]; m[s.id] = s;
    const keys = Object.keys(m);
    while (keys.length > 150) delete m[keys.shift()];
    store.set('webSongs', m);
  }
  const tidy = t => String(t || '').replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
  const webToSong = x => ({
    id: 'web-' + x.id, titulo: x.trackName || x.name || 'Sem título', autor: x.artistName || '',
    album: /^(null|undefined|-)?$/i.test(String(x.albumName || '').trim()) ? '' : String(x.albumName).trim(),
    categoria: 'outros', fonte: 'Letra: LRCLIB (lrclib.net)', idioma: 'pt', texto: tidy(x.plainLyrics)
  });
  const webCache = new Map();
  async function webSearch(q) {
    const k = norm(q).trim();
    if (webCache.has(k)) return webCache.get(k);
    const r = await fetch(`${LRCLIB}/search?q=${encodeURIComponent(q)}`);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const seen = new Set(), out = [];
    for (const x of await r.json()) {
      if (x.instrumental || !x.plainLyrics || !x.plainLyrics.trim()) continue;
      const key = norm(x.artistName).replace(/[^a-z0-9]/g, '').slice(0, 10) + '|' +
        norm(x.trackName).replace(/\(.*?\)|\[.*?\]|ao vivo|live|-.*$/g, '').replace(/[^a-z0-9]/g, '');
      if (seen.has(key)) continue;
      seen.add(key); out.push(webToSong(x));
      if (out.length >= 20) break;
    }
    webCache.set(k, out);
    return out;
  }
  async function webGet(id) {
    const r = await fetch(`${LRCLIB}/get/${encodeURIComponent(String(id).replace(/^web-/, ''))}`);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const x = await r.json();
    if (!x.plainLyrics) throw new Error('Letra indisponível');
    return webToSong(x);
  }
  // Sites gratuitos de cifra (o app só abre a busca; a cifra é copiada pelo usuário)
  const cleanArtist = a => String(a || '').replace(/\bPe\.\s*/gi, 'Padre ').replace(/,?\s*S\.?C\.?J\.?$/i, '').replace(/\s*\(.*?\)/g, '').trim();
  const cleanTitle = t => String(t || '').replace(/\s*[([].*?[)\]]/g, '').replace(/\s+-\s+.*$/, '').trim();
  const CHORD_SITES = [
    { id: 'cifraclub', nome: 'Cifra Club', url: s => 'https://www.cifraclub.com.br/?q=' + encodeURIComponent(`${cleanTitle(s.titulo)} ${cleanArtist(s.autor)}`.trim()) },
    { id: 'cifras', nome: 'Cifras.com.br', url: s => 'https://www.cifras.com.br/busca?q=' + encodeURIComponent(cleanTitle(s.titulo)) },
    { id: 'google', nome: 'Google', url: s => 'https://www.google.com/search?q=' + encodeURIComponent(`cifra ${cleanTitle(s.titulo)} ${cleanArtist(s.autor)}`.trim()) }
  ];
  const chordSearchURL = s => CHORD_SITES[0].url(s);
  const songHasChords = s => C.hasChords(s.texto);

  const favs = () => store.get('favs', []);
  const isFav = id => favs().includes(id);
  function toggleFav(id) {
    const f = favs(); const i = f.indexOf(id);
    if (i >= 0) f.splice(i, 1); else f.unshift(id);
    store.set('favs', f); return i < 0;
  }
  const hist = () => store.get('hist', []);
  function pushHist(id) { const h = hist().filter(x => x !== id); h.unshift(id); store.set('hist', h.slice(0, 40)); }

  const rep = () => store.get('rep', []);
  function setRep(r) { store.set('rep', r); updateBadge(); }
  function addToRep(song) {
    const r = rep();
    r.push({ id: song.id, momento: catOf(song.categoria).nome });
    setRep(r);
    toast(`Adicionada ao repertório (${r.length})`);
  }
  function updateBadge() {
    const n = rep().length, b = $('.tab-badge');
    if (!b) return;
    b.hidden = !n; b.textContent = n;
  }

  const settings = () => Object.assign({ fs: 19, modo: null, papel: 'claro' }, store.get('settings', {}));
  const setSettings = patch => store.set('settings', Object.assign(settings(), patch));

  const DEFAULT_OPTS = { estilo: 'fundo', tema: 'noite', simples: 'preto', linhas: 4, titulo: true, repetir: true, maiusc: false, rodape: true, rotulo: true, escurecer: 0.5 };
  const pptOpts = () => Object.assign({}, DEFAULT_OPTS, store.get('pptOpts', {}));
  const setPptOpts = patch => store.set('pptOpts', Object.assign(pptOpts(), patch));

  // imagem de fundo personalizada (fica na sessão; tenta guardar no aparelho)
  let customBg = null;
  function loadCustomBg() {
    if (customBg) return Promise.resolve(customBg);
    const src = store.get('customBg', null);
    if (!src) return Promise.resolve(null);
    return new Promise(res => { const img = new Image(); img.onload = () => { customBg = { img, src }; res(customBg); }; img.onerror = () => res(null); img.src = src; });
  }

  /* ---------------- busca ---------------- */
  function search(q, filtro) {
    const nq = norm(q).trim();
    const words = nq.split(/\s+/).filter(Boolean);
    const res = [];
    for (const s of allSongs()) {
      const chords = songHasChords(s);
      if (filtro === 'cifra' && !chords) continue;
      if (filtro === 'letra' && chords) continue;
      if (filtro === 'latim' && s.idioma !== 'la') continue;
      if (!words.length) { res.push({ s, score: 0 }); continue; }
      const title = norm(s.titulo), body = norm(C.parseSong(s.texto).flatMap(x => x.lines.map(C.stripChords)).join('\n'));
      const meta = norm(`${s.autor || ''} ${catOf(s.categoria).nome}`);
      let score = 0, ok = true;
      for (const w of words) {
        if (title.startsWith(w)) score += 14;
        else if (title.includes(w)) score += 10;
        else if (body.includes(w)) score += 3;
        else if (meta.includes(w)) score += 2;
        else { ok = false; break; }
      }
      if (title.includes(nq)) score += 6;
      if (ok) res.push({ s, score, snip: !title.includes(words[0]) ? snippet(s, words[0]) : '' });
    }
    return res.sort((a, b) => b.score - a.score || a.s.titulo.localeCompare(b.s.titulo, 'pt'));
  }
  function snippet(s, w) {
    for (const sec of C.parseSong(s.texto)) for (const l of sec.lines) {
      const t = C.stripChords(l); const i = norm(t).indexOf(w);
      if (i >= 0) return esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + w.length)) + '</mark>' + esc(t.slice(i + w.length));
    }
    return '';
  }

  /* ---------------- componentes ---------------- */
  function topbar(title, { back = true, right = null } = {}) {
    return `<header class="topbar">
      ${back ? `<button class="ib" data-act="back" aria-label="Voltar">${ic('back')}</button>` : '<span class="ib-sp"></span>'}
      <h1>${esc(title)}</h1>
      ${right != null ? right : `<a class="ib" href="#/" aria-label="Início">${ic('home')}</a>`}
    </header>`;
  }
  const thumbCls = s => isWeb(s) ? 'web' : isUser(s) ? 'user' : s.idioma === 'la' ? 'lat' : '';
  function songRow(s, extra = '', attrs = '') {
    const c = catOf(s.categoria);
    const tags = (songHasChords(s) ? `<span class="badge">CIFRA</span>` : '') + (s.idioma === 'la' ? `<span class="badge">LATIM</span>` : '');
    const sub = isWeb(s) ? esc(s.autor || 'Internet') + (s.album && norm(s.album) !== norm(s.titulo) ? ' · ' + esc(s.album) : '')
      : esc(c.nome) + (s.autor ? ' · ' + esc(s.autor) : '');
    return `<li><a class="row" href="#/musica/${encodeURIComponent(s.id)}" ${attrs}>
      <span class="thumb ${thumbCls(s)}">${CROSS_THUMB}</span>
      <span class="body"><b>${esc(s.titulo)}${tags}</b><span class="sub">${sub}</span>${extra}</span>
      ${ic('chev', 'sm chev')}</a></li>`;
  }
  function emptyState(icon, title, text, action = '') {
    return `<div class="empty">${ic(icon)}<b>${esc(title)}</b><p>${text}</p>${action}</div>`;
  }

  /* ---------------- telas ---------------- */
  const views = {};

  views.inicio = () => {
    const h = hist().map(getSong).filter(Boolean).slice(0, 10);
    const n = rep().length;
    return {
      tab: 'inicio',
      html: `<section class="hero">
        <div class="hero-art">${HERO_SVG}</div>
        <a class="ib hero-gear" href="#/mais" aria-label="Configurações">${ic('gear')}</a>
        <div class="hero-in">
          <h1 class="brand"><span>Cantai ao</span><em>Senhor</em></h1>
          <div class="divider"><svg viewBox="0 0 12 16"><path fill="currentColor" d="M5.2 0h1.6v16H5.2zM1.5 4.2h9v1.5h-9z"/></svg></div>
          <p class="tag">Letras e cifras para a Missa</p>
          <form class="search-pill" role="search" data-search>
            ${ic('search')}
            <input type="search" name="q" placeholder="Buscar qualquer música…" enterkeyhint="search" autocomplete="off" aria-label="Buscar músicas">
            <button class="go" aria-label="Buscar">${ic('chev', 'sm')}</button>
          </form>
        </div>
      </section>
      <section class="tiles">
        <a class="tile" href="#/categorias">${ic('music')}<span><strong>Letras e Cifras</strong><small>${window.SONGS.length + userSongs().length} cantos</small></span></a>
        <a class="tile" href="#/converter">${ic('slides')}<span><strong>Converter para PPT</strong><small>Slides prontos</small></span></a>
        <a class="tile" href="#/repertorio">${ic('list')}<span><strong>Repertório</strong><small>Monte a missa</small></span>${n ? `<span class="count">${n}</span>` : ''}</a>
        <a class="tile" href="#/favoritos">${ic('star')}<span><strong>Favoritas</strong><small>${favs().length || 'Nenhuma'} ${favs().length === 1 ? 'música' : favs().length ? 'músicas' : 'ainda'}</small></span></a>
        <a class="tile wide" href="#/oracoes"><span class="cat-ico">${catIc('calice')}</span><span><strong>Orações Eucarísticas</strong><small>I a V, diversas circunstâncias, com crianças e reconciliação</small></span>${ic('chev', 'sm')}</a>
      </section>
      ${h.length ? `<div class="sec-title">Vistas recentemente <a href="#/historico">Ver tudo</a></div>
      <div class="hscroll">${h.map(s => `<a class="mini" href="#/musica/${encodeURIComponent(s.id)}"><span class="thumb ${thumbCls(s)}" style="width:100%">${CROSS_THUMB}</span><b>${esc(s.titulo)}</b><span>${esc(catOf(s.categoria).nome)}</span></a>`).join('')}</div>` : ''}
      <blockquote class="verse">“Cantarei eternamente as misericórdias do Senhor.”<cite>Sl 89(88),2</cite></blockquote>`
    };
  };

  views.buscar = (_, q) => {
    const termo = q.get('q') || '';
    const filtro = q.get('f') || 'todas';
    const res = search(termo, filtro);
    const webOk = filtro === 'todas' || filtro === 'letra';
    const chips = [['todas', 'Todas'], ['cifra', 'Com cifra'], ['letra', 'Só letra'], ['latim', 'Latim']];
    return {
      tab: '',
      html: `${topbar(termo ? 'Resultados da busca' : 'Buscar')}
      <form class="searchbar" role="search" data-search>
        ${ic('search')}
        <input type="search" name="q" value="${esc(termo)}" placeholder="Título, trecho da letra, autor…" enterkeyhint="search" autocomplete="off" aria-label="Buscar">
        ${termo ? `<button type="button" class="ib" data-act="clear-search" aria-label="Limpar">${ic('x', 'sm')}</button>` : ''}
      </form>
      <div class="chips" role="tablist">${chips.map(([k, l]) => `<button class="chip ${filtro === k ? 'on' : ''}" data-filter="${k}" role="tab" aria-selected="${filtro === k}">${l}</button>`).join('')}</div>
      ${!termo ? `<div class="hint">Digite o nome ou um trecho de <b>qualquer música</b>: buscamos no acervo e na internet.</div>` : ''}
      ${res.length ? `<div class="sec-title">${termo ? 'No acervo' : 'Acervo'} <span>${res.length}</span></div>
        <ul class="list">${res.map(r => songRow(r.s, r.snip ? `<span class="snip">…${r.snip}…</span>` : '')).join('')}</ul>` : ''}
      ${termo && webOk ? `<div class="sec-title">Na internet <span class="src-tag">LRCLIB</span></div><div id="webres"><div class="hint loading"><span class="spin"></span> Buscando letras…</div></div>` : ''}
      ${termo && !webOk && !res.length ? emptyState('search', 'Nada encontrado', 'Tente outra palavra ou cadastre a música você mesmo.', `<a class="btn gold" href="#/nova">${ic('plus')} Adicionar música</a>`) : ''}`,
      after(el) {
        $$('[data-filter]', el).forEach(b => b.onclick = () => go(`#/buscar?q=${encodeURIComponent(termo)}&f=${b.dataset.filter}`, true));
        const clr = $('[data-act="clear-search"]', el);
        if (clr) clr.onclick = () => go(`#/buscar?f=${filtro}`, true);
        if (!termo) setTimeout(() => $('input', el).focus(), 50);
        const box = $('#webres', el);
        if (!box) return;
        webSearch(termo).then(list => {
          if (!box.isConnected) return;
          if (!list.length) {
            box.innerHTML = res.length ? `<div class="hint">Nenhuma letra encontrada na internet para “${esc(termo)}”.</div>`
              : emptyState('search', 'Nada encontrado', 'Confira a grafia, tente o nome do cantor junto (ex.: “segura na mão de Deus marcelo rossi”) ou cadastre a música.', `<a class="btn gold" href="#/nova">${ic('plus')} Adicionar música</a>`);
            return;
          }
          box.innerHTML = `<ul class="list">${list.map((s, i) => songRow(s, '', `data-web="${i}"`)).join('')}</ul>`;
          $$('[data-web]', box).forEach(a => a.addEventListener('click', () => saveWebSong(list[Number(a.dataset.web)])));
        }).catch(() => {
          if (!box.isConnected) return;
          box.innerHTML = `<div class="hint">${navigator.onLine === false ? 'Sem conexão com a internet' : 'Não foi possível buscar na internet agora'} — mostrando só o acervo. <button class="link" data-act="retry">Tentar de novo</button></div>`;
          $('[data-act="retry"]', box).onclick = () => render();
        });
      }
    };
  };

  views.categorias = () => {
    const songs = allSongs();
    return {
      tab: 'categorias',
      html: `${topbar('Categorias', { back: false })}
      <ul class="list">${CATS.map(c => {
        const n = songs.filter(s => s.categoria === c.id).length;
        return `<li><a class="row" href="#/categoria/${c.id}"><span class="cat-ico">${catIc(c.icon)}</span><span class="body"><b>${esc(c.nome)}</b></span><span class="n">${n}</span>${ic('chev', 'sm chev')}</a></li>`;
      }).join('')}</ul>`
    };
  };

  views.categoria = ([id]) => {
    const c = catOf(id);
    const list = allSongs().filter(s => s.categoria === c.id).sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt'));
    return {
      tab: 'categorias',
      html: `${topbar(c.nome)}
      ${list.length ? `<ul class="list">${list.map(s => songRow(s)).join('')}</ul>`
        : emptyState('music', 'Nenhuma música aqui ainda', 'Você pode cadastrar os cantos da sua comunidade.', `<a class="btn gold" href="#/nova?cat=${c.id}">${ic('plus')} Adicionar música</a>`)}`
    };
  };

  function renderLine(l, mode, st, flat) {
    if (mode === 'letra') { const t = C.stripChords(l); return t ? `<div class="ln">${esc(t)}</div>` : ''; }
    const parts = l.split(/\[([^\]]+)\]/);
    if (parts.length === 1) return `<div class="ln">${esc(l)}</div>`;
    let html = esc(parts[0]);
    for (let i = 1; i < parts.length; i += 2) {
      const ch = C.transposeChord(parts[i], st, flat);
      const seg = parts[i + 1] || '';
      const m = seg.match(/^(\S*)([\s\S]*)$/);
      // reserva espaço só quando o texto até o próximo acorde é curto demais para este acorde
      const tight = i + 2 < parts.length ? seg.length < ch.length + 2 : !seg.trim();
      const minW = tight ? ` style="min-width:${(ch.length * 0.55 + 0.45).toFixed(2)}em"` : '';
      html += `<span class="cw"${minW}><b class="ch">${esc(ch)}</b>${m[1] ? esc(m[1]) : '&nbsp;'}</span>${esc(m[2])}`;
    }
    return `<div class="ln hc">${html}</div>`;
  }

  /* ---------- desenhos dos acordes (base aberta Open Guitar Chords) ---------- */
  let SHAPES = null, shapesP = null;
  function loadShapes() {
    if (SHAPES) return Promise.resolve(SHAPES);
    if (!shapesP) shapesP = fetch('vendor/acordes.json').then(r => r.json()).then(d => (SHAPES = d.acordes)).catch(() => { shapesP = null; return null; });
    return shapesP;
  }
  const ENH = { Db: 'C#', 'D#': 'Eb', Gb: 'F#', 'G#': 'Ab', 'A#': 'Bb', Cb: 'B', Fb: 'E', 'E#': 'F', 'B#': 'C' };
  /** Acha o desenho mais próximo: "A7M(9)" → Amaj7, "E7(9)" → E7, "Bb°" → Bbdim, "B/A" → B. */
  function shapeFor(name) {
    if (!SHAPES) return null;
    if (SHAPES[name]) return { sym: name, ...SHAPES[name] };
    const m = String(name).match(/^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/);
    if (!m) return null;
    const root = ENH[m[1]] || m[1];
    const bass = m[3] ? (ENH[m[3]] || m[3]) : '';
    const q = m[2].replace(/[()]/g, '').replace(/[º°]/g, 'dim').replace(/7M|M7/, 'maj7');
    const c = [];
    if (bass) c.push(root + q + '/' + bass);
    if (/^(m7b5|m7-5|ø)/.test(q)) c.push('m7b5', 'dim', 'm');
    else if (/^dim/.test(q)) c.push('dim');
    else if (/^(aug|\+)/.test(q)) c.push('aug', '');
    else if (/^m(?!aj)/.test(q)) {
      if (/^m7/.test(q)) c.push('m7');
      if (/^m6/.test(q)) c.push('m6');
      if (/^m9/.test(q)) c.push('m9', 'm7');
      c.push('m');
    } else {
      if (/^maj7/.test(q)) c.push('maj7');
      if (/^(7sus4|74)/.test(q)) c.push('7sus4', 'sus4', '7');
      if (/^7/.test(q)) c.push('7');
      if (/^6/.test(q)) c.push('6');
      if (/^(sus2|2)/.test(q)) c.push('sus2');
      if (/^(sus|4)/.test(q)) c.push('sus4');
      if (/^(add)?9/.test(q)) c.push('add9');
      if (/^5$/.test(q)) c.push('5');
      c.push('');
    }
    for (const k of c) { const key = k.includes('/') ? k : root + k; if (SHAPES[key]) return { sym: key, ...SHAPES[key] }; }
    return null;
  }
  function chordSVG(sh, big) {
    const x0 = 11, y0 = 16, sx = 9, sy = 11, base = sh.o || 1, rel = f => f - base + 1;
    let g = base === 1 ? `<rect x="${x0}" y="${y0 - 2.5}" width="${sx * 5}" height="2.5" class="nut"/>`
      : `<text x="${x0 - 3}" y="${y0 + sy * 0.72}" class="bf" text-anchor="end">${base}</text>`;
    for (let i = 0; i < 6; i++) g += `<line x1="${x0 + i * sx}" y1="${y0}" x2="${x0 + i * sx}" y2="${y0 + sy * 5}" class="st"/>`;
    for (let j = 1; j <= 5; j++) g += `<line x1="${x0}" y1="${y0 + j * sy}" x2="${x0 + sx * 5}" y2="${y0 + j * sy}" class="fr"/>`;
    for (const [fret, from, to] of sh.b) {
      const y = y0 + (rel(fret) - 0.5) * sy;
      g += `<rect x="${x0 + from * sx - 3.4}" y="${y - 3.4}" width="${(to - from) * sx + 6.8}" height="6.8" rx="3.4" class="dot"/>`;
    }
    sh.f.forEach((f, i) => {
      const x = x0 + i * sx;
      if (f === 'x') g += `<text x="${x}" y="${y0 - 5}" class="mk" text-anchor="middle">×</text>`;
      else if (f === 0) g += `<circle cx="${x}" cy="${y0 - 7}" r="2.4" class="op"/>`;
      else if (!sh.b.some(([bf, fr, to]) => bf === f && i >= fr && i <= to)) {
        const y = y0 + (rel(f) - 0.5) * sy;
        g += `<circle cx="${x}" cy="${y}" r="3.6" class="dot"/>`;
        if (big && sh.d[i]) g += `<text x="${x}" y="${y + 1.9}" class="fg" text-anchor="middle">${sh.d[i]}</text>`;
      }
    });
    return `<svg viewBox="0 0 66 76" class="cd" aria-hidden="true">${g}</svg>`;
  }
  /** Acordes da música, na ordem em que aparecem, já no tom escolhido. */
  function songChords(s, st) {
    const flat = C.useFlats(s.tom || C.firstChord(s.texto), st);
    const seen = new Set(), out = [];
    for (const m of C.normalizeSheet(s.texto).matchAll(/\[([^\]]+)\]/g)) {
      const ch = C.transposeChord(m[1], st, flat);
      if (C.isChordLine(m[1]) && !seen.has(ch)) { seen.add(ch); out.push(ch); }
    }
    return out;
  }
  function fillChordStrip(el, list) {
    loadShapes().then(() => {
      if (!el.isConnected) return;
      el.innerHTML = list.map(ch => {
        const sh = shapeFor(ch);
        return `<button class="cbox" data-ch="${esc(ch)}"><b>${esc(ch)}</b>${sh ? chordSVG(sh) : '<span class="cna">sem desenho</span>'}</button>`;
      }).join('');
      $$('[data-ch]', el).forEach(b => b.onclick = () => showChord(b.dataset.ch));
    });
  }
  function showChord(name) {
    loadShapes().then(() => {
      const sh = shapeFor(name);
      const pop = document.createElement('div');
      pop.className = 'chord-pop';
      pop.innerHTML = `<div class="cp-card" role="dialog" aria-label="Acorde ${esc(name)}">
        <b>${esc(name)}</b>
        ${sh ? `${chordSVG(sh, true)}${sh.sym !== name ? `<small>Desenho de ${esc(sh.sym)} (forma mais próxima)</small>` : ''}` : '<p>Sem desenho para este acorde.</p>'}
        <small class="cp-src">Diagramas: Open Guitar Chords</small>
        <button class="btn small block">Fechar</button></div>`;
      pop.onclick = e => { if (e.target === pop || e.target.closest('button')) pop.remove(); };
      document.body.appendChild(pop);
    });
  }

  function renderSongBody(s, mode, st) {
    const flat = C.useFlats(s.tom || C.firstChord(s.texto), st);
    return C.parseSong(s.texto)
      .filter(sec => mode === 'cifra' || sec.kind !== 'instrumental')
      .map(sec => {
        const lines = sec.lines.map(l => renderLine(l, mode, st, flat)).join('');
        if (!lines) return '';
        return `<section class="sec ${sec.kind}">${sec.label ? `<div class="sec-l">${esc(sec.label)}</div>` : ''}${lines}</section>`;
      }).join('');
  }

  /* ---------- cifra para músicas que ainda não têm ----------
   * Tela limpa, sem sites dentro do app. A cifra é salva uma vez (colada pela
   * pessoa) e a partir daí abre sempre aqui, só letra e acordes. */
  function noChordsPanel(s) {
    const canClip = !!(navigator.clipboard && navigator.clipboard.readText);
    return `<div class="nochords">
      <span class="nc-ico">${ic('music')}</span>
      <b>Esta música ainda não tem cifra no app</b>
      <p class="nc-sub">Salve a cifra uma vez e ela passa a aparecer aqui, só letra e acordes, com troca de tom e sem internet.</p>
      ${canClip ? `<button class="btn gold block" data-act="pastechords">${ic('paste')} Colar cifra copiada</button>` : ''}
      <a class="btn block" href="#/nova?base=${encodeURIComponent(s.id)}">${ic('edit')} ${canClip ? 'Digitar ou colar no editor' : 'Colar a cifra'}</a>
      <a class="nc-link" href="${chordSearchURL(s)}" target="_blank" rel="noopener">Procurar a cifra na internet</a>
    </div>`;
  }

  function replaceRefs(oldId, newId) {
    if (oldId === newId) return;
    setRep(rep().map(r => r.id === oldId ? { ...r, id: newId } : r));
    store.set('favs', favs().map(x => x === oldId ? newId : x));
    store.set('hist', hist().map(x => x === oldId ? newId : x));
  }

  async function pasteChords(s, btn) {
    let txt = '';
    try { txt = await navigator.clipboard.readText(); } catch { /* permissão negada */ }
    if (!txt || !txt.trim()) {
      toast('Não consegui ler o que foi copiado — cole no campo');
      return go('#/nova?base=' + encodeURIComponent(s.id));
    }
    const clean = C.cleanPasted(txt, s);
    if (!C.hasChords(clean.texto)) {
      toast('O texto copiado não tem acordes. Copie a cifra inteira do site.');
      btn && btn.classList.add('shake'); setTimeout(() => btn && btn.classList.remove('shake'), 500);
      return;
    }
    const saved = saveUserSong({ titulo: s.titulo, categoria: s.categoria || 'outros', tom: clean.tom, autor: s.autor || '', texto: clean.texto }, isUser(s) ? s.id : undefined);
    replaceRefs(s.id, saved.id);
    setSettings({ modo: 'cifra' });
    toast('Cifra salva!');
    go('#/musica/' + encodeURIComponent(saved.id), true);
  }

  views.musica = ([id]) => {
    const s = getSong(id);
    if (!s && String(id).startsWith('web-')) {
      return {
        tab: '',
        html: `${topbar('Música')}<div class="empty"><span class="spin" style="display:inline-block;color:var(--gold)"></span><p style="margin-top:14px">Carregando a letra…</p></div>`,
        after(el) {
          webGet(id).then(song => { saveWebSong(song); if (parseHash().args[0] === id) render(); })
            .catch(() => { if (el.isConnected) el.innerHTML = `${topbar('Música')}${emptyState('music', 'Não foi possível carregar a letra', 'Verifique a conexão com a internet e tente de novo.', `<a class="btn" href="#/buscar">Buscar outra música</a>`)}`; $$('[data-act="back"]', el).forEach(b => b.onclick = () => history.back()); });
        }
      };
    }
    if (!s) return { tab: '', html: `${topbar('Música')}${emptyState('music', 'Música não encontrada', 'Ela pode ter sido removida deste aparelho.', `<a class="btn" href="#/">Voltar ao início</a>`)}` };
    pushHist(s.id);
    const chords = songHasChords(s);
    const set = settings();
    let mode = chords ? (set.modo || 'cifra') : 'letra';
    let st = store.get('tr:' + s.id, 0);
    const c = catOf(s.categoria);

    function body() {
      const key = s.tom || C.firstChord(s.texto);
      return `<div class="seg" role="tablist">
          <button data-mode="letra" class="${mode === 'letra' ? 'on' : ''}" role="tab">Letra</button>
          <button data-mode="cifra" class="${mode === 'cifra' ? 'on' : ''}" role="tab">Cifra</button>
        </div>
        ${mode === 'cifra' && !chords ? noChordsPanel(s) : `<div class="tools">
          ${mode === 'cifra' ? `<div class="tool"><button data-tr="-1" aria-label="Baixar meio tom">${ic('minus', 'sm')}</button><span class="lbl">Tom <b>${esc(C.transposeKey(key, st))}</b></span><button data-tr="1" aria-label="Subir meio tom">${ic('plus', 'sm')}</button></div>` : ''}
          <div class="tool"><button data-fs="-1" aria-label="Diminuir letra">A−</button><button data-fs="1" aria-label="Aumentar letra">A+</button></div>
          <span class="sp"></span>
          <div class="tool icon"><button data-act="paper" aria-label="Alternar fundo da leitura">${ic(settings().papel === 'escuro' ? 'sun' : 'moon', 'sm')}</button></div>
          <div class="tool icon"><button data-act="fav" aria-label="Favoritar" aria-pressed="${isFav(s.id)}">${isFav(s.id) ? `<svg class="i sm fill fav-on" viewBox="0 0 24 24">${P.star}</svg>` : ic('star', 'sm')}</button></div>
        </div>
        ${mode === 'cifra' ? `<div class="cstrip-head"><span>Acordes</span><button data-act="diag">${settings().diag === false ? 'Mostrar desenhos' : 'Ocultar desenhos'}</button></div>
          ${settings().diag === false ? '' : '<div class="cstrip" data-cstrip></div>'}` : ''}
        <article class="paper ${mode === 'letra' ? 'lyrics' : ''} ${settings().papel === 'escuro' ? 'dark' : ''}" style="--fs:${settings().fs}px">
          ${renderSongBody(s, mode, st)}
          <div class="src">${s.autor ? esc(s.autor) + ' · ' : ''}${esc(s.fonte || (isUser(s) ? 'Cadastrada por você' : ''))}</div>
        </article>`}`;
    }

    return {
      tab: '',
      html: `<div class="song-hero ${s.idioma === 'la' ? 'lat' : ''}">${SONG_ART}
        <div class="tb"><button class="ib" data-act="back" aria-label="Voltar">${ic('back')}</button><a class="ib" href="#/" aria-label="Início">${ic('home')}</a></div>
        <div class="meta"><h2>${esc(s.titulo)}</h2><span>${isWeb(s) ? esc(s.autor || 'Internet') : esc(c.nome)}${s.idioma === 'la' ? '<span class="dot">•</span>Latim' : ''}</span></div>
      </div>
      <div id="songbody">${body()}</div>
      <div class="actions">
        <a class="btn gold block" href="#/ppt?src=m&id=${encodeURIComponent(s.id)}">${ic('slides')} Converter para PPT</a>
        <div class="row3">
          <button class="btn stack" data-act="show">${ic('expand')}Apresentar</button>
          <button class="btn stack" data-act="rep">${ic('list')}Repertório</button>
          <button class="btn stack" data-act="share">${ic('share')}Compartilhar</button>
        </div>
        ${isUser(s) ? `<div class="row3" style="grid-template-columns:1fr 1fr"><a class="btn small" href="#/editar/${encodeURIComponent(s.id)}">${ic('edit', 'sm')} Editar</a><button class="btn small danger" data-act="del">${ic('trash', 'sm')} Excluir</button></div>`
          : isWeb(s) ? '' : `<a class="btn small" href="#/nova?base=${encodeURIComponent(s.id)}">${ic('edit', 'sm')} Criar uma cópia editável</a>`}
      </div>`,
      after(el) {
        const wrap = $('#songbody', el);
        const bind = () => {
          $$('[data-mode]', wrap).forEach(b => b.onclick = () => { mode = b.dataset.mode; if (chords) setSettings({ modo: mode }); refresh(); });
          $$('[data-tr]', wrap).forEach(b => b.onclick = () => { st = ((st + Number(b.dataset.tr)) % 12 + 12) % 12; if (st > 6) st -= 12; store.set('tr:' + s.id, st); refresh(); });
          $$('[data-fs]', wrap).forEach(b => b.onclick = () => { const fs = Math.min(30, Math.max(14, settings().fs + Number(b.dataset.fs))); setSettings({ fs }); $('.paper', wrap).style.setProperty('--fs', fs + 'px'); });
          const paper = $('[data-act="paper"]', wrap);
          if (paper) paper.onclick = () => { setSettings({ papel: settings().papel === 'escuro' ? 'claro' : 'escuro' }); refresh(); };
          const fav = $('[data-act="fav"]', wrap);
          if (fav) fav.onclick = () => { toast(toggleFav(s.id) ? 'Adicionada às favoritas' : 'Removida das favoritas'); refresh(); };
          const paste = $('[data-act="pastechords"]', wrap);
          if (paste) paste.onclick = () => pasteChords(s, paste);
          const diag = $('[data-act="diag"]', wrap);
          if (diag) diag.onclick = () => { setSettings({ diag: settings().diag === false }); refresh(); };
          // toque num acorde da cifra: mostra o desenho
          $$('.paper .ch', wrap).forEach(ch => ch.onclick = () => showChord(ch.textContent));
          const strip = $('[data-cstrip]', wrap);
          if (strip) fillChordStrip(strip, songChords(s, st));
        };
        const refresh = () => { wrap.innerHTML = body(); bind(); };
        bind();
        $('[data-act="rep"]', el).onclick = () => addToRep(s);
        $('[data-act="show"]', el).onclick = () => openShow([{ song: s }]);
        $('[data-act="share"]', el).onclick = () => shareText(s, mode, st);
        const del = $('[data-act="del"]', el);
        if (del) del.onclick = () => {
          if (!confirm(`Excluir “${s.titulo}” deste aparelho?`)) return;
          store.set('userSongs', userSongs().filter(x => x.id !== s.id));
          store.set('favs', favs().filter(x => x !== s.id));
          setRep(rep().filter(x => x.id !== s.id));
          toast('Música excluída'); go('#/', true);
        };
      }
    };
  };

  async function shareText(s, mode, st) {
    const flat = C.useFlats(s.tom || C.firstChord(s.texto), st);
    const text = C.parseSong(s.texto).map(sec => {
      const lines = sec.lines.map(l => mode === 'cifra' ? l.replace(/\[([^\]]+)\]/g, (_, ch) => `[${C.transposeChord(ch, st, flat)}]`) : C.stripChords(l)).filter(Boolean);
      return (sec.label ? sec.label + ':\n' : '') + lines.join('\n');
    }).join('\n\n');
    const full = `${s.titulo}\n\n${text}\n\n— via Cantai ao Senhor`;
    if (navigator.share) { try { await navigator.share({ title: s.titulo, text: full }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(full); toast('Letra copiada'); } catch { toast('Não foi possível compartilhar'); }
  }

  /* ---------- converter / ppt ---------- */
  views.converter = () => {
    const n = rep().length;
    return {
      tab: '',
      html: `${topbar('Converter para PPT')}
      <div class="pad" style="padding-bottom:0;color:var(--muted)">Gere slides prontos para projetar na missa: uma música, o repertório inteiro ou qualquer letra que você colar.</div>
      <div class="menu">
        <a href="#/buscar">${ic('search')}<span>Escolher uma música<small>Busque no acervo e toque em “Converter para PPT”</small></span>${ic('chev', 'sm')}</a>
        <a href="#/colar">${ic('paste')}<span>Colar uma letra<small>Copie de onde quiser e gere os slides na hora</small></span>${ic('chev', 'sm')}</a>
        <a href="${n ? '#/ppt?src=rep' : '#/repertorio'}">${ic('list')}<span>Repertório da missa<small>${n ? `${n} ${n === 1 ? 'música' : 'músicas'} em um único arquivo` : 'Monte o repertório primeiro'}</small></span>${ic('chev', 'sm')}</a>
      </div>
      <div class="sec-title">${hist().length ? 'Vistas recentemente' : 'Sugestões'}</div>
      <ul class="list">${(hist().length ? hist().map(getSong).filter(Boolean) : window.SONGS).slice(0, 5).map(s => songRow(s)).join('')}</ul>`
    };
  };

  views.colar = () => {
    const d = store.get('draft', { titulo: '', texto: '' });
    return {
      tab: '',
      html: `${topbar('Colar uma letra')}
      <form class="form" id="f">
        <div class="field"><label for="t">Título</label><input id="t" name="titulo" value="${esc(d.titulo)}" placeholder="Ex.: Canto de Entrada" required></div>
        <div class="field"><label for="x">Letra</label><textarea id="x" name="texto" placeholder="Cole aqui a letra (com ou sem cifra)." required>${esc(d.texto)}</textarea>
          <p class="help">Deixe uma linha em branco entre as estrofes — cada estrofe vira um slide. Escreva <code>Refrão:</code> na linha acima do refrão para ele ser repetido automaticamente. Se colar com cifra, os acordes são removidos dos slides.</p></div>
        <button class="btn gold block">${ic('slides')} Gerar slides</button>
        <button type="button" class="btn block" data-act="save">${ic('folder')} Salvar no meu acervo</button>
      </form>`,
      after(el) {
        const f = $('#f', el);
        const read = () => ({ titulo: f.titulo.value.trim() || 'Canto', texto: f.texto.value });
        f.oninput = () => store.set('draft', { titulo: f.titulo.value, texto: f.texto.value });
        f.onsubmit = e => { e.preventDefault(); if (!f.texto.value.trim()) return toast('Cole uma letra primeiro'); store.set('draft', read()); go('#/ppt?src=txt'); };
        $('[data-act="save"]', el).onclick = () => {
          if (!f.texto.value.trim()) return toast('Cole uma letra primeiro');
          const s = saveUserSong({ ...read(), categoria: 'outros' });
          store.set('draft', { titulo: '', texto: '' });
          go('#/musica/' + encodeURIComponent(s.id));
        };
      }
    };
  };

  function deckFromQuery(q) {
    const src = q.get('src');
    if (src === 'rep') {
      const items = rep().map(r => ({ song: getSong(r.id), momento: r.momento })).filter(x => x.song);
      return { deck: items, title: 'Repertório da Missa', back: '#/repertorio' };
    }
    if (src === 'txt') {
      const d = store.get('draft', { titulo: 'Canto', texto: '' });
      return { deck: [{ song: { id: 'draft', titulo: d.titulo || 'Canto', texto: d.texto, autor: '' } }], title: d.titulo || 'Canto' };
    }
    const s = getSong(q.get('id'));
    return { deck: s ? [{ song: s }] : [], title: s ? s.titulo : '' };
  }

  views.ppt = (_, q) => {
    const { deck, title } = deckFromQuery(q);
    if (!deck.length) return { tab: '', html: `${topbar('Converter para PPT')}${emptyState('slides', 'Nada para converter', 'Escolha uma música ou monte o repertório.', `<a class="btn gold" href="#/converter">Começar</a>`)}` };
    let cur = 0;

    const themeOf = o => o.estilo === 'simples' ? o.simples : o.estilo === 'custom' ? 'custom' : o.tema;
    const custom = o => customBg ? { img: customBg.img, src: customBg.src.slice(-64), escurecer: o.escurecer } : { escurecer: o.escurecer };
    const allSlides = o => deck.flatMap(it => C.buildSlides(it.song, o, { momento: it.momento }));

    function slideHTML(sl, o, small) {
      const tid = themeOf(o), t = C.THEMES[tid];
      const bg = t.solid ? `background:${t.solid}` : `background-image:url(${C.backgroundURL(tid, custom(o), small ? 480 : 960)})`;
      if (sl.type === 'title') {
        const size = sl.title.length > 34 ? 44 : 54;
        return `<div class="sl ${t.shadow ? 'shadow' : ''}" style="${bg}"><div class="t" style="width:88%"><div class="tt" style="font-size:${size * 100 / 960}cqw;color:${t.title}">${esc(sl.title)}</div><div class="rule" style="background:${t.accent}"></div>${sl.sub ? `<div class="st" style="color:${t.text}">${esc(sl.sub)}</div>` : ''}</div></div>`;
      }
      const pt = C.fitSize(sl.lines, o.maiusc);
      return `<div class="sl ${t.shadow ? 'shadow' : ''}" style="${bg}">
        ${sl.label ? `<div class="lab" style="color:${t.accent}">${esc(sl.label)}</div>` : ''}
        <div class="t" style="font-size:${(pt * 100 / 960).toFixed(2)}cqw;color:${t.text}">${sl.lines.map(esc).join('\n')}</div>
        ${sl.foot ? `<div class="foot" style="color:${t.accent}">${esc(sl.foot)}</div>` : ''}</div>`;
    }

    function swatch(id, on) {
      const t = C.THEMES[id];
      const bg = t.solid ? `background:${t.solid}` : `background-image:url(${C.backgroundURL(id, custom(pptOpts()), 160)})`;
      return `<button class="sw ${on ? 'on' : ''}" data-theme="${id}"><i style="${bg}"></i>${esc(t.nome)}</button>`;
    }

    function render() {
      const o = pptOpts();
      const slides = allSlides(o);
      if (cur >= slides.length) cur = 0;
      const opt = (k, icon, label, sub) => `<button class="opt ${o.estilo === k ? 'on' : ''}" data-estilo="${k}">${ic(icon)}<span>${label}<small>${sub}</small></span><span class="ck">${o.estilo === k ? ic('check') : ''}</span></button>`;
      const tg = (k, label, sub) => `<label class="tg"><span>${label}${sub ? `<small>${sub}</small>` : ''}</span><span class="switch"><input type="checkbox" data-opt="${k}" ${o[k] ? 'checked' : ''}><span></span></span></label>`;
      return `<div class="stage">${slideHTML(slides[cur], o)}</div>
        <div class="sec-title">${slides.length} slides <button data-act="show">${ic('expand', 'sm')} Apresentar</button></div>
        <div class="thumbs">${slides.map((sl, i) => `<div data-i="${i}" style="position:relative">${slideHTML(sl, o, true).replace('class="sl', `class="sl ${i === cur ? 'cur' : ''}`)}<span class="num">${i + 1}</span></div>`).join('')}</div>
        <div class="sec-title">Opções de exportação</div>
        <div class="opts">
          <h3>Estilo</h3>
          ${opt('fundo', 'layers', 'Slides com fundo', 'Cores do tempo litúrgico')}
          ${o.estilo === 'fundo' ? `<div class="swatches">${['noite', 'comum', 'roxo', 'festa', 'vermelho', 'aurora'].map(id => swatch(id, o.tema === id)).join('')}</div>` : ''}
          ${opt('simples', 'text', 'Slides simples (texto)', 'Ideal para projetores fracos')}
          ${o.estilo === 'simples' ? `<div class="swatches">${['preto', 'branco', 'azul'].map(id => swatch(id, o.simples === id)).join('')}</div>` : ''}
          ${opt('custom', 'image', 'Personalizar fundo', customBg ? 'Imagem escolhida — toque para trocar' : 'Use uma foto da sua igreja')}
          ${o.estilo === 'custom' ? `<label class="tg"><span>Escurecer a imagem<small>Deixa a letra mais legível</small></span></label><input class="range" type="range" min="0" max="0.85" step="0.05" value="${o.escurecer}" data-act="dark">` : ''}
          <input type="file" accept="image/*" hidden data-act="file">
          <div class="toggles">
            <div class="tg"><span>Linhas por slide<small>Menos linhas = letra maior</small></span><span class="stepper"><button data-lin="-1" aria-label="Menos">−</button><b>${o.linhas}</b><button data-lin="1" aria-label="Mais">+</button></span></div>
            ${tg('titulo', 'Slide de título', deck.length > 1 ? 'Um por música, com o momento da missa' : '')}
            ${tg('repetir', 'Repetir o refrão', 'Após cada estrofe, como se canta')}
            ${tg('rotulo', 'Indicar “Refrão”', '')}
            ${tg('rodape', 'Nome da música no rodapé', '')}
            ${tg('maiusc', 'Letras maiúsculas', '')}
          </div>
        </div>
        <div class="export-bar">
          <button class="btn gold" data-act="export">${ic('download')} Exportar PPT</button>
          <button class="btn share" data-act="sharefile" aria-label="Compartilhar arquivo">${ic('share')}</button>
        </div>`;
    }

    return {
      tab: '',
      html: `${topbar(deck.length > 1 ? 'PPT do repertório' : 'Converter para PPT')}<div id="pptbody"></div>`,
      async after(el) {
        await loadCustomBg();
        const box = $('#pptbody', el);
        const refresh = () => { box.innerHTML = render(); bind(); };
        const bind = () => {
          $$('[data-i]', box).forEach(d => d.onclick = () => { cur = Number(d.dataset.i); refresh(); $('.stage', box).scrollIntoView({ behavior: 'smooth', block: 'center' }); });
          $$('[data-estilo]', box).forEach(b => b.onclick = () => {
            if (b.dataset.estilo === 'custom' && (!customBg || pptOpts().estilo === 'custom')) { $('[data-act="file"]', box).click(); return; }
            setPptOpts({ estilo: b.dataset.estilo }); refresh();
          });
          $$('[data-theme]', box).forEach(b => b.onclick = () => { const id = b.dataset.theme; setPptOpts(C.THEMES[id].grupo === 'simples' ? { simples: id } : { tema: id }); refresh(); });
          $$('[data-opt]', box).forEach(i => i.onchange = () => { setPptOpts({ [i.dataset.opt]: i.checked }); refresh(); });
          $$('[data-lin]', box).forEach(b => b.onclick = () => { setPptOpts({ linhas: Math.min(10, Math.max(2, pptOpts().linhas + Number(b.dataset.lin))) }); refresh(); });
          const dark = $('[data-act="dark"]', box);
          if (dark) dark.onchange = () => { setPptOpts({ escurecer: Number(dark.value) }); refresh(); };
          $('[data-act="file"]', box).onchange = e => {
            const file = e.target.files[0]; if (!file) return;
            const img = new Image();
            img.onload = () => {
              const c = document.createElement('canvas'), s = Math.min(1, 1920 / Math.max(img.width, img.height));
              c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
              c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
              const src = c.toDataURL('image/jpeg', 0.85);
              const im2 = new Image();
              im2.onload = () => { customBg = { img: im2, src }; store.set('customBg', src); setPptOpts({ estilo: 'custom' }); refresh(); };
              im2.src = src;
              URL.revokeObjectURL(img.src);
            };
            img.src = URL.createObjectURL(file);
          };
          $('[data-act="show"]', box).onclick = () => openShow(deck, cur);
          $('[data-act="export"]', box).onclick = e => exportPptx(e.currentTarget, false);
          $('[data-act="sharefile"]', box).onclick = e => exportPptx(e.currentTarget, true);
        };
        async function exportPptx(btn, share) {
          const o = pptOpts();
          const old = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spin"></span>' + (share ? '' : ' Gerando…');
          try {
            const { pptx, fileName } = await C.makePptx(deck, Object.assign({}, o, { tema: themeOf(o), custom: custom(o) }), title);
            if (share) {
              const blob = await pptx.write({ outputType: 'blob' });
              const file = new File([blob], fileName, { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try { await navigator.share({ files: [file], title }); } catch (err) { if (err.name !== 'AbortError') throw err; }
              } else {
                await pptx.writeFile({ fileName }); toast('Compartilhamento indisponível — arquivo baixado');
              }
            } else {
              await pptx.writeFile({ fileName });
              toast('PPT gerado: ' + fileName);
            }
          } catch (err) {
            console.error(err); toast(err.message || 'Erro ao gerar o PPT');
          } finally { btn.disabled = false; btn.innerHTML = old; }
        }
        refresh();
        C.loadLib().catch(() => {}); // pré-carrega
      }
    };
  };

  /* ---------- modo apresentação ---------- */
  let wakeLock = null;
  function openShow(deck, start = 0) {
    const o = pptOpts();
    const tid = o.estilo === 'simples' ? o.simples : o.estilo === 'custom' ? 'custom' : o.tema;
    const t = C.THEMES[tid];
    const custom = customBg ? { img: customBg.img, src: customBg.src.slice(-64), escurecer: o.escurecer } : { escurecer: o.escurecer };
    const slides = deck.flatMap(it => C.buildSlides(it.song, o, { momento: it.momento }));
    let i = Math.min(start, slides.length - 1);
    const el = document.createElement('div');
    el.className = 'show';
    const bg = t.solid ? `background:${t.solid}` : `background-image:url(${C.backgroundURL(tid, custom, 1920)})`;
    const draw = () => {
      const sl = slides[i];
      let inner;
      if (sl.type === 'title') {
        const size = sl.title.length > 34 ? 44 : 54;
        inner = `<div class="t" style="width:88%"><div class="tt" style="font-size:${size * 100 / 960}cqw;color:${t.title}">${esc(sl.title)}</div><div class="rule" style="background:${t.accent}"></div>${sl.sub ? `<div class="st" style="color:${t.text}">${esc(sl.sub)}</div>` : ''}</div>`;
      } else {
        inner = `${sl.label ? `<div class="lab" style="color:${t.accent}">${esc(sl.label)}</div>` : ''}<div class="t" style="font-size:${(C.fitSize(sl.lines, o.maiusc) * 100 / 960).toFixed(2)}cqw;color:${t.text}">${sl.lines.map(esc).join('\n')}</div>${sl.foot ? `<div class="foot" style="color:${t.accent}">${esc(sl.foot)}</div>` : ''}`;
      }
      el.innerHTML = `<div class="sl ${t.shadow ? 'shadow' : ''}" style="${bg}">${inner}</div>
        <div class="hud"><button class="ib" data-x aria-label="Fechar">${ic('x')}</button><span>${i + 1} / ${slides.length}</span><span style="width:44px"></span></div>
        <div class="bar" style="width:${((i + 1) / slides.length) * 100}%"></div>`;
      $('[data-x]', el).onclick = e => { e.stopPropagation(); close(); };
    };
    const next = () => { if (i < slides.length - 1) { i++; draw(); } };
    const prev = () => { if (i > 0) { i--; draw(); } };
    let idle;
    const poke = () => { el.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => el.classList.add('idle'), 2500); };
    const onKey = e => {
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
      else if (e.key === 'Escape') close();
    };
    let sx = null;
    el.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); e.preventDefault(); }
    });
    el.addEventListener('click', e => { poke(); if (e.target.closest('.hud')) return; e.clientX > innerWidth / 3 ? next() : prev(); });
    el.addEventListener('mousemove', poke);
    function close() {
      document.removeEventListener('keydown', onKey);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
      el.remove();
    }
    document.addEventListener('keydown', onKey);
    document.body.appendChild(el);
    draw(); poke();
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => { wakeLock = w; }).catch(() => {});
  }

  /* ---------- repertório ---------- */
  views.repertorio = () => {
    const r = rep();
    const items = r.map((it, i) => ({ ...it, i, song: getSong(it.id) })).filter(x => x.song);
    return {
      tab: 'repertorio',
      html: `${topbar('Repertório da Missa', { back: false, right: r.length ? `<button class="ib" data-act="clear" aria-label="Limpar repertório">${ic('trash')}</button>` : '' })}
      ${items.length ? `<div class="pad" style="padding-bottom:4px;color:var(--muted);font-size:13.5px">Na ordem em que serão cantadas. Toque no momento para alterá-lo.</div>
        <div>${items.map((it, k) => `<div class="rep-item">
          <span class="ord">${k + 1}</span>
          <span class="body">
            <select data-mom="${it.i}" aria-label="Momento da missa">${CATS.map(c => `<option ${c.nome === it.momento ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')}</select>
            <a href="#/musica/${encodeURIComponent(it.id)}"><b>${esc(it.song.titulo)}</b></a>
          </span>
          <span class="ctl">
            <button data-mv="${it.i}:-1" aria-label="Subir" ${k === 0 ? 'disabled style="opacity:.3"' : ''}>${ic('up', 'sm')}</button>
            <button data-mv="${it.i}:1" aria-label="Descer" ${k === items.length - 1 ? 'disabled style="opacity:.3"' : ''}>${ic('down', 'sm')}</button>
            <button data-rm="${it.i}" aria-label="Remover">${ic('x', 'sm')}</button>
          </span></div>`).join('')}</div>
        <div class="actions">
          <a class="btn gold block" href="#/ppt?src=rep">${ic('slides')} Gerar PPT da missa</a>
          <div class="row3" style="grid-template-columns:1fr 1fr">
            <button class="btn small" data-act="show">${ic('expand', 'sm')} Apresentar</button>
            <a class="btn small" href="#/categorias">${ic('plus', 'sm')} Adicionar</a>
          </div>
        </div>`
        : emptyState('list', 'Seu repertório está vazio', 'Abra uma música e toque em <b>Repertório</b> para montar a sequência da missa. Depois gere um único PPT com tudo.', `<a class="btn gold" href="#/categorias">${ic('music')} Escolher músicas</a>`)}`,
      after(el) {
        const list = rep();
        $$('[data-mv]', el).forEach(b => b.onclick = () => {
          const [i, d] = b.dataset.mv.split(':').map(Number); const j = i + d;
          if (j < 0 || j >= list.length) return;
          [list[i], list[j]] = [list[j], list[i]]; setRep(list); render();
        });
        $$('[data-rm]', el).forEach(b => b.onclick = () => { list.splice(Number(b.dataset.rm), 1); setRep(list); render(); });
        $$('[data-mom]', el).forEach(s => s.onchange = () => { list[Number(s.dataset.mom)].momento = s.value; setRep(list); });
        const clr = $('[data-act="clear"]', el);
        if (clr) clr.onclick = () => { if (confirm('Limpar todo o repertório?')) { setRep([]); render(); } };
        const sh = $('[data-act="show"]', el);
        if (sh) sh.onclick = () => openShow(list.map(x => ({ song: getSong(x.id), momento: x.momento })).filter(x => x.song));
      }
    };
  };

  /* ---------- Orações Eucarísticas ----------
   * O texto é a tradução oficial do Missal Romano (protegida por direito autoral),
   * por isso não é copiado para o app: a página do site Católico Orante, que
   * permite ser incorporada, é exibida dentro do app, já na oração escolhida. */
  const OE_SITE = 'https://www.catolicoorante.com.br/oeucaristicas.html';
  const ORACOES = [
    { id: 'I', nome: 'Oração Eucarística I', sub: 'Cânon Romano' },
    { id: 'II', nome: 'Oração Eucarística II', sub: 'A mais breve; dias de semana' },
    { id: 'III', nome: 'Oração Eucarística III', sub: 'Domingos e festas' },
    { id: 'IV', nome: 'Oração Eucarística IV', sub: 'Prefácio próprio; história da salvação' },
    { id: 'V', nome: 'Oração Eucarística V', sub: 'Congresso Eucarístico de Manaus' },
    { id: 'DC-I', nome: 'Diversas Circunstâncias I', sub: 'A Igreja a caminho da unidade' },
    { id: 'DC-II', nome: 'Diversas Circunstâncias II', sub: 'Deus conduz a Igreja pelo caminho da salvação' },
    { id: 'DC-III', nome: 'Diversas Circunstâncias III', sub: 'Jesus, caminho para o Pai' },
    { id: 'DC-IV', nome: 'Diversas Circunstâncias IV', sub: 'Jesus que passa fazendo o bem' },
    { id: 'CC-I', nome: 'Com Crianças I', sub: '' },
    { id: 'CC-II', nome: 'Com Crianças II', sub: '' },
    { id: 'CC-III', nome: 'Com Crianças III', sub: '' },
    { id: 'R-I', nome: 'Sobre a Reconciliação I', sub: '' },
    { id: 'R-II', nome: 'Sobre a Reconciliação II', sub: '' }
  ];

  views.oracoes = ([id]) => {
    const oe = ORACOES.find(o => o.id === id);
    if (!oe) {
      return {
        tab: '',
        html: `${topbar('Orações Eucarísticas')}
        <ul class="list">${ORACOES.map(o => `<li><a class="row" href="#/oracoes/${o.id}">
          <span class="cat-ico">${catIc('calice')}</span>
          <span class="body"><b>${esc(o.nome)}</b>${o.sub ? `<span class="sub">${esc(o.sub)}</span>` : ''}</span>${ic('chev', 'sm chev')}</a></li>`).join('')}</ul>
        <p class="about">Texto do Missal Romano, exibido do site <b>Católico Orante</b>. É preciso estar conectado à internet.</p>`
      };
    }
    const i = ORACOES.indexOf(oe), prev = ORACOES[i - 1], next = ORACOES[i + 1];
    return {
      tab: '',
      html: `${topbar(oe.nome)}
      <div class="oe-wrap">
        <iframe class="oe-frame" src="${OE_SITE}#${oe.id}" title="${esc(oe.nome)}"
          sandbox="allow-scripts allow-same-origin allow-popups allow-modals"
          referrerpolicy="strict-origin-when-cross-origin"></iframe>
        <div class="oe-foot">
          ${prev ? `<a class="btn small" href="#/oracoes/${prev.id}">${ic('back', 'sm')} ${esc(prev.id)}</a>` : '<span></span>'}
          <small>Texto: Missal Romano · via Católico Orante</small>
          ${next ? `<a class="btn small" href="#/oracoes/${next.id}">${esc(next.id)} ${ic('chev', 'sm')}</a>` : '<span></span>'}
        </div>
      </div>`
    };
  };

  views.favoritos = () => {
    const list = favs().map(getSong).filter(Boolean);
    return {
      tab: 'favoritos',
      html: `${topbar('Favoritas', { back: false })}
      ${list.length ? `<ul class="list">${list.map(s => songRow(s)).join('')}</ul>`
        : emptyState('star', 'Nenhuma favorita ainda', 'Toque na estrela de uma música para encontrá-la rápido aqui.', `<a class="btn gold" href="#/categorias">${ic('music')} Explorar músicas</a>`)}`
    };
  };

  views.historico = () => {
    const list = hist().map(getSong).filter(Boolean);
    return {
      tab: '',
      html: `${topbar('Histórico', { right: list.length ? `<button class="ib" data-act="clear" aria-label="Limpar histórico">${ic('trash')}</button>` : null })}
      ${list.length ? `<ul class="list">${list.map(s => songRow(s)).join('')}</ul>` : emptyState('clock', 'Histórico vazio', 'As músicas que você abrir aparecem aqui.')}`,
      after(el) { const c = $('[data-act="clear"]', el); if (c) c.onclick = () => { store.set('hist', []); render(); }; }
    };
  };

  views.minhas = () => {
    const list = userSongs();
    return {
      tab: '',
      html: `${topbar('Minhas músicas')}
      ${list.length ? `<ul class="list">${list.map(s => songRow(s)).join('')}</ul>` : emptyState('folder', 'Você ainda não cadastrou músicas', 'Cadastre os cantos da sua comunidade — eles ficam salvos neste aparelho.', `<a class="btn gold" href="#/nova">${ic('plus')} Adicionar música</a>`)}`
    };
  };

  /* ---------- editor ---------- */
  function saveUserSong(data, id) {
    const list = userSongs();
    const song = {
      id: id || 'u-' + Date.now().toString(36),
      titulo: data.titulo.trim() || 'Sem título',
      categoria: data.categoria || 'outros',
      tom: (data.tom || '').trim() || (C.hasChords(data.texto) ? C.firstChord(data.texto) : ''),
      autor: (data.autor || '').trim(),
      fonte: 'Cadastrada por você',
      idioma: 'pt',
      texto: C.normalizeSheet(data.texto).trim()
    };
    const i = list.findIndex(x => x.id === song.id);
    if (i >= 0) list[i] = song; else list.push(song);
    if (!store.set('userSongs', list)) toast('Sem espaço para salvar neste aparelho');
    return song;
  }

  function editorView(existing, q) {
    const base = q && q.get('base') ? getSong(q.get('base')) : null;
    const fromWeb = !existing && isWeb(base);
    const s = existing || (base ? { ...base, titulo: fromWeb ? base.titulo : base.titulo + ' (minha versão)' } : { titulo: '', categoria: (q && q.get('cat')) || 'entrada', tom: '', autor: '', texto: '' });
    return {
      tab: '',
      html: `${topbar(existing ? 'Editar música' : fromWeb ? 'Adicionar cifra' : 'Nova música')}
      ${fromWeb ? `<div class="web-note" style="margin:14px 16px 0">${ic('info', 'sm')}<span>Copie a cifra de um site (<a href="${chordSearchURL(base)}" target="_blank" rel="noopener">procurar cifra</a>), apague a letra abaixo e cole a cifra inteira. Os acordes que ficam na linha de cima são encaixados automaticamente.</span></div>` : ''}
      <form class="form" id="f">
        <div class="field"><label for="t">Título</label><input id="t" name="titulo" value="${esc(s.titulo)}" required></div>
        <div class="two">
          <div class="field"><label for="c">Momento</label><select id="c" name="categoria">${CATS.map(c => `<option value="${c.id}" ${c.id === s.categoria ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')}</select></div>
          <div class="field"><label for="k">Tom</label><input id="k" name="tom" value="${esc(s.tom || '')}" placeholder="Ex.: G" maxlength="5"></div>
        </div>
        <div class="field"><label for="a">Autor / fonte</label><input id="a" name="autor" value="${esc(s.autor || '')}" placeholder="Opcional"></div>
        <div class="field"><label for="x">Letra e cifra</label><textarea id="x" name="texto" required spellcheck="false">${esc(s.texto)}</textarea>
          <p class="help">Pode colar no formato dos sites de cifra (acordes na linha de cima) — o app converte sozinho. Ou escreva os acordes entre colchetes: <code>[G]Senhor, vem sal[D]var-nos</code>.<br>Linha em branco separa estrofes. Para marcar o refrão, escreva <code>Refrão:</code> na linha de cima.</p></div>
        <button class="btn gold block">${ic('check')} Salvar</button>
      </form>`,
      after(el) {
        const f = $('#f', el);
        f.onsubmit = e => {
          e.preventDefault();
          if (!f.texto.value.trim()) return toast('Escreva a letra');
          const clean = C.cleanPasted(f.texto.value, { titulo: f.titulo.value, autor: f.autor.value });
          const saved = saveUserSong({ titulo: f.titulo.value, categoria: f.categoria.value, tom: f.tom.value.trim() || clean.tom, autor: f.autor.value, texto: clean.texto }, existing && existing.id);
          if (fromWeb) replaceRefs(base.id, saved.id); // a versão salva substitui a da internet
          toast(fromWeb ? 'Salva no seu acervo' : 'Música salva');
          go('#/musica/' + encodeURIComponent(saved.id), true);
        };
      }
    };
  }
  views.nova = (_, q) => editorView(null, q);
  views.editar = ([id]) => { const s = getSong(id); return isUser(s) ? editorView(s) : views.musica([id]); };

  /* ---------- mais ---------- */
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
  const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;

  views.mais = () => {
    const n = userSongs().length;
    return {
      tab: 'mais',
      html: `${topbar('Mais', { back: false })}
      <div class="menu">
        <a href="#/nova">${ic('plus')}<span>Adicionar música<small>Cadastre os cantos da sua comunidade</small></span>${ic('chev', 'sm')}</a>
        <a href="#/minhas">${ic('folder')}<span>Minhas músicas<small>${n} ${n === 1 ? 'cadastrada' : 'cadastradas'} neste aparelho</small></span>${ic('chev', 'sm')}</a>
        <a href="#/colar">${ic('paste')}<span>Colar letra e gerar PPT</span>${ic('chev', 'sm')}</a>
        <a href="#/oracoes">${ic('cross')}<span>Orações Eucarísticas</span>${ic('chev', 'sm')}</a>
        <a href="#/historico">${ic('clock')}<span>Histórico</span>${ic('chev', 'sm')}</a>
        <a href="#/buscar">${ic('search')}<span>Buscar</span>${ic('chev', 'sm')}</a>
      </div>
      <div class="sec-title">Backup</div>
      <div class="menu">
        <button data-act="export">${ic('download')}<span>Exportar minhas músicas<small>Arquivo .json para guardar ou enviar a outro aparelho</small></span></button>
        <label>${ic('upload')}<span>Importar músicas<small>De um arquivo exportado pelo app</small></span><input type="file" accept=".json,application/json" hidden data-act="import"></label>
      </div>
      ${isStandalone() ? '' : `<div class="sec-title">Aplicativo</div>
      <div class="menu"><button data-act="install">${ic('install')}<span>Instalar no celular<small>Abre como app e funciona sem internet</small></span></button></div>`}
      <div class="about">
        <p><b>Cantai ao Senhor</b> — letras e cifras para a liturgia, com geração de slides para projeção.</p>
        <p>O acervo próprio inclui textos em domínio público (hinos tradicionais e latinos) e letras originais escritas para o app. A busca na internet usa a base aberta de letras <b>LRCLIB</b> (lrclib.net); as letras pertencem aos seus autores e são exibidas para uso litúrgico da comunidade. Cifras podem ser coladas de sites de cifra e ficam salvas só no seu aparelho.</p>
        <p style="opacity:.7">Versão 1.0</p>
      </div>`,
      after(el) {
        $('[data-act="export"]', el).onclick = () => {
          const list = userSongs();
          if (!list.length) return toast('Você ainda não cadastrou músicas');
          const blob = new Blob([JSON.stringify({ app: 'cantai-ao-senhor', versao: 1, musicas: list }, null, 2)], { type: 'application/json' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'minhas-musicas-cantai.json'; a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        };
        $('[data-act="import"]', el).onchange = async e => {
          const file = e.target.files[0]; if (!file) return;
          try {
            const data = JSON.parse(await file.text());
            const incoming = (Array.isArray(data) ? data : data.musicas || []).filter(s => s && s.titulo && s.texto);
            const list = userSongs(); let add = 0;
            for (const s of incoming) {
              const id = String(s.id || '').startsWith('u-') ? s.id : 'u-' + Date.now().toString(36) + add;
              const clean = { id, titulo: String(s.titulo), categoria: CATS.some(c => c.id === s.categoria) ? s.categoria : 'outros', tom: String(s.tom || ''), autor: String(s.autor || ''), fonte: 'Cadastrada por você', idioma: s.idioma === 'la' ? 'la' : 'pt', texto: String(s.texto) };
              const i = list.findIndex(x => x.id === id);
              if (i >= 0) list[i] = clean; else list.push(clean);
              add++;
            }
            store.set('userSongs', list); toast(`${add} ${add === 1 ? 'música importada' : 'músicas importadas'}`); render();
          } catch { toast('Arquivo inválido'); }
        };
        const inst = $('[data-act="install"]', el);
        if (inst) inst.onclick = async () => {
          if (installEvt) { installEvt.prompt(); await installEvt.userChoice; installEvt = null; return; }
          const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
          alert(ios ? 'No iPhone: toque em Compartilhar (□↑) no Safari e depois em “Adicionar à Tela de Início”.'
            : 'No Android: abra o menu ⋮ do Chrome e toque em “Instalar app” ou “Adicionar à tela inicial”.');
        };
      }
    };
  };

  /* ---------------- roteador ---------------- */
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    return { name: parts[0] || 'inicio', args: parts.slice(1), q: new URLSearchParams(qs || '') };
  }
  function go(hash, replace) {
    if (replace) { history.replaceState(null, '', hash); render(); }
    else location.hash = hash;
  }

  let lastName = '';
  function render() {
    const { name, args, q } = parseHash();
    const fn = views[name] || views.inicio;
    const v = fn(args, q);
    const el = $('#view');
    el.innerHTML = v.html;
    el.classList.remove('view-in'); void el.offsetWidth; el.classList.add('view-in');
    $$('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === v.tab));
    $$('[data-act="back"]', el).forEach(b => b.onclick = () => (history.length > 1 ? history.back() : go('#/')));
    $$('form[data-search]', el).forEach(f => f.onsubmit = e => {
      e.preventDefault();
      const term = f.q.value.trim();
      const cur = parseHash();
      const filtro = cur.name === 'buscar' ? (cur.q.get('f') || 'todas') : 'todas';
      go(`#/buscar?q=${encodeURIComponent(term)}&f=${filtro}`, cur.name === 'buscar');
      f.q.blur();
    });
    if (name !== lastName) window.scrollTo(0, 0);
    lastName = name;
    if (v.after) v.after(el);
    updateBadge();
    document.title = name === 'inicio' ? 'Cantai ao Senhor' : `${($('h1', el) || $('h2', el) || {}).textContent || ''} · Cantai ao Senhor`;
  }

  window.addEventListener('hashchange', render);
  render();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    // versão nova instalada: recarrega uma vez para usá-la
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !reloaded && !document.querySelector('.show')) { reloaded = true; location.reload(); }
    });
  }
})();
