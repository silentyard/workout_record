'use server';

import { revalidatePath } from 'next/cache';
import { put } from '@vercel/blob';
import { listBodies, createBody, updateBody, deleteBody } from '@/lib/body';
import { listExercisesByBody, listExercises, createExercise, updateExercise, deleteExercise } from '@/lib/exercise';

export async function getBodyParts() {
  return listBodies();
}

export async function getExercises(bodyId?: string) {
  if (bodyId) return listExercisesByBody(bodyId);
  return listExercises();
}

export async function addBodyPart(formData: FormData) {
  const name = (formData.get('name') as string | null)?.trim();
  if (!name) return { error: 'Name cannot be empty' };

  try {
    await createBody({ name });
    revalidatePath('/settings/exercises');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { error: message };
  }
}

export async function addExercise(formData: FormData) {
  const name = (formData.get('name') as string | null)?.trim();
  const body_id = (formData.get('bodyPartId') as string | null)?.trim();
  const imageFile = formData.get('image') as File | null;

  if (!name || !body_id) return { error: 'Name and body part are required' };

  try {
    let image_url: string | undefined;
    if (imageFile && imageFile.size > 0) {
      const blob = await put(`exercises/${body_id}/${name}`, imageFile, {
        access: 'public',
        contentType: imageFile.type,
      });
      image_url = blob.url;
    }

    await createExercise({ name, body_id, image_url });
    revalidatePath('/settings/exercises');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { error: message };
  }
}

export async function updateBodyPartAction(id: string, formData: FormData) {
  const name = (formData.get('name') as string | null)?.trim();
  if (!name) return { error: 'Name cannot be empty' };

  try {
    await updateBody(id, { name });
    revalidatePath('/settings/exercises');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { error: message };
  }
}

export async function deleteBodyPartAction(id: string) {
  try {
    await deleteBody(id);
    revalidatePath('/settings/exercises');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { error: message };
  }
}

export async function updateExerciseAction(id: string, formData: FormData) {
  const name = (formData.get('name') as string | null)?.trim();
  const body_id = (formData.get('bodyPartId') as string | null)?.trim();
  const imageFile = formData.get('image') as File | null;

  if (!name || !body_id) return { error: 'Name and body part are required' };

  try {
    let image_url: string | undefined;
    if (imageFile && imageFile.size > 0) {
      const blob = await put(`exercises/${body_id}/${name}`, imageFile, {
        access: 'public',
        contentType: imageFile.type,
      });
      image_url = blob.url;
    }

    // Only pass image_url if a new image was uploaded
    await updateExercise(id, { name, body_id, ...(image_url ? { image_url } : {}) });
    revalidatePath('/settings/exercises');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { error: message };
  }
}

export async function deleteExerciseAction(id: string) {
  try {
    await deleteExercise(id);
    revalidatePath('/settings/exercises');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { error: message };
  }
}
