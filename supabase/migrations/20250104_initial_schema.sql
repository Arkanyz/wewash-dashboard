-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_role as enum ('admin', 'technician', 'manager');
create type machine_status as enum ('ok', 'warning', 'error');
create type intervention_status as enum ('pending', 'in_progress', 'completed');
create type intervention_priority as enum ('low', 'medium', 'high', 'urgent');

-- Create users table (extends Supabase auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade,
    role user_role not null default 'manager',
    full_name text,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id)
);

-- Create laundries table
create table public.laundries (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    address text not null,
    city text not null,
    postal_code text not null,
    manager_id uuid references public.profiles(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create machines table
create table public.machines (
    id uuid default uuid_generate_v4() primary key,
    laundry_id uuid references public.laundries(id) on delete cascade not null,
    name text not null,
    model text,
    status machine_status default 'ok' not null,
    last_vapi_check timestamp with time zone,
    last_status_update timestamp with time zone default timezone('utc'::text, now()),
    payment_terminal_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create interventions table
create table public.interventions (
    id uuid default uuid_generate_v4() primary key,
    machine_id uuid references public.machines(id) on delete cascade not null,
    technician_id uuid references public.profiles(id),
    status intervention_status default 'pending' not null,
    priority intervention_priority default 'medium' not null,
    description text not null,
    resolution_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    resolved_at timestamp with time zone
);

-- Create payments table
create table public.payments (
    id uuid default uuid_generate_v4() primary key,
    machine_id uuid references public.machines(id) on delete cascade not null,
    amount decimal(10,2) not null,
    currency text default 'EUR' not null,
    status text not null,
    stripe_payment_id text unique,
    metadata jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notifications table
create table public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    message text not null,
    type text not null,
    read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.profiles enable row level security;
alter table public.laundries enable row level security;
alter table public.machines enable row level security;
alter table public.interventions enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone."
    on public.profiles for select
    using ( true );

create policy "Users can insert their own profile."
    on public.profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update own profile."
    on public.profiles for update
    using ( auth.uid() = id );

-- Laundries policies
create policy "Laundries are viewable by authenticated users."
    on public.laundries for select
    using ( auth.role() = 'authenticated' );

create policy "Admins can manage laundries."
    on public.laundries for all
    using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

-- Machines policies
create policy "Machines are viewable by authenticated users."
    on public.machines for select
    using ( auth.role() = 'authenticated' );

create policy "Admins can manage machines."
    on public.machines for all
    using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

-- Create functions and triggers
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, role, full_name)
    values (new.id, 'manager', new.raw_user_meta_data->>'full_name');
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Function to update timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Add updated_at triggers to all tables
create trigger handle_updated_at
    before update on public.profiles
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.laundries
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.machines
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.interventions
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.payments
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.notifications
    for each row execute procedure public.handle_updated_at();
