-- ROOTED: per-user habits and daily check-ins. Run in the Supabase SQL editor.
-- Row-level security is the access boundary; the anon key in the browser is public by design.

create table public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  preset_key  text,
  name        text not null check (char_length(name) between 1 and 40),
  category    text,
  icon        text not null default 'spark',
  description text check (char_length(description) <= 200),
  good_day    text not null default '' check (char_length(good_day) <= 200),
  slip_day    text not null default '' check (char_length(slip_day) <= 200),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint habits_id_user_unique unique (id, user_id)
);

create unique index habits_user_preset_idx on public.habits (user_id, preset_key) where preset_key is not null;
create index habits_user_idx on public.habits (user_id);

-- One outcome per habit per calendar day. Composite FK forces the habit to belong to the same user.
create table public.check_ins (
  habit_id   uuid not null,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date       date not null,
  outcome    text not null check (outcome in ('good', 'slip', 'missed')),
  note       text check (char_length(note) <= 500),
  updated_at timestamptz not null default now(),
  primary key (habit_id, date),
  foreign key (habit_id, user_id) references public.habits (id, user_id) on delete cascade
);

create index check_ins_user_idx on public.check_ins (user_id);

-- Up to five active habits per user, enforced in the database.
create function public.enforce_active_habit_cap() returns trigger
language plpgsql as $$
begin
  if new.active and (tg_op = 'INSERT' or old.active is distinct from true) then
    perform pg_advisory_xact_lock(hashtext(new.user_id::text));
    if (select count(*) from public.habits
        where user_id = new.user_id and active and id <> new.id) >= 5 then
      raise exception 'active habit limit reached' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create trigger habits_active_cap
  before insert or update of active on public.habits
  for each row execute function public.enforce_active_habit_cap();

alter table public.habits    enable row level security;
alter table public.check_ins enable row level security;

create policy habits_select on public.habits for select to authenticated using (user_id = (select auth.uid()));
create policy habits_insert on public.habits for insert to authenticated with check (user_id = (select auth.uid()));
create policy habits_update on public.habits for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- No delete policy on habits: habits are archived (active = false), so history is preserved.

create policy check_ins_select on public.check_ins for select to authenticated using (user_id = (select auth.uid()));
create policy check_ins_insert on public.check_ins for insert to authenticated with check (user_id = (select auth.uid()));
create policy check_ins_update on public.check_ins for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy check_ins_delete on public.check_ins for delete to authenticated using (user_id = (select auth.uid()));
