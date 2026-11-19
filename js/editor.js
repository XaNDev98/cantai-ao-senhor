/*
 * Editor visual de PowerPoint: modelo dos slides, prévia e geração do .pptx.
 *
 * deck = { slides: [slide] }
 * slide = {
 *   texto: 'linha 1\nlinha 2',
 *   bg: { tipo: 'original'|'tema'|'cor'|'imagem', tema, cor, img, escurecer },
 *   fonte: 'Calibri', tamanho: 0 (0 = automático, senão pt), cor: '#FFFFFF',
 *   negrito: true, italico: false, alinhar: 'center'|'left'|'right', vertical: 'middle'|'top'|'bottom'
 * }
 */
(function () {
  'use strict';
  const C = window.Cantai;

  const FONTES = ['Calibri', 'Arial', 'Georgia', 'Verdana', 'Trebuchet MS', 'Times New Roman', 'Segoe UI', 'Tahoma'];
  const CSS_FONTE = {
    Calibri: 'Calibri, Carlito, \x27Segoe UI\x27, Inter, sans-serif',
    Arial: 'Arial, Helvetica, sans-serif',
    Georgia: 'Georgia, \x27Times New Roman\x27, serif',
    Verdana: 'Verdana, Geneva, sans-serif',
    'Trebuchet MS': '\x27Trebuchet MS\x27, Tahoma, sans-serif',
    'Times New Roman': '\x27Times New Roman\x27, Times, serif',
    'Segoe UI': '\x27Segoe UI\x27, Inter, sans-serif',
    Tahoma: 'Tahoma, Verdana, sans-serif'
  };
  const ESTILO_PADRAO = { fonte: 'Calibri', tamanho: 0, cor: '#FFFFFF', negrito: true, italico: false, alinhar: 'center', vertical: 'middle' };

  const novoSlide = (base = {}) => ({
    texto: '',
    bg: { tipo: 'tema', tema: 'noite', escurecer: 0.35 },
    ...ESTILO_PADRAO,
    ...JSON.parse(JSON.stringify(base))
  });

  /** Cor de texto que aparece bem sobre o fundo. */
  function corParaFundo(bg) {
    if (!bg) return '#FFFFFF';
    if (bg.tipo === 'tema') { const t = C.THEMES[bg.tema]; return t && t.light ? '#1F1A12' : '#FFFFFF'; }
    if (bg.tipo === 'cor') {
      const h = (bg.cor || '#000000').replace('#', '');
      const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
      return (0.299 * r + 0.587 * g + 0.114 * b) > 160 ? '#1F1A12' : '#FFFFFF';
    }
    return '#FFFFFF';                     // imagem: escurecida, texto branco
  }

  /** Monta o deck a partir de um PPT da biblioteca (texto + fundo original de cada slide). */
  async function deckFromPpt(item, blob) {
    let fundos = [];
    try { fundos = await window.PptLib.backgrounds(blob); } catch (e) { console.warn('fundos', e); }
    const imgs = {}, chave = new Map();
    const guardar = url => { if (!chave.has(url)) { const k = 'i' + chave.size; chave.set(url, k); imgs[k] = url; } return chave.get(url); };
    const slides = (item.slides || []).map((lines, i) => {
      const f = fundos[i];
      const bg = f && f.img ? { tipo: 'original', img: guardar(f.img), escurecer: 0 }
        : f && f.cor ? { tipo: 'cor', cor: f.cor }
        : { tipo: 'tema', tema: 'noite', escurecer: 0.35 };
      return { ...novoSlide(), texto: lines.join('\n'), bg, cor: corParaFundo(bg) };
    });
    if (!slides.length) slides.push(novoSlide());
    return { slides, imgs };
  }

  /* ---------- fundo final (aplica escurecer em imagens) ---------- */
  const imgCache = new Map();
  function loadImg(src) {
    if (!imgCache.has(src)) imgCache.set(src, new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }));
    return imgCache.get(src);
  }
  /** Imagem de fundo pronta (cortada em 16:9 e escurecida) como dataURL. */
  const imgSrc = (bg, imgs) => (imgs && imgs[bg.img]) || bg.img;
  async function bgImage(bg, imgs, w = 1920) {
    const img = await loadImg(imgSrc(bg, imgs));
    const c = document.createElement('canvas');
    c.width = w; c.height = Math.round(w * 9 / 16);
    const ctx = c.getContext('2d');
    const s = Math.max(c.width / img.width, c.height / img.height);
    ctx.drawImage(img, (c.width - img.width * s) / 2, (c.height - img.height * s) / 2, img.width * s, img.height * s);
    if (bg.escurecer > 0) { ctx.fillStyle = `rgba(0,0,0,${bg.escurecer})`; ctx.fillRect(0, 0, c.width, c.height); }
    return c.toDataURL('image/jpeg', 0.86);
  }

  /** CSS do fundo para a prévia. */
  function bgCSS(bg, w, imgs) {
    if (!bg) return 'background:#0b1630';
    if (bg.tipo === 'cor') return `background:${bg.cor || '#000'}`;
    if (bg.tipo === 'tema') {
      const t = C.THEMES[bg.tema] || C.THEMES.noite;
      return t.solid ? `background:${t.solid}` : `background-image:url(${C.backgroundURL(bg.tema, null, w)})`;
    }
    const dark = bg.escurecer > 0 ? `linear-gradient(rgba(0,0,0,${bg.escurecer}),rgba(0,0,0,${bg.escurecer})),` : '';
    return `background-image:${dark}url(${imgSrc(bg, imgs)});background-size:cover;background-position:center`;
  }

  const linhas = s => String(s.texto || '').split('\n').map(l => l.replace(/\s+$/, '')).filter((l, i, a) => l || (i > 0 && i < a.length - 1));
  /** Tamanho em pt (automático: cabe na área útil). */
  function tamanho(s) {
    if (s.tamanho > 0) return s.tamanho;
    const ls = linhas(s);
    return ls.length ? C.fitSize(ls.length ? ls : [''], false) : 40;
  }

  /** HTML de um slide (prévia), no mesmo tamanho proporcional do PPT. */
  function slideHTML(s, w = 960, imgs) {
    const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const pt = tamanho(s);
    const just = { top: 'start', middle: 'center', bottom: 'end' }[s.vertical] || 'center';
    const sombra = s.bg && (s.bg.tipo === 'imagem' || s.bg.tipo === 'original' || (s.bg.tipo === 'tema' && s.bg.tema === 'aurora'));
    return `<div class="sl ed-sl" style="${bgCSS(s.bg, w, imgs)};align-items:${just}">
      <div class="t" style="font-family:${CSS_FONTE[s.fonte] || CSS_FONTE.Calibri};font-size:${(pt * 100 / 960).toFixed(2)}cqw;color:${s.cor};font-weight:${s.negrito ? 700 : 400};font-style:${s.italico ? 'italic' : 'normal'};text-align:${s.alinhar};${sombra ? 'text-shadow:0 .3cqw 1cqw rgba(0,0,0,.6);' : ''}padding:5% 0">${linhas(s).map(esc).join('\n') || '<span style="opacity:.35">(slide sem texto)</span>'}</div>
    </div>`;
  }

  /** Gera o .pptx do deck. Retorna Blob. */
  async function toPptx(deck, titulo) {
    const PptxGenJS = await C.loadLib();
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.title = titulo || 'Apresentação';
    pptx.author = 'Cantai ao Senhor';
    const hex = c => String(c || '#FFFFFF').replace('#', '').toUpperCase();
    for (const s of deck.slides) {
      const slide = pptx.addSlide();
      const bg = s.bg || {};
      if (bg.tipo === 'cor') slide.background = { color: hex(bg.cor) };
      else if (bg.tipo === 'tema') {
        const t = C.THEMES[bg.tema] || C.THEMES.noite;
        slide.background = t.solid ? { color: hex(t.solid) } : { data: C.backgroundURL(bg.tema, null, 1920) };
      } else if (bg.img) slide.background = { data: await bgImage(bg, deck.imgs) };
      const ls = linhas(s);
      if (!ls.length) continue;
      const sombra = bg.tipo === 'imagem' || bg.tipo === 'original' || (bg.tipo === 'tema' && bg.tema === 'aurora');
      slide.addText(ls.map((l, i) => ({ text: l, options: { breakLine: i < ls.length - 1 } })), {
        x: 0.6, y: 0.45, w: 12.13, h: 6.6,
        align: s.alinhar || 'center', valign: s.vertical || 'middle',
        fontFace: s.fonte || 'Calibri', fontSize: tamanho(s), color: hex(s.cor),
        bold: !!s.negrito, italic: !!s.italico, lineSpacingMultiple: 1.08,
        shadow: sombra ? { type: 'outer', blur: 8, offset: 2, angle: 90, color: '000000', opacity: 0.6 } : undefined
      });
    }
    return pptx.write({ outputType: 'blob' });
  }

  window.SlideEditor = { FONTES, ESTILO_PADRAO, novoSlide, corParaFundo, deckFromPpt, slideHTML, bgCSS, toPptx };
})();
