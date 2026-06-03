'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Body, Exercise, SetConfig, WeightUnit } from '@/types/workout';
import { addBodyPart, addExercise, addWorkoutRecord } from './actions';
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Body-part form state ──────────────────────────────────────────────────
  const [partName, setPartName] = useState('');
  const [partFeedback, setPartFeedback] = useState<Feedback>(null);

  // ── Exercise form state ───────────────────────────────────────────────────
  const [exName, setExName] = useState('');
  const [exBodyId, setExBodyId] = useState('');
  const [exImage, setExImage] = useState<File | null>(null);
  const [exImagePreview, setExImagePreview] = useState<string | null>(null);
  const [exFeedback, setExFeedback] = useState<Feedback>(null);

  // ── Workout-record form state ─────────────────────────────────────────────
  const [recDate, setRecDate] = useState(new Date().toISOString().split('T')[0]);
  const [recExerciseId, setRecExerciseId] = useState('');
  const [recNotes, setRecNotes] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [configs, setConfigs] = useState<SetConfig[]>([{ weight: 0, reps: 0, sets: 1, unit: 'kg' }]);
  const [recFeedback, setRecFeedback] = useState<Feedback>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function refreshData() {
    startTransition(() => router.refresh());
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (exImagePreview) URL.revokeObjectURL(exImagePreview);
    setExImage(file);
    setExImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function clearImage() {
    if (exImagePreview) URL.revokeObjectURL(exImagePreview);
    setExImage(null);
    setExImagePreview(null);
  }

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

  async function handleAddBodyPart(e: React.FormEvent) {
    e.preventDefault();
    setPartFeedback(null);
    const fd = new FormData();
    fd.append('name', partName);
    const res = await addBodyPart(fd);
    if (res?.error) {
      setPartFeedback({ type: 'error', message: res.error });
    } else {
      setPartFeedback({ type: 'success', message: `"${partName}" 新增成功` });
      setPartName('');
      refreshData();
    }
  }

  async function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    setExFeedback(null);
    const fd = new FormData();
    fd.append('name', exName);
    fd.append('bodyPartId', exBodyId);
    if (exImage) fd.append('image', exImage);
    const res = await addExercise(fd);
    if (res?.error) {
      setExFeedback({ type: 'error', message: res.error });
    } else {
      setExFeedback({ type: 'success', message: `"${exName}" 新增成功` });
      setExName('');
      setExBodyId('');
      clearImage();
      refreshData();
    }
  }

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

      {/* ── 1. Body Part ─────────────────────────────────────────────────── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>1. 新增部位</h2>

        <form className={styles.inlineForm} onSubmit={handleAddBodyPart}>
          <div className={styles.fieldGroup}>
            <label htmlFor="partName" className={styles.label}>部位名稱</label>
            <input
              id="partName"
              className={styles.input}
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="例：胸、背、腿"
              required
              disabled={isPending}
            />
          </div>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={isPending || !partName.trim()}
          >
            新增部位
          </button>
        </form>

        {partFeedback && (
          <p className={partFeedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}>
            {partFeedback.message}
          </p>
        )}

        <hr className={styles.divider} />
        <p className={styles.label}>已建立的部位</p>
        {initialBodyParts.length === 0 ? (
          <p className={styles.tagEmpty}>尚無部位</p>
        ) : (
          <div className={styles.tagList}>
            {initialBodyParts.map((bp) => (
              <span key={bp.id} className={styles.tag}>{bp.name}</span>
            ))}
          </div>
        )}
      </section>

      {/* ── 2. Exercise ──────────────────────────────────────────────────── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>2. 新增動作</h2>

        <form className={styles.inlineForm} onSubmit={handleAddExercise}>
          <div className={styles.fieldGroup}>
            <label htmlFor="exBodyId" className={styles.label}>部位</label>
            <select
              id="exBodyId"
              className={styles.select}
              value={exBodyId}
              onChange={(e) => setExBodyId(e.target.value)}
              required
              disabled={isPending}
            >
              <option value="">選擇部位</option>
              {initialBodyParts.map((bp) => (
                <option key={bp.id} value={bp.id}>{bp.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="exName" className={styles.label}>動作名稱</label>
            <input
              id="exName"
              className={styles.input}
              type="text"
              value={exName}
              onChange={(e) => setExName(e.target.value)}
              placeholder="例：深蹲、臥推"
              required
              disabled={isPending}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>動作圖片（選填）</label>
            <label className={styles.fileInputLabel}>
              📷 {exImage ? exImage.name : '選擇圖片'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isPending}
              />
            </label>
          </div>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={isPending || !exName.trim() || !exBodyId}
          >
            新增動作
          </button>
        </form>

        {exImagePreview && (
          <div className={styles.imagePreviewWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={exImagePreview} alt="預覽" className={styles.imagePreview} />
            <button type="button" className={styles.imageClear} onClick={clearImage}>
              移除圖片
            </button>
          </div>
        )}

        {exFeedback && (
          <p className={exFeedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}>
            {exFeedback.message}
          </p>
        )}

        <hr className={styles.divider} />
        <p className={styles.label}>已建立的動作</p>
        {initialExercises.length === 0 ? (
          <p className={styles.tagEmpty}>尚無動作</p>
        ) : (
          <div className={styles.tagList}>
            {initialExercises.map((ex) => {
              const part = initialBodyParts.find((p) => p.id === ex.body_id);
              return (
                <span key={ex.id} className={styles.tag}>
                  {part ? `${part.name} · ` : ''}{ex.name}
                </span>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 3. Workout Record ────────────────────────────────────────────── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>3. 記錄訓練量</h2>

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
                disabled={isPending}
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
                disabled={isPending}
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
                    disabled={isPending}
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
                    disabled={isPending}
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
                    disabled={isPending}
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
                    disabled={isPending}
                  />
                </div>
                {configs.length > 1 && (
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => removeConfigRow(idx)}
                    disabled={isPending}
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
              disabled={isPending}
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
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={isPending || !recExerciseId || !recDate}
          >
            {isPending ? '儲存中…' : '儲存訓練記錄'}
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
