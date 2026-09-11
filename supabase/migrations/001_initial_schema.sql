-- StudyPlanner MVP — Initial Schema

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS & FAMILIES
-- ============================================

create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  avatar text,
  role text not null check (role in ('student', 'parent')),
  created_at timestamptz default now()
);

create table families (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

create table family_members (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role_in_family text not null check (role_in_family in ('parent', 'child')),
  created_at timestamptz default now(),
  unique (family_id, user_id)
);

-- ============================================
-- PROJECTS & TEMPLATES
-- ============================================

create table goal_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text not null
);

create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('exam', 'learning', 'fitness', 'skill', 'habit', 'custom')),
  description text,
  deadline date,
  unit text not null default 'score',
  template_id uuid references goal_templates(id),
  is_primary boolean default false,
  created_at timestamptz default now()
);

create index idx_projects_user on projects(user_id);

-- ============================================
-- MILESTONES & TOPICS
-- ============================================

create table milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  date date,
  status text default 'pending' check (status in ('pending', 'completed', 'skipped')),
  notes text,
  "order" int default 0
);

create table topics (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references goal_templates(id),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  "group" text not null,
  level text default 'beginner',
  weight real default 0,
  "order" int default 0
);

create table user_topics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'completed', 'mastered')),
  avg_score real default 0,
  last_studied_at timestamptz,
  unique (user_id, topic_id)
);

-- ============================================
-- ACTIVITY LOGS
-- ============================================

create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  topic_id uuid references topics(id),
  date date not null default current_date,
  type text not null check (type in ('theory', 'exercise', 'mock_exam', 'practice', 'session')),
  duration_minutes int,
  value real,
  max_value real,
  notes text,
  mood text check (mood in ('great', 'good', 'okay', 'tired', 'frustrated')),
  created_at timestamptz default now()
);

create index idx_activity_user_date on activity_logs(user_id, date);
create index idx_activity_project on activity_logs(project_id);

-- ============================================
-- WEEKLY GOALS & PARENT NOTES
-- ============================================

create table weekly_goals (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references users(id) on delete cascade,
  set_by_user_id uuid not null references users(id),
  week_start date not null,
  description text not null,
  is_completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table parent_notes (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid not null references users(id) on delete cascade,
  student_id uuid not null references users(id),
  date date not null default current_date,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================
-- GAMIFICATION
-- ============================================

create table user_game_stats (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references users(id) on delete cascade,
  level int default 1,
  xp int default 0,
  gold int default 0,
  rare_materials int default 0,
  current_streak int default 0,
  best_streak int default 0,
  perfect_weeks int default 0,
  updated_at timestamptz default now()
);

create table quests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  week_start date not null,
  title text not null,
  description text,
  tier text not null check (tier in ('normal', 'challenge', 'epic', 'royal')),
  reward_gold int default 0,
  reward_xp int default 0,
  reward_materials int default 0,
  is_completed boolean default false,
  completed_at timestamptz,
  source text default 'system' check (source in ('ai', 'parent', 'system')),
  created_at timestamptz default now()
);

create index idx_quests_user_week on quests(user_id, week_start);

create table buildings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  type text not null check (type in ('library', 'training', 'tower', 'forge')),
  unlocked_at timestamptz default now(),
  unique (user_id, topic_id, type)
);

create table achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  title text not null,
  description text,
  earned_at timestamptz default now()
);

-- ============================================
-- AI REPORTS
-- ============================================

create table ai_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  type text not null check (type in ('daily_suggestion', 'weekly_review', 'alert', 'parent_weekly')),
  content text not null,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table users enable row level security;
alter table families enable row level security;
alter table family_members enable row level security;
alter table projects enable row level security;
alter table milestones enable row level security;
alter table topics enable row level security;
alter table user_topics enable row level security;
alter table activity_logs enable row level security;
alter table weekly_goals enable row level security;
alter table parent_notes enable row level security;
alter table user_game_stats enable row level security;
alter table quests enable row level security;
alter table buildings enable row level security;
alter table achievements enable row level security;
alter table ai_reports enable row level security;

-- Security definer function to get family IDs without triggering RLS recursion
create or replace function get_my_family_ids()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select family_id from family_members where user_id = auth.uid();
$$;

-- Users can read their own data
create policy "users_own" on users for all using (id = auth.uid());

-- Family members can see each other
create policy "family_read" on users for select using (
  id in (
    select fm.user_id from family_members fm
    where fm.family_id in (select get_my_family_ids())
  )
);

-- Projects: owner access
create policy "projects_own" on projects for all using (user_id = auth.uid());

-- Projects: family can view children's projects
create policy "projects_family_read" on projects for select using (
  user_id in (
    select fm.user_id from family_members fm
    where fm.family_id in (select get_my_family_ids())
      and fm.role_in_family = 'child'
      and exists (select 1 from family_members p where p.user_id = auth.uid() and p.family_id = fm.family_id and p.role_in_family = 'parent')
  )
);

-- Activity logs: owner access
create policy "activity_own" on activity_logs for all using (user_id = auth.uid());

-- Activity logs: parent can view child's logs
create policy "activity_family_read" on activity_logs for select using (
  user_id in (
    select fm.user_id from family_members fm
    where fm.family_id in (select get_my_family_ids())
      and fm.role_in_family = 'child'
  )
);

-- Game stats: own
create policy "game_own" on user_game_stats for all using (user_id = auth.uid());

-- Game stats: family read
create policy "game_family_read" on user_game_stats for select using (
  user_id in (
    select fm.user_id from family_members fm
    where fm.family_id in (select get_my_family_ids())
  )
);

-- Quests: own
create policy "quests_own" on quests for all using (user_id = auth.uid());

-- User topics: own
create policy "user_topics_own" on user_topics for all using (user_id = auth.uid());

-- Topics: readable by project owner or family
create policy "topics_read" on topics for select using (
  project_id in (select id from projects where user_id = auth.uid())
  or project_id in (
    select p.id from projects p
    where p.user_id in (
      select fm.user_id from family_members fm
      where fm.family_id in (select get_my_family_ids()) and fm.role_in_family = 'child'
    )
  )
);

-- Milestones: project owner
create policy "milestones_own" on milestones for all using (
  project_id in (select id from projects where user_id = auth.uid())
);

-- Weekly goals: student or setter
create policy "weekly_goals_access" on weekly_goals for all using (
  student_id = auth.uid() or set_by_user_id = auth.uid()
);

-- Parent notes: parent only
create policy "parent_notes_own" on parent_notes for all using (parent_id = auth.uid());

-- Buildings: own
create policy "buildings_own" on buildings for all using (user_id = auth.uid());

-- Achievements: own
create policy "achievements_own" on achievements for all using (user_id = auth.uid());

-- AI reports: own
create policy "ai_reports_own" on ai_reports for all using (user_id = auth.uid());

-- Families: members only
create policy "families_member" on families for select using (
  id in (select get_my_family_ids())
);

-- Family members: members can see own family
create policy "family_members_read" on family_members for select using (
  family_id in (select get_my_family_ids())
);

-- Goal templates: public read
alter table goal_templates enable row level security;
create policy "templates_public" on goal_templates for select using (true);
