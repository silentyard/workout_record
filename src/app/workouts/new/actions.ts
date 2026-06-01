"use server";

import { getDb, saveDb } from "@/lib/db";
import { BodyPart, Exercise, SetConfig, WorkoutRecord } from "@/types/workout";
import { revalidatePath } from "next/cache";

export async function getBodyParts() {
  const db = await getDb();
  return db.bodyParts;
}

export async function getExercises() {
  const db = await getDb();
  return db.exercises;
}

export async function addBodyPart(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { error: "Name cannot be empty" };

  const db = await getDb();
  const newPart: BodyPart = { id: crypto.randomUUID(), name };
  db.bodyParts.push(newPart);
  await saveDb(db);

  revalidatePath("/workouts/new");
  return { success: true };
}

export async function addExercise(formData: FormData) {
  const name = formData.get("name") as string;
  const bodyPartId = formData.get("bodyPartId") as string;

  if (!name || !bodyPartId) return { error: "Name and body part are required" };

  const db = await getDb();
  const newExercise: Exercise = { id: crypto.randomUUID(), name, bodyPartId };
  db.exercises.push(newExercise);
  await saveDb(db);

  revalidatePath("/workouts/new");
  return { success: true };
}

export async function addWorkoutRecord(data: {
  date: string;
  exerciseId: string;
  configs: SetConfig[];
}) {
  if (!data.date || !data.exerciseId || !data.configs.length) {
    return { error: "Incomplete data" };
  }

  const db = await getDb();
  const newRecord: WorkoutRecord = {
    id: crypto.randomUUID(),
    date: data.date,
    exerciseId: data.exerciseId,
    configs: data.configs,
  };
  db.records.push(newRecord);
  await saveDb(db);

  revalidatePath("/workouts/new");
  return { success: true };
}
