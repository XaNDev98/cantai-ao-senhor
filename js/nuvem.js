/*
 * Nuvem (Supabase): login e biblioteca de PPTs compartilhada entre membros.
 * Tabela "ppts" guarda os dados e o texto dos slides; o arquivo fica na
 * pasta privada "ppts" do Storage. Regras de acesso em tools/nuvem-supabase.sql.
 */
(function () {
  'use strict';
  const CFG_KEY = 'cantai:nuvem';
  let client = null, libP = null;

  function cfg() {
    try {
      const o = JSON.parse(localStorage.getItem(CFG_KEY) || 'null');
      if (o && o.url && o.anon) return o;
    } catch { /* sem armazenamento */ }
    return window.CANTAI_NUVEM || { url: '', anon: '' };
  }
  const configured = () => { const c = cfg(); return !!(c.url && c.anon); };
  function setConfig(url, anon) {
    try { localStorage.setItem(CFG_KEY, JSON.stringify({ url: url.trim().replace(/\/+$/, ''), anon: anon.trim() })); } catch { /* ignore */ }
    client = null;
  }

  function loadLib() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    if (!libP) libP = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'vendor/supabase.js';
      s.onload = () => res(); s.onerror = () => { libP = null; rej(new Error('Sem conexão com a nuvem.')); };
      document.head.appendChild(s);
    });
    return libP;
  }
  async function sb() {
    if (!configured()) throw new Error('A biblioteca online ainda não foi configurada.');
    await loadLib();
    if (!client) {
      const c = cfg();
      client = window.supabase.createClient(c.url, c.anon, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: 'cantai-nuvem-auth' }
      });
    }
    return client;
  }

  function tr(e) {
    const m = (e && (e.message || e.error_description || e.msg)) || String(e);
    if (/invalid login credentials/i.test(m)) return new Error('E-mail ou senha incorretos.');
    if (/email not confirmed/i.test(m)) return new Error('Confirme seu e-mail: abra o link que chegou na sua caixa de entrada.');
    if (/already registered|already been registered/i.test(m)) return new Error('Este e-mail já tem conta. Use “Entrar”.');
    if (/password should be at least|weak password/i.test(m)) return new Error('A senha precisa ter pelo menos 6 caracteres.');
    if (/rate limit|too many/i.test(m)) return new Error('Muitas tentativas. Espere um pouco e tente de novo.');
    if (/row-level security|permission denied|not authorized|unauthorized|violates|403/i.test(m)) return new Error('Seu e-mail não está na lista de membros da biblioteca.');
    if (/failed to fetch|networkerror|load failed/i.test(m)) return new Error('Sem conexão com a nuvem.');
    if (/payload too large|maximum allowed size|exceeded/i.test(m)) return new Error('Arquivo grande demais para a nuvem (máximo 50 MB).');
    return new Error(m);
  }
  const ok = ({ data, error }) => { if (error) throw tr(error); return data; };

  async function user() {
    if (!configured()) return null;
    try { const c = await sb(); const { data } = await c.auth.getSession(); return data.session ? data.session.user : null; }
    catch { return null; }
  }
  async function signIn(email, senha) { const c = await sb(); return ok(await c.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha })).user; }
  async function signUp(email, senha) {
    const c = await sb();
    return ok(await c.auth.signUp({ email: email.trim().toLowerCase(), password: senha, options: { emailRedirectTo: location.origin + location.pathname } }));
  }
  async function signOut() { const c = await sb(); await c.auth.signOut(); }
  async function isMember() { const c = await sb(); return !!ok(await c.rpc('e_membro')); }

  const safe = n => String(n || 'apresentacao.pptx').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '_').slice(0, 80);

  async function list() {
    const c = await sb();
    return ok(await c.from('ppts').select('id,nome,arquivo,tipo,tamanho,data,slides,texto,erro,caminho,versao,enviado_por,criado_em').order('data', { ascending: false }));
  }
  async function upload(item) {
    const c = await sb();
    const caminho = item.id + '/' + safe(item.arquivo);
    ok(await c.storage.from('ppts').upload(caminho, item.blob, { upsert: true, contentType: item.tipo || 'application/octet-stream' }));
    ok(await c.from('ppts').upsert({
      id: item.id, nome: item.nome, arquivo: item.arquivo, tipo: item.tipo, tamanho: item.tamanho,
      data: item.data, slides: item.slides || [], texto: item.texto || '', erro: item.erro || null, caminho,
      versao: item.versao || item.data || 0
    }));
    return caminho;
  }
  async function download(caminho) { const c = await sb(); return ok(await c.storage.from('ppts').download(caminho)); }
  async function remove(row) {
    const c = await sb();
    if (row.caminho) await c.storage.from('ppts').remove([row.caminho]);
    ok(await c.from('ppts').delete().eq('id', row.id));
  }
  async function rename(id, nome, texto) { const c = await sb(); ok(await c.from('ppts').update({ nome, texto }).eq('id', id)); }

  window.Nuvem = { cfg, configured, setConfig, user, signIn, signUp, signOut, isMember, list, upload, download, remove, rename };
})();
