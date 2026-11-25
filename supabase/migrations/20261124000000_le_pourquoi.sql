-- Le Pourquoi : comptes, fiches, surprise du jour, cache et paiements.

-- Un profil par compte : date d'inscription (début de l'essai) et fin de l'abonnement.
create table public.profils (
  id uuid primary key references auth.users(id) on delete cascade,
  courriel text,
  cree_le timestamptz not null default now(),
  abonne_jusqu timestamptz
);

create or replace function public.creer_profil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profils (id, courriel) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;

create trigger profil_a_l_inscription after insert on auth.users
  for each row execute function public.creer_profil();

-- Les fiches demandées par chaque personne (son historique).
create table public.fiches (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  niveau text not null default 'normal' check (niveau in ('normal','simple','pro')),
  contenu jsonb not null,
  cree_le timestamptz not null default now()
);
create index fiches_par_personne on public.fiches (user_id, cree_le desc);

-- Cache partagé : une même question au même niveau n'est générée qu'une fois.
create table public.cache_fiches (
  cle text primary key,
  contenu jsonb not null,
  cree_le timestamptz not null default now()
);

-- La surprise du jour, la même pour tout le monde.
create table public.surprises (
  jour date primary key,
  question text not null,
  contenu jsonb not null,
  cree_le timestamptz not null default now()
);

-- Les paiements confirmés par Stripe.
create table public.paiements (
  id bigint generated always as identity primary key,
  session_id text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  montant integer,
  devise text,
  cree_le timestamptz not null default now()
);

-- Sécurité : chacun lit son profil et ses fiches. Le reste ne passe que par les fonctions serveur.
alter table public.profils enable row level security;
alter table public.fiches enable row level security;
alter table public.cache_fiches enable row level security;
alter table public.surprises enable row level security;
alter table public.paiements enable row level security;

create policy "lire son profil" on public.profils for select using ((select auth.uid()) = id);
create policy "lire ses fiches" on public.fiches for select using ((select auth.uid()) = user_id);
create policy "effacer ses fiches" on public.fiches for delete using ((select auth.uid()) = user_id);

revoke execute on function public.creer_profil() from public, anon, authenticated;
