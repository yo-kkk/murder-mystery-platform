-- Murder Mystery Platform Schema
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Games table
create table if not exists games (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  description text not null,
  themes text[] not null default '{}',
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced', 'expert')),
  min_players int not null,
  max_players int not null,
  duration_minutes int not null,
  image_url text,
  avg_rating numeric(3,1) not null default 0,
  review_count int not null default 0,
  publisher text,
  release_year int,
  created_at timestamptz not null default now()
);

-- Venues table
create table if not exists venues (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('party_room', 'board_game_cafe', 'escape_room', 'home', 'online')),
  address text not null,
  district text not null,
  phone text,
  reservation_url text,
  avg_rating numeric(3,1) not null default 0,
  created_at timestamptz not null default now()
);

-- Venue-Game mapping (M:N)
create table if not exists venue_games (
  venue_id uuid references venues(id) on delete cascade,
  game_id uuid references games(id) on delete cascade,
  primary key (venue_id, game_id)
);

-- Play records
create table if not exists play_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id uuid references games(id) on delete cascade not null,
  venue_id uuid references venues(id) on delete set null,
  played_at date not null,
  companions text[] not null default '{}',
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

-- Reviews
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id uuid references games(id) on delete cascade not null,
  rating int not null check (rating between 1 and 5),
  difficulty_rating int not null check (difficulty_rating between 1 and 5),
  atmosphere_rating int not null check (atmosphere_rating between 1 and 5),
  comment text not null default '',
  is_spoiler boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, game_id)
);

-- Row Level Security
alter table play_records enable row level security;
alter table reviews enable row level security;

-- play_records: 본인만 수정, 공개글은 모두 조회
create policy "play_records_select" on play_records
  for select using (is_public = true or auth.uid() = user_id);
create policy "play_records_insert" on play_records
  for insert with check (auth.uid() = user_id);
create policy "play_records_update" on play_records
  for update using (auth.uid() = user_id);
create policy "play_records_delete" on play_records
  for delete using (auth.uid() = user_id);

-- reviews: 모두 조회, 본인만 수정
create policy "reviews_select" on reviews for select using (true);
create policy "reviews_insert" on reviews
  for insert with check (auth.uid() = user_id);
create policy "reviews_update" on reviews
  for update using (auth.uid() = user_id);
create policy "reviews_delete" on reviews
  for delete using (auth.uid() = user_id);

-- games, venues: 누구나 조회 가능 (인증 불필요)
alter table games enable row level security;
alter table venues enable row level security;
create policy "games_select" on games for select using (true);
create policy "venues_select" on venues for select using (true);

-- Function: avg_rating 자동 업데이트
create or replace function update_game_avg_rating()
returns trigger as $$
begin
  update games
  set
    avg_rating = (select coalesce(avg(rating), 0) from reviews where game_id = coalesce(new.game_id, old.game_id)),
    review_count = (select count(*) from reviews where game_id = coalesce(new.game_id, old.game_id))
  where id = coalesce(new.game_id, old.game_id);
  return new;
end;
$$ language plpgsql;

create trigger trg_update_avg_rating
after insert or update or delete on reviews
for each row execute function update_game_avg_rating();
