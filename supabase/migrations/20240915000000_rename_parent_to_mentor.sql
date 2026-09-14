-- Rename role values: parent -> mentor
UPDATE users SET role = 'mentor' WHERE role = 'parent';

-- Rename family role values: parent -> mentor, child -> member
UPDATE family_members SET role_in_family = 'mentor' WHERE role_in_family = 'parent';
UPDATE family_members SET role_in_family = 'member' WHERE role_in_family = 'child';

-- Rename quest source: parent -> mentor
UPDATE quests SET source = 'mentor' WHERE source = 'parent';

-- Rename AI report type: parent_weekly -> mentor_weekly
UPDATE ai_reports SET type = 'mentor_weekly' WHERE type = 'parent_weekly';
