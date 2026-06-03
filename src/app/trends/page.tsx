import { getTrendsData } from './actions';
import TrendsPage from './TrendsPage';

export const metadata = {
  title: '訓練趨勢圖 | Workout Record',
};

export default async function TrendsPageRoute() {
  const { records, exercises, bodies } = await getTrendsData();
  return (
    <TrendsPage records={records} exercises={exercises} bodies={bodies} />
  );
}