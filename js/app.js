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
    book: '<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5v13"/>',
    folder: '<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
    redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',
    alleft: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
    alcenter: '<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>',
    alright: '<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>',
    aljustify: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>',
    vatop: '<path d="M5 4h14"/><path d="M12 8v12M8 12l4-4 4 4"/>',
    vamiddle: '<path d="M5 12h14"/><path d="M12 3v5M9.5 5.5 12 8l2.5-2.5M12 21v-5M9.5 18.5 12 16l2.5 2.5"/>',
    vabottom: '<path d="M5 20h14"/><path d="M12 4v12M8 12l4 4 4-4"/>'
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
  // vídeo da música: abre a busca do YouTube (sem chave de API, sem rastreio no app)
  // no acervo o "autor" é descrição (Acervo, Hino tradicional…), então só entra o nome de artista real
  const videoURL = s => {
    const artista = (isWeb(s) || isUser(s)) && !/acervo|tradicional|missal/i.test(s.autor || '') ? cleanArtist(s.autor) : '';
    const extra = s.idioma === 'la' ? 'canto gregoriano' : artista ? '' : 'música católica';
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent([cleanTitle(s.titulo), artista, extra].filter(Boolean).join(' '));
  };
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
  // linha da busca: toque no nome abre normal; botões abrem direto em Letra ou Cifra
  function searchRow(s, extra = '', attrs = '') {
    const c = catOf(s.categoria);
    const href = '#/musica/' + encodeURIComponent(s.id);
    const tags = (songHasChords(s) ? `<span class="badge">CIFRA</span>` : '') + (s.idioma === 'la' ? `<span class="badge">LATIM</span>` : '');
    const sub = isWeb(s) ? esc(s.autor || 'Internet') + (s.album && norm(s.album) !== norm(s.titulo) ? ' · ' + esc(s.album) : '')
      : esc(c.nome) + (s.autor ? ' · ' + esc(s.autor) : '');
    return `<li class="srow"><a class="row" href="${href}" ${attrs}>
      <span class="thumb ${thumbCls(s)}">${CROSS_THUMB}</span>
      <span class="body"><b>${esc(s.titulo)}${tags}</b><span class="sub">${sub}</span>${extra}</span></a>
      <span class="lc">
        <a class="lc-b" href="${href}?modo=letra" ${attrs} aria-label="Abrir a letra de ${esc(s.titulo)}">Letra</a>
        <a class="lc-b ${songHasChords(s) ? 'has' : ''}" href="${href}?modo=cifra" ${attrs} aria-label="Abrir a cifra de ${esc(s.titulo)}">Cifra</a>
        <a class="lc-b vid" href="${videoURL(s)}" target="_blank" rel="noopener" aria-label="Ver vídeo de ${esc(s.titulo)} no YouTube">${ic('play', 'sm')}</a>
      </span></li>`;
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
        <div class="hero-art photo" role="img" aria-label="Interior da Catedral Nossa Senhora dos Prazeres"></div>
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
        <a class="tile wide" href="#/ppts"><span class="cat-ico">${catIc('nota')}</span><span><strong>Meus PPTs</strong><small>Guarde os PPTs prontos e use quando quiser</small></span>${ic('chev', 'sm')}</a>
        <a class="tile wide" href="#/liturgia"><span class="cat-ico">${ic('book')}</span><span><strong>Liturgia do dia</strong><small>Leituras, salmo e evangelho de hoje</small></span>${ic('chev', 'sm')}</a>
        <a class="tile wide" href="#/oracoes"><span class="cat-ico">${catIc('calice')}</span><span><strong>Orações Eucarísticas</strong><small>Guarde as 14 no app e leia sem internet</small></span>${ic('chev', 'sm')}</a>
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
        <ul class="list">${res.map(r => searchRow(r.s, r.snip ? `<span class="snip">…${r.snip}…</span>` : '')).join('')}</ul>` : ''}
      ${termo ? '<div id="pptres"></div>' : ''}
      ${termo && webOk ? `<div class="sec-title">Na internet <span class="src-tag">LRCLIB</span></div><div id="webres"><div class="hint loading"><span class="spin"></span> Buscando letras…</div></div>` : ''}
      ${termo && !webOk && !res.length ? emptyState('search', 'Nada encontrado', 'Tente outra palavra ou cadastre a música você mesmo.', `<a class="btn gold" href="#/nova">${ic('plus')} Adicionar música</a>`) : ''}`,
      after(el) {
        $$('[data-filter]', el).forEach(b => b.onclick = () => go(`#/buscar?q=${encodeURIComponent(termo)}&f=${b.dataset.filter}`, true));
        const clr = $('[data-act="clear-search"]', el);
        if (clr) clr.onclick = () => go(`#/buscar?f=${filtro}`, true);
        if (!termo) setTimeout(() => $('input', el).focus(), 50);
        // resultados da biblioteca de PPTs do aparelho
        const pbox = $('#pptres', el);
        if (pbox && window.PptLib) PptLib.search(termo).then(items => {
          if (items.length && pbox.isConnected) pbox.innerHTML = `<div class="sec-title">Nos seus PPTs <span>${items.length}</span></div><ul class="list">${items.slice(0, 10).map(pptRow).join('')}</ul>`;
        }).catch(() => {});
        const box = $('#webres', el);
        if (!box) return;
        webSearch(termo).then(list => {
          if (!box.isConnected) return;
          if (!list.length) {
            box.innerHTML = res.length ? `<div class="hint">Nenhuma letra encontrada na internet para “${esc(termo)}”.</div>`
              : emptyState('search', 'Nada encontrado', 'Confira a grafia, tente o nome do cantor junto (ex.: “segura na mão de Deus marcelo rossi”) ou cadastre a música.', `<a class="btn gold" href="#/nova">${ic('plus')} Adicionar música</a>`);
            return;
          }
          box.innerHTML = `<ul class="list">${list.map((s, i) => searchRow(s, '', `data-web="${i}"`)).join('')}</ul>`;
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
    const ia = !!iaKey();
    return `<div class="nochords">
      <span class="nc-ico">${ic('music')}</span>
      <b>Esta música ainda não tem cifra no app</b>
      <p class="nc-sub">${ia ? 'A IA monta a cifra a partir da letra. Depois ela fica salva aqui, com troca de tom e sem internet.' : 'Ative a IA grátis (Gemini) e a cifra aparece aqui sozinha ao abrir esta aba.'}</p>
      ${ia ? `<button class="btn gold block" data-act="iagen">${ic('music')} Gerar cifra com IA</button>`
        : `<a class="btn gold block" href="#/ia">${ic('music')} Ativar cifras com IA (grátis)</a>`}
      ${canClip ? `<button class="btn block" data-act="pastechords">${ic('paste')} Colar cifra copiada</button>` : ''}
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

  /* ---------- Cifra com IA (Gemini, chave gratuita da própria pessoa) ----------
   * A letra vai para o Gemini; ele devolve SÓ os acordes e em qual palavra de
   * cada linha eles entram. O app encaixa na letra e salva no aparelho, marcada
   * como "sugerida por IA". A chave fica só neste aparelho. */
  const GEM = 'https://generativelanguage.googleapis.com/v1beta';
  const iaKey = () => store.get('geminiKey', '');
  const iaTried = new Set();

  async function gemError(r) {
    let msg = '';
    try { const d = await r.json(); msg = (d.error && d.error.message) || ''; } catch { /* sem corpo */ }
    if (r.status === 400 && /api key/i.test(msg)) return new Error('Chave do Gemini inválida. Confira em Mais › Cifras com IA.');
    if (r.status === 401 || r.status === 403) return new Error('A chave do Gemini não tem permissão. Crie uma nova no Google AI Studio.');
    if (r.status === 429) return Object.assign(new Error('Limite grátis do Gemini atingido. Tente de novo em alguns minutos.'), { quota: true, msg });
    if (r.status === 404) return Object.assign(new Error('Modelo indisponível'), { notFound: true });
    if (r.status === 400 && /thinking/i.test(msg)) return Object.assign(new Error('Ajuste de raciocínio não aceito'), { thinking: true });
    if (r.status >= 500) return Object.assign(new Error('O Gemini está sobrecarregado agora. Tente de novo em instantes.'), { busy: true });
    return new Error('Gemini respondeu com erro ' + r.status + (msg ? ': ' + msg.slice(0, 120) : ''));
  }

  /**
   * Modelos disponíveis para a chave, na ordem de uso. Os "flash-lite" vêm
   * primeiro: respondem em segundos. Os "flash" maiores ficam de reserva
   * (pensam muito e chegam a levar 1–2 min).
   */
  const MODELS_KEY = 'geminiModels2';
  async function gemModels(key, force) {
    const cached = store.get(MODELS_KEY, null);
    if (cached && cached.length && !force) return cached;
    const r = await fetch(`${GEM}/models?pageSize=200`, { headers: { 'x-goog-api-key': key } });
    if (!r.ok) throw await gemError(r);
    const d = await r.json();
    const names = (d.models || [])
      .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map(m => m.name.replace(/^models\//, ''))
      .filter(n => /^gemini-.*flash/.test(n) && !/(image|tts|audio|live|embed|vision|exp|8b|computer)/.test(n));
    const score = n => {
      const v = parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
      return (/lite/.test(n) ? 1000 : 0) + v * 10 - (/preview/.test(n) ? 1.5 : 0) + (/latest/.test(n) ? 0.5 : 0);
    };
    names.sort((a, b) => score(b) - score(a));
    const list = names.length ? names.slice(0, 6) : ['gemini-flash-lite-latest', 'gemini-flash-latest'];
    store.set(MODELS_KEY, list);
    return list;
  }

  const IA_SYS = `Você é um violonista experiente de música católica e cristã brasileira.
Sua tarefa: dar a cifra (acordes para violão) de uma música a partir da letra fornecida.
Regras:
1. Acordes em letras (C D E F G A B), com m, 7, 7M, 9, sus4, °, /baixo. Ex.: G, Em, D/F#, A7M, Bb, C#m7. Nunca use Dó, Ré, Mi.
2. Para cada linha numerada que leva acorde, informe os acordes e em qual palavra cada um começa (palavra 1 = primeira palavra da linha).
3. NÃO escreva a letra na resposta; só os números das linhas e os acordes.
4. Se você conhece a música, siga a harmonia mais tocada, no tom mais comum para violão. Se não conhece, crie uma harmonização simples, coerente e cantável e marque conhecida=false.
5. Linhas que se repetem (refrão) levam os mesmos acordes.`;

  const IA_SCHEMA = {
    type: 'OBJECT',
    properties: {
      tom: { type: 'STRING' },
      conhecida: { type: 'BOOLEAN' },
      linhas: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            n: { type: 'INTEGER' },
            acordes: {
              type: 'ARRAY',
              items: { type: 'OBJECT', properties: { acorde: { type: 'STRING' }, palavra: { type: 'INTEGER' } }, required: ['acorde', 'palavra'] }
            }
          },
          required: ['n', 'acordes']
        }
      }
    },
    required: ['tom', 'linhas']
  };

  /** Linhas da letra (sem acordes), mantendo nomes de parte e linhas em branco. */
  function lyricLines(s) {
    return C.normalizeSheet(s.texto).split('\n').map(l => C.isLabelLine(l) ? l.trim() : C.stripChords(l));
  }

  async function geminiChords(s, onStatus = () => {}) {
    const key = iaKey();
    if (!key) throw new Error('Configure a IA primeiro.');
    const lines = lyricLines(s);
    let n = 0;
    const numbered = lines.map(l => (!l.trim() || C.isLabelLine(l)) ? null : `${++n}: ${l}`).filter(Boolean).join('\n');
    if (!n) throw new Error('Esta música não tem letra para cifrar.');
    const body = {
      systemInstruction: { parts: [{ text: IA_SYS }] },
      contents: [{ role: 'user', parts: [{ text: `Música: "${s.titulo}"${s.autor ? ' — ' + s.autor : ''}\nLetra (linhas numeradas):\n${numbered}` }] }],
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json', responseSchema: IA_SCHEMA }
    };
    const models = await gemModels(key);
    let lastErr = null;
    for (let i = 0; i < models.length && i < 4; i++) {
      const model = models[i], lite = /lite/.test(model);
      if (i > 0) onStatus('Tentando outro modelo da IA…');
      // modelos maiores: pede pouco raciocínio (senão levam 1–2 min)
      let cfg = lite ? body.generationConfig : { ...body.generationConfig, thinkingConfig: { thinkingLevel: 'low' } };
      let r;
      for (let tentativa = 0; tentativa < 2; tentativa++) {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), lite ? 30000 : 75000);
        try {
          r = await fetch(`${GEM}/models/${encodeURIComponent(model)}:generateContent`, {
            method: 'POST', signal: ctl.signal,
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: JSON.stringify({ ...body, generationConfig: cfg })
          });
        } catch (e) {
          r = null;
          lastErr = new Error(e.name === 'AbortError' ? 'A IA demorou demais para responder. Tente de novo.' : 'Sem conexão com a IA. Verifique a internet.');
        } finally { clearTimeout(timer); }
        if (r && !r.ok) {
          lastErr = await gemError(r);
          if (lastErr.thinking && cfg.thinkingConfig) { cfg = body.generationConfig; continue; } // repete sem o ajuste
        }
        break;
      }
      if (!r) continue;                                    // tempo esgotado ou sem rede: próximo modelo
      if (!r.ok) {
        // sobrecarregado, inexistente ou sem cota grátis ("limit: 0"): tenta o próximo
        if (lastErr.busy || lastErr.notFound || lastErr.thinking || (lastErr.quota && /limit:\s*0/i.test(lastErr.msg || ''))) continue;
        throw lastErr;
      }
      const d = await r.json();
      const cand = (d.candidates || [])[0];
      const text = cand && cand.content && (cand.content.parts || []).map(p => p.text || '').join('');
      if (!text) throw new Error(cand && cand.finishReason === 'RECITATION'
        ? 'O Gemini não quis gerar a cifra desta música. Tente "Gerar de novo" ou cole a cifra.'
        : 'O Gemini não devolveu a cifra. Tente de novo.');
      let res;
      try { res = JSON.parse(text); } catch { throw new Error('Resposta da IA em formato inesperado. Tente de novo.'); }
      if (i > 0) store.set(MODELS_KEY, [model, ...models.filter(m => m !== model)]);
      return { ...res, model, texto: applyChords(lines, res.linhas || []) };
    }
    throw lastErr || new Error('Nenhum modelo gratuito do Gemini disponível para esta chave.');
  }

  /** Encaixa os acordes (linha n, palavra k) na letra. */
  function applyChords(lines, linhas) {
    const map = new Map();
    for (const l of linhas) map.set(l.n | 0, (l.acordes || []).filter(a => a && C.isChordLine(String(a.acorde || '').trim())));
    let n = 0;
    return lines.map(line => {
      if (!line.trim() || C.isLabelLine(line)) return line;
      n++;
      const acs = (map.get(n) || []).slice().sort((a, b) => (a.palavra | 0) - (b.palavra | 0));
      if (!acs.length) return line;
      const starts = [...line.matchAll(/\S+/g)].map(m => m.index);
      let out = line;
      for (const a of acs.reverse()) {
        const k = Math.min(Math.max(1, a.palavra | 0), starts.length);
        out = out.slice(0, starts[k - 1]) + `[${String(a.acorde).trim()}]` + out.slice(starts[k - 1]);
      }
      return out;
    }).join('\n');
  }

  async function runIA(s, btn, overwriteId) {
    const old = btn ? btn.innerHTML : '';
    const show = t => { if (btn && btn.isConnected) btn.innerHTML = `<span class="spin"></span> ${t}`; };
    if (btn) btn.disabled = true;
    show('Gerando a cifra com IA…');
    const slow = setTimeout(() => show('A IA está demorando, aguarde…'), 12000);
    try {
      const res = await geminiChords(s, show);
      if (!C.hasChords(res.texto)) throw new Error('A IA não devolveu acordes. Tente de novo.');
      const tom = /^[A-G][#b]?m?$/.test(String(res.tom || '').trim()) ? res.tom.trim() : '';
      const saved = saveUserSong({
        titulo: s.titulo, categoria: s.categoria || 'outros', tom, autor: s.autor || '', texto: res.texto, ia: true,
        fonte: `Cifra sugerida por IA (${res.model})${res.conhecida === false ? ' · harmonização criada' : ''} — confira antes de tocar`
      }, overwriteId || (isUser(s) ? s.id : undefined));
      replaceRefs(s.id, saved.id);
      store.set('tr:' + saved.id, 0);
      setSettings({ modo: 'cifra' });
      toast(res.conhecida === false ? 'Cifra criada pela IA (música pouco conhecida)' : 'Cifra pronta!');
      go('#/musica/' + encodeURIComponent(saved.id), true);
    } catch (e) {
      console.error(e);
      toast(e.message || 'Erro ao gerar a cifra');
      if (btn && btn.isConnected) { btn.disabled = false; btn.innerHTML = old; }
    } finally {
      clearTimeout(slow);
    }
  }

  views.musica = ([id], q) => {
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
    const pedido = q && q.get('modo');
    let mode = pedido === 'letra' || pedido === 'cifra' ? pedido : chords ? (set.modo || 'cifra') : 'letra';
    if (pedido && chords) setSettings({ modo: mode });
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
        ${mode === 'cifra' && s.ia ? `<div class="ia-note">${ic('info', 'sm')}<span>Cifra sugerida por IA: pode ter acordes errados.
          <button data-act="iaregen">Gerar de novo</button> · <a href="#/editar/${encodeURIComponent(s.id)}">Corrigir</a></span></div>` : ''}
        ${mode === 'cifra' ? `<div class="cstrip-head"><span>Acordes</span><button data-act="diag">${settings().diag === false ? 'Mostrar desenhos' : 'Ocultar desenhos'}</button></div>
          ${settings().diag === false ? '' : '<div class="cstrip" data-cstrip></div>'}` : ''}
        <article class="paper ${mode === 'letra' ? 'lyrics' : ''} ${settings().papel === 'escuro' ? 'dark' : ''}" style="--fs:${settings().fs}px">
          ${renderSongBody(s, mode, st)}
          <div class="src">${s.autor ? esc(s.autor) + ' · ' : ''}${esc(s.fonte || (isUser(s) ? 'Cadastrada por você' : ''))}</div>
        </article>`}`;
    }

    return {
      tab: '',
      html: `<div class="song-hero photo ${s.idioma === 'la' ? 'lat' : ''}"><div class="art-photo" aria-hidden="true"></div>
        <div class="tb"><button class="ib" data-act="back" aria-label="Voltar">${ic('back')}</button><a class="ib" href="#/" aria-label="Início">${ic('home')}</a></div>
        <div class="meta"><h2>${esc(s.titulo)}</h2><span>${isWeb(s) ? esc(s.autor || 'Internet') : esc(c.nome)}${s.idioma === 'la' ? '<span class="dot">•</span>Latim' : ''}</span></div>
      </div>
      <div id="songbody">${body()}</div>
      <div class="actions">
        <a class="video-card" href="${videoURL(s)}" target="_blank" rel="noopener"><span class="vc-ico">${ic('play')}</span><span><b>Ouvir a música</b><small>Vídeos de “${esc(cleanTitle(s.titulo))}” no YouTube</small></span>${ic('chev', 'sm')}</a>
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
          // IA: gera sozinha ao abrir a aba Cifra (uma vez por música), ou pelo botão
          const iagen = $('[data-act="iagen"]', wrap);
          if (iagen) {
            iagen.onclick = () => runIA(s, iagen);
            if (settings().iaAuto !== false && !iaTried.has(s.id)) { iaTried.add(s.id); runIA(s, iagen); }
          }
          const iaregen = $('[data-act="iaregen"]', wrap);
          if (iaregen) iaregen.onclick = () => runIA(s, iaregen, s.id);
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
        <a href="#/ppts">${ic('folder')}<span>Meus PPTs prontos<small>Guarde e reutilize apresentações que você já tem</small></span>${ic('chev', 'sm')}</a>
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
   * por isso NÃO vai no código. A pessoa copia cada oração (ex.: do site Católico
   * Orante) e toca em "Colar": o app reconhece qual é, limpa e guarda no aparelho.
   * Depois ela abre aqui, limpa e sem internet. */
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

  const oeText = id => store.get('oe:' + id, '');
  const oeCount = () => ORACOES.filter(o => oeText(o.id)).length;

  /** Descobre qual oração é pelo título que vem no texto copiado. */
  function detectOE(txt) {
    const head = norm(txt.slice(0, 600)).replace(/\s+/g, ' ');
    const rom = '(iv|iii|ii|v|i)\\b';
    let m;
    if ((m = head.match(new RegExp('diversas circunst\\w* ' + rom)))) return 'DC-' + m[1].toUpperCase();
    if ((m = head.match(new RegExp('criancas ' + rom)))) return 'CC-' + m[1].toUpperCase();
    if ((m = head.match(new RegExp('reconcilia\\w* ' + rom)))) return 'R-' + m[1].toUpperCase();
    if ((m = head.match(new RegExp('eucaristica ' + rom)))) return m[1].toUpperCase();
    return null;
  }
  /** Tira do texto copiado os botões e menus do site e o título repetido. */
  function cleanOE(txt) {
    const junk = /^(voltar|prefer[eê]ncias|fechar|menu|zoom|aumentar|diminuir|tema|leitura|normal|topo|compartilhar|imprimir|\s)+$/i;
    const lines = String(txt).replace(/\r\n?/g, '\n').replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').split('\n')
      .map(l => l.replace(/\s+$/, ''));
    const out = [];
    let started = false;
    for (const l of lines) {
      const t = l.trim();
      if (junk.test(t) || /prefer[eê]ncias\s*fechar/i.test(t)) continue;
      // título/subtítulo repetidos no começo (ex.: "DIVERSAS CIRCUNSTÂNCIAS I", "MISSAS COM CRIANÇAS III")
      if (!started && (!t || /^ora[cç][aã]o( eucar[ií]stica.*)?$/i.test(t) || /^eucar[ií]stica\b/i.test(t) || /^(para|com|sobre)\b.{0,40}$/i.test(t)
        || (t.length < 60 && t === t.toLocaleUpperCase('pt-BR') && /[A-ZÀ-Ý]/.test(t) && !/^(V|R|T|CP|CC)[.:\s]/.test(t)))) continue;
      started = true;
      out.push(t);
    }
    // links de navegação do site no fim (ex.: "Rito da Comunhão")
    while (out.length && (!out[out.length - 1] || /^(rito da comunh[aã]o|ritos? finais|pr[oó]xim[oa]|anterior)$/i.test(out[out.length - 1]))) out.pop();
    return joinStanzas(out.join('\n'));
  }
  /** Sites que põem cada linha num parágrafo: 1 linha em branco = quebra de linha; 2+ = nova estrofe. */
  function joinStanzas(t) {
    const blocks = t.split(/\n{2,}/).filter(b => b.trim());
    const singles = blocks.filter(b => !b.includes('\n')).length;
    if (blocks.length > 8 && singles / blocks.length > 0.7) {
      t = t.replace(/\n{3,}/g, '\u0000').replace(/\n\n/g, '\n').replace(/\u0000/g, '\n\n');
    }
    return t.replace(/\n{3,}/g, '\n\n').trim();
  }
  function saveOE(id, txt) {
    const clean = cleanOE(txt);
    if (clean.length < 200) return false;
    return store.set('oe:' + id, clean);
  }
  async function pasteOE(fallbackId) {
    let txt = '';
    try { txt = await navigator.clipboard.readText(); } catch { /* sem permissão */ }
    if (!txt.trim()) { toast('Não consegui ler o que foi copiado — use o campo de colar'); if (fallbackId) go('#/oracoes/' + fallbackId + '?colar=1', true); return; }
    const id = detectOE(txt) || fallbackId;
    if (!id) return toast('Não reconheci qual oração é. Abra a oração e cole por ela.');
    const oe = ORACOES.find(o => o.id === id);
    if (!saveOE(id, txt)) return toast('O texto copiado está curto demais. Copie a oração inteira.');
    toast(`${oe.nome} salva (${oeCount()} de ${ORACOES.length})`);
    render();
  }
  /** Arquivo .json { oracoes: { "I": "texto", "DC-II": "texto", ... } } guardado no aparelho. */
  async function importOEFile(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const src = data && (data.oracoes || data);
      let n = 0;
      for (const o of ORACOES) if (typeof src[o.id] === 'string' && saveOE(o.id, src[o.id])) n++;
      toast(n ? `${n} ${n === 1 ? 'oração importada' : 'orações importadas'}` : 'Nenhuma oração encontrada no arquivo');
      render();
    } catch { toast('Arquivo inválido'); }
  }
  function renderOE(txt) {
    return txt.split(/\n{2,}/).map(par => `<p>${par.split('\n').map(l => {
      // V. / R. / T. (com ponto) e CP / CC / C1… (celebrante principal, concelebrantes)
      const m = l.match(/^([VRTP]|Todos|Pres)([.:])\s*(.*)$/) || l.match(/^(CP|CC|C[1-4])([.:]?)\s+(.*)$/);
      if (!m) return esc(l);
      const povo = ['R', 'T', 'Todos'].includes(m[1]);
      return `<span class="oe-${povo ? 'r' : 'v'}"><b>${esc(m[1] + m[2])}</b> ${esc(m[3])}</span>`;
    }).join('<br>')}</p>`).join('');
  }

  views.oracoes = ([id], q) => {
    const oe = ORACOES.find(o => o.id === id);
    const canClip = !!(navigator.clipboard && navigator.clipboard.readText);
    if (!oe) {
      const n = oeCount();
      return {
        tab: '',
        html: `${topbar('Orações Eucarísticas')}
        ${n < ORACOES.length ? `<div class="oe-get">
          <b>${n ? `${n} de ${ORACOES.length} salvas no app` : 'Traga as orações para o app'}</b>
          <ol>
            <li>Abra uma oração no site (botão abaixo) e copie o texto dela.</li>
            <li>Volte aqui e toque em <em>Colar oração copiada</em>: o app reconhece qual é e guarda.</li>
          </ol>
          <div class="oe-btns">
            <a class="btn small" href="${OE_SITE}" target="_blank" rel="noopener">${ic('search', 'sm')} Abrir o site</a>
            ${canClip ? `<button class="btn small gold" data-act="oepaste">${ic('paste', 'sm')} Colar oração copiada</button>` : ''}
          </div>
          <label class="btn small block oe-file">${ic('upload', 'sm')} Importar arquivo de orações (.json)<input type="file" accept=".json,application/json" hidden data-act="oefile"></label>
          <small>Feito uma vez, a oração fica no seu aparelho e abre aqui, limpa e sem internet.</small>
        </div>` : `<div class="oe-ok">${ic('check', 'sm')} As ${ORACOES.length} orações estão salvas neste aparelho.</div>`}
        <ul class="list">${ORACOES.map(o => {
          const ok = !!oeText(o.id);
          return `<li><a class="row" href="#/oracoes/${o.id}">
          <span class="cat-ico ${ok ? '' : 'off'}">${ok ? ic('check') : catIc('calice')}</span>
          <span class="body"><b>${esc(o.nome)}</b><span class="sub">${ok ? 'Salva no app' : esc(o.sub || 'Ainda não salva')}</span></span>${ic('chev', 'sm chev')}</a></li>`;
        }).join('')}</ul>`,
        after(el) {
          const b = $('[data-act="oepaste"]', el); if (b) b.onclick = () => pasteOE(null);
          const f = $('[data-act="oefile"]', el); if (f) f.onchange = e => importOEFile(e.target.files[0]);
        }
      };
    }
    const i = ORACOES.indexOf(oe), prev = ORACOES[i - 1], next = ORACOES[i + 1];
    const txt = oeText(oe.id);
    const nav = `<div class="oe-nav">
        ${prev ? `<a class="btn small" href="#/oracoes/${prev.id}">${ic('back', 'sm')} ${esc(prev.id)}</a>` : '<span></span>'}
        <a class="btn small" href="#/oracoes">Todas</a>
        ${next ? `<a class="btn small" href="#/oracoes/${next.id}">${esc(next.id)} ${ic('chev', 'sm')}</a>` : '<span></span>'}
      </div>`;
    if (txt && q.get('colar') !== '1') {
      return {
        tab: '',
        html: `${topbar(oe.nome)}
        <div class="tools"><div class="tool"><button data-fs="-1" aria-label="Diminuir letra">A−</button><button data-fs="1" aria-label="Aumentar letra">A+</button></div>
          <span class="sp"></span><a class="btn small" href="#/oracoes/${oe.id}?colar=1">${ic('edit', 'sm')} Substituir</a></div>
        <article class="paper oe-text" style="--fs:${settings().fs}px"><h3>${esc(oe.nome)}</h3>${renderOE(txt)}</article>
        ${nav}`,
        after(el) {
          $$('[data-fs]', el).forEach(b => b.onclick = () => { const fs = Math.min(30, Math.max(14, settings().fs + Number(b.dataset.fs))); setSettings({ fs }); $('.paper', el).style.setProperty('--fs', fs + 'px'); });
        }
      };
    }
    return {
      tab: '',
      html: `${topbar(oe.nome)}
      <div class="oe-get">
        <b>${txt ? 'Substituir o texto desta oração' : 'Esta oração ainda não está no app'}</b>
        <ol>
          <li>Toque em <em>Abrir esta oração</em>, selecione o texto e copie.</li>
          <li>Volte e toque em <em>Colar</em> (ou cole no campo abaixo e salve).</li>
        </ol>
        <div class="oe-btns">
          <a class="btn small" href="${OE_SITE}#${oe.id}" target="_blank" rel="noopener">${ic('search', 'sm')} Abrir esta oração</a>
          ${canClip ? `<button class="btn small gold" data-act="oepaste">${ic('paste', 'sm')} Colar</button>` : ''}
        </div>
      </div>
      <form class="form" id="f" style="margin-top:12px">
        <div class="field"><label for="x">Texto da oração</label><textarea id="x" name="texto" placeholder="Cole aqui o texto da ${esc(oe.nome)}" style="white-space:pre-wrap;font-family:var(--sans);min-height:220px">${esc(txt)}</textarea></div>
        <button class="btn gold block">${ic('check')} Salvar</button>
        ${txt ? `<button type="button" class="btn small danger block" data-act="oedel">${ic('trash', 'sm')} Apagar do aparelho</button>` : ''}
      </form>
      ${nav}`,
      after(el) {
        const b = $('[data-act="oepaste"]', el);
        if (b) b.onclick = () => pasteOE(oe.id).then(() => { if (oeText(oe.id)) go('#/oracoes/' + oe.id, true); });
        const f = $('#f', el);
        f.onsubmit = e => {
          e.preventDefault();
          const other = detectOE(f.texto.value);
          if (other && other !== oe.id && !confirm(`Este texto parece ser a ${ORACOES.find(o => o.id === other).nome}. Salvar mesmo assim como ${oe.nome}?`)) return;
          if (!saveOE(oe.id, f.texto.value)) return toast('Texto curto demais. Cole a oração inteira.');
          toast(`${oe.nome} salva`); go('#/oracoes/' + oe.id, true);
        };
        const d = $('[data-act="oedel"]', el);
        if (d) d.onclick = () => { if (confirm(`Apagar a ${oe.nome} deste aparelho?`)) { store.set('oe:' + oe.id, ''); go('#/oracoes/' + oe.id, true); } };
      }
    };
  };

  /* ---------- Liturgia diária ----------
   * Leituras do dia pela API aberta liturgia.up.railway.app (textos litúrgicos da CNBB).
   * Cada dia aberto fica guardado no aparelho e pode ser lido sem internet depois. */
  const LIT_API = 'https://liturgia.up.railway.app/v2/';
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const pad2 = n => String(n).padStart(2, '0');
  const isoDate = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const parseISO = t => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const LIT_COR = { verde: '#3f9b5a', roxo: '#7b4fb0', branco: '#f3efe4', vermelho: '#c8423b', rosa: '#e48aac', preto: '#222' };
  const litMem = new Map();
  async function litGet(iso) {
    if (litMem.has(iso)) return litMem.get(iso);
    const cache = store.get('lit', {});
    const d = parseISO(iso);
    try {
      const r = await fetch(`${LIT_API}?dia=${d.getDate()}&mes=${d.getMonth() + 1}&ano=${d.getFullYear()}`);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      if (!j || !j.leituras) throw new Error('Resposta inesperada');
      litMem.set(iso, j);
      cache[iso] = j;
      const keys = Object.keys(cache).sort();
      while (keys.length > 14) delete cache[keys.shift()];
      store.set('lit', cache);
      return j;
    } catch (e) {
      if (cache[iso]) return cache[iso];
      throw e;
    }
  }
  // números de versículo colados ao texto ("17Como") viram números pequenos
  const litText = t => esc(t || '').replace(/(^|[\s(“"])(\d{1,3})(?=[A-Za-zÀ-ú“"‘'«–—])/g, '$1<sup>$2</sup>');
  function litReading(kind, x) {
    if (!x) return '';
    if (kind === 'salmo') {
      const linhas = String(x.texto || '').split(/\n+/).map(l => l.trim()).filter(Boolean);
      return `<div class="lit-h"><b>Salmo responsorial</b><span>${esc(x.referencia || '')}</span></div>
        ${x.refrao ? `<p class="lit-refrao"><span>R.</span> ${esc(x.refrao)}</p>` : ''}
        ${linhas.map(l => `<p class="lit-verso">${litText(l)}</p>`).join('')}`;
    }
    const paras = String(x.texto || '').split(/\n+/).map(l => l.trim()).filter(Boolean);
    const fim = kind === 'evangelho' ? 'Palavra da Salvação.' : 'Palavra do Senhor.';
    const resp = kind === 'evangelho' ? 'Glória a vós, Senhor.' : 'Graças a Deus.';
    return `<div class="lit-h"><b>${esc(x.titulo || '')}</b><span>${esc(x.referencia || '')}</span></div>
      ${paras.map(l => `<p>${litText(l)}</p>`).join('')}
      <p class="lit-fim">— ${fim} <span>— ${resp}</span></p>`;
  }

  views.liturgia = (_, q) => {
    const hoje = new Date();
    const dia = parseISO(q.get('d')) || new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const iso = isoDate(dia);
    const ehHoje = iso === isoDate(hoje);
    const rotulo = `${ehHoje ? 'Hoje, ' : ''}${SEMANA[dia.getDay()]}${ehHoje ? '' : ','} ${dia.getDate()} de ${MESES[dia.getMonth()]}`;
    let aba = q.get('l') || 'primeira';
    return {
      tab: 'liturgia',
      html: `${topbar('Liturgia diária', { back: false })}
      <div class="lit-nav">
        <a class="ib" href="#/liturgia?d=${isoDate(addDays(dia, -1))}" aria-label="Dia anterior">${ic('back')}</a>
        <label class="lit-date"><span>${esc(rotulo)}</span><input type="date" value="${iso}" aria-label="Escolher data"></label>
        <a class="ib flip" href="#/liturgia?d=${isoDate(addDays(dia, 1))}" aria-label="Próximo dia">${ic('back')}</a>
      </div>
      ${ehHoje ? '' : `<div class="lit-today"><a href="#/liturgia">Voltar para hoje</a></div>`}
      <div id="litbody"><div class="empty"><span class="spin" style="display:inline-block;color:var(--gold)"></span><p style="margin-top:14px">Carregando as leituras…</p></div></div>`,
      after(el) {
        const inp = $('.lit-date input', el);
        inp.onchange = () => { if (inp.value) go('#/liturgia?d=' + inp.value, true); };
        const box = $('#litbody', el);
        litGet(iso).then(j => {
          if (!box.isConnected) return;
          const L = j.leituras;
          const tabs = [['primeira', '1ª Leitura', L.primeiraLeitura && L.primeiraLeitura[0]], ['salmo', 'Salmo', L.salmo && L.salmo[0]],
            ['segunda', '2ª Leitura', L.segundaLeitura && L.segundaLeitura[0]], ['evangelho', 'Evangelho', L.evangelho && L.evangelho[0]]].filter(t => t[2]);
          if (!tabs.some(t => t[0] === aba)) aba = tabs.length ? tabs[0][0] : '';
          const cor = String(j.cor || '').toLowerCase().split(/\s|\//)[0];
          const draw = () => {
            const t = tabs.find(x => x[0] === aba);
            box.innerHTML = `<div class="lit-card">
                <span class="lit-cor" style="background:${LIT_COR[cor] || 'var(--gold)'}" title="Cor litúrgica"></span>
                <div><b>${esc(j.liturgia || '')}</b><small>Cor litúrgica: ${esc(j.cor || '—')}</small></div>
              </div>
              <div class="chips lit-tabs" role="tablist">${tabs.map(([k, l]) => `<button class="chip ${k === aba ? 'on' : ''}" data-lit="${k}" role="tab" aria-selected="${k === aba}">${l}</button>`).join('')}</div>
              <div class="tools"><div class="tool"><button data-fs="-1" aria-label="Diminuir letra">A−</button><button data-fs="1" aria-label="Aumentar letra">A+</button></div>
                <span class="sp"></span>
                <div class="tool icon"><button data-act="paper" aria-label="Alternar fundo da leitura">${ic(settings().papel === 'escuro' ? 'sun' : 'moon', 'sm')}</button></div>
                <div class="tool icon"><button data-act="litshare" aria-label="Compartilhar">${ic('share', 'sm')}</button></div></div>
              <article class="paper lit ${settings().papel === 'escuro' ? 'dark' : ''}" style="--fs:${settings().fs}px">
                ${t ? litReading(t[0] === 'segunda' || t[0] === 'primeira' ? 'leitura' : t[0], t[2]) : '<p>Leituras indisponíveis para este dia.</p>'}
              </article>
              <p class="lit-src">Textos litúrgicos: CNBB · via liturgia.up.railway.app</p>`;
            $$('[data-lit]', box).forEach(b => b.onclick = () => { aba = b.dataset.lit; history.replaceState(null, '', `#/liturgia?d=${iso}&l=${aba}`); draw(); });
            $$('[data-fs]', box).forEach(b => b.onclick = () => { const fs = Math.min(30, Math.max(14, settings().fs + Number(b.dataset.fs))); setSettings({ fs }); $('.paper', box).style.setProperty('--fs', fs + 'px'); });
            $('[data-act="paper"]', box).onclick = () => { setSettings({ papel: settings().papel === 'escuro' ? 'claro' : 'escuro' }); draw(); };
            $('[data-act="litshare"]', box).onclick = async () => {
              const txt = `${j.liturgia}\n${t ? (t[2].titulo || 'Salmo') + ' (' + t[2].referencia + ')\n\n' + (t[2].refrao ? 'R. ' + t[2].refrao + '\n\n' : '') + t[2].texto : ''}`;
              try { if (navigator.share) await navigator.share({ title: j.liturgia, text: txt }); else { await navigator.clipboard.writeText(txt); toast('Leitura copiada'); } } catch { /* cancelado */ }
            };
          };
          draw();
        }).catch(() => {
          if (!box.isConnected) return;
          box.innerHTML = emptyState('info', 'Não foi possível carregar as leituras', navigator.onLine === false ? 'Sem conexão com a internet. Os dias que você já abriu ficam guardados para ler offline.' : 'O serviço de leituras não respondeu agora. Tente de novo em instantes.', `<button class="btn" data-act="retry">Tentar de novo</button>`);
          $('[data-act="retry"]', box).onclick = () => render();
        });
      }
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
      fonte: data.fonte || 'Cadastrada por você',
      idioma: 'pt',
      texto: C.normalizeSheet(data.texto).trim()
    };
    if (data.ia) song.ia = true;          // cifra sugerida pela IA (mostra o aviso "confira")
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

  /* ---------- Meus PPTs: biblioteca de apresentações prontas (no aparelho) ---------- */
  const fmtSize = b => b >= 1073741824 ? (b / 1073741824).toFixed(1).replace('.', ',') + ' GB' : b >= 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
  const fmtDate = t => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  const pptRow = it => `<li><a class="row" href="#/ppts/${encodeURIComponent(it.id)}">
      <span class="ppt-ico">${ic('slides')}</span>
      <span class="body"><b>${esc(it.nome)}${it.nuvem ? '<span class="badge">NUVEM</span>' : ''}</b><span class="sub">${it.slides.length ? it.slides.length + ' slides · ' : ''}${fmtSize(it.tamanho)} · ${fmtDate(it.data)}${it.nuvem && !it.temArquivo ? ' · baixa ao abrir' : ''}</span>
      ${it.erro ? `<span class="snip">${esc(it.erro)}</span>` : ''}</span>${ic('chev', 'sm chev')}</a></li>`;

  /**
   * Transforma os slides em letra: cada slide vira uma estrofe.
   * Tira o rodapé (linha repetida na maioria dos slides), rótulos como "REFRÃO"
   * e o slide de título (cujo texto vira o título da música).
   */
  function pptToSong(it) {
    let slides = it.slides.map(l => l.slice()).filter(l => l.length);
    // 1) slide de título: primeiro slide curto cuja 1ª linha bate com o nome do arquivo
    let titulo = it.nome;
    const clean = s => norm(s).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    const nome = clean(it.nome), first = slides[0];
    if (first && slides.length > 1 && first.length <= 3) {
      const l0 = clean(first[0]);
      if (l0 && (nome.includes(l0) || l0.includes(nome))) { titulo = first[0]; slides = slides.slice(1); }
    }
    // 2) rodapé: mesma linha em 60%+ dos slides (geralmente o nome da música)
    if (slides.length >= 3) {
      const cont = new Map();
      slides.forEach(l => new Set(l.map(norm)).forEach(x => cont.set(x, (cont.get(x) || 0) + 1)));
      const rod = new Set([...cont].filter(([, n]) => n >= Math.max(3, slides.length * 0.6)).map(([x]) => x));
      slides = slides.map(l => l.filter(x => !rod.has(norm(x))));
    }
    // 3) rótulos soltos
    slides = slides.map(l => l.filter(x => !/^(refr[aã]o|estrofe \d*|coro)$/i.test(x.trim()))).filter(l => l.length);
    return { titulo, texto: slides.map(l => l.join('\n')).join('\n\n') };
  }

  /* ---------- biblioteca online (Supabase) ---------- */
  let nuvemState = { checked: false, user: null, membro: false };
  async function nuvemCheck(force) {
    if (nuvemState.checked && !force) return nuvemState;
    if (!window.Nuvem || !Nuvem.configured()) return (nuvemState = { checked: true, off: true, user: null, membro: false });
    const user = await Nuvem.user();
    let membro = false, erro = '';
    if (user) { try { membro = await Nuvem.isMember(); } catch (e) { erro = e.message; } }
    return (nuvemState = { checked: true, user, membro, erro });
  }
  const online = () => !!(nuvemState.user && nuvemState.membro);

  /** Sobe para a nuvem o arquivo atual de um PPT do aparelho. */
  async function pushNuvem(id) {
    if (!online()) return false;
    const full = await PptLib.get(id);
    if (!full || !full.blob) return false;
    const caminho = await Nuvem.upload(full);
    await PptLib.update(id, { nuvem: true, caminho });
    return true;
  }

  /** Junta aparelho e nuvem: envia o que é novo daqui, traz o que é novo de lá (sem baixar os arquivos). */
  async function syncNuvem() {
    const rows = await Nuvem.list();
    const cloud = new Map(rows.map(r => [r.id, r]));
    const local = await PptLib.list();
    const lmap = new Map(local.map(i => [i.id, i]));
    let enviados = 0, recebidos = 0, removidos = 0;
    for (const it of local) {
      if (!it.nuvem) { if (await pushNuvem(it.id)) enviados++; }
      else if (!cloud.has(it.id)) { await PptLib.remove(it.id); removidos++; }          // apagado por outro membro
    }
    for (const r of rows) {
      const l = lmap.get(r.id);
      const meta = { nome: r.nome, arquivo: r.arquivo, tipo: r.tipo, tamanho: r.tamanho, data: r.data, slides: r.slides || [], texto: r.texto || '', erro: r.erro || '', caminho: r.caminho, versao: r.versao || 0, enviadoPor: r.enviado_por, nuvem: true };
      if (!l) { await PptLib.put({ id: r.id, ...meta, blob: null }); recebidos++; }
      else if ((r.versao || 0) > (l.versao || 0)) { await PptLib.update(r.id, { ...meta, blob: null }); recebidos++; }  // editado em outro aparelho
      else if (l.nome !== r.nome) await PptLib.update(r.id, { nome: r.nome, texto: r.texto || l.texto });
    }
    store.set('nuvemSync', Date.now());
    return { enviados, recebidos, removidos };
  }

  /** Arquivo do PPT: do aparelho, ou baixa da nuvem na primeira vez. */
  async function ensureBlob(it) {
    if (it.blob) return it.blob;
    if (!it.nuvem || !it.caminho) throw new Error('O arquivo deste PPT não está neste aparelho.');
    await nuvemCheck();
    if (!online()) throw new Error('Entre na biblioteca online para baixar este PPT.');
    toast('Baixando da nuvem…');
    const b = await Nuvem.download(it.caminho);
    await PptLib.update(it.id, { blob: b });
    it.blob = b;
    return b;
  }

  async function sendPpts(files, after) {
    const list = [...files].filter(f => /\.(pptx|ppt|ppsx|pps)$/i.test(f.name) || /presentation|powerpoint/.test(f.type));
    if (!list.length) return toast('Escolha arquivos de PowerPoint (.pptx)');
    PptLib.persist();
    await nuvemCheck();
    let ok = 0, subiu = 0;
    for (const f of list) {
      toast(`Guardando ${ok + 1} de ${list.length}: ${f.name}`);
      try {
        const meta = await PptLib.add(f); ok++;
        if (online()) { try { if (await pushNuvem(meta.id)) subiu++; } catch (e) { console.error(e); toast('Guardado só no aparelho: ' + e.message); } }
      } catch (e) { console.error(e); toast('Não consegui guardar ' + f.name + (e.name === 'QuotaExceededError' ? ' (sem espaço)' : '')); }
    }
    toast(`${ok} ${ok === 1 ? 'PPT guardado' : 'PPTs guardados'}${subiu ? ` e ${subiu === ok ? '' : subiu + ' '}enviado${subiu === 1 ? '' : 's'} para a nuvem` : ''}`);
    after && after();
  }

  views.ppts = ([id], q) => {
    if (id && q.get('editar') === '1') return pptEditor(id);
    if (id) return pptDetail(id);
    const termo = q.get('q') || '';
    return {
      tab: '',
      html: `${topbar('Meus PPTs')}
      <div class="oe-get">
        <b>Sua biblioteca de apresentações</b>
        <p class="ia-p">Guarde aqui os PPTs prontos da comunidade. O app lê o texto dos slides: eles aparecem na busca, podem ser apresentados, editados e virar música do acervo.</p>
        <label class="btn gold block ppt-up">${ic('upload')} Enviar PPTs<input type="file" multiple accept=".pptx,.ppt,.ppsx,.pps,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint" hidden data-act="pptfiles"></label>
        <a class="btn block" href="#/editor/novo">${ic('plus')} Criar um PPT do zero</a>
        <small data-uso>Os arquivos ficam guardados neste aparelho.</small>
      </div>
      <div class="nuvem-box" data-nuvem></div>
      <form class="searchbar" data-pptsearch>${ic('search')}<input type="search" name="q" value="${esc(termo)}" placeholder="Buscar nos PPTs (nome ou trecho)…" enterkeyhint="search" autocomplete="off"></form>
      <div id="pptlist"><div class="hint loading"><span class="spin"></span> Carregando…</div></div>
      <div class="sec-title">Backup</div>
      <div class="menu">
        <button data-act="pptexport">${ic('download')}<span>Exportar a biblioteca<small>Um arquivo .zip com todos os PPTs, para guardar ou passar a outro celular</small></span></button>
        <label>${ic('upload')}<span>Importar backup<small>Arquivo .zip exportado pelo app</small></span><input type="file" accept=".zip,application/zip" hidden data-act="pptimport"></label>
      </div>`,
      async after(el) {
        const box = $('#pptlist', el);
        const fill = async () => {
          const t = ($('[data-pptsearch] input', el) || {}).value || '';
          const items = t.trim() ? await PptLib.search(t) : await PptLib.list();
          if (!box.isConnected) return;
          box.innerHTML = items.length
            ? `<div class="sec-title">${t.trim() ? 'Encontrados' : 'Guardados'} <span>${items.length}</span></div><ul class="list">${items.map(pptRow).join('')}</ul>`
            : (t.trim() ? `<div class="hint">Nenhum PPT com “${esc(t)}”.</div>` : emptyState('slides', 'Nenhum PPT guardado ainda', 'Toque em <b>Enviar PPTs</b> e escolha os arquivos do seu celular ou computador. Pode escolher vários de uma vez.'));
          const u = await PptLib.usage(), uso = $('[data-uso]', el);
          if (u && u.usage != null && uso) uso.textContent = `Os arquivos ficam guardados neste aparelho · ${fmtSize(u.usage)} usados de ${fmtSize(u.quota)} disponíveis.`;
        };
        $('[data-act="pptfiles"]', el).onchange = e => sendPpts(e.target.files, fill);
        const sf = $('[data-pptsearch]', el);
        sf.onsubmit = e => { e.preventDefault(); history.replaceState(null, '', '#/ppts?q=' + encodeURIComponent(sf.q.value.trim())); fill(); };
        let deb; sf.q.oninput = () => { clearTimeout(deb); deb = setTimeout(fill, 250); };
        $('[data-act="pptexport"]', el).onclick = async e => {
          const btn = e.currentTarget;
          btn.disabled = true;
          try {
            const { blob, total } = await PptLib.exportZip();
            if (!total) return toast('A biblioteca está vazia');
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob); a.download = `biblioteca-ppts-cantai-${new Date().toISOString().slice(0, 10)}.zip`; a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 4000);
            toast(`Backup com ${total} ${total === 1 ? 'PPT' : 'PPTs'} gerado`);
          } catch (err) { console.error(err); toast('Não consegui gerar o backup'); } finally { btn.disabled = false; }
        };
        $('[data-act="pptimport"]', el).onchange = async e => {
          const f = e.target.files[0]; if (!f) return;
          toast('Importando…');
          try { const n = await PptLib.importZip(f); toast(n ? `${n} ${n === 1 ? 'PPT importado' : 'PPTs importados'}` : 'Nada novo para importar'); fill(); }
          catch (err) { console.error(err); toast(err.message || 'Arquivo inválido'); }
        };
        fill();
        // biblioteca online: mostra o estado e sincroniza ao abrir
        const nb = $('[data-nuvem]', el);
        const nuvemUI = (msg, acao) => { if (nb.isConnected) nb.innerHTML = `${ic('upload', 'sm')}<span>${msg}</span>${acao || ''}`; };
        const st = await nuvemCheck(true);
        if (st.off) nuvemUI('Biblioteca online ainda não configurada.', `<a href="#/nuvem">Configurar</a>`);
        else if (!st.user) nuvemUI('Entre para ver os PPTs da biblioteca online.', `<a href="#/nuvem">Entrar</a>`);
        else if (!st.membro) nuvemUI(`${esc(st.user.email)} não está na lista de membros.`, `<a href="#/nuvem">Ver</a>`);
        else {
          const doSync = async () => {
            nuvemUI(`Online como <b>${esc(st.user.email)}</b> · sincronizando…`);
            try {
              const r = await syncNuvem();
              const partes = [r.recebidos && `${r.recebidos} recebido${r.recebidos > 1 ? 's' : ''}`, r.enviados && `${r.enviados} enviado${r.enviados > 1 ? 's' : ''}`, r.removidos && `${r.removidos} removido${r.removidos > 1 ? 's' : ''}`].filter(Boolean);
              nuvemUI(`Online como <b>${esc(st.user.email)}</b> · ${partes.length ? partes.join(', ') : 'tudo em dia'}`, `<button data-act="sync">Sincronizar</button>`);
              if (partes.length) fill();
            } catch (e) {
              console.error(e);
              nuvemUI(`Online · ${esc(e.message)}`, `<button data-act="sync">Tentar de novo</button>`);
            }
            const b = $('[data-act="sync"]', nb); if (b) b.onclick = doSync;
          };
          doSync();
        }
      }
    };
  };

  function pptDetail(id) {
    return {
      tab: '',
      html: `${topbar('PPT')}<div id="pptd"><div class="hint loading"><span class="spin"></span> Abrindo…</div></div>`,
      async after(el) {
        const box = $('#pptd', el);
        const it = await PptLib.get(id);
        if (!box.isConnected) return;
        if (!it) { box.innerHTML = emptyState('slides', 'PPT não encontrado', 'Ele pode ter sido apagado deste aparelho.', `<a class="btn" href="#/ppts">Voltar à biblioteca</a>`); return; }
        $('.topbar h1', el).textContent = it.nome;
        const temTexto = it.slides.some(s => s.length);
        box.innerHTML = `
          <div class="ppt-head">
            <span class="ppt-ico lg">${ic('slides')}</span>
            <div><b>${esc(it.nome)}</b><small>${esc(it.arquivo)} · ${fmtSize(it.tamanho)} · ${it.slides.length} slides · ${fmtDate(it.data)}</small></div>
          </div>
          ${it.erro ? `<div class="ia-note">${ic('info', 'sm')}<span>${esc(it.erro)}</span></div>` : ''}
          <div class="actions">
            <div class="row3">
              <button class="btn stack" data-act="open">${ic('download')}Abrir</button>
              <button class="btn stack" data-act="show" ${temTexto ? '' : 'disabled'}>${ic('expand')}Apresentar</button>
              <button class="btn stack" data-act="share">${ic('share')}Compartilhar</button>
            </div>
            ${it.erro && !temTexto ? '' : `<div class="ed-open"><a class="btn gold" href="#/editor/${encodeURIComponent(it.id)}">${ic('layers')} Editar PowerPoint</a><a class="btn ed-nova" href="#/editor/${encodeURIComponent(it.id)}" target="_blank" rel="noopener" title="Abrir o editor numa aba nova do navegador">${ic('share', 'sm')} Nova aba</a></div>`}
            <div class="row3" style="grid-template-columns:1fr 1fr">
              ${temTexto ? `<a class="btn" href="#/ppts/${encodeURIComponent(it.id)}?editar=1">${ic('edit')} Só os textos</a>` : '<span></span>'}
              <label class="btn ppt-up">${ic('upload')} Substituir arquivo<input type="file" accept=".pptx,.ppt,.ppsx,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint" hidden data-act="replace"></label>
            </div>
            ${temTexto ? `<button class="btn block" data-act="tosong">${ic('music')} Salvar como música do acervo</button>` : ''}
            <div class="row3" style="grid-template-columns:1fr 1fr">
              <button class="btn small" data-act="rename">${ic('edit', 'sm')} Renomear</button>
              <button class="btn small danger" data-act="del">${ic('trash', 'sm')} Apagar</button>
            </div>
            <p class="ppt-dica">Para mudar imagens ou o layout: toque em <b>Abrir</b>, edite no PowerPoint ou Google Apresentações, salve e use <b>Substituir arquivo</b>.${it.nuvem ? ' A versão nova vai para todos da biblioteca online.' : ''}</p>
          </div>
          ${temTexto ? `<div class="sec-title">Texto dos slides</div>
          <div class="ppt-slides">${it.slides.map((lines, i) => `<div class="ppt-sl"><span class="num">${i + 1}</span>${lines.length ? lines.map(esc).join('<br>') : '<i>(sem texto)</i>'}</div>`).join('')}</div>` : ''}`;
        const tipo = it.tipo || 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        const baixar = blob => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob); a.download = it.arquivo || (it.nome + '.pptx'); a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        };
        $('[data-act="open"]', box).onclick = async () => {
          try { baixar(await ensureBlob(it)); } catch (e) { toast(e.message); }
        };
        $('[data-act="share"]', box).onclick = async () => {
          let blob;
          try { blob = await ensureBlob(it); } catch (e) { return toast(e.message); }
          const f = new File([blob], it.arquivo || (it.nome + '.pptx'), { type: tipo });
          if (navigator.canShare && navigator.canShare({ files: [f] })) {
            try { await navigator.share({ files: [f], title: it.nome }); } catch (e) { if (e.name !== 'AbortError') toast('Não foi possível compartilhar'); }
          } else { baixar(blob); toast('Compartilhamento indisponível aqui — arquivo baixado'); }
        };
        $('[data-act="replace"]', box).onchange = async e => {
          const f = e.target.files[0]; if (!f) return;
          toast('Substituindo…');
          try {
            await PptLib.replaceFile(it.id, f, f.name);
            await nuvemCheck();
            if (it.nuvem || online()) { try { await pushNuvem(it.id); } catch (err) { toast('Substituído só neste aparelho: ' + err.message); render(); return; } }
            toast(online() ? 'Arquivo substituído para todos' : 'Arquivo substituído'); render();
          } catch (err) { console.error(err); toast(err.message || 'Não consegui substituir'); }
        };
        const show = $('[data-act="show"]', box);
        if (show && temTexto) show.onclick = () => { const p = pptToSong(it); openShow([{ song: { id: it.id, titulo: p.titulo, texto: p.texto, autor: '' } }]); };
        const tosong = $('[data-act="tosong"]', box);
        if (tosong) tosong.onclick = () => {
          const p = pptToSong(it);
          const s = saveUserSong({ titulo: p.titulo, categoria: 'outros', autor: '', texto: p.texto, fonte: 'Importada de PPT (' + it.arquivo + ')' });
          PptLib.update(it.id, { musica: s.id });
          toast('Música criada! Escolha o momento da missa em Editar.');
          go('#/musica/' + encodeURIComponent(s.id));
        };
        $('[data-act="rename"]', box).onclick = async () => {
          const nome = prompt('Novo nome:', it.nome);
          if (!nome || !nome.trim()) return;
          const texto = norm(nome.trim() + '\n' + it.slides.flat().join('\n'));
          await PptLib.update(it.id, { nome: nome.trim(), texto });
          await nuvemCheck();
          if (it.nuvem && online()) { try { await Nuvem.rename(it.id, nome.trim(), texto); } catch (e) { toast('Renomeado só neste aparelho: ' + e.message); } }
          toast('Renomeado'); render();
        };
        $('[data-act="del"]', box).onclick = async () => {
          await nuvemCheck();
          if (it.nuvem && online()) {
            if (!confirm(`Apagar “${it.nome}” da biblioteca online?\n\nEle some para TODOS os membros.`)) return;
            try { await Nuvem.remove({ id: it.id, caminho: it.caminho }); } catch (e) { return toast('Não consegui apagar da nuvem: ' + e.message); }
          } else if (it.nuvem) {
            if (!confirm(`Apagar “${it.nome}” deste aparelho?\n\nEle continua na biblioteca online e volta na próxima sincronização.`)) return;
          } else if (!confirm(`Apagar “${it.nome}” deste aparelho?`)) return;
          await PptLib.remove(it.id); toast('PPT apagado'); go('#/ppts', true);
        };
      }
    };
  }

  /* ---------- Editor de PowerPoint (aba de edição em tela cheia) ---------- */
  let editorAberto = null;
  views.editor = ([id]) => ({
    tab: '',
    tela: 'editor',
    html: `<div id="ved" class="ved"><div class="ved-load"><span class="spin"></span> Abrindo o editor…</div></div>`,
    async after(el) {
      document.body.classList.add('e2-mode');
      const box = $('#ved', el);
      const falha = msg => { box.innerHTML = `${topbar('Editar PowerPoint')}${emptyState('slides', 'Não foi possível abrir no editor', esc(msg), `<a class="btn" href="#/ppts">Voltar</a>`)}`; document.body.classList.remove('e2-mode'); };
      let it = null, deck, nome, ignorados = 0;
      const t0 = performance.now();
      try {
        await SlideEditor.loadLibs();
        if (id === 'novo') {
          nome = 'Nova apresentação';
          deck = { v: 2, h: 540, imgs: {}, slides: [
            { bg: { tipo: 'tema', tema: 'noite', escurecer: 0 }, objs: [SlideEditor.novoTexto('Título da apresentação', { pt: 54, y: 190, h: 160 })] },
            SlideEditor.slideEmBranco({ bg: { tipo: 'tema', tema: 'noite', escurecer: 0 } })
          ] };
        } else {
          it = await PptLib.get(id);
          if (!it) return falha('Este PPT não está mais na biblioteca.');
          nome = it.nome;
          if (it.deck && it.deck.v === 2) deck = it.deck;               // já editado antes: abre na hora
          else {
            if (!/\.(pptx|ppsx)$/i.test(it.arquivo || '') && !/presentationml/.test(it.tipo || '')) return falha('O editor abre arquivos .pptx. Salve este PPT como .pptx no PowerPoint e envie de novo.');
            ({ deck, ignorados } = await SlideEditor.fromPptx(await ensureBlob(it)));
          }
        }
      } catch (e) { console.error(e); return falha(e.message); }
      if (!box.isConnected) return;
      console.info(`Editor aberto em ${Math.round(performance.now() - t0)} ms`);
      editorAberto = SlideEditorUI.mount(box, {
        deck, nome, toast, ic,
        onClose: () => { editorAberto = null; document.body.classList.remove('e2-mode'); history.length > 1 ? history.back() : go(it ? '#/ppts/' + encodeURIComponent(it.id) : '#/ppts'); },
        onSave: async (d, comoNovo) => {
          const blob = await SlideEditor.toPptx(d, nome);
          await nuvemCheck();
          let alvo;
          if (comoNovo || !it) {
            const meta = await PptLib.add(new File([blob], (it ? nome + ' (editado)' : nome) + '.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }));
            alvo = meta.id;
          } else {
            await PptLib.replaceFile(it.id, blob, /\.pptx$/i.test(it.arquivo || '') ? it.arquivo : nome + '.pptx');
            alvo = it.id;
          }
          await PptLib.update(alvo, { deck: d });
          let msg = comoNovo || !it ? 'Salvo como um PPT novo na biblioteca' : 'PowerPoint salvo';
          if (online()) { try { if (await pushNuvem(alvo)) msg += ' e enviado para todos'; } catch (e) { msg += ' (só neste aparelho)'; } }
          toast(msg);
          if (!it || comoNovo) { it = await PptLib.get(alvo); nome = it.nome; history.replaceState(null, '', '#/editor/' + encodeURIComponent(alvo)); }
        }
      });
      if (ignorados) toast(`${ignorados} elemento${ignorados > 1 ? 's' : ''} (vídeo, tabela ou gráfico) não ${ignorados > 1 ? 'podem' : 'pode'} ser editado${ignorados > 1 ? 's' : ''} e ${ignorados > 1 ? 'ficaram' : 'ficou'} de fora`);
    }
  });

  /** Editor: um campo por slide; grava no próprio .pptx mantendo fundo e formatação. */
  function pptEditor(id) {
    return {
      tab: '',
      html: `${topbar('Editar textos')}<div id="pped"><div class="hint loading"><span class="spin"></span> Abrindo…</div></div>`,
      async after(el) {
        const box = $('#pped', el);
        const it = await PptLib.get(id);
        if (!box.isConnected) return;
        if (!it) { box.innerHTML = emptyState('slides', 'PPT não encontrado', '', `<a class="btn" href="#/ppts">Voltar</a>`); return; }
        $('.topbar h1', el).textContent = 'Editar: ' + it.nome;
        let estrutura;
        try { estrutura = await PptLib.boxes(await ensureBlob(it)); }
        catch (e) { box.innerHTML = emptyState('slides', 'Não foi possível abrir para edição', esc(e.message), `<a class="btn" href="#/ppts/${encodeURIComponent(it.id)}">Voltar</a>`); return; }
        // a caixa com mais linhas de cada slide é o texto principal; as outras (rodapé, rótulo) vêm separadas
        box.innerHTML = `
          <div class="ia-note">${ic('info', 'sm')}<span>Cada linha do campo é uma linha do slide. O fundo, as imagens e a formatação do PPT continuam iguais.</span></div>
          <form class="form ppt-edit" id="f">
            ${estrutura.map((caixas, i) => `<div class="ppt-ed-sl"><div class="ppt-ed-h">Slide ${i + 1}</div>
              ${caixas.length ? caixas.map((lines, c) => {
                const maior = caixas.findIndex(x => x.length === Math.max(...caixas.map(y => y.length)));
                const principal = c === maior;
                return `<div class="field"><label for="s${i}-${c}">${caixas.length > 1 ? (principal ? 'Texto principal' : 'Outro texto (título, rótulo ou rodapé)') : 'Texto'}</label>
                  <textarea id="s${i}-${c}" data-s="${i}" data-c="${c}" rows="${Math.max(1, Math.min(10, lines.length + (principal ? 1 : 0)))}">${esc(lines.join('\n'))}</textarea></div>`;
              }).join('') : '<p class="ppt-dica">Este slide não tem texto.</p>'}</div>`).join('')}
            <button class="btn gold block">${ic('check')} Salvar alterações</button>
            <a class="btn block" href="#/ppts/${encodeURIComponent(it.id)}">Cancelar</a>
          </form>`;
        const f = $('#f', box);
        f.onsubmit = async e => {
          e.preventDefault();
          const btn = $('button.gold', f), old = btn.innerHTML;
          btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Salvando…';
          try {
            const novos = estrutura.map((caixas, i) => caixas.map((_, c) => $(`[data-s="${i}"][data-c="${c}"]`, f).value.split('\n')));
            const blob = await PptLib.editTexts(await ensureBlob(it), novos);
            await PptLib.replaceFile(it.id, blob, it.arquivo);
            await nuvemCheck();
            let msg = 'PPT salvo';
            if (it.nuvem || online()) {
              try { if (await pushNuvem(it.id)) msg = 'PPT salvo e atualizado para todos'; }
              catch (err) { msg = 'Salvo só neste aparelho: ' + err.message; }
            }
            toast(msg);
            go('#/ppts/' + encodeURIComponent(it.id), true);
          } catch (err) {
            console.error(err); toast(err.message || 'Não consegui salvar');
            btn.disabled = false; btn.innerHTML = old;
          }
        };
      }
    };
  }

  /* ---------- tela da biblioteca online (login) ---------- */
  views.nuvem = () => ({
    tab: 'mais',
    html: `${topbar('Biblioteca online')}<div id="nv"><div class="hint loading"><span class="spin"></span> Verificando…</div></div>`,
    async after(el) {
      const box = $('#nv', el);
      const st = await nuvemCheck(true);
      if (!box.isConnected) return;
      if (st.off) {
        box.innerHTML = `<div class="oe-get"><b>Biblioteca online ainda não configurada</b>
          <p class="ia-p">Quem administra o app precisa criar o projeto gratuito no Supabase e ligar aqui. Depois disso, cada pessoa só entra com e-mail e senha.</p></div>
          <form class="form" id="cfg" style="margin-top:12px">
            <div class="field"><label for="u">Project URL</label><input id="u" name="url" placeholder="https://xxxx.supabase.co" autocomplete="off"></div>
            <div class="field"><label for="a">Chave pública (anon / publishable)</label><input id="a" name="anon" autocomplete="off" spellcheck="false"></div>
            <button class="btn gold block">${ic('check')} Ligar a biblioteca</button>
          </form>`;
        $('#cfg', box).onsubmit = e => {
          e.preventDefault();
          const u = e.target.url.value.trim(), a = e.target.anon.value.trim();
          if (!/^https:\/\/[\w.-]+\.supabase\.(co|in)\/?$/.test(u) || a.length < 20) return toast('Confira o endereço e a chave');
          Nuvem.setConfig(u, a); toast('Biblioteca ligada'); render();
        };
        return;
      }
      if (st.user) {
        box.innerHTML = `<div class="oe-get"><b>${st.membro ? 'Você está na biblioteca online' : 'Conta sem acesso à biblioteca'}</b>
          <p class="ia-p">Conectado como <em>${esc(st.user.email)}</em>.</p>
          <p class="ia-p">${st.membro ? 'Os PPTs que você enviar aparecem para todos os membros, e os deles aparecem para você em <em>Meus PPTs</em>.' : `Peça para quem administra incluir este e-mail na lista de membros. ${st.erro ? '(' + esc(st.erro) + ')' : ''}`}</p>
          ${st.membro ? `<a class="btn gold block" href="#/ppts">${ic('slides')} Abrir Meus PPTs</a>` : ''}
          <button class="btn block" data-act="sair">Sair</button></div>`;
        $('[data-act="sair"]', box).onclick = async () => { await Nuvem.signOut(); nuvemState.checked = false; toast('Você saiu'); render(); };
        return;
      }
      box.innerHTML = `<div class="oe-get"><b>Entrar na biblioteca online</b>
          <p class="ia-p">Com a conta, os PPTs ficam guardados na nuvem e aparecem nos celulares de todos os membros (ex.: você e seu irmão). Só e-mails autorizados entram.</p></div>
        <form class="form" id="lg" style="margin-top:12px">
          <div class="field"><label for="e">E-mail</label><input id="e" name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="p">Senha</label><input id="p" name="senha" type="password" autocomplete="current-password" minlength="6" required></div>
          <button class="btn gold block" data-modo="entrar">${ic('check')} Entrar</button>
          <button type="button" class="btn block" data-modo="criar">Criar conta</button>
          <p class="help" style="color:var(--muted);font-size:12.5px">Na primeira vez, toque em <b>Criar conta</b>, abra o link de confirmação que chega no e-mail e depois volte aqui e toque em <b>Entrar</b>.</p>
        </form>`;
      const f = $('#lg', box);
      const go2 = async modo => {
        if (!f.reportValidity()) return;
        const b = $(`[data-modo="${modo}"]`, f), old = b.innerHTML;
        b.disabled = true; b.innerHTML = '<span class="spin"></span>';
        try {
          if (modo === 'criar') {
            const r = await Nuvem.signUp(f.email.value, f.senha.value);
            toast(r.session ? 'Conta criada!' : 'Conta criada! Confirme pelo link que chegou no seu e-mail e depois toque em Entrar.');
          } else {
            await Nuvem.signIn(f.email.value, f.senha.value);
            toast('Bem-vindo!');
          }
          nuvemState.checked = false; render();
        } catch (err) { toast(err.message); b.disabled = false; b.innerHTML = old; }
      };
      f.onsubmit = e => { e.preventDefault(); go2('entrar'); };
      $('[data-modo="criar"]', f).onclick = () => go2('criar');
    }
  });

  views.ia = () => {
    const key = iaKey();
    const models = store.get(MODELS_KEY, []);
    return {
      tab: 'mais',
      html: `${topbar('Cifras com IA')}
      <div class="oe-get">
        <b>${key ? 'IA ativada neste aparelho' : 'Cifra automática com o Gemini (grátis)'}</b>
        <p class="ia-p">Ao abrir a aba <em>Cifra</em> de uma música sem cifra, o app pede ao Gemini (IA do Google) os acordes e monta a cifra na letra. Ela fica salva no aparelho, com troca de tom, desenhos dos acordes e PPT.</p>
        ${key ? `<p class="ia-p">Modelo em uso: <em>${esc(models[0] || 'escolhido no primeiro uso')}</em></p>` : `
        <ol>
          <li>Abra o <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a> e entre com sua conta Google.</li>
          <li>Toque em <em>Criar chave de API</em> (Create API key) e copie a chave.</li>
          <li>Cole abaixo e toque em <em>Salvar e testar</em>.</li>
        </ol>`}
      </div>
      <form class="form" id="f" style="margin-top:12px">
        <div class="field"><label for="k">Chave do Gemini</label>
          <input id="k" name="key" type="password" autocomplete="off" spellcheck="false" placeholder="AQ.… ou AIza…" value="${esc(key)}">
          <p class="help">A chave fica guardada só neste aparelho. Ao gerar uma cifra, a letra da música é enviada ao Google. No plano grátis há limite de pedidos por minuto e por dia.</p></div>
        <button class="btn gold block">${ic('check')} Salvar e testar</button>
        <label class="tg" style="color:var(--text)"><span>Gerar sozinha ao abrir a aba Cifra<small style="color:var(--muted)">Desligado: aparece um botão para gerar</small></span>
          <span class="switch"><input type="checkbox" data-act="iaauto" ${settings().iaAuto !== false ? 'checked' : ''}><span></span></span></label>
        ${key ? `<button type="button" class="btn small danger block" data-act="iadel">${ic('trash', 'sm')} Remover a chave deste aparelho</button>` : ''}
      </form>`,
      after(el) {
        const f = $('#f', el);
        f.onsubmit = async e => {
          e.preventDefault();
          // aceita "AIza…" (antigo) e "AQ.…" (novo); se colarem a linha inteira do AI Studio, pega só a chave
          const k = (f.key.value.match(/\b(AIza[\w-]{20,}|AQ\.[\w.-]{20,})/) || f.key.value.trim().match(/^[\w.-]{20,}$/) || [''])[0];
          if (!k) return toast('Cole a chave inteira (começa com "AIza…" ou "AQ.…")');
          f.key.value = k;
          const btn = $('button.gold', f), old = btn.innerHTML;
          btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Testando…';
          try {
            store.set('geminiKey', k);
            const list = await gemModels(k, true);
            toast('IA pronta! Modelo: ' + list[0]);
            render();
          } catch (err) {
            store.set('geminiKey', '');
            toast(err.message || 'Não consegui usar essa chave');
            btn.disabled = false; btn.innerHTML = old;
          }
        };
        $('[data-act="iaauto"]', el).onchange = e => setSettings({ iaAuto: e.target.checked });
        const del = $('[data-act="iadel"]', el);
        if (del) del.onclick = () => { store.set('geminiKey', ''); store.set(MODELS_KEY, null); toast('Chave removida'); render(); };
      }
    };
  };

  views.mais = () => {
    const n = userSongs().length;
    return {
      tab: 'mais',
      html: `${topbar('Mais', { back: false })}
      <div class="menu">
        <a href="#/nova">${ic('plus')}<span>Adicionar música<small>Cadastre os cantos da sua comunidade</small></span>${ic('chev', 'sm')}</a>
        <a href="#/minhas">${ic('folder')}<span>Minhas músicas<small>${n} ${n === 1 ? 'cadastrada' : 'cadastradas'} neste aparelho</small></span>${ic('chev', 'sm')}</a>
        <a href="#/colar">${ic('paste')}<span>Colar letra e gerar PPT</span>${ic('chev', 'sm')}</a>
        <a href="#/ppts">${ic('slides')}<span>Meus PPTs<small>Biblioteca de apresentações prontas</small></span>${ic('chev', 'sm')}</a>
        <a href="#/nuvem">${ic('upload')}<span>Biblioteca online<small>Entrar para dividir os PPTs entre os membros</small></span>${ic('chev', 'sm')}</a>
        <a href="#/ia">${ic('music')}<span>Cifras com IA (Gemini)<small>${iaKey() ? 'Ativada neste aparelho' : 'Grátis: a cifra aparece sozinha'}</small></span>${ic('chev', 'sm')}</a>
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
    // saindo do editor: desliga atalhos e volta a mostrar a barra do app
    if (editorAberto) { editorAberto.destroy(); editorAberto = null; }
    document.body.classList.remove('e2-mode');
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

  window.addEventListener('hashchange', e => {
    // sair do editor com alterações não salvas: pergunta antes
    if (editorAberto && editorAberto.sujo && !/#\/editor\//.test(location.hash) && !confirm('Sair do editor sem salvar as alterações?')) {
      history.pushState(null, '', e.oldURL.slice(e.oldURL.indexOf('#')));
      return;
    }
    render();
  });
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
