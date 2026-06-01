import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createExercise, listExercises, listExercisesByBody } from '@/lib/exercise';
import type { CreateExerciseInput } from '@/types/workout';

/**
 * GET /api/exercises
 * GET /api/exercises?bodyId=<uuid>   – filter by body part
 */
export async function GET(request: NextRequest) {
  try {
    const bodyId = request.nextUrl.searchParams.get('bodyId');
    const exercises = bodyId
      ? await listExercisesByBody(bodyId)
      : await listExercises();

    return NextResponse.json(exercises);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/exercises
 * Accepts multipart/form-data with fields:
 *   - name        (string, required)
 *   - body_id     (string / uuid, required)
 *   - image       (File, optional) – uploaded to Vercel Blob
 *
 * Also accepts application/json without an image:
 *   { name, body_id }
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    let input: CreateExerciseInput;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const name = (formData.get('name') as string | null)?.trim();
      const body_id = (formData.get('body_id') as string | null)?.trim();
      const imageFile = formData.get('image') as File | null;

      if (!name || !body_id) {
        return NextResponse.json(
          { error: 'name and body_id are required' },
          { status: 400 }
        );
      }

      let image_url: string | undefined;
      if (imageFile && imageFile.size > 0) {
        const blob = await put(`exercises/${body_id}/${name}`, imageFile, {
          access: 'public',
          contentType: imageFile.type,
        });
        image_url = blob.url;
      }

      input = { name, body_id, image_url };
    } else {
      // JSON body (no image)
      const json = (await request.json()) as Partial<CreateExerciseInput>;
      if (!json.name?.trim() || !json.body_id?.trim()) {
        return NextResponse.json(
          { error: 'name and body_id are required' },
          { status: 400 }
        );
      }
      input = { name: json.name, body_id: json.body_id };
    }

    const created = await createExercise(input);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
