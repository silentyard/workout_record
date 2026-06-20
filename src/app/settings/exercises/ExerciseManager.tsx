'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { Body, Exercise } from '@/types/workout';
import { addBodyPart, addExercise } from './actions';
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

  // ── Exercise form state ───────────────────────────────────────────────────
  const [exName, setExName] = useState('');
  const [exBodyId, setExBodyId] = useState('');
  const [exImage, setExImage] = useState<File | null>(null);
  const [exImagePreview, setExImagePreview] = useState<string | null>(null);
  const [exFeedback, setExFeedback] = useState<Feedback>(null);

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

  async function handleAddBodyPart(e: React.FormEvent) {
    e.preventDefault();
    setPartFeedback(null);
    try {
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
    } catch (err: any) {
      setPartFeedback({ type: 'error', message: err?.message || '新增失敗，請確認網路連線。' });
    }
  }

  async function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    setExFeedback(null);
    
    try {
      let finalImage = exImage;

      // 如果有圖片，先進行客戶端壓縮
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
      
      const res = await addExercise(fd);
      if (res?.error) {
        setExFeedback({ type: 'error', message: res.error });
      } else {
        setExFeedback({ type: 'success', message: `"${exName}" 新增成功` });
        setExName('');
        clearImage();
        refreshData();
      }
    } catch (err: any) {
      // 捕捉 Server Action 拋出的 413 Payload Too Large 等連線層級錯誤
      setExFeedback({ 
        type: 'error', 
        message: err?.message || '上傳失敗，請確認網路狀態或檔案是否過大。' 
      });
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

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>2. 新增與管理動作</h2>

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
