import { getBodyParts, getExercises } from './actions';
import ExerciseManager from './ExerciseManager';

export const metadata = {
  title: '部位 / 動作管理 | Workout Record',
};

export default async function SettingsExercisesPage() {
  const [bodies, exercises] = await Promise.all([
    getBodyParts(),
    getExercises(),
  ]);

  return <ExerciseManager initialBodyParts={bodies} initialExercises={exercises} />;
}
