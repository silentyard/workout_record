import { NextRequest, NextResponse } from 'next/server';
import { createWorkoutRecord, listWorkoutRecords, listWorkoutRecordsByExercise } from '@/lib/workoutRecord';
import type { CreateWorkoutRecordInput, SetConfig } from '@/types/workout';

/**
 * GET /api/workout-records
 * GET /api/workout-records?exerciseId=<uuid>  – filter by exercise
 */
export async function GET(request: NextRequest) {
  try {
    const exerciseId = request.nextUrl.searchParams.get('exerciseId');
    const records = exerciseId
      ? await listWorkoutRecordsByExercise(exerciseId)
      : await listWorkoutRecords();

    return NextResponse.json(records);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/workout-records
 * Body (JSON):
 * {
 *   date:        string,       // "YYYY-MM-DD"
 *   exercise_id: string,       // uuid
 *   configs:     SetConfig[],  // [{ weight, reps, sets }]
 *   notes?:      string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const json = (await request.json()) as Partial<CreateWorkoutRecordInput>;

    if (!json.date || !json.exercise_id || !Array.isArray(json.configs) || json.configs.length === 0) {
      return NextResponse.json(
        { error: 'date, exercise_id, and at least one config entry are required' },
        { status: 400 }
      );
    }

    // Validate each SetConfig entry
    const validConfigs = (json.configs as SetConfig[]).every(
      (c) =>
        typeof c.weight === 'number' &&
        typeof c.reps === 'number' &&
        typeof c.sets === 'number'
    );
    if (!validConfigs) {
      return NextResponse.json(
        { error: 'Each config must have numeric weight, reps, and sets' },
        { status: 400 }
      );
    }

    const input: CreateWorkoutRecordInput = {
      date: json.date,
      exercise_id: json.exercise_id,
      configs: json.configs,
      notes: json.notes,
    };

    const created = await createWorkoutRecord(input);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
