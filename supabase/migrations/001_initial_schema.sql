-- Migration: 001_initial_schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- body: muscle groups / body parts
CREATE TABLE IF NOT EXISTS body (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- exercise: a specific movement, linked to a body part
CREATE TABLE IF NOT EXISTS exercise (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  body_id     uuid        NOT NULL REFERENCES body(id) ON DELETE CASCADE,
  image_url   text,                          -- Vercel Blob URL (optional)
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, body_id)
);

-- workout_record: a logged workout session for one exercise
CREATE TABLE IF NOT EXISTS workout_record (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  date        date        NOT NULL,
  exercise_id uuid        NOT NULL REFERENCES exercise(id) ON DELETE CASCADE,
  configs     jsonb       NOT NULL DEFAULT '[]'::jsonb, -- [{weight, reps, sets}]
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_exercise_body_id         ON exercise(body_id);
CREATE INDEX IF NOT EXISTS idx_workout_record_exercise  ON workout_record(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_record_date      ON workout_record(date DESC);
