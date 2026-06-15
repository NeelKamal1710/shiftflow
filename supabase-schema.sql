-- Run this FULL script in Supabase SQL Editor
-- Drop existing tables if any
drop table if exists availability cascade;
drop table if exists fixed_assignments cascade;
drop table if exists schedule_assignments cascade;
drop table if exists shift_types cascade;
drop table if exists employees cascade;

-- Employees table
create table employees (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  token text unique not null,
  created_at timestamp default now()
);

-- Shift types (admin defined: Morning 6AM-2PM, etc.)
create table shift_types (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  start_time text not null,
  end_time text not null,
  color text default '#4F46E5',
  created_at timestamp default now()
);

-- Employee availability (which days + which shift types they can do)
create table availability (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references employees(id) on delete cascade,
  day text not null,
  shift_type_id uuid references shift_types(id) on delete cascade,
  preferred_start text,
  preferred_end text,
  unique(employee_id, day, shift_type_id)
);

-- Final schedule assignments (admin sets these)
create table schedule_assignments (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references employees(id) on delete cascade,
  day text not null,
  shift_type_id uuid references shift_types(id) on delete cascade,
  actual_start text not null,
  actual_end text not null,
  week_start text not null,
  created_at timestamp default now(),
  unique(employee_id, day, week_start)
);

-- RLS policies
alter table employees enable row level security;
alter table shift_types enable row level security;
alter table availability enable row level security;
alter table schedule_assignments enable row level security;

create policy "public all employees" on employees for all using (true) with check (true);
create policy "public all shift_types" on shift_types for all using (true) with check (true);
create policy "public all availability" on availability for all using (true) with check (true);
create policy "public all schedule_assignments" on schedule_assignments for all using (true) with check (true);

-- Default shift types
insert into shift_types (name, start_time, end_time, color) values
  ('Morning',   '06:00', '14:00', '#92400E'),
  ('Afternoon', '11:00', '19:00', '#1E40AF'),
  ('Night',     '17:00', '01:00', '#5B21B6');

-- Sample employees
insert into employees (name, token) values
  ('Rahul',   'rahul-x7k2'),
  ('Priya',   'priya-m3n8'),
  ('Arjun',   'arjun-p9q1'),
  ('Neha',    'neha-t4r6'),
  ('Vikram',  'vikram-w2s5');
