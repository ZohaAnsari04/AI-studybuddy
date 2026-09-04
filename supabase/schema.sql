-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT,
  status TEXT DEFAULT 'ready' CHECK (status IN ('uploading', 'reading', 'understanding', 'organizing', 'ready', 'failed')),
  units_detected INT DEFAULT 0,
  topics_identified INT DEFAULT 0,
  concepts_extracted INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DOCUMENT CHUNKS TABLE (with pgvector embedding)
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  unit_title TEXT DEFAULT 'Unit 1',
  page_number INT,
  text_content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code TEXT DEFAULT 'CS-101',
  description TEXT,
  documents_count INT DEFAULT 1,
  total_topics INT DEFAULT 0,
  mastered_topics INT DEFAULT 0,
  progress_percent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COURSE TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.course_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_number INT DEFAULT 1,
  unit_title TEXT DEFAULT 'Unit 1',
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('mastered', 'learning', 'needs_review', 'not_started')),
  difficulty TEXT DEFAULT 'medium',
  confidence_score INT DEFAULT 0,
  technical_explanation TEXT,
  eli10_explanation TEXT,
  analogy TEXT,
  example TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  common_mistakes JSONB DEFAULT '[]'::jsonb,
  quick_check JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'nova')),
  text_content TEXT NOT NULL,
  citations_json JSONB DEFAULT '[]'::jsonb,
  is_fallback BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_title TEXT NOT NULL,
  course_title TEXT NOT NULL,
  topic_id TEXT,
  topic_title TEXT,
  score_percent INT NOT NULL,
  total_questions INT NOT NULL,
  correct_count INT NOT NULL,
  questions_json JSONB NOT NULL,
  weak_topics_json JSONB DEFAULT '[]'::jsonb,
  strong_topics_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REVISION TASKS TABLE
CREATE TABLE IF NOT EXISTS public.revision_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic_id TEXT,
  topic_title TEXT NOT NULL,
  task_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  duration_minutes INT DEFAULT 30,
  task_type TEXT DEFAULT 'review' CHECK (task_type IN ('review', 'quiz', 'practice', 'reading')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- ROW-LEVEL SECURITY (RLS) MULTI-TENANT ISOLATION POLICIES
-- ===================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_tasks ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Documents Policies
CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Document Chunks Policies
CREATE POLICY "Users can view own document chunks" ON public.document_chunks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own document chunks" ON public.document_chunks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own document chunks" ON public.document_chunks FOR DELETE USING (auth.uid() = user_id);

-- Courses & Topics Policies
CREATE POLICY "Users can view own courses" ON public.courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own courses" ON public.courses FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own course topics" ON public.course_topics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own course topics" ON public.course_topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own course topics" ON public.course_topics FOR DELETE USING (auth.uid() = user_id);

-- Chat Messages Policies
CREATE POLICY "Users can view own chat messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quizzes & Revision Tasks Policies
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own revision tasks" ON public.revision_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own revision tasks" ON public.revision_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own revision tasks" ON public.revision_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own revision tasks" ON public.revision_tasks FOR DELETE USING (auth.uid() = user_id);

-- ===================================================================
-- VECTOR SIMILARITY SEARCH FUNCTION FOR GROUNDED RAG CHAT
-- ===================================================================

CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_count INT,
  filter_user_id UUID
) RETURNS TABLE (
  id UUID,
  document_id UUID,
  document_name TEXT,
  unit_title TEXT,
  page_number INT,
  text_content TEXT,
  similarity FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.document_name,
    dc.unit_title,
    dc.page_number,
    dc.text_content,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  WHERE dc.user_id = filter_user_id
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
