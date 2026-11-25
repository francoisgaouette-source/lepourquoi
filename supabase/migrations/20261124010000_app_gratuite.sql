-- Le Pourquoi devient gratuit et sans compte : on retire les comptes et les paiements,
-- et on garde une trace anonyme des demandes pour limiter les coûts.
drop trigger if exists profil_a_l_inscription on auth.users;
drop function if exists public.creer_profil();
drop table if exists public.paiements;
drop table if exists public.fiches;
drop table if exists public.profils;

create table public.demandes (
  id bigint generated always as identity primary key,
  empreinte text not null,   -- empreinte de l'adresse IP (jamais l'adresse elle-même)
  cree_le timestamptz not null default now()
);
create index demandes_par_empreinte on public.demandes (empreinte, cree_le desc);
create index demandes_par_date on public.demandes (cree_le desc);
alter table public.demandes enable row level security;
