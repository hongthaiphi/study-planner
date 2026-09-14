-- Drop old CHECK constraints
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE family_members DROP CONSTRAINT family_members_role_in_family_check;
ALTER TABLE quests DROP CONSTRAINT quests_source_check;
ALTER TABLE ai_reports DROP CONSTRAINT ai_reports_type_check;

-- Update data
UPDATE users SET role = 'mentor' WHERE role = 'parent';
UPDATE family_members SET role_in_family = 'mentor' WHERE role_in_family = 'parent';
UPDATE family_members SET role_in_family = 'member' WHERE role_in_family = 'child';
UPDATE quests SET source = 'mentor' WHERE source = 'parent';
UPDATE ai_reports SET type = 'mentor_weekly' WHERE type = 'parent_weekly';

-- Add new CHECK constraints
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role = ANY (ARRAY['student', 'mentor']));
ALTER TABLE family_members ADD CONSTRAINT family_members_role_in_family_check CHECK (role_in_family = ANY (ARRAY['mentor', 'member']));
ALTER TABLE quests ADD CONSTRAINT quests_source_check CHECK (source = ANY (ARRAY['ai', 'mentor', 'system']));
ALTER TABLE ai_reports ADD CONSTRAINT ai_reports_type_check CHECK (type = ANY (ARRAY['daily_suggestion', 'weekly_review', 'alert', 'mentor_weekly']));
