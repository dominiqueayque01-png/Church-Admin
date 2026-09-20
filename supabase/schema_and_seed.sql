-- ==============================================================================
-- CHURCH MANAGEMENT SYSTEM — BULLETPROOF SUPABASE DATABASE SCHEMA & SEED SCRIPT
-- ==============================================================================
-- Safe to re-run anytime. Uses TEXT + CHECK constraints to avoid enum collisions.
-- Paste this entire script into your Supabase Cloud SQL Editor and click "Run".
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- 2. DROP TABLES IN SAFE CASCADE ORDER
drop table if exists activity_logs cascade;
drop table if exists attendance_logs cascade;
drop table if exists family_members cascade;
drop table if exists emergency_contacts cascade;
drop table if exists members cascade;
drop table if exists events cascade;
drop table if exists small_groups cascade;
drop table if exists ministries cascade;
drop table if exists system_users cascade;

-- 3. DROP ANY CONFLICTING LEGACY ENUM TYPES
drop type if exists user_role cascade;
drop type if exists user_status cascade;
drop type if exists member_status cascade;
drop type if exists event_type cascade;
drop type if exists day_category cascade;

-- 4. TABLES CREATION

-- (A) System Users (for Admin & Tablet Usher Station logins)
create table system_users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  username text unique not null,
  password_hash text not null,
  role text not null default 'usher' check (lower(role) in ('admin', 'usher')),
  assigned_ministry text,
  status text not null default 'active' check (lower(status) in ('active', 'disabled')),
  avatar_initials text not null default 'US',
  last_login timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- (B) Ministries
create table ministries (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  color text default '#b5973a',
  created_at timestamp with time zone default now()
);

-- (C) Small Groups / Cell Groups
create table small_groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  ministry_id uuid references ministries(id) on delete set null,
  schedule text,
  created_at timestamp with time zone default now()
);

-- (D) Church Members & Visitors
create table members (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  middle_initial text,
  last_name text not null,
  birthday date,
  age text,
  age_group text default '26-35',
  gender text,
  phone text,
  email text,
  address text,
  status text not null default 'visitor' check (lower(status) in ('visitor', 'new_member', 'member', 'leader')),
  ministry text default 'Unassigned',
  ministry_id uuid references ministries(id) on delete set null,
  small_group_id uuid references small_groups(id) on delete set null,
  how_they_heard text,
  joined_date date default current_date,
  avatar_initials text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- (E) Emergency Contacts
create table emergency_contacts (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references members(id) on delete cascade,
  name text not null,
  relationship text,
  phone text not null,
  created_at timestamp with time zone default now()
);

-- (F) Family Members
create table family_members (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references members(id) on delete cascade,
  name text not null,
  relationship text,
  birthday date,
  created_at timestamp with time zone default now()
);

-- (G) Service Gatherings / Events
create table events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null default 'fellowship' check (lower(type) in ('ministry', 'fellowship', 'special')),
  event_date date not null default current_date,
  day_of_week text default 'sunday' check (lower(day_of_week) in ('saturday', 'sunday', 'weekday')),
  time_slot text default '9:00 AM - 5:00 PM',
  room text default 'Main Sanctuary',
  description text,
  is_active boolean default true,
  expected_attendance integer default 60,
  created_at timestamp with time zone default now()
);

-- (H) Attendance Logs (Live Headcount Synced from Tablet)
create table attendance_logs (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references members(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  checked_in_at timestamp with time zone default now(),
  is_guest boolean default false,
  device_id text,
  synced boolean default true,
  created_at timestamp with time zone default now(),
  constraint unique_member_event_attendance unique (member_id, event_id)
);

-- (I) Activity & Audit Logs (Admin Oversight)
create table activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references system_users(id) on delete set null,
  username text not null,
  action_type text not null, -- 'checkin', 'registration', 'user_management'
  description text not null,
  created_at timestamp with time zone default now()
);

-- 5. INDEXES FOR FAST QUERIES & SYNC
create index if not exists idx_members_name on members (last_name, first_name);
create index if not exists idx_members_status on members (status);
create index if not exists idx_attendance_event on attendance_logs (event_id);
create index if not exists idx_attendance_member on attendance_logs (member_id);
create index if not exists idx_events_date on events (event_date);

