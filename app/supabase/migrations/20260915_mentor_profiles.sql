CREATE TABLE mentor_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  subjects TEXT[] DEFAULT '{}',
  experience TEXT,
  role_type TEXT DEFAULT 'tutor' CHECK (role_type IN ('parent', 'tutor', 'teacher')),
  is_public BOOLEAN DEFAULT TRUE,
  max_students INT DEFAULT 5,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read mentor profiles"
  ON mentor_profiles FOR SELECT
  USING (is_public = true);

CREATE POLICY "Owner full access mentor profiles"
  ON mentor_profiles FOR ALL
  USING (id = auth.uid());
