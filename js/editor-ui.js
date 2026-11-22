/*
 * Aba de edição do PowerPoint: faixa de comandos, painel de slides e área de
 * trabalho com seleção, arrastar, redimensionar e edição de texto no slide.
 */
(function () {
  'use strict';
  const SE = window.SlideEditor, C = window.Cantai;
  const PX = 4 / 3;                        // 1 pt = 4/3 px (CSS)
  const LARG_PX = SE.W * PX;               // 1280 px

  function mount(root, opts) {
    const { nome, onSave, onClose, toast, ic } = opts;
    const deck = opts.deck;
    const H = deck.h || 540;
    let cur = 0, selId = null, editId = null, aba = 'inicio', k = 0.3, sujo = false, editAntes = null, clip = null;
    const hist = [], fut = [];
    const S = () => deck.slides[cur];
    const sel = () => (S().objs.find(o => o.id === selId) || null);
    const snap = () => JSON.stringify(deck.slides);
    const $ = (s, el = root) => el.querySelector(s);
    const $$ = (s, el = root) => [...el.querySelectorAll(s)];
    const rnd = v => Math.round(v * 10) / 10;

    root.innerHTML = `
      <div class="e2">
        <header class="e2-top">
          <button class="e2-ib" data-a="fechar" title="Fechar o editor">${ic('x')}</button>
          <b class="e2-nome" title="${SE.escHtml(nome)}">${SE.escHtml(nome)}</b>
          <button class="e2-ib" data-a="desfazer" title="Desfazer (Ctrl+Z)">${ic('undo')}</button>
          <button class="e2-ib" data-a="refazer" title="Refazer (Ctrl+Y)">${ic('redo')}</button>
          <button class="e2-ib" data-a="apresentar" title="Apresentar (F5)">${ic('play')}</button>
          <button class="e2-btn" data-a="copia" title="Salvar como um PPT novo, mantendo o original">Salvar cópia</button>
          <button class="e2-btn gold" data-a="salvar" title="Salvar (Ctrl+S)">${ic('check', 'sm')} Salvar</button>
        </header>
        <nav class="e2-tabs" role="tablist">
          ${[['inicio', 'Início'], ['inserir', 'Inserir'], ['fundo', 'Fundo'], ['organizar', 'Organizar'], ['slides', 'Slides']].map(([id, t]) => `<button data-aba="${id}" role="tab">${t}</button>`).join('')}
        </nav>
        <div class="e2-ribbon"></div>
        <div class="e2-main">
          <aside class="e2-thumbs"></aside>
          <section class="e2-canvas"><div class="e2-fit"><div class="e2-scaler"></div></div>
            <p class="e2-dica">Toque num elemento para selecionar e arrastar · toque de novo (ou duplo clique) para editar o texto</p></section>
        </div>
        <input type="file" accept="image/*" hidden data-f="img"><input type="file" accept="image/*" hidden data-f="bgimg">
      </div>`;
    const scaler = $('.e2-scaler'), fit = $('.e2-fit'), canvas = $('.e2-canvas'), thumbs = $('.e2-thumbs'), ribbon = $('.e2-ribbon');

    /* ---------- escala ---------- */
    function ajustar() {
      const cw = canvas.clientWidth - 24, ch = Math.max(160, canvas.clientHeight - 40);
      k = Math.max(0.12, Math.min(cw / LARG_PX, ch / (H * PX), 1.2));
      scaler.style.cssText = `width:${LARG_PX}px;height:${H * PX}px;transform:scale(${k})`;
      fit.style.cssText = `width:${LARG_PX * k}px;height:${H * PX * k}px;--k:${k}`;
    }
    function escalaThumbs() { const tb = thumbs.querySelector('.e2-thbox'); if (tb && tb.clientWidth) thumbs.style.setProperty('--tk', tb.clientWidth / LARG_PX); }
    const ro = new ResizeObserver(() => { ajustar(); escalaThumbs(); });
    ro.observe(canvas); ro.observe(thumbs);

    /* ---------- desenho ---------- */
    function renderStage() {
      scaler.innerHTML = SE.slideHTML(S(), deck, 1280);
      renderSel();
    }
    function renderSel() {
      $$('.e2-selbox', scaler).forEach(n => n.remove());
      $$('.e2-o.on', scaler).forEach(n => n.classList.remove('on'));
      const o = sel();
      if (!o) return;
      const el = $(`[data-id="${o.id}"]`, scaler);
      if (el) el.classList.add('on');
      if (editId) return;
      const box = document.createElement('div');
      box.className = 'e2-selbox';
      box.style.cssText = `left:${o.x}pt;top:${o.y}pt;width:${o.w}pt;height:${o.h}pt;${o.rot ? `transform:rotate(${o.rot}deg)` : ''}`;
      box.innerHTML = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(d => `<i data-h="${d}" class="h-${d}"></i>`).join('');
      scaler.querySelector('.e2-slide').appendChild(box);
    }
    function thumbHTML(i) {
      return `<button class="e2-th ${i === cur ? 'on' : ''}" data-th="${i}" title="Slide ${i + 1}"><span class="e2-thn">${i + 1}</span><div class="e2-thbox" style="aspect-ratio:${SE.W}/${H}"><div class="e2-thsc">${SE.slideHTML(deck.slides[i], deck, 480)}</div></div></button>`;
    }
    function renderThumbs() {
      thumbs.innerHTML = deck.slides.map((_, i) => thumbHTML(i)).join('') + `<button class="e2-th e2-thadd" data-a="novoSlide" title="Novo slide">${ic('plus')}</button>`;
      escalaThumbs();
      const on = $('.e2-th.on', thumbs); if (on) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    let thumbTimer;
    function updThumb() {
      clearTimeout(thumbTimer);
      thumbTimer = setTimeout(() => { const t = $(`[data-th="${cur}"]`, thumbs); if (t) t.outerHTML = thumbHTML(cur); }, 150);
    }
    function updUndo() {
      $('[data-a="desfazer"]').disabled = !hist.length;
      $('[data-a="refazer"]').disabled = !fut.length;
    }
    function renderAll() { renderStage(); renderThumbs(); renderRibbon(); updUndo(); }

    /* ---------- histórico ---------- */
    function antes(s = snap()) { hist.push(s); if (hist.length > 80) hist.shift(); fut.length = 0; sujo = true; updUndo(); }
    function desfazer() { stopEdit(); if (!hist.length) return; fut.push(snap()); deck.slides = JSON.parse(hist.pop()); cur = Math.min(cur, deck.slides.length - 1); selId = null; sujo = true; renderAll(); }
    function refazer() { stopEdit(); if (!fut.length) return; hist.push(snap()); deck.slides = JSON.parse(fut.pop()); cur = Math.min(cur, deck.slides.length - 1); selId = null; sujo = true; renderAll(); }
    function mudar(fn, { thumbs: th = true, ribbon: rb = true } = {}) {
      antes();
      fn();
      renderStage();
      if (th) updThumb();
      if (rb) renderRibbon();
    }

    /* ---------- seleção, arrastar, redimensionar ---------- */
    function select(id) { if (selId === id) return; selId = id; renderSel(); renderRibbon(); }
    const elDe = id => $(`[data-id="${id}"]`, scaler);
    function aplicarPos(o) {
      const el = elDe(o.id);
      if (el) { el.style.left = o.x + 'pt'; el.style.top = o.y + 'pt'; el.style.width = o.w + 'pt'; el.style.height = o.h + 'pt'; }
      const b = $('.e2-selbox', scaler);
      if (b) { b.style.left = o.x + 'pt'; b.style.top = o.y + 'pt'; b.style.width = o.w + 'pt'; b.style.height = o.h + 'pt'; }
    }
    function encaixe(o) {                               // guia: centro do slide
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2, lim = 6;
      let gx = false, gy = false;
      if (Math.abs(cx - SE.W / 2) < lim) { o.x = rnd(SE.W / 2 - o.w / 2); gx = true; }
      if (Math.abs(cy - H / 2) < lim) { o.y = rnd(H / 2 - o.h / 2); gy = true; }
      scaler.classList.toggle('guia-x', gx); scaler.classList.toggle('guia-y', gy);
    }
    scaler.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      const h = e.target.closest('[data-h]');
      if (h) return redimensionar(e, h.dataset.h);
      const el = e.target.closest('.e2-o:not(.e2-lock)');
      if (editId && el && el.dataset.id === editId) return;      // digitando dentro da caixa
      if (!el) { stopEdit(); select(null); return; }
      const id = el.dataset.id;
      if (editId && editId !== id) stopEdit();
      const jaSel = selId === id;
      select(id);
      arrastar(e, jaSel);
    });
    scaler.addEventListener('dblclick', e => {
      const el = e.target.closest('.e2-texto:not(.e2-lock), .e2-forma:not(.e2-lock)');
      if (el && el.dataset.id !== editId) startEdit(el.dataset.id);
    });
    function arrastar(e, jaSel) {
      const o = sel(); if (!o) return;
      const sx = e.clientX, sy = e.clientY, ox = o.x, oy = o.y, before = snap();
      let moveu = false;
      try { scaler.setPointerCapture(e.pointerId); } catch { /* ponteiro já solto */ }
      const mv = ev => {
        const dx = (ev.clientX - sx) / k / PX, dy = (ev.clientY - sy) / k / PX;
        if (!moveu && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
        moveu = true;
        o.x = rnd(ox + dx); o.y = rnd(oy + dy);
        encaixe(o); aplicarPos(o);
      };
      const up = () => {
        scaler.removeEventListener('pointermove', mv); scaler.removeEventListener('pointerup', up); scaler.removeEventListener('pointercancel', up);
        scaler.classList.remove('guia-x', 'guia-y');
        if (moveu) { antes(before); updThumb(); renderRibbon(); }
        else if (jaSel && (o.tipo === 'texto' || o.tipo === 'forma')) startEdit(o.id);
      };
      scaler.addEventListener('pointermove', mv); scaler.addEventListener('pointerup', up); scaler.addEventListener('pointercancel', up);
    }
    function redimensionar(e, d) {
      e.stopPropagation();
      const o = sel(); if (!o) return;
      const sx = e.clientX, sy = e.clientY, r0 = { x: o.x, y: o.y, w: o.w, h: o.h }, before = snap();
      const prop = o.tipo === 'imagem' && d.length === 2;     // imagem: cantos mantêm a proporção
      try { scaler.setPointerCapture(e.pointerId); } catch { /* ponteiro já solto */ }
      const mv = ev => {
        const dx = (ev.clientX - sx) / k / PX, dy = (ev.clientY - sy) / k / PX;
        let { x, y, w, h } = r0;
        if (d.includes('e')) w = r0.w + dx;
        if (d.includes('s')) h = r0.h + dy;
        if (d.includes('w')) { w = r0.w - dx; x = r0.x + dx; }
        if (d.includes('n')) { h = r0.h - dy; y = r0.y + dy; }
        if (prop) {
          const ratio = r0.w / r0.h;
          if (Math.abs(w - r0.w) / r0.w > Math.abs(h - r0.h) / r0.h) { const nh = w / ratio; if (d.includes('n')) y = r0.y + r0.h - nh; h = nh; }
          else { const nw = h * ratio; if (d.includes('w')) x = r0.x + r0.w - nw; w = nw; }
        }
        if (w < 12) { if (d.includes('w')) x -= 12 - w; w = 12; }
        if (h < 12) { if (d.includes('n')) y -= 12 - h; h = 12; }
        Object.assign(o, { x: rnd(x), y: rnd(y), w: rnd(w), h: rnd(h) });
        aplicarPos(o);
      };
      const up = () => {
        scaler.removeEventListener('pointermove', mv); scaler.removeEventListener('pointerup', up); scaler.removeEventListener('pointercancel', up);
        if (JSON.stringify(r0) !== JSON.stringify({ x: o.x, y: o.y, w: o.w, h: o.h })) { antes(before); updThumb(); renderRibbon(); }
      };
      scaler.addEventListener('pointermove', mv); scaler.addEventListener('pointerup', up); scaler.addEventListener('pointercancel', up);
    }

    /* ---------- edição de texto no slide ---------- */
    function startEdit(id) {
      const o = S().objs.find(x => x.id === id);
      if (!o || o.lock || (o.tipo !== 'texto' && o.tipo !== 'forma')) return;
      editId = id; selId = id; editAntes = snap();
      renderSel();
      const box = $(`[data-id="${id}"] .e2-txt`, scaler);
      if (!box) return;
      if (!box.innerHTML.trim()) box.innerHTML = '<p style="text-align: center;"><span style="font-family: Calibri;font-size: 32pt;color: #000000;">&nbsp;</span></p>';
      box.contentEditable = 'true';
      box.closest('.e2-o').classList.add('editando');
      box.focus();
      const r = document.createRange(); r.selectNodeContents(box); r.collapse(false);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      box.oninput = () => { sujo = true; };
      renderRibbon();
    }
    function limparHtml(html) {
      const d = document.createElement('div');
      d.innerHTML = html;
      d.querySelectorAll('font').forEach(f => {
        const sp = document.createElement('span');
        if (f.getAttribute('face')) sp.style.fontFamily = f.getAttribute('face');
        if (f.getAttribute('color')) sp.style.color = f.getAttribute('color');
        if (f.dataset.pt) sp.style.fontSize = f.dataset.pt + 'pt';
        while (f.firstChild) sp.appendChild(f.firstChild);
        f.replaceWith(sp);
      });
      // texto solto (sem parágrafo) vira parágrafo
      if ([...d.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim()) || !d.querySelector('p,div,li')) {
        d.innerHTML = `<p>${d.innerHTML}</p>`;
      }
      d.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
      return d.innerHTML;
    }
    function stopEdit() {
      if (!editId) return;
      const id = editId; editId = null;
      const el = $(`[data-id="${id}"]`, scaler);
      const o = S().objs.find(x => x.id === id);
      if (el && o) {
        const box = $('.e2-txt', el);
        box.contentEditable = 'false';
        el.classList.remove('editando');
        const html = limparHtml(box.innerHTML);
        if (html !== o.html) { antes(editAntes); o.html = html; updThumb(); }
      }
      editAntes = null;
      getSelection().removeAllRanges();
      renderSel(); renderRibbon();
    }
    const seleçãoNoTexto = () => {
      if (!editId) return false;
      const s = getSelection(), box = $(`[data-id="${editId}"] .e2-txt`, scaler);
      return !!(s.rangeCount && !s.isCollapsed && box && box.contains(s.anchorNode));
    };

    /* ---------- formatação ---------- */
    // aplica em toda a caixa (quando não há trecho selecionado)
    function estiloCaixa(o, fn) {
      const d = document.createElement('div');
      d.innerHTML = o.html || '';
      // garante que todo texto esteja dentro de <span>
      const walker = document.createTreeWalker(d, NodeFilter.SHOW_TEXT);
      const soltos = [];
      while (walker.nextNode()) { const t = walker.currentNode; if (t.nodeValue && t.parentElement.tagName !== 'SPAN') soltos.push(t); }
      soltos.forEach(t => { const sp = document.createElement('span'); t.replaceWith(sp); sp.appendChild(t); });
      fn(d);
      o.html = d.innerHTML;
    }
    function formatar(tipo, valor) {
      const o = sel(); if (!o || (o.tipo !== 'texto' && o.tipo !== 'forma')) return;
      if (seleçãoNoTexto()) {
        document.execCommand('styleWithCSS', false, tipo !== 'tamanho');
        if (tipo === 'negrito') document.execCommand('bold');
        else if (tipo === 'italico') document.execCommand('italic');
        else if (tipo === 'sublinhado') document.execCommand('underline');
        else if (tipo === 'cor') document.execCommand('foreColor', false, valor);
        else if (tipo === 'fonte') document.execCommand('fontName', false, valor);
        else if (tipo === 'tamanho') {
          document.execCommand('fontSize', false, '7');
          $$(`[data-id="${editId}"] font[size="7"]`, scaler).forEach(f => { f.removeAttribute('size'); f.dataset.pt = valor; f.style.fontSize = valor + 'pt'; });
        }
        sujo = true;
        return;
      }
      const html0 = o.html;
      if (editId) stopEdit();
      mudar(() => estiloCaixa(o, d => {
        const spans = [...d.querySelectorAll('span')];
        if (tipo === 'negrito') { const on = !spans.every(s => s.style.fontWeight === 'bold' || +s.style.fontWeight >= 600); spans.forEach(s => { s.style.fontWeight = on ? 'bold' : 'normal'; }); }
        if (tipo === 'italico') { const on = !spans.every(s => s.style.fontStyle === 'italic'); spans.forEach(s => { s.style.fontStyle = on ? 'italic' : 'normal'; }); }
        if (tipo === 'sublinhado') { const on = !spans.every(s => /underline/.test(s.style.textDecoration)); spans.forEach(s => { s.style.textDecoration = on ? 'underline' : 'none'; }); }
        if (tipo === 'cor') spans.forEach(s => { s.style.color = valor; });
        if (tipo === 'fonte') spans.forEach(s => { s.style.fontFamily = valor; });
        if (tipo === 'tamanho') spans.forEach(s => { s.style.fontSize = valor + 'pt'; });
        if (tipo === 'escala') spans.forEach(s => { const m = (s.style.fontSize || '18pt').match(/([\d.]+)(pt|px)/); const pt = m ? (m[2] === 'px' ? +m[1] * 0.75 : +m[1]) : 18; s.style.fontSize = Math.max(6, Math.round(pt * valor * 2) / 2) + 'pt'; });
        if (tipo === 'alinhar') d.querySelectorAll('p,div,li').forEach(p => { p.style.textAlign = valor; });
      }));
      if (o.html === html0) { hist.pop(); updUndo(); }
    }
    // estilo atual (primeiro trecho da caixa selecionada)
    function estiloAtual() {
      const o = sel();
      const r = { fonte: 'Calibri', tamanho: 32, cor: '#000000', negrito: false, italico: false, sublinhado: false, alinhar: 'left' };
      if (!o || !o.html) return r;
      const el = elDe(o.id);
      const sp = el && (el.querySelector('.e2-txt span') || el.querySelector('.e2-txt p'));
      if (sp) {
        const cs = getComputedStyle(sp);
        r.fonte = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
        r.tamanho = Math.round(parseFloat(cs.fontSize) * 0.75 * 2) / 2;
        r.cor = SE.toHex(cs.color);
        r.negrito = +cs.fontWeight >= 600;
        r.italico = cs.fontStyle === 'italic';
        r.sublinhado = /underline/.test(cs.textDecorationLine || cs.textDecoration);
      }
      const p = el && el.querySelector('.e2-txt p, .e2-txt div');
      if (p) r.alinhar = getComputedStyle(p).textAlign.replace('start', 'left');
      return r;
    }

    /* ---------- faixa de comandos ---------- */
    const B = (a, rot, t, extra = '') => {
      const on = /class="e2-cmd on"/.test(extra);              // botão ativo (ex.: negrito ligado)
      return `<button class="e2-cmd${on ? ' on' : ''}" data-a="${a}" title="${t || ''}" ${extra.replace(/class="[^"]*"/, '')}>${rot}</button>`;
    };
    const grupo = (titulo, html) => `<div class="e2-grp"><div class="e2-grpc">${html}</div><span>${titulo}</span></div>`;
    function renderRibbon() {
      $$('[data-aba]').forEach(b => b.classList.toggle('on', b.dataset.aba === aba));
      const o = sel(), temTexto = o && (o.tipo === 'texto' || o.tipo === 'forma');
      const dis = c => c ? '' : 'disabled';
      let h = '';
      if (aba === 'inicio') {
        const st = estiloAtual();
        h = grupo('Fonte', `
            <select data-c="fonte" ${dis(temTexto)} title="Fonte">${SE.FONTES.concat(SE.FONTES.includes(st.fonte) ? [] : [st.fonte]).map(f => `<option ${f === st.fonte ? 'selected' : ''} style="font-family:'${f}'">${f}</option>`).join('')}</select>
            <div class="e2-tam">${B('menor', 'A−', 'Diminuir o texto (10%)', dis(temTexto))}<input type="number" data-c="tamanho" min="6" max="200" step="1" value="${st.tamanho}" ${dis(temTexto)} title="Tamanho (pt)">${B('maior', 'A+', 'Aumentar o texto (10%)', dis(temTexto))}</div>
            ${B('negrito', '<b>N</b>', 'Negrito', `${dis(temTexto)} class="e2-cmd ${st.negrito && temTexto ? 'on' : ''}"`)}
            ${B('italico', '<i>I</i>', 'Itálico', `${dis(temTexto)} class="e2-cmd ${st.italico && temTexto ? 'on' : ''}"`)}
            ${B('sublinhado', '<u>S</u>', 'Sublinhado', `${dis(temTexto)} class="e2-cmd ${st.sublinhado && temTexto ? 'on' : ''}"`)}
            <label class="e2-cor" title="Cor do texto">A<input type="color" data-c="cor" value="${st.cor}" ${dis(temTexto)}><i style="background:${st.cor}"></i></label>`)
          + grupo('Parágrafo', ['left', 'center', 'right', 'justify'].map(a => B('al-' + a, ic('al' + a, 'sm'), { left: 'Alinhar à esquerda', center: 'Centralizar', right: 'Alinhar à direita', justify: 'Justificar' }[a], `${dis(temTexto)} class="e2-cmd ${temTexto && st.alinhar === a ? 'on' : ''}"`)).join('')
            + ['top', 'middle', 'bottom'].map(v => B('va-' + v, ic('va' + v, 'sm'), { top: 'Texto em cima', middle: 'Texto no meio', bottom: 'Texto embaixo' }[v], `${dis(temTexto)} class="e2-cmd ${temTexto && (o.vAlign || 'middle') === v ? 'on' : ''}"`)).join(''))
          + grupo('Caixa', `<label class="e2-cor" title="Cor de fundo da caixa">${ic('layers', 'sm')}<input type="color" data-c="fill" value="${(o && o.fill) || '#FFFFFF'}" ${dis(o && o.tipo !== 'imagem')}><i style="background:${(o && o.fill) || 'transparent'}"></i></label>${B('semfill', 'Sem fundo', 'Caixa sem cor de fundo', dis(o && o.tipo !== 'imagem' && o.fill))}`);
      } else if (aba === 'inserir') {
        h = grupo('Slides', B('novoSlide', `${ic('plus', 'sm')} Slide`, 'Novo slide depois deste') + B('dupSlide', `${ic('layers', 'sm')} Duplicar`, 'Duplicar este slide'))
          + grupo('Texto', B('novoTexto', `${ic('text', 'sm')} Caixa de texto`, 'Nova caixa de texto') + B('novoTitulo', `${ic('text', 'sm')} Título`, 'Título grande'))
          + grupo('Imagem', B('novaImg', `${ic('image', 'sm')} Imagem`, 'Inserir uma imagem do aparelho'))
          + grupo('Formas', B('f-rect', '▭', 'Retângulo') + B('f-roundRect', '▢', 'Retângulo arredondado') + B('f-ellipse', '◯', 'Círculo') + B('f-line', '—', 'Faixa / linha'));
      } else if (aba === 'fundo') {
        const bg = S().bg || {};
        h = grupo('Temas', `<div class="e2-sws">${['noite', 'comum', 'roxo', 'festa', 'vermelho', 'aurora', 'preto', 'branco', 'azul'].map(t => `<button class="e2-sw ${bg.tipo === 'tema' && bg.tema === t ? 'on' : ''}" data-tema="${t}" title="${C.THEMES[t].nome}" style="${SE.bgCSS({ tipo: 'tema', tema: t }, deck, 160)}"></button>`).join('')}</div>`)
          + grupo('Personalizado', `<label class="e2-cor" title="Cor sólida">${ic('layers', 'sm')}<input type="color" data-c="bgcor" value="${bg.tipo === 'cor' ? bg.cor : '#0B1630'}"><i style="background:${bg.tipo === 'cor' ? bg.cor : '#0B1630'}"></i></label>${B('bgfoto', `${ic('image', 'sm')} Foto`, 'Usar uma foto de fundo')}${S().bgOrig ? B('bgorig', 'Original', 'Voltar ao fundo original deste slide') : ''}`)
          + (bg.tipo === 'imagem' ? grupo('Escurecer', `<input type="range" min="0" max="0.85" step="0.05" value="${bg.escurecer || 0}" data-c="escurecer" title="Escurecer a foto">`) : '')
          + grupo('Todos', B('bgtodos', 'Aplicar a todos', 'Usar este fundo em todos os slides'));
      } else if (aba === 'organizar') {
        const temLock = S().objs.some(x => x.lock);
        h = grupo('Ordem', B('frente', `${ic('up', 'sm')} Frente`, 'Trazer para a frente', dis(o)) + B('tras', `${ic('down', 'sm')} Trás`, 'Enviar para trás', dis(o)))
          + grupo('Posição', B('centroH', '↔ Centro', 'Centralizar na horizontal', dis(o)) + B('centroV', '↕ Meio', 'Centralizar na vertical', dis(o)) + B('cheio', '⛶ Slide inteiro', 'Ocupar o slide inteiro', dis(o)))
          + grupo('Elemento', B('dupObj', `${ic('layers', 'sm')} Duplicar`, 'Duplicar (Ctrl+D)', dis(o)) + B('girar', '⟳ Girar', 'Girar 15°', dis(o)) + B('espelhar', '⇋ Espelhar', 'Espelhar na horizontal', dis(o)) + B('apagarObj', `${ic('trash', 'sm')} Apagar`, 'Apagar (Delete)', dis(o)))
          + (temLock ? grupo('Fundo do modelo', B('destravar', '🔓 Destravar', 'Permite editar os elementos que vêm do modelo do PPT')) : '');
      } else {
        h = grupo('Slide', B('novoSlide', `${ic('plus', 'sm')} Novo`, 'Novo slide') + B('dupSlide', `${ic('layers', 'sm')} Duplicar`, 'Duplicar') + B('apagarSlide', `${ic('trash', 'sm')} Apagar`, 'Apagar este slide', dis(deck.slides.length > 1)))
          + grupo('Ordem', B('slideEsq', `${ic('back', 'sm')} Antes`, 'Mover para antes', dis(cur > 0)) + B('slideDir', `Depois ${ic('chev', 'sm')}`, 'Mover para depois', dis(cur < deck.slides.length - 1)))
          + grupo('Ver', B('apresentar', `${ic('play', 'sm')} Apresentar`, 'Tela cheia (F5)'))
          + grupo('Arquivo', B('copia', `${ic('folder', 'sm')} Salvar como novo`, 'Salvar como um PPT novo, mantendo o original'));
      }
      ribbon.innerHTML = `<div class="e2-ribin">${h}</div>`;
    }
    // não perde a seleção do texto ao clicar nos botões da faixa
    ribbon.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });

    function novoObj(o) { mudar(() => { S().objs.push(o); selId = o.id; }); renderSel(); }
    function slideAtualMuda() { selId = null; stopEdit(); renderStage(); renderThumbs(); renderRibbon(); }
    const acoes = {
      fechar: () => { stopEdit(); if (!sujo || confirm('Sair sem salvar as alterações?')) { destroy(); onClose(); } },
      desfazer, refazer,
      salvar: e => salvar(false, e), copia: e => salvar(true, e),
      apresentar,
      negrito: () => formatar('negrito'), italico: () => formatar('italico'), sublinhado: () => formatar('sublinhado'),
      menor: () => formatar('escala', 0.9), maior: () => formatar('escala', 1.1),
      semfill: () => { const o = sel(); if (o) mudar(() => { o.fill = null; }); },
      novoSlide: () => { stopEdit(); mudar(() => { deck.slides.splice(cur + 1, 0, SE.slideEmBranco(S())); cur++; selId = null; }); renderThumbs(); },
      dupSlide: () => { stopEdit(); mudar(() => { const c = SE.clone(S()); c.objs.forEach(x => { x.id = SE.uid(); }); deck.slides.splice(cur + 1, 0, c); cur++; selId = null; }); renderThumbs(); },
      apagarSlide: () => { if (deck.slides.length > 1 && confirm(`Apagar o slide ${cur + 1}?`)) { stopEdit(); mudar(() => { deck.slides.splice(cur, 1); cur = Math.min(cur, deck.slides.length - 1); selId = null; }); renderThumbs(); } },
      slideEsq: () => { if (cur > 0) { mudar(() => { [deck.slides[cur - 1], deck.slides[cur]] = [deck.slides[cur], deck.slides[cur - 1]]; cur--; }); renderThumbs(); } },
      slideDir: () => { if (cur < deck.slides.length - 1) { mudar(() => { [deck.slides[cur + 1], deck.slides[cur]] = [deck.slides[cur], deck.slides[cur + 1]]; cur++; }); renderThumbs(); } },
      novoTexto: () => { const t = SE.novoTexto('Novo texto', { cor: SE.corTextoPara(S().bg), pt: 32, negrito: false, x: 230, y: H / 2 - 50, w: 500, h: 100 }); novoObj(t); setTimeout(() => startEdit(t.id), 30); },
      novoTitulo: () => { const t = SE.novoTexto('Título', { cor: SE.corTextoPara(S().bg), pt: 54, x: 60, y: 40, w: 840, h: 110 }); novoObj(t); setTimeout(() => startEdit(t.id), 30); },
      novaImg: () => $('[data-f="img"]').click(),
      bgfoto: () => $('[data-f="bgimg"]').click(),
      bgorig: () => mudar(() => { S().bg = SE.clone(S().bgOrig); }),
      bgtodos: () => { const bg = S().bg; mudar(() => deck.slides.forEach(s => { s.bg = SE.clone(bg); })); renderThumbs(); toast('Fundo aplicado a todos os slides'); },
      frente: () => { const o = sel(); if (o) mudar(() => { const a = S().objs; a.push(a.splice(a.indexOf(o), 1)[0]); }); },
      tras: () => { const o = sel(); if (o) mudar(() => { const a = S().objs; const i = a.indexOf(o); a.splice(i, 1); const firstFree = a.findIndex(x => !x.lock); a.splice(firstFree < 0 ? a.length : firstFree, 0, o); }); },
      centroH: () => { const o = sel(); if (o) mudar(() => { o.x = rnd(SE.W / 2 - o.w / 2); }); },
      centroV: () => { const o = sel(); if (o) mudar(() => { o.y = rnd(H / 2 - o.h / 2); }); },
      cheio: () => { const o = sel(); if (o) mudar(() => { Object.assign(o, { x: 0, y: 0, w: SE.W, h: H, rot: 0 }); }); },
      dupObj: () => duplicarObj(),
      girar: () => { const o = sel(); if (o) mudar(() => { o.rot = ((o.rot || 0) + 15) % 360; }); },
      espelhar: () => { const o = sel(); if (o) mudar(() => { o.flipH = !o.flipH; }); },
      apagarObj: () => apagarObj(),
      destravar: () => mudar(() => S().objs.forEach(x => { x.lock = false; }))
    };
    ['left', 'center', 'right', 'justify'].forEach(a => { acoes['al-' + a] = () => formatar('alinhar', a); });
    ['top', 'middle', 'bottom'].forEach(v => { acoes['va-' + v] = () => { const o = sel(); if (o) mudar(() => { o.vAlign = v; }); }; });
    ['rect', 'roundRect', 'ellipse', 'line'].forEach(f => {
      acoes['f-' + f] = () => novoObj({ id: SE.uid(), tipo: 'forma', forma: f === 'line' ? 'rect' : f, x: f === 'line' ? 80 : 330, y: f === 'line' ? H / 2 - 4 : H / 2 - 100, w: f === 'line' ? 800 : 300, h: f === 'line' ? 8 : 200, rot: 0, lock: false, html: '', vAlign: 'middle', fill: '#D6B26E', borda: null });
    });
    function duplicarObj() { const o = sel(); if (!o) return; const c = { ...SE.clone(o), id: SE.uid(), x: o.x + 20, y: o.y + 20, lock: false }; novoObj(c); }
    function apagarObj() { const o = sel(); if (!o) return; stopEdit(); mudar(() => { S().objs.splice(S().objs.indexOf(o), 1); selId = null; }); }

    root.addEventListener('click', e => {
      const th = e.target.closest('[data-th]');
      if (th) { stopEdit(); cur = +th.dataset.th; slideAtualMuda(); return; }
      const ab = e.target.closest('[data-aba]');
      if (ab) { aba = ab.dataset.aba; renderRibbon(); return; }
      const sw = e.target.closest('[data-tema]');
      if (sw) { const t = sw.dataset.tema; mudar(() => { S().bg = { tipo: 'tema', tema: t, escurecer: 0 }; }); return; }
      const b = e.target.closest('[data-a]');
      if (b && !b.disabled && acoes[b.dataset.a]) acoes[b.dataset.a](e);
    });
    root.addEventListener('change', e => {
      const c = e.target.dataset.c;
      if (c === 'fonte') formatar('fonte', e.target.value);
      else if (c === 'tamanho') { const v = Math.max(6, Math.min(200, +e.target.value || 18)); formatar('tamanho', v); }
      else if (c === 'cor') formatar('cor', e.target.value);
      else if (c === 'fill') { const o = sel(); if (o) mudar(() => { o.fill = e.target.value.toUpperCase(); }); }
      else if (c === 'bgcor') { const v = e.target.value.toUpperCase(); mudar(() => { S().bg = { tipo: 'cor', cor: v }; }); }
      else if (c === 'escurecer') { mudar(() => { S().bg.escurecer = +e.target.value; }, { ribbon: false }); }
    });
    root.addEventListener('input', e => {
      if (e.target.dataset.c === 'escurecer') { S().bg.escurecer = +e.target.value; const sl = $('.e2-slide', scaler); if (sl) sl.style.cssText = `height:${H}pt;${SE.bgCSS(S().bg, deck, 1280)}`; }
    });
    async function lerImagem(f) {
      const key = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      deck.imgs[key] = f;
      let w = 1, h = 1;
      try { const bmp = await createImageBitmap(f); w = bmp.width; h = bmp.height; bmp.close && bmp.close(); } catch { /* tamanho padrão */ }
      return { key, w, h };
    }
    $('[data-f="img"]').onchange = async e => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      const { key, w, h } = await lerImagem(f);
      const esc = Math.min(SE.W * 0.6 / w, H * 0.6 / h);
      const ow = rnd(w * esc), oh = rnd(h * esc);
      novoObj({ id: SE.uid(), tipo: 'imagem', img: key, x: rnd((SE.W - ow) / 2), y: rnd((H - oh) / 2), w: ow, h: oh, rot: 0, lock: false });
    };
    $('[data-f="bgimg"]').onchange = async e => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      const { key } = await lerImagem(f);
      mudar(() => { S().bg = { tipo: 'imagem', img: key, escurecer: 0.3 }; });
    };

    /* ---------- teclado ---------- */
    function teclas(e) {
      if (!root.isConnected) return;
      const ctrl = e.ctrlKey || e.metaKey, kk = e.key.toLowerCase();
      if (ctrl && kk === 's') { e.preventDefault(); salvar(false); return; }
      if (e.key === 'F5') { e.preventDefault(); apresentar(); return; }
      if (editId) { if (e.key === 'Escape') { e.preventDefault(); stopEdit(); } return; }
      if (/^(input|select|textarea)$/i.test(document.activeElement && document.activeElement.tagName)) return;
      if (ctrl && kk === 'z' && !e.shiftKey) { e.preventDefault(); desfazer(); return; }
      if (ctrl && (kk === 'y' || (kk === 'z' && e.shiftKey))) { e.preventDefault(); refazer(); return; }
      if (e.key === 'PageDown' && cur < deck.slides.length - 1) { cur++; slideAtualMuda(); return; }
      if (e.key === 'PageUp' && cur > 0) { cur--; slideAtualMuda(); return; }
      const o = sel();
      if (ctrl && kk === 'c' && o) { clip = SE.clone(o); return; }
      if (ctrl && kk === 'v' && clip) { e.preventDefault(); novoObj({ ...SE.clone(clip), id: SE.uid(), x: clip.x + 20, y: clip.y + 20, lock: false }); return; }
      if (!o) return;
      if (ctrl && kk === 'd') { e.preventDefault(); duplicarObj(); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); apagarObj(); return; }
      if (e.key === 'Enter' && (o.tipo === 'texto' || o.tipo === 'forma')) { e.preventDefault(); startEdit(o.id); return; }
      if (e.key === 'Escape') { select(null); return; }
      const passo = e.shiftKey ? 10 : 1;
      const mov = { ArrowLeft: [-passo, 0], ArrowRight: [passo, 0], ArrowUp: [0, -passo], ArrowDown: [0, passo] }[e.key];
      if (mov) { e.preventDefault(); mudar(() => { o.x = rnd(o.x + mov[0]); o.y = rnd(o.y + mov[1]); }, { ribbon: false }); }
    }
    document.addEventListener('keydown', teclas);
    const antesDeSair = e => { if (sujo) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', antesDeSair);

    /* ---------- apresentar ---------- */
    function apresentar() {
      stopEdit();
      const ov = document.createElement('div');
      ov.className = 'show e2-show';
      let i = cur;
      const draw = () => {
        const kk2 = Math.min(innerWidth / LARG_PX, innerHeight / (H * PX));
        ov.innerHTML = `<div class="e2-showsc" style="width:${LARG_PX}px;height:${H * PX}px;transform:translate(-50%,-50%) scale(${kk2})">${SE.slideHTML(deck.slides[i], deck, 1920)}</div>
          <div class="hud"><button class="ib" data-x>${ic('x')}</button><span>${i + 1} / ${deck.slides.length}</span><span style="width:44px"></span></div>`;
        ov.querySelector('[data-x]').onclick = ev => { ev.stopPropagation(); fechar(); };
      };
      const tec = ev => {
        if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(ev.key)) { ev.preventDefault(); ev.stopPropagation(); if (i < deck.slides.length - 1) { i++; draw(); } }
        else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(ev.key)) { ev.preventDefault(); ev.stopPropagation(); if (i > 0) { i--; draw(); } }
        else if (ev.key === 'Escape') fechar();
      };
      const fechar = () => { document.removeEventListener('keydown', tec, true); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); ov.remove(); };
      ov.onclick = ev => { if (ev.target.closest('.hud')) return; if (ev.clientX > innerWidth / 3) { if (i < deck.slides.length - 1) i++; } else if (i > 0) i--; draw(); };
      document.addEventListener('keydown', tec, true);
      document.body.appendChild(ov); draw();
      if (ov.requestFullscreen) ov.requestFullscreen().catch(() => {});
    }

    /* ---------- salvar ---------- */
    async function salvar(comoNovo, e) {
      stopEdit();
      const btn = (e && e.target && e.target.closest('button')) || $(comoNovo ? '[data-a="copia"]' : '[data-a="salvar"]');
      const old = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Salvando…';
      try { await onSave(deck, comoNovo); sujo = false; }
      catch (err) { console.error(err); toast(err.message || 'Não consegui salvar'); }
      finally { if (btn.isConnected) { btn.disabled = false; btn.innerHTML = old; } }
    }

    function destroy() {
      document.removeEventListener('keydown', teclas);
      window.removeEventListener('beforeunload', antesDeSair);
      ro.disconnect();
    }

    ajustar();
    renderAll();
    return { destroy, get sujo() { return sujo; } };
  }

  window.SlideEditorUI = { mount };
})();
