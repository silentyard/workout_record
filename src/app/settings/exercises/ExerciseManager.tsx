'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { Body, Exercise } from '@/types/workout';
import {
  addBodyPart,
  addExercise,
  updateBodyPartAction,
  deleteBodyPartAction,
  updateExerciseAction,
  deleteExerciseAction,
} from './actions';
import styles from './ExerciseManager.module.scss';

type Feedback = { type: 'success' | 'error'; message: string } | null;

export default function ExerciseManager({
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
  const [editingBodyId, setEditingBodyId] = useState<string | null>(null);

  // ── Exercise form state ───────────────────────────────────────────────────
  const [exName, setExName] = useState('');
  const [exBodyId, setExBodyId] = useState('');
  const [exImage, setExImage] = useState<File | null>(null);
  const [exImagePreview, setExImagePreview] = useState<string | null>(null);
  const [exFeedback, setExFeedback] = useState<Feedback>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  function refreshData() {
    startTransition(() => router.refresh());
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (exImagePreview && !exImagePreview.startsWith('http')) {
      URL.revokeObjectURL(exImagePreview);
    }
    setExImage(file);
    setExImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function clearImage() {
    if (exImagePreview && !exImagePreview.startsWith('http')) {
      URL.revokeObjectURL(exImagePreview);
    }
    setExImage(null);
    setExImagePreview(null);
  }

  // ── Body Part Actions ─────────────────────────────────────────────────────

  async function handleAddOrUpdateBodyPart(e: React.FormEvent) {
    e.preventDefault();
    setPartFeedback(null);

    if (editingBodyId) {
      if (!window.confirm('確定要儲存部位修改嗎？')) return;
    }

    try {
      const fd = new FormData();
      fd.append('name', partName);
      
      const res = editingBodyId
        ? await updateBodyPartAction(editingBodyId, fd)
        : await addBodyPart(fd);

      if (res?.error) {
        setPartFeedback({ type: 'error', message: res.error });
      } else {
        setPartFeedback({
          type: 'success',
          message: `"${partName}" ${editingBodyId ? '修改' : '新增'}成功`,
        });
        cancelEditBodyPart();
        refreshData();
      }
    } catch (err: unknown) {
      const e = err as Error;
      setPartFeedback({
        type: 'error',
        message: e?.message || '操作失敗，請確認網路連線。',
      });
    }
  }

  function startEditBodyPart(body: Body) {
    setEditingBodyId(body.id);
    setPartName(body.name);
    setPartFeedback(null);
  }

  function cancelEditBodyPart() {
    setEditingBodyId(null);
    setPartName('');
    setPartFeedback(null);
  }

  async function handleDeleteBodyPart(id: string) {
    if (!window.confirm('確定要刪除此部位嗎？這將連帶刪除底下所有的動作與訓練紀錄！這項操作無法復原。')) {
      return;
    }
    setPartFeedback(null);
    try {
      const res = await deleteBodyPartAction(id);
      if (res?.error) {
        setPartFeedback({ type: 'error', message: res.error });
      } else {
        setPartFeedback({ type: 'success', message: '刪除成功' });
        if (editingBodyId === id) cancelEditBodyPart();
        refreshData();
      }
    } catch (err: unknown) {
      const e = err as Error;
      setPartFeedback({ type: 'error', message: e?.message || '刪除失敗' });
    }
  }

  // ── Exercise Actions ──────────────────────────────────────────────────────

  async function handleAddOrUpdateExercise(e: React.FormEvent) {
    e.preventDefault();
    setExFeedback(null);

    if (editingExerciseId) {
      if (!window.confirm('確定要儲存動作修改嗎？')) return;
    }
    
    try {
      let finalImage = exImage;

      // 如果有新圖片，先進行客戶端壓縮
      if (exImage) {
        setExFeedback({ type: 'success', message: '正在處理與壓縮圖片...' });
        const options = {
          maxSizeMB: 1, // 目標壓縮至 1MB 以下
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        finalImage = await imageCompression(exImage, options) as File;
      }

      setExFeedback({ type: 'success', message: '正在上傳儲存...' });
      const fd = new FormData();
      fd.append('name', exName);
      fd.append('bodyPartId', exBodyId);
      if (finalImage) {
        // browser-image-compression 回傳 File or Blob，如果是 Blob 可以加上檔名
        fd.append('image', finalImage, finalImage.name || exImage?.name);
      }
      
      const res = editingExerciseId
        ? await updateExerciseAction(editingExerciseId, fd)
        : await addExercise(fd);

      if (res?.error) {
        setExFeedback({ type: 'error', message: res.error });
      } else {
        setExFeedback({
          type: 'success',
          message: `"${exName}" ${editingExerciseId ? '修改' : '新增'}成功`,
        });
        cancelEditExercise();
        refreshData();
      }
    } catch (err: unknown) {
      const e = err as Error;
      setExFeedback({ 
        type: 'error', 
        message: e?.message || '上傳失敗，請確認網路狀態或檔案是否過大。' 
      });
    }
  }

  function startEditExercise(ex: Exercise) {
    setEditingExerciseId(ex.id);
    setExName(ex.name);
    setExBodyId(ex.body_id);
    if (ex.image_url) {
      setExImagePreview(ex.image_url);
    } else {
      clearImage();
    }
    setExImage(null);
    setExFeedback(null);
    window.scrollTo({ top: 300, behavior: 'smooth' }); // scroll to form roughly
  }

  function cancelEditExercise() {
    setEditingExerciseId(null);
    setExName('');
    clearImage();
    setExFeedback(null);
  }

  async function handleDeleteExercise(id: string) {
    if (!window.confirm('確定要刪除此動作嗎？這將連帶刪除此動作所有的訓練紀錄！這項操作無法復原。')) {
      return;
    }
    setExFeedback(null);
    try {
      const res = await deleteExerciseAction(id);
      if (res?.error) {
        setExFeedback({ type: 'error', message: res.error });
      } else {
        setExFeedback({ type: 'success', message: '刪除成功' });
        if (editingExerciseId === id) cancelEditExercise();
        refreshData();
      }
    } catch (err: unknown) {
      const e = err as Error;
      setExFeedback({ type: 'error', message: e?.message || '刪除失敗' });
    }
  }

  // Derive exercises for selected body
  const selectedBodyExercises = exBodyId
    ? initialExercises.filter((ex) => ex.body_id === exBodyId)
    : [];

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>部位 / 動作管理</h1>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          {editingBodyId ? '編輯部位' : '1. 新增部位'}
        </h2>

        <form className={styles.inlineForm} onSubmit={handleAddOrUpdateBodyPart}>
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
            {editingBodyId ? '儲存部位修改' : '新增部位'}
          </button>
          {editingBodyId && (
            <button
              type="button"
              className={styles.btnPrimary}
              style={{ background: 'var(--surface-muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
              onClick={cancelEditBodyPart}
              disabled={isPending}
            >
              取消
            </button>
          )}
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
              <span key={bp.id} className={styles.tag}>
                {bp.name}
                <button type="button" className={styles.actionBtn} onClick={() => startEditBodyPart(bp)} title="編輯">
                  ✏️
                </button>
                <button type="button" className={styles.actionBtn} onClick={() => handleDeleteBodyPart(bp.id)} title="刪除">
                  🗑️
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          {editingExerciseId ? '編輯動作' : '2. 新增與管理動作'}
        </h2>

        <form className={styles.inlineForm} onSubmit={handleAddOrUpdateExercise}>
          <div className={styles.fieldGroup}>
            <label htmlFor="exBodyId" className={styles.label}>部位</label>
            <select
              id="exBodyId"
              className={styles.select}
              value={exBodyId}
              onChange={(e) => {
                setExBodyId(e.target.value);
                // If we're editing and we change the body part, that's allowed, but we shouldn't reset the editing state
              }}
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
              📷 {exImage ? exImage.name : (editingExerciseId && exImagePreview ? '重新上傳圖片' : '選擇圖片')}
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
            {editingExerciseId ? '儲存動作修改' : '新增動作'}
          </button>
          {editingExerciseId && (
            <button
              type="button"
              className={styles.btnPrimary}
              style={{ background: 'var(--surface-muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
              onClick={cancelEditExercise}
              disabled={isPending}
            >
              取消
            </button>
          )}
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

        {exBodyId && (
          <>
            <hr className={styles.divider} />
            <p className={styles.label}>
              已建立的動作（{initialBodyParts.find(b => b.id === exBodyId)?.name}）
            </p>
            {selectedBodyExercises.length === 0 ? (
              <p className={styles.tagEmpty}>尚無動作</p>
            ) : (
              <div className={styles.exerciseGrid}>
                {selectedBodyExercises.map((ex) => (
                  <div key={ex.id} className={styles.exerciseCard}>
                    <div className={styles.cardActions}>
                      <button type="button" className={styles.cardActionBtn} onClick={() => startEditExercise(ex)} title="編輯">
                        ✏️
                      </button>
                      <button type="button" className={styles.cardActionBtn} onClick={() => handleDeleteExercise(ex.id)} title="刪除">
                        🗑️
                      </button>
                    </div>
                    {ex.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={ex.image_url} alt={ex.name} className={styles.exerciseImage} />
                    ) : (
                      <div className={styles.exerciseImagePlaceholder}>無圖片</div>
                    )}
                    <span className={styles.exerciseName}>{ex.name}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
