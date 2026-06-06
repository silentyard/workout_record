'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './AuthForm.module.scss';

type Mode = 'signin' | 'signup';

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const supabase = createClient();

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Auth callback handles email confirmation link
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess('帳號建立成功！請確認你的信箱並點擊驗證連結後再登入。');
        setMode('signin');
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.push('/');
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {mode === 'signin' ? '登入' : '建立帳號'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'signin'
              ? '登入後開始記錄你的訓練資料。'
              : '免費建立帳號，開始追蹤你的訓練進度。'}
          </p>
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}
        {success && <p className={styles.success} role="status">{success}</p>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="auth-email" className={styles.label}>電子信箱</label>
            <input
              id="auth-email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="auth-password" className={styles.label}>密碼</label>
            <input
              id="auth-password"
              type="password"
              className={styles.input}
              placeholder={mode === 'signup' ? '至少 6 個字元' : ''}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          <button
            id="auth-submit"
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? '處理中…' : mode === 'signin' ? '登入' : '建立帳號'}
          </button>
        </form>

        {/*
          ── OAuth placeholder ─────────────────────────────────────────────────
          To add Google login in future:
          1. Enable Google provider in Supabase Dashboard
          2. Uncomment and fill in the block below:
          ─────────────────────────────────────────────────────────────────────

          <div className={styles.divider}>或</div>
          <button
            type="button"
            className={styles.oauthBtn}
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${location.origin}/auth/callback` },
              });
            }}
          >
            使用 Google 帳號登入
          </button>
        */}

        <p className={styles.toggle}>
          {mode === 'signin' ? '還沒有帳號？' : '已經有帳號？'}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
              setSuccess('');
            }}
          >
            {mode === 'signin' ? '建立帳號' : '登入'}
          </button>
        </p>
      </div>
    </div>
  );
}
