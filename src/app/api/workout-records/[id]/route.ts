import { NextRequest, NextResponse } from 'next/server';
import { updateWorkoutRecord, deleteWorkoutRecord } from '@/lib/workoutRecord';
import type { UpdateWorkoutRecordInput } from '@/types/workout';

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<UpdateWorkoutRecordInput>;

    const updated = await updateWorkoutRecord(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteWorkoutRecord(id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
