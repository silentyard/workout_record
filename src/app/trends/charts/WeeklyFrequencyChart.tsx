'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useMemo } from 'react';
import type { WorkoutRecord } from '@/types/workout';
import styles from '../TrendsPage.module.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the ISO Monday (YYYY-MM-DD) for any given date string.
 */
function isoMonday(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

/**
 * Enumerates every Monday between two dates (inclusive range).
 */
function allMondaysInRange(from: string, to: string): string[] {
  const mondays: string[] = [];
  const start = new Date(isoMonday(from) + 'T00:00:00');
  const end   = new Date(to + 'T00:00:00');
  while (start <= end) {
    mondays.push(start.toISOString().split('T')[0]);
    start.setDate(start.getDate() + 7);
  }
  return mondays;
}

interface WeekBucket {
  monday: string;     // YYYY-MM-DD
  label: string;      // display label, e.g. "06/02"
  trainingDays: number;
}

function computeWeeklyFrequency(
  records: WorkoutRecord[],
  from: string,
  to: string
): WeekBucket[] {
  // Group distinct dates per week
  const daysByWeek = new Map<string, Set<string>>();

  for (const r of records) {
    const monday = isoMonday(r.date);
    if (!daysByWeek.has(monday)) daysByWeek.set(monday, new Set());
    daysByWeek.get(monday)!.add(r.date);
  }

  return allMondaysInRange(from, to).map((monday) => {
    const parts = monday.split('-');
    const label = `${parts[1]}/${parts[2]}`;
    return {
      monday,
      label,
      trainingDays: daysByWeek.get(monday)?.size ?? 0,
    };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WeeklyFrequencyChart({
  records,
  from,
  to,
}: {
  records: WorkoutRecord[];
  from: string;
  to: string;
}) {
  const buckets = useMemo(
    () => computeWeeklyFrequency(records, from, to),
    [records, from, to]
  );

  if (buckets.length === 0) {
    return (
      <div className={styles.chartCard}>
        <p className={styles.chartTitle}>每週訓練天數</p>
        <div className={styles.empty}>此時間範圍內無資料</div>
      </div>
    );
  }

  const chartData = {
    labels: buckets.map((b) => b.label),
    datasets: [
      {
        label: '訓練天數',
        data: buckets.map((b) => b.trainingDays),
        backgroundColor: 'rgba(47, 111, 78, 0.75)',
        borderColor: '#2f6f4e',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: { label: string }[]) => `週起始：${items[0].label}`,
          label: (item: { raw: unknown }) => `訓練天數：${item.raw} 天`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: '週起始日 (月/日)', color: '#5d675f', font: { size: 11 } },
        grid: { display: false },
        ticks: { color: '#5d675f', font: { size: 11 } },
      },
      y: {
        title: { display: true, text: '天數', color: '#5d675f', font: { size: 11 } },
        beginAtZero: true,
        max: 7,
        ticks: { stepSize: 1, color: '#5d675f', font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
    },
  } as const;

  return (
    <div className={styles.chartCard}>
      <p className={styles.chartTitle}>每週訓練天數</p>
      <div className={styles.chartWrap}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
