import type { Metadata } from 'next';
import AuthForm from './AuthForm';

export const metadata: Metadata = {
  title: '登入 | Workout Record',
  description: '登入或建立帳號以開始記錄你的訓練資料。',
};

export default function LoginPage() {
  return <AuthForm />;
}
