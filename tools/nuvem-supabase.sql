-- ============================================================
-- Cantai ao Senhor — biblioteca de PPTs na nuvem (Supabase)
-- Rode UMA vez em: Supabase › SQL Editor › New query › Run
-- Antes, troque os e-mails no fim do arquivo pelos de quem pode usar.
-- ============================================================

-- Quem pode usar a biblioteca compartilhada
create table if not exists public.membros (
  email text primary key check (email = lower(email))
);

-- PPTs (dados + texto dos slides; o arquivo fica no Storage)
create table if not exists public.ppts (
  id          text primary key,
  nome        text not null,
  arquivo     text,
  tipo        text,
  tamanho     bigint,
  data        bigint,
  slides      jsonb not null default '[]'::jsonb,
  texto       text,
  erro        text,
  caminho     text not null,
  versao      bigint not null default 0,          -- muda a cada edição (outros aparelhos baixam de novo)
  enviado_por text default lower(auth.jwt() ->> 'email'),
  criado_em   timestamptz not null default now()
);

-- É membro? (security definer: consulta a lista sem expor a tabela)
create or replace function public.e_membro() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.membros where email = lower(auth.jwt() ->> 'email'));
$$;
grant execute on function public.e_membro() to authenticated;

alter table public.membros enable row level security;
alter table public.ppts    enable row level security;

drop policy if exists "membros: membro vê a lista" on public.membros;
create policy "membros: membro vê a lista" on public.membros
  for select to authenticated using (public.e_membro());

drop policy if exists "ppts: membro lê"     on public.ppts;
drop policy if exists "ppts: membro envia"  on public.ppts;
drop policy if exists "ppts: membro altera" on public.ppts;
drop policy if exists "ppts: membro apaga"  on public.ppts;
create policy "ppts: membro lê"     on public.ppts for select to authenticated using (public.e_membro());
create policy "ppts: membro envia"  on public.ppts for insert to authenticated with check (public.e_membro());
create policy "ppts: membro altera" on public.ppts for update to authenticated using (public.e_membro()) with check (public.e_membro());
create policy "ppts: membro apaga"  on public.ppts for delete to authenticated using (public.e_membro());

-- Pasta PRIVADA dos arquivos (limite de 50 MB por arquivo)
insert into storage.buckets (id, name, public, file_size_limit)
values ('ppts', 'ppts', false, 52428800)
on conflict (id) do nothing;

drop policy if exists "arquivos ppts: membro lê"     on storage.objects;
drop policy if exists "arquivos ppts: membro envia"  on storage.objects;
drop policy if exists "arquivos ppts: membro altera" on storage.objects;
drop policy if exists "arquivos ppts: membro apaga"  on storage.objects;
create policy "arquivos ppts: membro lê"     on storage.objects for select to authenticated using (bucket_id = 'ppts' and public.e_membro());
create policy "arquivos ppts: membro envia"  on storage.objects for insert to authenticated with check (bucket_id = 'ppts' and public.e_membro());
create policy "arquivos ppts: membro altera" on storage.objects for update to authenticated using (bucket_id = 'ppts' and public.e_membro());
create policy "arquivos ppts: membro apaga"  on storage.objects for delete to authenticated using (bucket_id = 'ppts' and public.e_membro());

-- ▼▼▼ TROQUE pelos e-mails de quem pode usar (em minúsculas) ▼▼▼
insert into public.membros (email) values
  ('seu-email@exemplo.com'),
  ('email-do-irmao@exemplo.com')
on conflict do nothing;
