-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.laundries enable row level security;
alter table public.machines enable row level security;
alter table public.interventions enable row level security;
alter table public.tasks enable row level security;
alter table public.notifications enable row level security;

-- Create tables
create table public.profiles (
  id uuid references auth.users on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  phone text,
  role text check (role in ('admin', 'technician', 'manager')),
  zone text,
  status text check (status in ('available', 'busy', 'offline')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

create table public.laundries (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text not null,
  city text not null,
  postal_code text not null,
  phone text,
  email text,
  status text check (status in ('active', 'maintenance', 'inactive')),
  manager_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.machines (
  id uuid default uuid_generate_v4() primary key,
  laundry_id uuid references public.laundries(id) on delete cascade,
  name text not null,
  type text check (type in ('washer', 'dryer')),
  status text check (status in ('active', 'maintenance', 'broken', 'inactive')),
  last_maintenance timestamp with time zone,
  next_maintenance timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.interventions (
  id uuid default uuid_generate_v4() primary key,
  machine_id uuid references public.machines(id) on delete cascade,
  technician_id uuid references public.profiles(id),
  type text check (type in ('maintenance', 'repair', 'installation', 'emergency')),
  status text check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text check (priority in ('low', 'medium', 'high', 'urgent')),
  description text,
  scheduled_for timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  intervention_id uuid references public.interventions(id) on delete cascade,
  title text not null,
  description text,
  status text check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text check (type in ('info', 'warning', 'error', 'success')),
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index profiles_role_idx on public.profiles(role);
create index laundries_status_idx on public.laundries(status);
create index machines_status_idx on public.machines(status);
create index interventions_status_idx on public.interventions(status);
create index interventions_priority_idx on public.interventions(priority);
create index notifications_user_id_idx on public.notifications(user_id);

-- Create RLS policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Public can view active laundries"
  on public.laundries for select
  using (status = 'active');

create policy "Admins and managers can update laundries"
  on public.laundries for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and (role = 'admin' or role = 'manager')
    )
  );

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