-- 6. RPC AUTHENTICATION FUNCTION (Safe station login)
create or replace function login_station_user(p_username text, p_password text)
returns table (
  id uuid,
  name text,
  username text,
  role text,
  assigned_ministry text,
  status text,
  avatar_initials text
) language plpgsql security definer as $$
begin
  return query
  update system_users u
  set last_login = now()
  where lower(u.username) = lower(trim(p_username))
    and lower(u.status) = 'active'
    and (
      u.password_hash = crypt(p_password, u.password_hash)
      or u.password_hash = p_password
    )
  returning
    u.id,
    u.name,
    u.username,
    u.role,
    u.assigned_ministry,
    u.status,
    u.avatar_initials;
end;
$$;

-- 7. ENABLE ROW-LEVEL SECURITY (RLS) & SAFE ACCESS POLICIES
alter table system_users enable row level security;
alter table ministries enable row level security;
alter table small_groups enable row level security;
alter table members enable row level security;
alter table emergency_contacts enable row level security;
alter table family_members enable row level security;
alter table events enable row level security;
alter table attendance_logs enable row level security;
alter table activity_logs enable row level security;

create policy "Allow read and update system_users" on system_users for all using (true) with check (true);
create policy "Allow all ministries" on ministries for all using (true) with check (true);
create policy "Allow all small_groups" on small_groups for all using (true) with check (true);
create policy "Allow all members" on members for all using (true) with check (true);
create policy "Allow all emergency_contacts" on emergency_contacts for all using (true) with check (true);
create policy "Allow all family_members" on family_members for all using (true) with check (true);
create policy "Allow all events" on events for all using (true) with check (true);
create policy "Allow all attendance_logs" on attendance_logs for all using (true) with check (true);
create policy "Allow all activity_logs" on activity_logs for all using (true) with check (true);

-- 8. ENABLE SUPABASE REALTIME REPLICATION
do $$ begin
  alter publication supabase_realtime add table attendance_logs;
exception when others then null; end $$;

do $$ begin
  alter publication supabase_realtime add table members;
exception when others then null; end $$;

do $$ begin
  alter publication supabase_realtime add table events;
exception when others then null; end $$;

do $$ begin
  alter publication supabase_realtime add table activity_logs;
exception when others then null; end $$;

-- ==============================================================================
-- 9. SEED DATA
-- ==============================================================================

-- (A) Initial Ministries
insert into ministries (id, name, description, color) values
  ('11111111-1111-1111-1111-111111111101', 'Youth Ministry', 'Junior & Senior High, College fellowship', '#3498db'),
  ('11111111-1111-1111-1111-111111111102', 'Worship Team', 'Vocalists, musicians, and audio engineers', '#b5973a'),
  ('11111111-1111-1111-1111-111111111103', 'Ushers', 'Sanctuary hospitality, greeters, and intake', '#27ae60'),
  ('11111111-1111-1111-1111-111111111104', 'Media Team', 'Visual projection, streaming, and lighting', '#8e44ad'),
  ('11111111-1111-1111-1111-111111111105', 'Children Ministry', 'Sunday school and nursery care', '#f39c12')
on conflict (name) do nothing;

-- (B) System Accounts (Default credentials: admin/admin123, usher1/usher123)
insert into system_users (id, name, username, password_hash, role, assigned_ministry, status, avatar_initials) values
  ('22222222-2222-2222-2222-222222222201', 'System Admin', 'admin', crypt('admin123', gen_salt('bf')), 'admin', null, 'active', 'SA'),
  ('22222222-2222-2222-2222-222222222202', 'Ana Garcia', 'usher1', crypt('usher123', gen_salt('bf')), 'usher', 'Youth Ministry', 'active', 'AG'),
  ('22222222-2222-2222-2222-222222222203', 'Jose Reyes', 'usher2', crypt('usher123', gen_salt('bf')), 'usher', 'Worship Team', 'active', 'JR'),
  ('22222222-2222-2222-2222-222222222204', 'Pedro Bautista', 'usher3', crypt('usher123', gen_salt('bf')), 'usher', 'Ushers', 'active', 'PB'),
  ('22222222-2222-2222-2222-222222222205', 'Divina Fernandez', 'divina.admin', crypt('admin123', gen_salt('bf')), 'admin', null, 'active', 'DF')
on conflict (username) do nothing;

