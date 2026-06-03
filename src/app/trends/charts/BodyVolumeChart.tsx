'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';
import { useState, useMemo } from 'react';
import type { WorkoutRecord, Exercise, Body, SetConfig } from '@/types/workout';
import styles from '../TrendsPage.module.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// ─── Volume helpers ───────────────────────────────────────────────────────────

const LB_TO_KG = 0.453592;

function setVolumeKg(c: SetConfig): number {
  const weightKg = c.unit === 'lb' ? c.weight * LB_TO_KG : c.weight;
  return c.reps * weightKg * c.sets;
}

interface DayVolume {
  date: string;
  volume: number;
}

/**
 * Aggregate daily volume for all exercises belonging to a body part.
 */
function computeBodyVolume(
  records: WorkoutRecord[],
  exercises: Exercise[],
  bodyId: string
): DayVolume[] {
  const exerciseIds = new Set(
    exercises.filter((ex) => ex.body_id === bodyId).map((ex) => ex.id)
  );

  const byDate = new Map<string, number>();
  for (const r of records) {
    if (!exerciseIds.has(r.exercise_id)) continue;
    const vol = r.configs.reduce((sum, c) => sum + setVolumeKg(c), 0);
    byDate.set(r.date, (byDate.get(r.date) ?? 0) + vol);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, volume]) => ({ date, volume }));
}

// ─── Chart options factory ────────────────────────────────────────────────────

type XMode = 'proportional' | 'uniform';

function makeOptions(mode: XMode) {
  const baseScales = {
    y: {
      title: { display: true, text: '訓練量 (kg·reps·sets)', color: '#5d675f', font: { size: 11 } },
      beginAtZero: true,
      ticks: { color: '#5d675f', font: { size: 11 } },
      grid: { color: 'rgba(0,0,0,0.06)' },
    },
  };

  if (mode === 'proportional') {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item: { raw: unknown }) =>
              `訓練量：${Math.round(item.raw as number)} kg-unit`,
          },
        },
      },
      scales: {
        x: {
          type: 'time' as const,
          time: { unit: 'day' as const, displayFormats: { day: 'MM/dd' } },
          title: { display: true, text: '日期', color: '#5d675f', font: { size: 11 } },
          ticks: { color: '#5d675f', font: { size: 11 }, maxRotation: 45 },
          grid: { display: false },
        },
        ...baseScales,
      },
    };
  }

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item: { raw: unknown }) =>
            `訓練量：${Math.round(item.raw as number)} kg-unit`,
        },
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        title: { display: true, text: '日期', color: '#5d675f', font: { size: 11 } },
        ticks: { color: '#5d675f', font: { size: 11 }, maxRotation: 45 },
        grid: { display: false },
      },
      ...baseScales,
    },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BodyVolumeChart({
  records,
  exercises,
  bodies,
}: {
  records: WorkoutRecord[];
  exercises: Exercise[];
  bodies: Body[];
}) {
  const [bodyId, setBodyId] = useState<string>(bodies[0]?.id ?? '');
  const [mode, setMode] = useState<XMode>('uniform');

  const dayVolumes = useMemo(
    () => computeBodyVolume(records, exercises, bodyId),
    [records, exercises, bodyId]
  );

  const isEmpty = dayVolumes.length === 0;

  const shortLabels = dayVolumes.map((d) => {
    const parts = d.date.split('-');
    return `${parts[1]}/${parts[2]}`;
  });

  const chartData = useMemo(() => ({
    labels: mode === 'proportional' ? dayVolumes.map((d) => d.date) : shortLabels,
    datasets: [
      {
        label: '訓練量',
        data: dayVolumes.map((d) => Math.round(d.volume)),
        borderColor: '#b76823',
        backgroundColor: 'rgba(183, 104, 35, 0.08)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#b76823',
        tension: 0.3,
        fill: true,
      },
    ],
  }), [dayVolumes, mode, shortLabels]);

  const options = makeOptions(mode);

  return (
    <div className={styles.chartCard}>
      <p className={styles.chartTitle}>部位訓練量趨勢</p>

      <div className={styles.chartControls}>
        <select
          id="body-select"
          className={styles.chartSelect}
          value={bodyId}
          onChange={(e) => setBodyId(e.target.value)}
        >
          {bodies.length === 0 && <option value="">尚無部位</option>}
          {bodies.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <div className={styles.modeToggle}>
          {(['uniform', 'proportional'] as XMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`${styles.modeBtn} ${mode === m ? styles.modeBtnActive : ''}`}
              onClick={() => setMode(m)}
            >
              {m === 'uniform' ? '均等間距' : '實際時間'}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className={styles.empty}>此時間範圍內無此部位資料</div>
      ) : (
        <div className={styles.chartWrap}>
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
