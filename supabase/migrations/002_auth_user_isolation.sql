-- Migration: 002_auth_user_isolation
-- Run in Supabase SQL Editor AFTER truncating all tables:
--   TRUNCATE workout_record, exercise, body CASCADE;
--
-- This migration adds per-user data isolation using Supabase Auth (auth.users).

-- ── Add user_id to body ───────────────────────────────────────────────────────

ALTER TABLE body
  ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── Add user_id to exercise ───────────────────────────────────────────────────

ALTER TABLE exercise
  ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── Add user_id to workout_record ─────────────────────────────────────────────

ALTER TABLE workout_record
  ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── Enable Row Level Security ─────────────────────────────────────────────────

ALTER TABLE body           ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_record ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies: body ────────────────────────────────────────────────────────

CREATE POLICY "body: select own"  ON body FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "body: insert own"  ON body FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "body: update own"  ON body FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "body: delete own"  ON body FOR DELETE USING (auth.uid() = user_id);

-- ── RLS Policies: exercise ────────────────────────────────────────────────────

CREATE POLICY "exercise: select own"  ON exercise FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "exercise: insert own"  ON exercise FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exercise: update own"  ON exercise FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "exercise: delete own"  ON exercise FOR DELETE USING (auth.uid() = user_id);

-- ── RLS Policies: workout_record ──────────────────────────────────────────────

CREATE POLICY "workout_record: select own"  ON workout_record FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workout_record: insert own"  ON workout_record FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_record: update own"  ON workout_record FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "workout_record: delete own"  ON workout_record FOR DELETE USING (auth.uid() = user_id);

-- ── Indexes for user_id (query performance) ───────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_body_user_id           ON body(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_user_id       ON exercise(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_record_user_id ON workout_record(user_id);
