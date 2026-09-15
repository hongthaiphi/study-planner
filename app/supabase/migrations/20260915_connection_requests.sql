CREATE TABLE connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, mentor_id)
);

ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student create request"
  ON connection_requests FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Both read request"
  ON connection_requests FOR SELECT
  USING (student_id = auth.uid() OR mentor_id = auth.uid());

CREATE POLICY "Mentor update request"
  ON connection_requests FOR UPDATE
  USING (mentor_id = auth.uid());
