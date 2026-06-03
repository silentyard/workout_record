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
import type { WorkoutRecord, Exercise, SetConfig } from '@/types/workout';
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

/** Convert a single SetConfig's volume to kg-units */
function setVolumeKg(c: SetConfig): number {
  const weightKg = c.unit === 'lb' ? c.weight * LB_TO_KG : c.weight;
  return c.reps * weightKg * c.sets;
}

interface DayVolume {
  date: string; // YYYY-MM-DD
  volume: number; // total kg-volume for that day
}

/**
 * Aggregate daily volume for a specific exercise.
 * Multiple records on the same day are summed.
 */
function computeExerciseVolume(
  records: WorkoutRecord[],
  exerciseId: string
): DayVolume[] {
  const byDate = new Map<string, number>();
  for (const r of records) {
    if (r.exercise_id !== exerciseId) continue;
    const vol = r.configs.reduce((sum, c) => sum + setVolumeKg(c), 0);
    byDate.set(r.date, (byDate.get(r.date) ?? 0) + vol);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, volume]) => ({ date, volume }));
}

// ─── Chart options factories ──────────────────────────────────────────────────

type XMode = 'proportional' | 'uniform';

function makeOptions(mode: XMode, labels: string[]) {
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

  // Uniform mode — category scale
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: { label: string }[]) => labels[Number(items[0].dataIndex)] ?? '',
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

export default function ExerciseVolumeChart({
  records,
  exercises,
}: {
  records: WorkoutRecord[];
  exercises: Exercise[];
}) {
  const [exerciseId, setExerciseId] = useState<string>(exercises[0]?.id ?? '');
  const [mode, setMode] = useState<XMode>('uniform');

  const dayVolumes = useMemo(
    () => computeExerciseVolume(records, exerciseId),
    [records, exerciseId]
  );

  const isEmpty = dayVolumes.length === 0;

  const chartData = useMemo(() => {
    const shortLabels = dayVolumes.map((d) => {
      const parts = d.date.split('-');
      return `${parts[1]}/${parts[2]}`;
    });

    return {
      labels: mode === 'proportional' ? dayVolumes.map((d) => d.date) : shortLabels,
      datasets: [
        {
          label: '訓練量',
          data: dayVolumes.map((d) => Math.round(d.volume)),
          borderColor: '#2f6f4e',
          backgroundColor: 'rgba(47, 111, 78, 0.08)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#2f6f4e',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [dayVolumes, mode]);

  const shortLabels = dayVolumes.map((d) => {
    const parts = d.date.split('-');
    return `${parts[1]}/${parts[2]}`;
  });
  const options = makeOptions(mode, shortLabels);

  return (
    <div className={styles.chartCard}>
      <p className={styles.chartTitle}>動作訓練量趨勢</p>

      <div className={styles.chartControls}>
        <select
          id="exercise-select"
          className={styles.chartSelect}
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
        >
          {exercises.length === 0 && <option value="">尚無動作</option>}
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
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
        <div className={styles.empty}>此時間範圍內無此動作資料</div>
      ) : (
        <div className={styles.chartWrap}>
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
