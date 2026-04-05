create extension if not exists pgcrypto;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('student','faculty','hod','admin','superadmin')),
  department_id uuid references public.departments(id) on delete set null,
  assigned_faculty_id uuid references public.profiles(id) on delete set null,
  year integer,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  submitter_id uuid not null references public.profiles(id) on delete cascade,
  submitter_role text not null,
  department_id uuid references public.departments(id) on delete set null,
  assigned_faculty_id uuid references public.profiles(id) on delete set null,
  current_reviewer_role text,
  current_reviewer_id uuid references public.profiles(id) on delete set null,
  current_step integer not null default 1,
  status text not null,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submission_items (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  table_name text not null,
  record_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.submission_logs (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  action text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_role text,
  remarks text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

do $$
declare
  t text;
  tables text[] := array['publications','patents','projects','books','book_chapters','conferences','workshops','seminars','certifications','awards','consultancies','grants','collaborations','internships_guided','phd_guidance','events_organized'];
begin
  foreach t in array tables
  loop
    execute format($sql$
      create table if not exists public.%I (
        id uuid primary key default gen_random_uuid(),
        owner_id uuid not null references public.profiles(id) on delete cascade,
        department_id uuid references public.departments(id) on delete set null,
        year integer,
        title text not null,
        data jsonb not null default '{}'::jsonb,
        attachment_path text,
        status text not null default 'draft',
        is_submitted boolean not null default false,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    $sql$, t);
  end loop;
end $$;

alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_items enable row level security;
alter table public.submission_logs enable row level security;

do $$
declare
  t text;
  tables text[] := array['publications','patents','projects','books','book_chapters','conferences','workshops','seminars','certifications','awards','consultancies','grants','collaborations','internships_guided','phd_guidance','events_organized'];
begin
  foreach t in array tables
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

insert into public.departments (name, code)
values
('Computer Science', 'CSE'),
('Artificial Intelligence', 'AIML'),
('Electronics', 'ECE'),
('Mechanical', 'ME'),
('Civil', 'CE')
on conflict (code) do nothing;

insert into storage.buckets (id, name, public)
values ('rd-files', 'rd-files', false)
on conflict (id) do nothing;
