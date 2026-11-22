/*
 * Editor de PowerPoint do Cantai ao Senhor.
 *
 * Leitura do .pptx: pptxtojson (MIT, github.com/pipipi-pikachu/pptxtojson) para
 * posições, textos e estilos + fflate (MIT) para descompactar as imagens rápido.
 * Geração do .pptx: PptxGenJS (MIT).
 *
 * deck = { v: 2, h: 540, imgs: { chave: Blob }, slides: [ { bg, objs: [obj] } ] }
 *   medidas em pt; largura fixa 960 pt (16:9 → h = 540)
 *   bg  = { tipo: 'cor'|'imagem'|'tema'|'gradiente', cor, img, tema, escurecer, ang, cores }
 *   obj = { id, tipo: 'texto'|'forma'|'imagem', x, y, w, h, rot, lock,
 *           html, vAlign: 'top'|'middle'|'bottom', fill, borda: {cor, larg},
 *           forma, path, vb, img, flipH, flipV }
 */
(function () {
  'use strict';
  const C = window.Cantai;
  const W = 960;                                   // largura do slide em pt
  const FONTES = ['Calibri', 'Arial', 'Georgia', 'Verdana', 'Trebuchet MS', 'Times New Roman', 'Segoe UI', 'Tahoma', 'Impact', 'Comic Sans MS'];
  const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp', webp: 'image/webp', svg: 'image/svg+xml' };
  const uid = () => 'o' + Math.random().toString(36).slice(2, 9);
  const clone = o => JSON.parse(JSON.stringify(o));

  /* ---------- carregamento das bibliotecas (só quando o editor abre) ---------- */
  const scripts = {};
  function loadScript(src) {
    if (!scripts[src]) scripts[src] = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res;
      s.onerror = () => { delete scripts[src]; rej(new Error('Não foi possível carregar o editor. Verifique a internet.')); };
      document.head.appendChild(s);
    });
    return scripts[src];
  }
  const loadLibs = () => Promise.all([
    window.pptxtojson ? 0 : loadScript('vendor/pptxtojson.js'),
    window.fflate ? 0 : loadScript('vendor/fflate.js')
  ]);

  /* ---------- cores ---------- */
  function toHex(c, fallback = '#000000') {
    if (!c) return fallback;
    c = String(c).trim();
    if (/^#[0-9a-f]{6}$/i.test(c)) return c.toUpperCase();
    if (/^#[0-9a-f]{3}$/i.test(c)) return ('#' + c.slice(1).split('').map(x => x + x).join('')).toUpperCase();
    const m = c.match(/rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/i);
    if (m) return '#' + [m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2, '0')).join('').toUpperCase();
    return fallback;
  }
  const luz = hex => { const h = toHex(hex).slice(1); const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); return 0.299 * r + 0.587 * g + 0.114 * b; };

  /* ---------- importar .pptx ---------- */
  async function fromPptx(blob) {
    await loadLibs();
    const u8 = new Uint8Array(await blob.arrayBuffer());
    const j = await window.pptxtojson.parse(u8.slice().buffer, { imageMode: 'none', videoMode: 'none', audioMode: 'none' });
    const media = await new Promise((res, rej) => window.fflate.unzip(u8, { filter: f => f.name.startsWith('ppt/media/') }, (e, d) => e ? rej(e) : res(d)));
    const imgs = {}, porRef = {}, porHash = new Map();
    async function keyOf(ref) {
      if (!ref) return null;
      ref = String(ref).replace(/^\//, '');
      if (ref in porRef) return porRef[ref];
      const d = media[ref], ext = (ref.split('.').pop() || '').toLowerCase();
      if (!d || !MIME[ext]) return (porRef[ref] = null);
      const h = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', d))).slice(0, 10).map(b => b.toString(16).padStart(2, '0')).join('');
      if (!porHash.has(h)) { const k = 'm' + porHash.size; porHash.set(h, k); imgs[k] = new Blob([d], { type: MIME[ext] }); }
      return (porRef[ref] = porHash.get(h));
    }
    const k = W / ((j.size && j.size.width) || W);
    const H = Math.round(((j.size && j.size.height) || 540) * k);
    const sc = v => Math.round((+v || 0) * k * 100) / 100;
    const scaleHtml = html => k === 1 ? html : String(html || '').replace(/font-size:\s*([\d.]+)pt/g, (_, n) => `font-size: ${Math.round(+n * k * 10) / 10}pt`);
    const vmap = v => v === 'up' || v === 'top' ? 'top' : v === 'down' || v === 'bottom' ? 'bottom' : 'middle';
    const fillCor = f => f && f.type === 'color' && f.value ? toHex(f.value) : null;
    const borda = el => el.borderWidth > 0 && el.borderColor ? { cor: toHex(el.borderColor), larg: sc(el.borderWidth) } : null;
    let ignorados = 0;

    async function conv(el, dx, dy, lock, out) {
      const base = { id: uid(), x: sc(el.left + dx), y: sc(el.top + dy), w: sc(el.width), h: sc(el.height), rot: +el.rotate || 0, lock: !!lock };
      if (el.isFlipH) base.flipH = true;
      if (el.isFlipV) base.flipV = true;
      switch (el.type) {
        case 'group':
          for (const c of el.elements || []) await conv(c, dx + (+el.left || 0), dy + (+el.top || 0), lock, out);
          return;
        case 'text':
          out.push({ ...base, tipo: 'texto', html: scaleHtml(el.content), vAlign: vmap(el.vAlign), fill: fillCor(el.fill), borda: borda(el) });
          return;
        case 'shape':
          out.push({ ...base, tipo: 'forma', forma: el.shapType || 'rect', path: el.path || '', vb: el.pathViewBox || null,
            html: scaleHtml(el.content), vAlign: vmap(el.vAlign), fill: fillCor(el.fill), borda: borda(el) });
          return;
        case 'image': {
          const key = await keyOf(el.ref || (el.src && !String(el.src).startsWith('data:') ? el.src : null));
          if (key) out.push({ ...base, tipo: 'imagem', img: key }); else ignorados++;
          return;
        }
        default: ignorados++;
      }
    }
    async function bgOf(fill) {
      if (fill && fill.type === 'color' && fill.value) return { tipo: 'cor', cor: toHex(fill.value, '#FFFFFF') };
      if (fill && fill.type === 'image') {
        const key = await keyOf(fill.value && fill.value.ref);
        if (key) return { tipo: 'imagem', img: key, escurecer: 0 };
      }
      if (fill && fill.type === 'gradient' && fill.value) {
        const g = fill.value;
        const cores = (g.colors || []).map(c => ({ pos: parseFloat(c.pos) || 0, cor: toHex(c.color, '#FFFFFF') }));
        if (cores.length >= 2) return { tipo: 'gradiente', ang: +g.rot || 0, cores };
        if (cores.length === 1) return { tipo: 'cor', cor: cores[0].cor };
      }
      return { tipo: 'cor', cor: '#FFFFFF' };
    }
    const slides = [];
    for (const s of j.slides || []) {
      const objs = [];
      for (const el of s.layoutElements || []) await conv(el, 0, 0, true, objs);
      for (const el of s.elements || []) await conv(el, 0, 0, false, objs);
      const bg = await bgOf(s.fill);
      slides.push({ bg, bgOrig: clone(bg), objs });
    }
    if (!slides.length) slides.push(slideEmBranco());
    return { deck: { v: 2, h: H, imgs, slides }, ignorados };
  }

  /* ---------- novos objetos ---------- */
  const span = (txt, pt, cor, extra = '') => `<span style="font-family: Calibri;font-size: ${pt}pt;color: ${cor};${extra}">${txt}</span>`;
  function novoTexto(texto, { pt = 40, cor = '#FFFFFF', x = 80, y = 170, w = 800, h = 200, negrito = true } = {}) {
    const html = String(texto).split('\n').map(l => `<p style="text-align: center;">${span(escHtml(l) || '&nbsp;', pt, cor, negrito ? 'font-weight: bold;' : '')}</p>`).join('');
    return { id: uid(), tipo: 'texto', x, y, w, h, rot: 0, lock: false, html, vAlign: 'middle', fill: null, borda: null };
  }
  function slideEmBranco(base) {
    const bg = base ? clone(base.bg) : { tipo: 'tema', tema: 'noite', escurecer: 0 };
    const cor = corTextoPara(bg);
    return { bg, objs: [novoTexto('Clique duas vezes para escrever', { cor })] };
  }
  function corTextoPara(bg) {
    if (!bg) return '#FFFFFF';
    if (bg.tipo === 'cor') return luz(bg.cor) > 150 ? '#1F1A12' : '#FFFFFF';
    if (bg.tipo === 'tema') { const t = C.THEMES[bg.tema]; return t && t.light ? '#1F1A12' : '#FFFFFF'; }
    if (bg.tipo === 'gradiente') return luz(bg.cores[0].cor) > 150 ? '#1F1A12' : '#FFFFFF';
    return '#FFFFFF';
  }
  const escHtml = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- desenho dos slides (DOM em pt; a tela aplica escala) ---------- */
  const blobUrls = new WeakMap();
  const urlDe = (deck, key) => {
    const b = deck.imgs && deck.imgs[key];
    if (!b) return '';
    if (!blobUrls.has(b)) blobUrls.set(b, URL.createObjectURL(b));
    return blobUrls.get(b);
  };
  function bgCSS(bg, deck, larg = 960) {
    if (!bg) return 'background:#FFFFFF';
    if (bg.tipo === 'cor') return `background:${bg.cor}`;
    if (bg.tipo === 'gradiente') return `background:linear-gradient(${(bg.ang || 0) + 90}deg,${bg.cores.map(c => `${c.cor} ${c.pos}%`).join(',')})`;
    if (bg.tipo === 'tema') {
      const t = C.THEMES[bg.tema] || C.THEMES.noite;
      return t.solid ? `background:${t.solid}` : `background:url(${C.backgroundURL(bg.tema, null, larg)}) center/cover no-repeat`;
    }
    const e = +bg.escurecer || 0;
    const dark = e > 0 ? `linear-gradient(rgba(0,0,0,${e}),rgba(0,0,0,${e})),` : '';
    return `background:${dark}url(${urlDe(deck, bg.img)}) center/cover no-repeat`;
  }
  function objHTML(o, deck) {
    const tf = [o.rot ? `rotate(${o.rot}deg)` : '', o.flipH ? 'scaleX(-1)' : '', o.flipV ? 'scaleY(-1)' : ''].filter(Boolean).join(' ');
    const st = `left:${o.x}pt;top:${o.y}pt;width:${o.w}pt;height:${o.h}pt;${tf ? `transform:${tf};` : ''}`;
    const cls = `e2-o e2-${o.tipo}${o.lock ? ' e2-lock' : ''}`;
    if (o.tipo === 'imagem') return `<div class="${cls}" data-id="${o.id}" style="${st}"><img src="${urlDe(deck, o.img)}" alt="" draggable="false"></div>`;
    let fundo = '';
    if (o.tipo === 'forma' && o.path && o.vb) {
      const vb = o.vb;
      fundo = `<svg class="e2-svg" viewBox="${vb.x || 0} ${vb.y || 0} ${vb.width} ${vb.height}" preserveAspectRatio="none"><path d="${o.path}" fill="${o.fill || 'none'}" ${o.borda ? `stroke="${o.borda.cor}" stroke-width="${o.borda.larg}"` : ''} vector-effect="non-scaling-stroke"/></svg>`;
    }
    const caixa = o.tipo === 'forma' && !(o.path && o.vb)
      ? `background:${o.fill || 'transparent'};${o.borda ? `border:${o.borda.larg}pt solid ${o.borda.cor};` : ''}${o.forma === 'ellipse' ? 'border-radius:50%;' : o.forma === 'roundRect' ? 'border-radius:12pt;' : ''}`
      : o.tipo === 'texto' ? `${o.fill ? `background:${o.fill};` : ''}${o.borda ? `border:${o.borda.larg}pt solid ${o.borda.cor};` : ''}` : '';
    return `<div class="${cls}" data-id="${o.id}" style="${st}${caixa}">${fundo}<div class="e2-txt" style="justify-content:${o.vAlign === 'top' ? 'flex-start' : o.vAlign === 'bottom' ? 'flex-end' : 'center'}">${o.html || ''}</div></div>`;
  }
  function slideHTML(slide, deck, larg) {
    return `<div class="e2-slide" style="height:${deck.h || 540}pt;${bgCSS(slide.bg, deck, larg)}">${slide.objs.map(o => objHTML(o, deck)).join('')}</div>`;
  }

  /* ---------- texto rico: HTML → trechos do PptxGenJS ---------- */
  function estiloDe(node, base) {
    const s = { ...base };
    const tag = node.tagName;
    if (tag === 'B' || tag === 'STRONG') s.bold = true;
    if (tag === 'I' || tag === 'EM') s.italic = true;
    if (tag === 'U') s.underline = true;
    if (tag === 'FONT') {
      if (node.getAttribute('face')) s.fontFace = node.getAttribute('face');
      if (node.getAttribute('color')) s.color = toHex(node.getAttribute('color'));
    }
    const st = node.style;
    if (st) {
      if (st.fontWeight) s.bold = st.fontWeight === 'bold' || +st.fontWeight >= 600;
      if (st.fontStyle) s.italic = st.fontStyle === 'italic';
      if (st.textDecoration || st.textDecorationLine) s.underline = /underline/.test(st.textDecoration + ' ' + st.textDecorationLine);
      if (st.color) s.color = toHex(st.color, s.color);
      if (st.fontFamily) s.fontFace = st.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      if (st.fontSize) {
        const m = st.fontSize.match(/([\d.]+)(pt|px)/);
        if (m) s.fontSize = m[2] === 'px' ? +m[1] * 0.75 : +m[1];
      }
    }
    return s;
  }
  function htmlToRuns(html, padrao) {
    const doc = new DOMParser().parseFromString(`<div>${html || ''}</div>`, 'text/html');
    const paras = [];
    let para = null;
    const novo = al => { para = { align: al, runs: [] }; paras.push(para); };
    const BLOCO = /^(P|DIV|LI|H[1-6])$/;
    (function walk(node, st, al) {
      if (node.nodeType === 3) {
        const t = node.nodeValue.replace(/[\n\r\t]+/g, ' ').replace(/ /g, ' ');
        if (!t) return;
        if (!para) novo(al);
        para.runs.push({ text: t, st });
        return;
      }
      if (node.nodeType !== 1) return;
      if (node.tagName === 'BR') { if (!para) novo(al); para.runs.push({ text: '', st, quebra: true }); return; }
      const s2 = estiloDe(node, st);
      const a2 = (node.style && node.style.textAlign) || al;
      // só vira parágrafo o bloco que não tem outros blocos dentro
      const bloco = BLOCO.test(node.tagName) && ![...node.children].some(c => BLOCO.test(c.tagName));
      if (bloco) novo(a2);
      node.childNodes.forEach(c => walk(c, s2, a2));
      if (bloco) para = null;
    })(doc.body.firstChild, { ...padrao }, 'left');
    // tira parágrafos totalmente vazios das pontas (sobras de marcação)
    while (paras.length > 1 && !paras[0].runs.length) paras.shift();
    while (paras.length > 1 && !paras[paras.length - 1].runs.length) paras.pop();
    const out = [];
    paras.forEach((p, i) => {
      const align = { start: 'left', end: 'right', justify: 'justify' }[p.align] || p.align || 'left';
      const runs = p.runs.length ? p.runs : [{ text: '', st: padrao }];
      runs.forEach((r, j) => {
        const st = r.st || padrao;
        const ultimo = j === runs.length - 1;
        out.push({
          text: r.quebra ? '' : r.text,
          options: {
            fontFace: st.fontFace || 'Calibri', fontSize: Math.max(6, Math.round((st.fontSize || 18) * 10) / 10),
            color: toHex(st.color || '#000000').slice(1), bold: !!st.bold, italic: !!st.italic, underline: st.underline ? { style: 'sng' } : undefined,
            align, breakLine: r.quebra || (ultimo && i < paras.length - 1)
          }
        });
      });
    });
    return out;
  }

  /* ---------- imagens para o PPTX ---------- */
  const lerDataURL = blob => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
  async function fundoImagem(bg, deck) {
    const blob = deck.imgs[bg.img];
    if (!blob) return null;
    if (!(+bg.escurecer > 0)) return lerDataURL(blob);
    const url = urlDe(deck, bg.img);
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const c = document.createElement('canvas');
    c.width = 1920; c.height = Math.round(1920 * (deck.h || 540) / W);
    const ctx = c.getContext('2d');
    const s = Math.max(c.width / img.width, c.height / img.height);
    ctx.drawImage(img, (c.width - img.width * s) / 2, (c.height - img.height * s) / 2, img.width * s, img.height * s);
    ctx.fillStyle = `rgba(0,0,0,${bg.escurecer})`; ctx.fillRect(0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.88);
  }
  function fundoGradiente(bg, deck) {
    const c = document.createElement('canvas');
    c.width = 1920; c.height = Math.round(1920 * (deck.h || 540) / W);
    const ctx = c.getContext('2d');
    const a = ((bg.ang || 0)) * Math.PI / 180, cx = c.width / 2, cy = c.height / 2, r = Math.hypot(cx, cy);
    const g = ctx.createLinearGradient(cx - Math.cos(a) * r, cy - Math.sin(a) * r, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    bg.cores.forEach(cc => g.addColorStop(Math.min(1, Math.max(0, cc.pos / 100)), cc.cor));
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.9);
  }

  /** Gera o .pptx. Retorna Blob. */
  async function toPptx(deck, titulo) {
    const PptxGenJS = await C.loadLib();
    const pptx = new PptxGenJS();
    const H = deck.h || 540;
    if (H === 540) pptx.layout = 'LAYOUT_WIDE';
    else { pptx.defineLayout({ name: 'CANTAI', width: W / 72, height: H / 72 }); pptx.layout = 'CANTAI'; }
    pptx.title = titulo || 'Apresentação';
    pptx.author = 'Cantai ao Senhor';
    const inch = v => Math.round((v / 72) * 1000) / 1000;
    const cacheImg = new Map();
    const imgData = async key => { if (!cacheImg.has(key)) cacheImg.set(key, await lerDataURL(deck.imgs[key])); return cacheImg.get(key); };
    for (const s of deck.slides) {
      const slide = pptx.addSlide();
      const bg = s.bg || {};
      if (bg.tipo === 'cor') slide.background = { color: toHex(bg.cor).slice(1) };
      else if (bg.tipo === 'tema') { const t = C.THEMES[bg.tema] || C.THEMES.noite; slide.background = t.solid ? { color: toHex(t.solid).slice(1) } : { data: C.backgroundURL(bg.tema, null, 1920) }; }
      else if (bg.tipo === 'gradiente') slide.background = { data: fundoGradiente(bg, deck) };
      else if (bg.tipo === 'imagem') { const d = await fundoImagem(bg, deck); if (d) slide.background = { data: d }; }
      for (const o of s.objs) {
        const pos = { x: inch(o.x), y: inch(o.y), w: inch(Math.max(1, o.w)), h: inch(Math.max(1, o.h)), rotate: o.rot || 0, flipH: !!o.flipH, flipV: !!o.flipV };
        if (o.tipo === 'imagem') {
          if (deck.imgs[o.img]) slide.addImage({ data: await imgData(o.img), ...pos });
          continue;
        }
        const tipoForma = o.tipo === 'forma' ? (pptx.ShapeType[o.forma] || pptx.ShapeType.rect) : null;
        const caixa = {
          ...pos,
          fill: o.fill ? { color: toHex(o.fill).slice(1) } : undefined,
          line: o.borda ? { color: toHex(o.borda.cor).slice(1), width: o.borda.larg } : undefined
        };
        const temTexto = (o.html || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
        if (temTexto) {
          slide.addText(htmlToRuns(o.html, { fontSize: 18, color: '#000000', fontFace: 'Calibri' }), {
            ...caixa, shape: tipoForma || undefined, valign: o.vAlign || 'middle', margin: 4, fit: 'none', wrap: true
          });
        } else if (tipoForma) {
          slide.addShape(tipoForma, caixa);
        }
      }
    }
    return pptx.write({ outputType: 'blob' });
  }

  window.SlideEditor = { W, FONTES, loadLibs, fromPptx, novoTexto, slideEmBranco, corTextoPara, slideHTML, objHTML, bgCSS, urlDe, htmlToRuns, toPptx, toHex, uid, clone, escHtml };
})();
