-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  bio text,
  is_admin boolean default false
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create articles table
create table articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null,
  excerpt text not null,
  content text not null,
  image_url text not null,
  video_url text,
  image_credit text,
  author_id uuid references profiles(id) not null,
  status text not null default 'draft',
  is_urgent boolean default false,
  is_main boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Set up RLS for articles
alter table articles enable row level security;

create policy "Articles are viewable by everyone." on articles
  for select using (true);

create policy "Authenticated users can insert articles." on articles
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update their own articles or admins can update any." on articles
  for update using (
    auth.uid() = author_id OR 
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Users can delete their own articles or admins can delete any." on articles
  for delete using (
    auth.uid() = author_id OR 
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Create a trigger to automatically create a profile when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
