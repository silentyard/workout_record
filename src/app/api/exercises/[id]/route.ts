import { NextRequest, NextResponse } from 'next/server';
import { updateExercise, deleteExercise } from '@/lib/exercise';
import type { UpdateExerciseInput } from '@/types/workout';

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<UpdateExerciseInput>;

    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 });
    }

    const updated = await updateExercise(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteExercise(id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
