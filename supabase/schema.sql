-- =============================================
-- LMS 프로젝트 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 1. courses 테이블 (강의 묶음)
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  sequence INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. lessons 테이블 (개별 레슨)
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  video_id VARCHAR(100) NOT NULL,  -- VdoCipher 영상 ID
  duration INTEGER DEFAULT 0,
  sequence INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. license_keys 테이블 (라이선스 키)
CREATE TABLE IF NOT EXISTS license_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(19) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  current_device_id VARCHAR(50),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  memo TEXT,
  email VARCHAR(255),  -- 워터마크용 이메일
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. user_progress 테이블 (진도율)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key_id UUID NOT NULL REFERENCES license_keys(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  watch_seconds INTEGER DEFAULT 0,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(license_key_id, lesson_id)
);

-- 5. reviews 테이블 (수강 후기)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key_id UUID NOT NULL REFERENCES license_keys(id) ON DELETE CASCADE UNIQUE,  -- 1인 1후기
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),  -- 별점 1~5
  content TEXT NOT NULL,
  author_name VARCHAR(50),  -- 표시할 이름 (익명 가능)
  is_visible BOOLEAN DEFAULT false,  -- 관리자 승인 후 노출
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 인덱스 생성 (성능 최적화)
-- =============================================

CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_license_key_id ON user_progress(license_key_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_license_keys_key ON license_keys(key);
CREATE INDEX IF NOT EXISTS idx_reviews_visible ON reviews(is_visible);

-- =============================================
-- RLS (Row Level Security) 설정
-- =============================================

-- RLS 활성화
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- courses: 모두 읽기 가능
CREATE POLICY "courses_select_policy" ON courses
  FOR SELECT USING (true);

-- courses: 인증된 사용자만 CUD (관리자)
CREATE POLICY "courses_insert_policy" ON courses
  FOR INSERT WITH CHECK (true);
CREATE POLICY "courses_update_policy" ON courses
  FOR UPDATE USING (true);
CREATE POLICY "courses_delete_policy" ON courses
  FOR DELETE USING (true);

-- lessons: 모두 읽기 가능
CREATE POLICY "lessons_select_policy" ON lessons
  FOR SELECT USING (true);

-- lessons: 인증된 사용자만 CUD
CREATE POLICY "lessons_insert_policy" ON lessons
  FOR INSERT WITH CHECK (true);
CREATE POLICY "lessons_update_policy" ON lessons
  FOR UPDATE USING (true);
CREATE POLICY "lessons_delete_policy" ON lessons
  FOR DELETE USING (true);

-- license_keys: 모두 읽기/쓰기 가능 (키 검증용)
CREATE POLICY "license_keys_select_policy" ON license_keys
  FOR SELECT USING (true);
CREATE POLICY "license_keys_insert_policy" ON license_keys
  FOR INSERT WITH CHECK (true);
CREATE POLICY "license_keys_update_policy" ON license_keys
  FOR UPDATE USING (true);
CREATE POLICY "license_keys_delete_policy" ON license_keys
  FOR DELETE USING (true);

-- user_progress: 모두 읽기/쓰기 가능 (진도 저장용)
CREATE POLICY "user_progress_select_policy" ON user_progress
  FOR SELECT USING (true);
CREATE POLICY "user_progress_insert_policy" ON user_progress
  FOR INSERT WITH CHECK (true);
CREATE POLICY "user_progress_update_policy" ON user_progress
  FOR UPDATE USING (true);
CREATE POLICY "user_progress_delete_policy" ON user_progress
  FOR DELETE USING (true);

-- reviews: 모두 읽기/쓰기 가능
CREATE POLICY "reviews_select_policy" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_policy" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_update_policy" ON reviews FOR UPDATE USING (true);
CREATE POLICY "reviews_delete_policy" ON reviews FOR DELETE USING (true);

-- =============================================
-- 5. user_notes 테이블 (메모 기능)
-- =============================================

CREATE TABLE IF NOT EXISTS user_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key_id UUID NOT NULL REFERENCES license_keys(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notes_license_lesson ON user_notes(license_key_id, lesson_id);

ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_notes_select_policy" ON user_notes FOR SELECT USING (true);
CREATE POLICY "user_notes_insert_policy" ON user_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "user_notes_update_policy" ON user_notes FOR UPDATE USING (true);
CREATE POLICY "user_notes_delete_policy" ON user_notes FOR DELETE USING (true);

-- =============================================
-- 6. user_bookmarks 테이블 (북마크 기능)
-- =============================================

CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key_id UUID NOT NULL REFERENCES license_keys(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL DEFAULT 0,
  label VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_license_lesson ON user_bookmarks(license_key_id, lesson_id);

ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_bookmarks_select_policy" ON user_bookmarks FOR SELECT USING (true);
CREATE POLICY "user_bookmarks_insert_policy" ON user_bookmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "user_bookmarks_delete_policy" ON user_bookmarks FOR DELETE USING (true);

-- =============================================
-- 7. user_achievements 테이블 (뱃지/레벨)
-- =============================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key_id UUID NOT NULL REFERENCES license_keys(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  achievement_data JSONB DEFAULT '{}',
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(license_key_id, achievement_type)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_license ON user_achievements(license_key_id);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_achievements_select_policy" ON user_achievements FOR SELECT USING (true);
CREATE POLICY "user_achievements_insert_policy" ON user_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "user_achievements_update_policy" ON user_achievements FOR UPDATE USING (true);

-- =============================================
-- 8. user_streaks 테이블 (연속 학습 스트릭)
-- =============================================

CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key_id UUID NOT NULL REFERENCES license_keys(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_streaks_select_policy" ON user_streaks FOR SELECT USING (true);
CREATE POLICY "user_streaks_insert_policy" ON user_streaks FOR INSERT WITH CHECK (true);
CREATE POLICY "user_streaks_update_policy" ON user_streaks FOR UPDATE USING (true);

-- =============================================
-- 테스트 데이터 (선택사항)
-- =============================================

-- 테스트 강의 추가
-- INSERT INTO courses (title, description, is_published, sequence) VALUES
-- ('Next.js 완벽 가이드', 'Next.js 14를 활용한 풀스택 개발', true, 0),
-- ('React 기초부터 고급까지', 'React의 모든 것을 배워보세요', true, 1);

-- 테스트 라이선스 키 추가 (30일 유효)
-- INSERT INTO license_keys (key, expires_at, memo) VALUES
-- ('TEST-1234-ABCD-5678', NOW() + INTERVAL '30 days', '테스트용 키');
