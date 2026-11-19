/*
 * Biblioteca de PPTs prontos — banco de dados no próprio aparelho (IndexedDB).
 * Guarda o arquivo original e o texto de cada slide (para busca, apresentar
 * e transformar em música). Também exporta/importa a biblioteca em .zip.
 */
(function () {
  'use strict';
  const DB = 'cantai-biblioteca', STORE = 'ppts', VER = 1;
  let dbp = null;

  function open() {
    if (!dbp) {
      dbp = new Promise((res, rej) => {
        const rq = indexedDB.open(DB, VER);
        rq.onupgradeneeded = () => {
          const db = rq.result;
          if (!db.objectStoreNames.contains(STORE)) {
            const st = db.createObjectStore(STORE, { keyPath: 'id' });
            st.createIndex('data', 'data');
          }
        };
        rq.onsuccess = () => res(rq.result);
        rq.onerror = () => { dbp = null; rej(rq.error); };
      });
    }
    return dbp;
  }
  async function tx(mode, fn) {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction(STORE, mode);
      const st = t.objectStore(STORE);
      let out;
      Promise.resolve(fn(st)).then(v => { out = v; });
      t.oncomplete = () => res(out);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error || new Error('Operação cancelada'));
    });
  }
  const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

  /** Lista sem carregar os arquivos (só os dados), mais recentes primeiro. */
  async function list() {
    const all = await tx('readonly', st => req(st.getAll()));
    return all.map(({ blob, ...meta }) => ({ ...meta, temArquivo: !!blob })).sort((a, b) => b.data - a.data);
  }
  const get = id => tx('readonly', st => req(st.get(id)));
  const remove = id => tx('readwrite', st => req(st.delete(id)));
  const put = item => tx('readwrite', st => req(st.put(item)));
  const update = async (id, patch) => { const it = await get(id); if (it) await put({ ...it, ...patch }); return it; };

  /* ---------- leitura do texto dos slides (.pptx = zip com XML) ---------- */
  const NS_A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
  async function extract(blob) {
    await window.Cantai.loadLib();               // traz o JSZip junto com o gerador de PPT
    const zip = await window.JSZip.loadAsync(blob);
    const slides = [];
    for (const path of await slideOrder(zip)) {
      const f = zip.file(path);
      if (!f) continue;
      const xml = new DOMParser().parseFromString(await f.async('string'), 'application/xml');
      slides.push(textParas(xml).flatMap(p => p.lines));
    }
    return slides;
  }

  /** Parágrafos com texto de um slide: [{ node, lines }] (quebra <a:br> = nova linha). */
  function textParas(xml) {
    const out = [];
    for (const p of xml.getElementsByTagNameNS(NS_A, 'p')) {
      let t = '', hasText = false;
      for (const node of p.childNodes) {
        if (node.localName === 'r' || node.localName === 'fld') { t += [...node.getElementsByTagNameNS(NS_A, 't')].map(x => x.textContent).join(''); hasText = true; }
        else if (node.localName === 'br') t += '\n';
      }
      const lines = t.split('\n').map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
      if (hasText && lines.length) out.push({ node: p, lines });
    }
    return out;
  }

  /** Reescreve o texto de um parágrafo mantendo a formatação do 1º trecho. */
  function setParaText(p, lines) {
    const A = NS_A, doc = p.ownerDocument;
    const firstRun = [...p.childNodes].find(n => n.localName === 'r');
    const rPr = firstRun && [...firstRun.childNodes].find(n => n.localName === 'rPr');
    for (const n of [...p.childNodes]) if (['r', 'br', 'fld'].includes(n.localName)) p.removeChild(n);
    const endPr = [...p.childNodes].find(n => n.localName === 'endParaRPr');
    lines.forEach((line, i) => {
      if (i > 0) {
        const br = doc.createElementNS(A, 'a:br');
        if (rPr) br.appendChild(rPr.cloneNode(true));
        p.insertBefore(br, endPr || null);
      }
      const r = doc.createElementNS(A, 'a:r');
      if (rPr) r.appendChild(rPr.cloneNode(true));
      const t = doc.createElementNS(A, 'a:t');
      t.textContent = line;
      if (/^\s|\s$/.test(line)) t.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
      r.appendChild(t);
      p.insertBefore(r, endPr || null);
    });
  }

  /** Caixas de texto de um slide: [[parágrafos da caixa 1], [parágrafos da caixa 2], ...] */
  function textBoxes(xml) {
    const groups = new Map();
    for (const p of textParas(xml)) {
      const box = p.node.parentNode;
      if (!groups.has(box)) groups.set(box, []);
      groups.get(box).push(p);
    }
    return [...groups.values()];
  }

  /** Estrutura para o editor: por slide, as linhas de cada caixa de texto. */
  async function boxes(blob) {
    await window.Cantai.loadLib();
    const zip = await window.JSZip.loadAsync(blob);
    const out = [];
    for (const path of await slideOrder(zip)) {
      const xml = new DOMParser().parseFromString(await zip.file(path).async('string'), 'application/xml');
      out.push(textBoxes(xml).map(b => b.flatMap(p => p.lines)));
    }
    return out;
  }

  /**
   * Edita os textos de um .pptx. novos[slide][caixa] = [linhas] (mesma ordem de boxes()).
   * Fundo, imagens e formatação continuam os do arquivo. Retorna um novo Blob.
   */
  async function editTexts(blob, novos) {
    await window.Cantai.loadLib();
    const zip = await window.JSZip.loadAsync(blob);
    const order = await slideOrder(zip);
    for (let i = 0; i < order.length; i++) {
      if (!novos[i]) continue;
      const f = zip.file(order[i]);
      if (!f) continue;
      const xml = new DOMParser().parseFromString(await f.async('string'), 'application/xml');
      const caixas = textBoxes(xml);
      let mudou = false;
      caixas.forEach((paras, c) => {
        if (!novos[i][c]) return;
        const want = novos[i][c].map(s => s.replace(/\s+$/, '')).filter(Boolean);
        if (JSON.stringify(paras.flatMap(p => p.lines)) === JSON.stringify(want)) return;   // caixa sem mudança
        mudou = true;
        // mesma quantidade de linhas por parágrafo de antes; o que sobrar entra no último
        let k = 0;
        paras.forEach((p, idx) => {
          const take = idx === paras.length - 1 ? want.slice(k) : want.slice(k, k + p.lines.length);
          k += take.length;
          if (take.length) setParaText(p.node, take);
          else if (paras.length > 1) p.node.parentNode.removeChild(p.node);
          else setParaText(p.node, ['']);
        });
      });
      if (mudou) zip.file(order[i], new XMLSerializer().serializeToString(xml));
    }
    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', compression: 'DEFLATE' });
  }

  /* ---------- fundo original de cada slide (imagem ou cor) ---------- */
  const NS_P = 'http://schemas.openxmlformats.org/presentationml/2006/main';
  const NS_R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const relsPath = p => p.replace(/([^/]+)$/, '_rels/$1.rels');
  const resolve = (base, target) => {
    if (target.startsWith('/')) return target.slice(1);
    const parts = base.split('/'); parts.pop();
    for (const seg of target.split('/')) { if (seg === '..') parts.pop(); else if (seg !== '.') parts.push(seg); }
    return parts.join('/');
  };
  async function readRels(zip, path) {
    const f = zip.file(relsPath(path));
    const map = {};
    if (!f) return map;
    const x = new DOMParser().parseFromString(await f.async('string'), 'application/xml');
    for (const r of x.getElementsByTagName('Relationship')) map[r.getAttribute('Id')] = { target: resolve(path, r.getAttribute('Target')), type: r.getAttribute('Type') || '' };
    return map;
  }
  const blipId = el => { const b = el && el.getElementsByTagNameNS(NS_A, 'blip')[0]; return b && (b.getAttributeNS(NS_R, 'embed') || b.getAttribute('r:embed')); };
  const solid = el => {
    const c = el && el.getElementsByTagNameNS(NS_A, 'srgbClr')[0];
    return c ? '#' + c.getAttribute('val') : '';
  };

  /** Imagem → dataURL JPEG reduzida (máx. 1920 px) para usar como fundo. */
  async function toDataURL(blob) {
    const url = URL.createObjectURL(blob);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      const s = Math.min(1, 1920 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.85);
    } finally { URL.revokeObjectURL(url); }
  }

  /**
   * Fundo de cada slide: { img: dataURL } ou { cor: '#RRGGBB' } ou null.
   * Procura no slide, depois no layout e no mestre; também aceita uma
   * imagem que cubra a maior parte do slide.
   */
  async function backgrounds(blob) {
    await window.Cantai.loadLib();
    const zip = await window.JSZip.loadAsync(blob);
    let sw = 12192000, sh = 6858000;
    try {
      const pres = new DOMParser().parseFromString(await zip.file('ppt/presentation.xml').async('string'), 'application/xml');
      const sz = pres.getElementsByTagNameNS(NS_P, 'sldSz')[0];
      if (sz) { sw = +sz.getAttribute('cx') || sw; sh = +sz.getAttribute('cy') || sh; }
    } catch { /* tamanho padrão 16:9 */ }
    const cache = new Map();
    const media = async target => {
      if (cache.has(target)) return cache.get(target);
      const f = zip.file(target);
      let v = null;
      if (f && /\.(png|jpe?g|gif|bmp|webp)$/i.test(target)) {
        try { v = await toDataURL(new Blob([await f.async('arraybuffer')], { type: /png$/i.test(target) ? 'image/png' : 'image/jpeg' })); } catch { v = null; }
      }
      cache.set(target, v);
      return v;
    };
    // fundo declarado em <p:bg> de uma parte (slide, layout ou mestre)
    async function bgOf(path) {
      const f = zip.file(path);
      if (!f) return null;
      const x = new DOMParser().parseFromString(await f.async('string'), 'application/xml');
      const rels = await readRels(zip, path);
      const bg = x.getElementsByTagNameNS(NS_P, 'bg')[0];
      if (bg) {
        const id = blipId(bg);
        if (id && rels[id]) { const img = await media(rels[id].target); if (img) return { img }; }
        const cor = solid(bg);
        if (cor) return { cor };
      }
      // imagem que cobre 60%+ do slide (muito comum em PPT de igreja)
      let best = null, area = 0;
      for (const pic of x.getElementsByTagNameNS(NS_P, 'pic')) {
        const ext = pic.getElementsByTagNameNS(NS_A, 'ext')[0];
        const a = ext ? (+ext.getAttribute('cx')) * (+ext.getAttribute('cy')) : 0;
        if (a > area) { area = a; best = pic; }
      }
      if (best && area >= sw * sh * 0.6) {
        const id = blipId(best);
        if (id && rels[id]) { const img = await media(rels[id].target); if (img) return { img }; }
      }
      return { rels };
    }
    const out = [];
    for (const path of await slideOrder(zip)) {
      let r = await bgOf(path);
      if (r && (r.img || r.cor)) { out.push(r); continue; }
      const layout = r && Object.values(r.rels || {}).find(x => /slideLayout$/.test(x.type));
      let found = null;
      if (layout) {
        const rl = await bgOf(layout.target);
        if (rl && (rl.img || rl.cor)) found = rl;
        else {
          const master = rl && Object.values(rl.rels || {}).find(x => /slideMaster$/.test(x.type));
          if (master) { const rm = await bgOf(master.target); if (rm && (rm.img || rm.cor)) found = rm; }
        }
      }
      out.push(found ? (found.img ? { img: found.img } : { cor: found.cor }) : null);
    }
    return out;
  }

  /** Caminhos dos slides na ordem em que aparecem na apresentação. */
  async function slideOrder(zip) {
    // ordem real dos slides: presentation.xml (sldIdLst) + relações
    let order = [];
    try {
      const pres = new DOMParser().parseFromString(await zip.file('ppt/presentation.xml').async('string'), 'application/xml');
      const rels = new DOMParser().parseFromString(await zip.file('ppt/_rels/presentation.xml.rels').async('string'), 'application/xml');
      const map = {};
      for (const r of rels.getElementsByTagName('Relationship')) map[r.getAttribute('Id')] = r.getAttribute('Target');
      for (const s of pres.getElementsByTagNameNS('*', 'sldId')) {
        const rid = s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
        if (map[rid]) order.push('ppt/' + map[rid].replace(/^\.?\//, '').replace(/^\/?ppt\//, ''));
      }
    } catch { order = []; }
    if (!order.length) {
      order = Object.keys(zip.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))
        .sort((a, b) => (+a.match(/(\d+)\.xml$/)[1]) - (+b.match(/(\d+)\.xml$/)[1]));
    }
    return order.filter(p => zip.file(p));
  }

  const normName = n => String(n || '').replace(/\.(pptx|ppt|odp|pps|ppsx)$/i, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  /** Guarda um arquivo. Retorna o item salvo (sem o blob). */
  async function add(file) {
    const isPptx = /\.(pptx|ppsx)$/i.test(file.name) || /presentationml/.test(file.type);
    let slides = [], erro = '';
    if (isPptx) {
      try { slides = await extract(file); } catch (e) { erro = 'Não foi possível ler o texto deste arquivo.'; }
    } else {
      erro = 'Formato antigo (.ppt): o arquivo fica guardado, mas o texto não é lido. Salve como .pptx para buscar e apresentar.';
    }
    const item = {
      id: 'ppt-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      nome: normName(file.name) || 'Apresentação',
      arquivo: file.name,
      tipo: file.type || (isPptx ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/vnd.ms-powerpoint'),
      tamanho: file.size,
      data: Date.now(),
      versao: Date.now(),
      slides,
      texto: norm(normName(file.name) + '\n' + slides.flat().join('\n')),
      erro,
      blob: file
    };
    await put(item);
    const { blob, ...meta } = item;
    return meta;
  }

  /** Busca no nome e no texto dos slides. */
  async function search(q) {
    const words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return (await list()).filter(it => words.every(w => it.texto.includes(w)));
  }

  /* ---------- backup (.zip com os arquivos + índice) ---------- */
  async function exportZip() {
    await window.Cantai.loadLib();
    const zip = new window.JSZip();
    const items = await tx('readonly', st => req(st.getAll()));
    const index = [];
    for (const it of items) {
      if (!it.blob) continue;                       // da nuvem e ainda não baixado neste aparelho
      const nomeArq = it.id + '__' + (it.arquivo || 'apresentacao.pptx').replace(/[\\/:*?"<>|]/g, '_');
      zip.file('arquivos/' + nomeArq, it.blob);
      const { blob, ...meta } = it;
      index.push({ ...meta, zipPath: 'arquivos/' + nomeArq });
    }
    zip.file('biblioteca.json', JSON.stringify({ app: 'cantai-ao-senhor', tipo: 'biblioteca-ppt', versao: 1, itens: index }, null, 1));
    return { blob: await zip.generateAsync({ type: 'blob' }), total: index.length };
  }
  async function importZip(file) {
    await window.Cantai.loadLib();
    const zip = await window.JSZip.loadAsync(file);
    const idx = zip.file('biblioteca.json');
    if (!idx) throw new Error('Este arquivo não é um backup da biblioteca.');
    const data = JSON.parse(await idx.async('string'));
    const existing = new Set((await list()).map(i => i.id));
    let n = 0;
    for (const meta of data.itens || []) {
      if (existing.has(meta.id)) continue;
      const f = zip.file(meta.zipPath);
      if (!f) continue;
      const blob = new Blob([await f.async('arraybuffer')], { type: meta.tipo || '' });
      const { zipPath, ...rest } = meta;
      await put({ ...rest, blob });
      n++;
    }
    return n;
  }

  async function usage() {
    try { if (navigator.storage && navigator.storage.estimate) return await navigator.storage.estimate(); } catch { /* sem suporte */ }
    return null;
  }
  async function persist() {
    try { if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist(); } catch { /* sem suporte */ }
    return false;
  }

  /** Troca o arquivo de um PPT (versão editada aqui ou no PowerPoint) e relê os slides. */
  async function replaceFile(id, blob, nomeArquivo) {
    const it = await get(id);
    if (!it) throw new Error('PPT não encontrado');
    const isPptx = /\.(pptx|ppsx)$/i.test(nomeArquivo || it.arquivo || '') || /presentationml/.test(blob.type);
    let slides = [], erro = '';
    if (isPptx) { try { slides = await extract(blob); } catch { erro = 'Não foi possível ler o texto deste arquivo.'; } }
    else erro = 'Formato antigo (.ppt): o texto não é lido. Salve como .pptx.';
    const novo = {
      ...it, blob, slides, erro,
      arquivo: nomeArquivo || it.arquivo,
      tipo: blob.type || it.tipo,
      tamanho: blob.size,
      texto: norm(it.nome + '\n' + slides.flat().join('\n')),
      versao: Date.now()
    };
    await put(novo);
    return novo;
  }

  window.PptLib = { list, get, put, add, remove, update, search, extract, boxes, backgrounds, toDataURL, editTexts, replaceFile, exportZip, importZip, usage, persist };
})();
