'use client';

import { useState, useMemo } from 'react';
import type { WorkoutRecord, Exercise, Body } from '@/types/workout';
import WeeklyFrequencyChart from './charts/WeeklyFrequencyChart';
import ExerciseVolumeChart from './charts/ExerciseVolumeChart';
import BodyVolumeChart from './charts/BodyVolumeChart';
import styles from './TrendsPage.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'weekly' | 'exercise' | 'body';

interface Preset {
  label: string;
  days: number; // days back from today
}

const PRESETS: Preset[] = [
  { label: '最近一週', days: 7 },
  { label: '一個月',   days: 30 },
  { label: '三個月',  days: 90 },
  { label: '半年',    days: 180 },
  { label: '一年',    days: 365 },
];

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateStr(d);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrendsPage({
  records,
  exercises,
  bodies,
}: {
  records: WorkoutRecord[];
  exercises: Exercise[];
  bodies: Body[];
}) {
  const today = toDateStr(new Date());

  // ── Date range state ──────────────────────────────────────────────────────
  const [activePreset, setActivePreset] = useState<number>(30); // days
  const [from, setFrom] = useState<string>(daysAgo(30));
  const [to,   setTo]   = useState<string>(today);

  function applyPreset(days: number) {
    setActivePreset(days);
    setFrom(daysAgo(days));
    setTo(today);
  }

  function handleFromChange(val: string) {
    setActivePreset(0); // clear preset highlight
    setFrom(val);
  }

  function handleToChange(val: string) {
    setActivePreset(0);
    setTo(val);
  }

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<TabId>('weekly');

  // ── Filter records client-side ────────────────────────────────────────────
  const filteredRecords = useMemo(
    () => records.filter((r) => r.date >= from && r.date <= to),
    [records, from, to]
  );

  const TABS: { id: TabId; label: string }[] = [
    { id: 'weekly',   label: '週訓練天數' },
    { id: 'exercise', label: '動作訓練量' },
    { id: 'body',     label: '部位訓練量' },
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>訓練趨勢圖</h1>

      {/* ── Filter card ──────────────────────────────────────────────────── */}
      <div className={styles.filterCard}>
        <p className={styles.filterLabel}>時間範圍</p>

        {/* Quick presets */}
        <div className={styles.presets}>
          {PRESETS.map((p) => (
            <button
              key={p.days}
              type="button"
              className={`${styles.presetBtn} ${activePreset === p.days ? styles.presetBtnActive : ''}`}
              onClick={() => applyPreset(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        <div className={styles.dateRow}>
          <input
            id="trends-from"
            type="date"
            className={styles.dateInput}
            value={from}
            max={to}
            onChange={(e) => handleFromChange(e.target.value)}
          />
          <span className={styles.dateSep}>—</span>
          <input
            id="trends-to"
            type="date"
            className={styles.dateInput}
            value={to}
            min={from}
            max={today}
            onChange={(e) => handleToChange(e.target.value)}
          />
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            type="button"
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Chart panels ─────────────────────────────────────────────────── */}
      {tab === 'weekly' && (
        <WeeklyFrequencyChart records={filteredRecords} from={from} to={to} />
      )}
      {tab === 'exercise' && (
        <ExerciseVolumeChart records={filteredRecords} exercises={exercises} />
      )}
      {tab === 'body' && (
        <BodyVolumeChart records={filteredRecords} exercises={exercises} bodies={bodies} />
      )}
    </div>
  );
}
