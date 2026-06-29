'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Body, Exercise, SetConfig, WeightUnit, WorkoutRecord } from '@/types/workout';
import { addWorkoutRecord, getLastWorkoutForExercise } from './actions';
import styles from './NewWorkoutForms.module.scss';

// ─── Feedback state type ──────────────────────────────────────────────────────

type Feedback = { type: 'success' | 'error'; message: string } | null;

// ─── Volume helpers ───────────────────────────────────────────────────────────

const LB_TO_KG = 0.453592;

/** Convert a SetConfig's weight to kg for volume calculation. */
function weightInKg(conf: SetConfig): number {
  return conf.unit === 'lb' ? conf.weight * LB_TO_KG : conf.weight;
}

/** Calculate total volume (kg-unit) for a list of SetConfigs. */
function calcVolume(configs: SetConfig[]): number {
  return configs.reduce((sum, c) => sum + weightInKg(c) * c.reps * c.sets, 0);
}

/** Format a SetConfig list as an array of human-readable summary strings. */
function formatConfigsSummary(configs: SetConfig[]): string[] {
  return configs.map((c) => `${c.weight}${c.unit} × ${c.reps} × ${c.sets}組`);
}

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

  // ── Last workout state ────────────────────────────────────────────────────
  const [lastWorkout, setLastWorkout] = useState<WorkoutRecord | null>(null);
  const [lastWorkoutLoading, setLastWorkoutLoading] = useState(false);

  // ── Text-mode inputs for mobile-friendly number editing ───────────────────
  // We store the raw string typed by the user so that leading zeros, empty
  // fields, and decimal points all work naturally on mobile keyboards.
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({});

  function getRawKey(idx: number, field: string) {
    return `${idx}-${field}`;
  }

  function getRawValue(idx: number, field: string, numericValue: number): string {
    const key = getRawKey(idx, field);
    if (key in rawInputs) return rawInputs[key];
    // Default: show numeric value, but show empty string for 0 so mobile users
    // can type fresh
    return numericValue === 0 ? '' : String(numericValue);
  }

  function handleRawChange(idx: number, field: keyof SetConfig, raw: string) {
    const key = getRawKey(idx, field);
    setRawInputs((prev) => ({ ...prev, [key]: raw }));

    // Parse and update underlying numeric state
    const parsed = field === 'weight' ? parseFloat(raw) : parseInt(raw, 10);
    const value = isNaN(parsed) ? 0 : parsed;
    updateConfig(idx, field, value);
  }

  function handleRawBlur(idx: number, field: string) {
    // On blur, remove the raw override so the canonical numeric value takes over
    const key = getRawKey(idx, field);
    setRawInputs((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  // ── Fetch last workout on exercise change ─────────────────────────────────

  const fetchLastWorkout = useCallback(async (exerciseId: string) => {
    if (!exerciseId) {
      setLastWorkout(null);
      return;
    }
    setLastWorkoutLoading(true);
    try {
      const record = await getLastWorkoutForExercise(exerciseId);
      setLastWorkout(record);
    } catch {
      setLastWorkout(null);
    } finally {
      setLastWorkoutLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLastWorkout(recExerciseId);
  }, [recExerciseId, fetchLastWorkout]);

  // ── Current volume (real-time) ────────────────────────────────────────────

  const currentVolume = useMemo(() => calcVolume(configs), [configs]);

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
    // Also clean up raw inputs for the removed row
    setRawInputs((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`${index}-`)) delete next[key];
      });
      return next;
    });
  }

  // ── Submit handlers ───────────────────────────────────────────────────────

  async function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    setRecFeedback(null);

    // Validate that all numeric fields have sensible values
    for (const conf of configs) {
      if (conf.weight < 0 || conf.reps < 1 || conf.sets < 1) {
        setRecFeedback({ type: 'error', message: '請確認每組的重量、次數和組數都已正確填寫。' });
        return;
      }
    }

    try {
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
        setRawInputs({});
        setRecNotes('');
        // Refresh last workout data for this exercise
        fetchLastWorkout(recExerciseId);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setRecFeedback({ type: 'error', message: e?.message || '儲存失敗，請確認網路連線。' });
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>新增訓練</h1>

      {/* ── Workout Record ────────────────────────────────────────────── */}
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

          {/* ── Last workout summary ──────────────────────────────────── */}
          {recExerciseId && (
            <div className={styles.lastWorkoutBox}>
              <p className={styles.lastWorkoutTitle}>上次紀錄</p>
              {lastWorkoutLoading ? (
                <p className={styles.lastWorkoutContent}>載入中...</p>
              ) : lastWorkout ? (
                <div className={styles.lastWorkoutContent}>
                  <p className={styles.lastWorkoutDate}>
                    📅 {lastWorkout.date}
                  </p>
                  <div className={styles.lastWorkoutDetail}>
                    {formatConfigsSummary(lastWorkout.configs).map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                  <p className={styles.lastWorkoutVolume}>
                    總訓練量：{calcVolume(lastWorkout.configs).toFixed(1)} kg-unit
                  </p>
                </div>
              ) : (
                <p className={styles.lastWorkoutContent}>無歷史紀錄</p>
              )}
            </div>
          )}

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
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    placeholder="0"
                    value={getRawValue(idx, 'weight', conf.weight)}
                    onChange={(e) => handleRawChange(idx, 'weight', e.target.value)}
                    onBlur={() => handleRawBlur(idx, 'weight')}
                    onFocus={(e) => e.target.select()}
                    required
                  />
                </div>
                <div className={styles.setRowLabel}>
                  <span>次數</span>
                  <div className={styles.presetRow}>
                    {[5, 8, 12, 15].map(val => (
                      <button
                        key={val}
                        type="button"
                        className={`${styles.presetBtn} ${conf.reps === val ? styles.presetBtnActive : ''}`}
                        onClick={() => {
                          updateConfig(idx, 'reps', val);
                          // Clear raw input so numeric value takes over
                          setRawInputs((prev) => {
                            const next = { ...prev };
                            delete next[getRawKey(idx, 'reps')];
                            return next;
                          });
                        }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <input
                    className={styles.inputNarrow}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={getRawValue(idx, 'reps', conf.reps)}
                    onChange={(e) => handleRawChange(idx, 'reps', e.target.value)}
                    onBlur={() => handleRawBlur(idx, 'reps')}
                    onFocus={(e) => e.target.select()}
                    required
                  />
                </div>
                <div className={styles.setRowLabel}>
                  <span>組數</span>
                  <div className={styles.presetRow}>
                    {[1, 2, 3, 4].map(val => (
                      <button
                        key={val}
                        type="button"
                        className={`${styles.presetBtn} ${conf.sets === val ? styles.presetBtnActive : ''}`}
                        onClick={() => {
                          updateConfig(idx, 'sets', val);
                          setRawInputs((prev) => {
                            const next = { ...prev };
                            delete next[getRawKey(idx, 'sets')];
                            return next;
                          });
                        }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <input
                    className={styles.inputNarrow}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={getRawValue(idx, 'sets', conf.sets)}
                    onChange={(e) => handleRawChange(idx, 'sets', e.target.value)}
                    onBlur={() => handleRawBlur(idx, 'sets')}
                    onFocus={(e) => e.target.select()}
                    required
                  />
                </div>
                {configs.length > 1 && (
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => removeConfigRow(idx)}
                  >
                    移除
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setConfigs((prev) => [...prev, { weight: 0, reps: 0, sets: 1, unit: weightUnit }]);
              }}
            >
              ＋ 新增一組
            </button>
          </div>

          {/* ── Real-time volume display ──────────────────────────────── */}
          <div className={styles.volumeDisplay}>
            <span className={styles.volumeLabel}>本次訓練量</span>
            <span className={styles.volumeValue}>
              {currentVolume.toFixed(1)} <small>kg-unit</small>
            </span>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="recNotes" className={styles.label}>備註（選填）</label>
            <textarea
              id="recNotes"
              className={styles.textarea}
              value={recNotes}
              onChange={(e) => setRecNotes(e.target.value)}
              placeholder="今天狀態、感受…"
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
