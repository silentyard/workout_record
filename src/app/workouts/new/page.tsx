import { getBodyParts, getExercises } from "./actions";
import NewWorkoutForms from "./NewWorkoutForms";

export default async function NewWorkoutPage() {
  const bodyParts = await getBodyParts();
  const exercises = await getExercises();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1>Workout Record Management</h1>
      <NewWorkoutForms
        initialBodyParts={bodyParts}
        initialExercises={exercises}
      />
    </div>
  );
}