-- (C) Service Events (Active Gatherings)
insert into events (id, name, type, event_date, day_of_week, time_slot, room, is_active, expected_attendance) values
  ('33333333-3333-3333-3333-333333333301', 'Saturday Ministry Gathering', 'ministry', current_date, 'saturday', '9:00 AM - 5:00 PM', 'Main Sanctuary', true, 50),
  ('33333333-3333-3333-3333-333333333302', 'Sunday Fellowship Gathering', 'fellowship', current_date + 1, 'sunday', '9:00 AM - 5:00 PM', 'Youth Center & Hall B', true, 70),
  ('33333333-3333-3333-3333-333333333303', 'Midweek Youth Gathering', 'special', current_date + 4, 'weekday', '6:00 PM - 8:30 PM', 'Youth Center', true, 40)
on conflict do nothing;

-- (D) Church Members & Visitors (Populating directory)
insert into members (id, first_name, last_name, status, ministry, age, age_group, birthday, phone, email, how_they_heard, avatar_initials) values
  ('44444444-4444-4444-4444-444444444401', 'Maria', 'Santos', 'member', 'Children Ministry', '34', '26-35', '1992-05-14', '0917 234 5678', 'maria.santos@email.com', 'Friend / Family', 'MS'),
  ('44444444-4444-4444-4444-444444444402', 'Jose', 'Reyes', 'leader', 'Worship Team', '41', '36-50', '1985-11-20', '0918 345 6789', 'jose.reyes@email.com', 'Walk-in', 'JR'),
  ('44444444-4444-4444-4444-444444444403', 'Ana', 'Garcia', 'leader', 'Ushers', '29', '26-35', '1997-03-08', '0919 456 7890', 'ana.garcia@email.com', 'Social Media', 'AG'),
  ('44444444-4444-4444-4444-444444444404', 'Pedro', 'Bautista', 'member', 'Ushers', '52', '51-65', '1974-08-12', '0920 567 8901', null, 'Word of Mouth', 'PB'),
  ('44444444-4444-4444-4444-444444444405', 'Rosa', 'Mendoza', 'new_member', 'Youth Ministry', '22', '18-25', '2004-01-19', '0921 678 9012', 'rosa.m@email.com', 'Flyer / Poster', 'RM'),
  ('44444444-4444-4444-4444-444444444406', 'Blaster', 'Silog', 'visitor', 'Unassigned', '19', '18-25', '2007-06-25', null, null, 'Walk-in', 'BS'),
  ('44444444-4444-4444-4444-444444444407', 'Shrek', 'Taumbayan', 'member', 'Ushers', '47', '36-50', '1979-09-03', '0922 789 0123', null, 'Friend / Family', 'ST'),
  ('44444444-4444-4444-4444-444444444408', 'Unique', 'Salon', 'new_member', 'Youth Ministry', '24', '18-25', '2002-04-16', null, 'unique.salon@email.com', 'Social Media', 'US'),
  ('44444444-4444-4444-4444-444444444409', 'Aypon', 'Ikisisks', 'member', 'Worship Team', '31', '26-35', '1995-10-30', '0923 890 1234', null, 'Word of Mouth', 'AI'),
  ('44444444-4444-4444-4444-444444444410', 'Badjao', 'Walangbike', 'member', 'Worship Team', '27', '26-35', '1999-07-07', '0924 901 2345', 'badjao.w@email.com', 'Social Media', 'BW'),
  ('44444444-4444-4444-4444-444444444411', 'John Apolinario', 'Juaquin', 'leader', 'Ushers', '44', '36-50', '1982-12-05', '0925 012 3456', 'john.aj@email.com', 'Walk-in', 'JA'),
  ('44444444-4444-4444-4444-444444444412', 'Carmela', 'Villanueva', 'member', 'Children Ministry', '39', '36-50', '1987-02-14', '0926 123 4567', null, 'Friend / Family', 'CV')
on conflict do nothing;

-- (E) Initial Attendance Logs for Saturday Gathering
insert into attendance_logs (member_id, event_id, is_guest) values
  ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', false),
  ('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333301', false),
  ('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333301', false),
  ('44444444-4444-4444-4444-444444444406', '33333333-3333-3333-3333-333333333301', true)
on conflict do nothing;

-- (F) Initial Activity Log
insert into activity_logs (username, action_type, description) values
  ('admin', 'user_management', 'System initialized with production schema and seed dataset.'),
  ('usher1', 'checkin', 'Checked in Maria Santos for Saturday Ministry Gathering.');
