"use client";

import { useState } from "react";
import { BodyPart, Exercise, SetConfig } from "@/types/workout";
import { addBodyPart, addExercise, addWorkoutRecord } from "./actions";

export default function NewWorkoutForms({
  initialBodyParts,
  initialExercises,
}: {
  initialBodyParts: BodyPart[];
  initialExercises: Exercise[];
}) {
  const [partName, setPartName] = useState("");

  const [exName, setExName] = useState("");
  const [exBodyPartId, setExBodyPartId] = useState("");

  const [recDate, setRecDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [recExerciseId, setRecExerciseId] = useState("");
  const [configs, setConfigs] = useState<SetConfig[]>([
    { weight: 0, reps: 0, sets: 1 },
  ]);

  const handleAddBodyPart = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", partName);
    await addBodyPart(formData);
    setPartName("");
    alert("Body part added successfully");
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", exName);
    formData.append("bodyPartId", exBodyPartId);
    await addExercise(formData);
    setExName("");
    setExBodyPartId("");
    alert("Exercise added successfully");
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await addWorkoutRecord({
      date: recDate,
      exerciseId: recExerciseId,
      configs,
    });
    if (res && res.error) alert(res.error);
    else {
      alert("Workout record added successfully");
      setConfigs([{ weight: 0, reps: 0, sets: 1 }]);
    }
  };

  const addConfigRow = () => {
    setConfigs([...configs, { weight: 0, reps: 0, sets: 1 }]);
  };

  const updateConfig = (
    index: number,
    field: keyof SetConfig,
    value: number,
  ) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setConfigs(newConfigs);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <section
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h2>1. Add Body Part</h2>
        <form
          onSubmit={handleAddBodyPart}
          style={{ display: "flex", gap: "1rem", alignItems: "center" }}
        >
          <input
            type="text"
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            placeholder="Body Part Name (e.g., Chest)"
            required
            style={{ padding: "0.5rem", color: "black" }}
          />
          <button
            type="submit"
            style={{ padding: "0.5rem 1rem", color: "black" }}
          >
            Add Body Part
          </button>
        </form>
      </section>

      <section
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h2>2. Add Exercise</h2>
        <form
          onSubmit={handleAddExercise}
          style={{ display: "flex", gap: "1rem", alignItems: "center" }}
        >
          <select
            value={exBodyPartId}
            onChange={(e) => setExBodyPartId(e.target.value)}
            required
            style={{ padding: "0.5rem", color: "black" }}
          >
            <option value="">Select Body Part</option>
            {initialBodyParts.map((bp) => (
              <option key={bp.id} value={bp.id}>
                {bp.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={exName}
            onChange={(e) => setExName(e.target.value)}
            placeholder="Exercise Name (e.g., Squat)"
            required
            style={{ padding: "0.5rem", color: "black" }}
          />
          <button
            type="submit"
            style={{ padding: "0.5rem 1rem", color: "black" }}
          >
            Add Exercise
          </button>
        </form>
      </section>

      <section
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h2>3. Add Workout Record</h2>
        <form
          onSubmit={handleAddRecord}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div>
            <label>Date:</label>
            <input
              type="date"
              value={recDate}
              onChange={(e) => setRecDate(e.target.value)}
              required
              style={{ padding: "0.5rem", color: "black" }}
            />
          </div>
          <div>
            <label>Exercise:</label>
            <select
              value={recExerciseId}
              onChange={(e) => setRecExerciseId(e.target.value)}
              required
              style={{ padding: "0.5rem", color: "black" }}
            >
              <option value="">Select Exercise</option>
              {initialExercises.map((ex) => {
                const part = initialBodyParts.find(
                  (p) => p.id === ex.bodyPartId,
                );
                return (
                  <option key={ex.id} value={ex.id}>
                    {part?.name} - {ex.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ border: "1px dashed #aaa", padding: "1rem" }}>
            <p style={{ margin: "0 0 1rem 0" }}>
              Set Configs (Weight/Reps/Sets):
            </p>
            {configs.map((conf, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginBottom: "0.5rem",
                  alignItems: "center",
                }}
              >
                <label>
                  Weight (kg):{" "}
                  <input
                    type="number"
                    step="0.1"
                    value={conf.weight}
                    onChange={(e) =>
                      updateConfig(idx, "weight", parseFloat(e.target.value))
                    }
                    style={{ width: "80px", color: "black" }}
                    required
                  />
                </label>
                <label>
                  Reps:{" "}
                  <input
                    type="number"
                    value={conf.reps}
                    onChange={(e) =>
                      updateConfig(idx, "reps", parseInt(e.target.value))
                    }
                    style={{ width: "80px", color: "black" }}
                    required
                  />
                </label>
                <label>
                  Sets:{" "}
                  <input
                    type="number"
                    value={conf.sets}
                    onChange={(e) =>
                      updateConfig(idx, "sets", parseInt(e.target.value))
                    }
                    style={{ width: "80px", color: "black" }}
                    required
                  />
                </label>
              </div>
            ))}
            <button
              type="button"
              onClick={addConfigRow}
              style={{ marginTop: "0.5rem", padding: "0.5rem", color: "black" }}
            >
              + Add Set Config
            </button>
          </div>

          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Save Workout Record
          </button>
        </form>
      </section>
    </div>
  );
}
