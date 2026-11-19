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
    return all.map(({ blob, ...meta }) => meta).sort((a, b) => b.data - a.data);
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
    const slides = [];
    for (const path of order) {
      const f = zip.file(path);
      if (!f) continue;
      const xml = new DOMParser().parseFromString(await f.async('string'), 'application/xml');
      const lines = [];
      for (const p of xml.getElementsByTagNameNS(NS_A, 'p')) {
        let t = '';
        for (const node of p.childNodes) {
          if (node.localName === 'r' || node.localName === 'fld') t += [...node.getElementsByTagNameNS(NS_A, 't')].map(x => x.textContent).join('');
          else if (node.localName === 'br') t += '\n';
        }
        t.split('\n').map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean).forEach(s => lines.push(s));
      }
      slides.push(lines);
    }
    return slides;
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
      const nomeArq = it.id + '__' + (it.arquivo || 'apresentacao.pptx').replace(/[\\/:*?"<>|]/g, '_');
      zip.file('arquivos/' + nomeArq, it.blob);
      const { blob, ...meta } = it;
      index.push({ ...meta, zipPath: 'arquivos/' + nomeArq });
    }
    zip.file('biblioteca.json', JSON.stringify({ app: 'cantai-ao-senhor', tipo: 'biblioteca-ppt', versao: 1, itens: index }, null, 1));
    return { blob: await zip.generateAsync({ type: 'blob' }), total: items.length };
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

  window.PptLib = { list, get, add, remove, update, search, extract, exportZip, importZip, usage, persist };
})();
