'use client';

import { useState } from 'react';
import { Body, Exercise, SetConfig, WeightUnit } from '@/types/workout';
import { addWorkoutRecord } from './actions';
import styles from './NewWorkoutForms.module.scss';

// ─── Feedback state type ──────────────────────────────────────────────────────

type Feedback = { type: 'success' | 'error'; message: string } | null;

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewWorkoutForms({
  initialBodyParts,
  initialExercises,
}: {
  initialBodyParts: Body[];
  initialExercises: Exercise[];
}) {

  // ── Workout-record form state ─────────────────────────────────────────────
  const [recDate, setRecDate] = useState(new Date().toISOString().split('T')[0]);
  const [recExerciseId, setRecExerciseId] = useState('');
  const [recNotes, setRecNotes] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [configs, setConfigs] = useState<SetConfig[]>([{ weight: 0, reps: 0, sets: 1, unit: 'kg' }]);
  const [recFeedback, setRecFeedback] = useState<Feedback>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function updateConfig(index: number, field: keyof SetConfig, value: number) {
    setConfigs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function removeConfigRow(index: number) {
    setConfigs((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Submit handlers ───────────────────────────────────────────────────────

  async function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    setRecFeedback(null);
    const res = await addWorkoutRecord({
      date: recDate,
      exerciseId: recExerciseId,
      configs,
      notes: recNotes || undefined,
    });
    if (res?.error) {
      setRecFeedback({ type: 'error', message: res.error });
    } else {
      setRecFeedback({ type: 'success', message: '訓練記錄已儲存' });
      setConfigs([{ weight: 0, reps: 0, sets: 1, unit: weightUnit }]);
      setRecNotes('');
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>新增訓練</h1>

      {/* ── 3. Workout Record ────────────────────────────────────────────── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>記錄訓練量</h2>

        <form className={styles.stackedForm} onSubmit={handleAddRecord}>
          <div className={styles.inlineForm}>
            <div className={styles.fieldGroup}>
              <label htmlFor="recDate" className={styles.label}>日期</label>
              <input
                id="recDate"
                className={styles.input}
                type="date"
                value={recDate}
                onChange={(e) => setRecDate(e.target.value)}
                required
                disabled={false}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="recExercise" className={styles.label}>動作</label>
              <select
                id="recExercise"
                className={styles.select}
                value={recExerciseId}
                onChange={(e) => setRecExerciseId(e.target.value)}
                required
                disabled={false}
              >
                <option value="">選擇動作</option>
                {initialBodyParts.map((bp) => {
                  const bpExercises = initialExercises.filter((ex) => ex.body_id === bp.id);
                  if (bpExercises.length === 0) return null;
                  return (
                    <optgroup key={bp.id} label={bp.name}>
                      {bpExercises.map((ex) => (
                        <option key={ex.id} value={ex.id}>{ex.name}</option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>
          </div>

          <div className={styles.setBlock}>
            <div className={styles.setBlockHeader}>
              <p className={styles.setBlockTitle}>組數設定</p>
              <div className={styles.unitToggle}>
                {(['kg', 'lb'] as WeightUnit[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    className={`${styles.unitBtn} ${weightUnit === u ? styles.unitBtnActive : ''}`}
                    onClick={() => {
                      setWeightUnit(u);
                      setConfigs((prev) => prev.map((c) => ({ ...c, unit: u })));
                    }}
                    disabled={false}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            {configs.map((conf, idx) => (
              <div key={idx} className={styles.setRow}>
                <div className={styles.setRowLabel}>
                  <span>重量 ({weightUnit})</span>
                  <input
                    className={styles.inputNarrow}
                    type="number"
                    step="0.5"
                    min="0"
                    value={conf.weight}
                    onChange={(e) => updateConfig(idx, 'weight', parseFloat(e.target.value) || 0)}
                    required
                    disabled={false}
                  />
                </div>
                <div className={styles.setRowLabel}>
                  <span>次數</span>
                  <input
                    className={styles.inputNarrow}
                    type="number"
                    min="1"
                    value={conf.reps}
                    onChange={(e) => updateConfig(idx, 'reps', parseInt(e.target.value) || 0)}
                    required
                    disabled={false}
                  />
                </div>
                <div className={styles.setRowLabel}>
                  <span>組數</span>
                  <input
                    className={styles.inputNarrow}
                    type="number"
                    min="1"
                    value={conf.sets}
                    onChange={(e) => updateConfig(idx, 'sets', parseInt(e.target.value) || 0)}
                    required
                    disabled={false}
                  />
                </div>
                {configs.length > 1 && (
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => removeConfigRow(idx)}
                    disabled={false}
                  >
                    移除
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setConfigs((prev) => [...prev, { weight: 0, reps: 0, sets: 1, unit: weightUnit }])}
              disabled={false}
            >
              ＋ 新增一組
            </button>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="recNotes" className={styles.label}>備註（選填）</label>
            <textarea
              id="recNotes"
              className={styles.textarea}
              value={recNotes}
              onChange={(e) => setRecNotes(e.target.value)}
              placeholder="今天狀態、感受…"
              disabled={false}
            />
          </div>

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={!recExerciseId || !recDate}
          >
            儲存訓練記錄
          </button>
        </form>

        {recFeedback && (
          <p className={recFeedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}>
            {recFeedback.message}
          </p>
        )}
      </section>
    </div>
  );
}
