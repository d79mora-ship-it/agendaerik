-- ============================================================
-- Agenda Escolar Profesional — Supabase Schema
-- Normalized (3NF) with RLS policies
-- ============================================================

-- 1. PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  school_name TEXT,
  grade_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. SUBJECTS
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  teacher_name TEXT,
  color TEXT DEFAULT '#6366f1',
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subjects_user_id ON subjects(user_id);
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own subjects" ON subjects FOR ALL USING (auth.uid() = user_id);

-- 3. TASKS
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- 4. EXAMS
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  exam_date DATE NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exams_user_id ON exams(user_id);
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own exams" ON exams FOR ALL USING (auth.uid() = user_id);

-- 5. SCHEDULES
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schedules_user_id ON schedules(user_id);
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own schedules" ON schedules FOR ALL USING (auth.uid() = user_id);

-- 6. GRADES
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 10),
  max_score NUMERIC(5,2) NOT NULL DEFAULT 10 CHECK (max_score > 0),
  weight NUMERIC(3,2) DEFAULT 1.0,
  graded_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grades_user_id ON grades(user_id);
CREATE INDEX idx_grades_subject_id ON grades(subject_id);
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own grades" ON grades FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: Calculate weighted average per subject
-- ============================================================
CREATE OR REPLACE FUNCTION get_subject_averages(p_user_id UUID)
RETURNS TABLE(subject_id UUID, subject_name TEXT, weighted_average NUMERIC) AS $$
BEGIN
  RETURN QUERY
    SELECT
      s.id AS subject_id,
      s.name AS subject_name,
      ROUND(SUM(g.score * g.weight) / NULLIF(SUM(g.weight), 0), 2) AS weighted_average
    FROM subjects s
    LEFT JOIN grades g ON g.subject_id = s.id
    WHERE s.user_id = p_user_id
    GROUP BY s.id, s.name
    ORDER BY s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
