import { NextRequest, NextResponse } from 'next/server';
import { createBody, listBodies } from '@/lib/body';
import type { CreateBodyInput } from '@/types/workout';

export async function GET() {
  try {
    const bodies = await listBodies();
    return NextResponse.json(bodies);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CreateBodyInput>;

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const created = await createBody({ name: body.name });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
