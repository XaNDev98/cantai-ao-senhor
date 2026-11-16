/*
 * Núcleo: leitura de cifras, transposição, montagem dos slides,
 * fundos (canvas) e exportação para .pptx (PptxGenJS, carregado sob demanda).
 */
(function () {
  'use strict';

  /* ---------------- acordes ---------------- */
  const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const IDX = { C: 0, 'B#': 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, Fb: 4, F: 5, 'E#': 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11, Cb: 11 };
  const FLAT_MAJOR = new Set([5, 10, 3, 8, 1, 6]);   // F Bb Eb Ab Db Gb
  const FLAT_MINOR = new Set([2, 7, 0, 5, 10, 3]);   // Dm Gm Cm Fm Bbm Ebm

  // Acorde "isolado" (para reconhecer linhas de cifra coladas de sites).
  const CHORD_RE = /^[A-G][#b]?(?:maj|min|m|M|dim|aug|sus|add|º|°|\+)?[0-9]{0,2}(?:M|maj|sus|add|dim)?[0-9]{0,2}(?:\([^)\s]{1,8}\))?(?:\/[A-G][#b]?)?$/;

  function shiftNote(n, st, flat) {
    const i = IDX[n];
    if (i == null) return n;
    return (flat ? FLAT : SHARP)[((i + st) % 12 + 12) % 12];
  }

  /** Decide se o tom resultante usa bemóis. */
  function useFlats(tom, st) {
    const m = String(tom || '').match(/^([A-G][#b]?)(m(?!aj))?/);
    if (!m) return false;
    const i = ((IDX[m[1]] + st) % 12 + 12) % 12;
    return m[2] ? FLAT_MINOR.has(i) : FLAT_MAJOR.has(i);
  }

  function transposeChord(ch, st, flat) {
    if (!st) return ch;
    return ch.replace(/^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/, (_, r, q, b) =>
      shiftNote(r, st, flat) + q + (b ? '/' + shiftNote(b, st, flat) : ''));
  }

  function transposeKey(tom, st) {
    if (!tom) return '';
    const m = tom.match(/^([A-G][#b]?)(.*)$/);
    if (!m) return tom;
    return shiftNote(m[1], st, useFlats(tom, st)) + m[2];
  }

  /* ------------- texto colado no formato "acorde acima da letra" ------------- */
  function isChordLine(line) {
    const toks = line.trim().split(/\s+/).filter(t => t && !/^[|\-–%]+$/.test(t) && !/^\(?\d+x\)?$/i.test(t));
    if (!toks.length) return false;
    return toks.every(t => CHORD_RE.test(t.replace(/^\(|\)$/g, '')));
  }

  function inlineChords(chordLine) {
    return chordLine.trim().split(/\s+/).map(t => CHORD_RE.test(t.replace(/^\(|\)$/g, '')) ? `[${t.replace(/^\(|\)$/g, '')}]` : t).join(' ');
  }

  function mergeChordLine(chordLine, lyric) {
    const marks = [];
    chordLine.replace(/\S+/g, (tok, pos) => { marks.push({ tok, pos }); return tok; });
    let out = lyric;
    const maxPos = marks.length ? marks[marks.length - 1].pos : 0;
    if (out.length < maxPos) out = out.padEnd(maxPos, ' ');
    for (let k = marks.length - 1; k >= 0; k--) {
      const { tok, pos } = marks[k];
      const c = tok.replace(/^\(|\)$/g, '');
      if (!CHORD_RE.test(c)) continue;
      out = out.slice(0, pos) + `[${c}]` + out.slice(pos);
    }
    return out.replace(/\s+$/, '').replace(/^\s+/, '');
  }

  const LABEL_RE = /^\[?\s*((?:refr[aã]o|estrofe|verso|coro|ponte|final|intro(?:du[cç][aã]o)?|solo|pr[eé]-?refr[aã]o|ant[ií]fona|resposta|parte)(?:\s*\d+)?)\s*\]?\s*:?\s*(.*)$/i;

  function labelOf(t) {
    if (t.startsWith('@')) return { label: t.slice(1).trim(), rest: '' };
    const m = t.match(LABEL_RE);
    if (!m) return null;
    // "[Intro] G D Em" -> rótulo + linha de acordes
    if (m[2] && !isChordLine(m[2])) return null;
    const label = m[1].charAt(0).toUpperCase() + m[1].slice(1);
    return { label, rest: m[2] || '' };
  }

  /** Converte texto colado (cifra "acima da letra") para o formato com [acordes]. */
  function normalizeSheet(raw) {
    const lines = String(raw || '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (/\[[^\]]+\]/.test(l) && !LABEL_RE.test(l.trim())) { out.push(l); continue; }
      const t = l.trim();
      if (t && !t.startsWith('@') && isChordLine(l)) {
        const next = lines[i + 1];
        if (next != null && next.trim() && !isChordLine(next) && !labelOf(next.trim())) {
          out.push(mergeChordLine(l, next));
          i++;
        } else {
          out.push(inlineChords(l));
        }
        continue;
      }
      out.push(l);
    }
    return out.join('\n');
  }

  function kindOf(label) {
    if (/refr|coro|ant[ií]fona|resposta/i.test(label) && !/pr[eé]-?refr/i.test(label)) return 'refrao';
    if (/^(intro|solo)/i.test(label)) return 'instrumental';
    return 'estrofe';
  }

  const cache = new Map();
  /** Divide a música em partes: [{label, kind, lines: ["[G]texto..."]}] */
  function parseSong(raw) {
    if (cache.has(raw)) return cache.get(raw);
    const text = normalizeSheet(raw);
    const sections = [];
    let cur = null;
    const close = () => { if (cur && cur.lines.length) { sections.push(cur); cur = null; } };
    for (const line of text.split('\n')) {
      const t = line.trim();
      if (!t) { close(); continue; }
      const lab = labelOf(t);
      if (lab) {
        close();
        cur = { label: lab.label, kind: kindOf(lab.label), lines: [] };
        if (lab.rest) cur.lines.push(inlineChords(lab.rest));
        continue;
      }
      if (!cur) cur = { label: '', kind: 'estrofe', lines: [] };
      cur.lines.push(t);
    }
    close();
    cache.set(raw, sections);
    return sections;
  }

  const stripChords = l => l.replace(/\[[^\]]*\]/g, '').replace(/\s{2,}/g, ' ').trim();
  const hasChords = raw => /\[[A-G][^\]]*\]/.test(normalizeSheet(raw));
  function firstChord(raw) {
    const m = normalizeSheet(raw).match(/\[([A-G][#b]?m?)[^\]]*\]/);
    return m ? m[1] : '';
  }

  /* ---------------- montagem dos slides ---------------- */
  /**
   * opts: { linhas, repetir, titulo, maiusc, rodape, rotulo }
   * Retorna [{type:'title', title, sub} | {type:'text', lines, label, foot}]
   */
  function buildSlides(song, opts, extra = {}) {
    const o = Object.assign({ linhas: 4, repetir: true, titulo: true, maiusc: false, rodape: true, rotulo: true }, opts);
    const secs = parseSong(song.texto)
      .filter(s => s.kind !== 'instrumental')
      .map(s => ({ ...s, text: s.lines.map(stripChords).filter(Boolean) }))
      .filter(s => s.text.length);

    // ordem de canto: repete o refrão depois de cada estrofe (quando não vier escrito)
    let order = secs;
    const refrao = secs.find(s => s.kind === 'refrao');
    if (o.repetir && refrao) {
      order = [];
      secs.forEach((s, i) => {
        order.push(s);
        const next = secs[i + 1];
        if (s.kind !== 'refrao' && (!next || next.kind !== 'refrao')) order.push(refrao);
      });
    }

    const slides = [];
    if (o.titulo) slides.push({ type: 'title', title: song.titulo, sub: extra.momento || song.autor || '' });
    const max = Math.max(2, o.linhas | 0);
    for (const s of order) {
      const n = s.text.length;
      const parts = Math.ceil(n / max);
      const per = Math.ceil(n / parts);
      for (let p = 0; p < parts; p++) {
        let lines = s.text.slice(p * per, (p + 1) * per);
        if (o.maiusc) lines = lines.map(l => l.toLocaleUpperCase('pt-BR'));
        slides.push({ type: 'text', lines, label: o.rotulo && s.kind === 'refrao' ? 'Refrão' : '', foot: o.rodape ? song.titulo : '' });
      }
    }
    return slides;
  }

  /** Tamanho da letra (pt) para caber na área útil de um slide 13,33 x 7,5 pol. */
  function fitSize(lines, upper) {
    const maxLen = Math.max(8, ...lines.map(l => l.length));
    const charW = upper ? 0.6 : 0.5;
    const byW = 860 / (maxLen * charW);
    const byH = 400 / (lines.length * 1.24);
    return Math.max(20, Math.min(54, Math.floor(Math.min(byW, byH))));
  }

  /* ---------------- temas e fundos ---------------- */
  const THEMES = {
    noite: { nome: 'Noite', grupo: 'fundo', top: '#12224a', bot: '#050a18', glow: [214, 178, 110], text: '#FFFFFF', title: '#E9CB8A', accent: '#D6B26E' },
    comum: { nome: 'Tempo Comum', grupo: 'fundo', top: '#134232', bot: '#04130d', glow: [214, 190, 120], text: '#FFFFFF', title: '#E5CD8E', accent: '#CDB577' },
    roxo: { nome: 'Advento · Quaresma', grupo: 'fundo', top: '#33195a', bot: '#0c0617', glow: [205, 170, 120], text: '#FFFFFF', title: '#E3C98F', accent: '#C9A86E' },
    festa: { nome: 'Natal · Páscoa', grupo: 'fundo', top: '#fffaf0', bot: '#efe1c0', glow: [214, 168, 80], text: '#2A2216', title: '#8E6114', accent: '#B8892E', light: true },
    vermelho: { nome: 'Pentecostes', grupo: 'fundo', top: '#5a1420', bot: '#160408', glow: [240, 180, 110], text: '#FFFFFF', title: '#F0CC8A', accent: '#D8A866' },
    aurora: { nome: 'Aurora', grupo: 'fundo', aurora: true, text: '#FFFFFF', title: '#F6D693', accent: '#F0C477', shadow: true },
    preto: { nome: 'Preto', grupo: 'simples', solid: '#000000', text: '#FFFFFF', title: '#FFFFFF', accent: '#BBBBBB' },
    branco: { nome: 'Branco', grupo: 'simples', solid: '#FFFFFF', text: '#111111', title: '#111111', accent: '#666666', light: true },
    azul: { nome: 'Azul', grupo: 'simples', solid: '#0B1630', text: '#FFFFFF', title: '#E9CB8A', accent: '#D6B26E' },
    custom: { nome: 'Minha imagem', grupo: 'custom', text: '#FFFFFF', title: '#FFE3A6', accent: '#F2D08B', shadow: true }
  };

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function drawCross(ctx, cx, cy, h, color) {
    const w = h * 0.09, arm = h * 0.56, ay = cy - h * 0.22;
    ctx.fillStyle = color;
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
    ctx.fillRect(cx - arm / 2, ay - w / 2, arm, w);
  }

  function drawAurora(ctx, W, H) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0f1a3a'); sky.addColorStop(0.45, '#3b3460'); sky.addColorStop(0.72, '#b8673f'); sky.addColorStop(0.86, '#f0b25e'); sky.addColorStop(1, '#f7cf7f');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    const sx = W * 0.7, sy = H * 0.8;
    // raios
    ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = '#fff4d0';
    for (let a = -170; a <= -10; a += 13) {
      const r = (a * Math.PI) / 180, r2 = ((a + 4) * Math.PI) / 180, L = W * 1.2;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(r) * L, sy + Math.sin(r) * L); ctx.lineTo(sx + Math.cos(r2) * L, sy + Math.sin(r2) * L); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, H * 0.55);
    sun.addColorStop(0, 'rgba(255,248,220,1)'); sun.addColorStop(0.12, 'rgba(255,220,150,.85)'); sun.addColorStop(1, 'rgba(255,180,90,0)');
    ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H);
    // colinas
    ctx.fillStyle = '#1a1420';
    ctx.beginPath(); ctx.moveTo(0, H * 0.86);
    ctx.bezierCurveTo(W * 0.2, H * 0.76, W * 0.42, H * 0.82, W * 0.58, H * 0.8);
    ctx.bezierCurveTo(W * 0.72, H * 0.78, W * 0.86, H * 0.8, W, H * 0.84);
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    ctx.fillStyle = '#0d0b14';
    ctx.beginPath(); ctx.moveTo(0, H * 0.93); ctx.bezierCurveTo(W * 0.3, H * 0.86, W * 0.6, H * 0.94, W, H * 0.9); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    drawCross(ctx, sx, H * 0.66, H * 0.3, '#120e16');
    // véu escuro para legibilidade
    const veil = ctx.createLinearGradient(0, 0, 0, H);
    veil.addColorStop(0, 'rgba(6,10,24,.55)'); veil.addColorStop(0.7, 'rgba(6,10,24,.38)'); veil.addColorStop(1, 'rgba(6,10,24,.15)');
    ctx.fillStyle = veil; ctx.fillRect(0, 0, W, H);
  }

  /** Desenha o fundo de um tema no canvas. custom = {img, escurecer} */
  function drawBackground(canvas, themeId, custom) {
    const t = THEMES[themeId] || THEMES.noite;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    if (t.solid) { ctx.fillStyle = t.solid; ctx.fillRect(0, 0, W, H); return; }
    if (themeId === 'custom') {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      if (custom && custom.img) {
        const img = custom.img, s = Math.max(W / img.width, H / img.height);
        const w = img.width * s, h = img.height * s;
        ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      }
      ctx.fillStyle = `rgba(0,0,0,${custom && custom.escurecer != null ? custom.escurecer : 0.5})`;
      ctx.fillRect(0, 0, W, H);
      return;
    }
    if (t.aurora) { drawAurora(ctx, W, H); return; }
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, t.top); g.addColorStop(1, t.bot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, -H * 0.1, 0, W / 2, -H * 0.1, H * 1.05);
    glow.addColorStop(0, rgba(t.glow, t.light ? 0.38 : 0.26)); glow.addColorStop(1, rgba(t.glow, 0));
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    if (!t.light) {
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, W * 0.75);
      vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.45)');
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
    }
    // moldura fina e pequena cruz
    const u = W / 1920;
    ctx.strokeStyle = rgba(t.glow, t.light ? 0.5 : 0.28); ctx.lineWidth = 2 * u;
    ctx.strokeRect(36 * u, 36 * u, W - 72 * u, H - 72 * u);
    ctx.globalAlpha = t.light ? 0.55 : 0.4;
    drawCross(ctx, W / 2, H - 70 * u, 44 * u, t.accent);
    ctx.globalAlpha = 1;
  }

  const bgCache = new Map();
  function backgroundURL(themeId, custom, w = 1920, type = 'image/jpeg') {
    const key = [themeId, w, type, custom && custom.src, custom && custom.escurecer].join('|');
    if (bgCache.has(key)) return bgCache.get(key);
    const c = document.createElement('canvas');
    c.width = w; c.height = Math.round(w * 9 / 16);
    drawBackground(c, themeId, custom);
    const url = c.toDataURL(type, 0.86);
    bgCache.set(key, url);
    return url;
  }

  /* ---------------- PPTX ---------------- */
  let libPromise = null;
  function loadLib() {
    if (window.PptxGenJS) return Promise.resolve(window.PptxGenJS);
    if (!libPromise) {
      libPromise = new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'vendor/pptxgen.bundle.js';
        s.onload = () => res(window.PptxGenJS);
        s.onerror = () => { libPromise = null; rej(new Error('Não foi possível carregar o gerador de PPT.')); };
        document.head.appendChild(s);
      });
    }
    return libPromise;
  }

  const hex = c => c.replace('#', '').toUpperCase();

  /**
   * deck: [{song, momento}] ; opts: opções + tema + custom
   * Retorna { pptx, fileName }
   */
  async function makePptx(deck, opts, title) {
    const PptxGenJS = await loadLib();
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE'; // 13,33 x 7,5 pol
    pptx.title = title;
    pptx.author = 'Cantai ao Senhor';
    const t = THEMES[opts.tema] || THEMES.noite;
    const bg = t.solid ? { color: hex(t.solid) } : { data: backgroundURL(opts.tema, opts.custom) };
    const shadow = t.shadow ? { type: 'outer', blur: 8, offset: 2, angle: 90, color: '000000', opacity: 0.6 } : undefined;

    for (const item of deck) {
      for (const s of buildSlides(item.song, opts, { momento: item.momento })) {
        const slide = pptx.addSlide();
        slide.background = bg;
        if (s.type === 'title') {
          const size = s.title.length > 34 ? 44 : 54;
          slide.addText(s.title, { x: 0.8, y: 2.0, w: 11.73, h: 2.2, align: 'center', valign: 'bottom', fontFace: 'Georgia', fontSize: size, bold: true, color: hex(t.title), shadow });
          slide.addShape(pptx.shapes.LINE, { x: 5.97, y: 4.45, w: 1.4, h: 0, line: { color: hex(t.accent), width: 1.5 } });
          if (s.sub) slide.addText(s.sub, { x: 0.8, y: 4.65, w: 11.73, h: 0.8, align: 'center', valign: 'top', fontFace: 'Georgia', fontSize: 22, italic: true, color: hex(t.text), shadow });
        } else {
          const size = fitSize(s.lines, opts.maiusc);
          if (s.label) slide.addText(s.label.toUpperCase(), { x: 0.5, y: 0.35, w: 12.33, h: 0.5, align: 'center', fontFace: 'Calibri', fontSize: 14, bold: true, charSpacing: 6, color: hex(t.accent) });
          slide.addText(s.lines.map((l, i) => ({ text: l, options: { breakLine: i < s.lines.length - 1 } })), {
            x: 0.6, y: 0.85, w: 12.13, h: 5.75, align: 'center', valign: 'middle',
            fontFace: 'Calibri', fontSize: size, bold: true, color: hex(t.text), lineSpacingMultiple: 1.08, shadow
          });
          if (s.foot) slide.addText(s.foot, { x: 0.5, y: 6.8, w: 12.33, h: 0.4, align: 'center', fontFace: 'Calibri', fontSize: 12, color: hex(t.accent), transparency: 20 });
        }
      }
    }
    const fileName = slug(title || 'slides') + '.pptx';
    return { pptx, fileName };
  }

  function slug(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase().slice(0, 60) || 'slides';
  }

  window.Cantai = {
    THEMES, parseSong, normalizeSheet, stripChords, hasChords, firstChord,
    transposeChord, transposeKey, useFlats, isChordLine,
    buildSlides, fitSize, backgroundURL, makePptx, loadLib, slug
  };
})();
