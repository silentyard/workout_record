import { getBodyParts, getExercises } from './actions';
import NewWorkoutForms from './NewWorkoutForms';

export default async function NewWorkoutPage() {
  const bodyParts = await getBodyParts();
  const exercises = await getExercises();

  return (
    <NewWorkoutForms
      initialBodyParts={bodyParts}
      initialExercises={exercises}
    />
  );
}
