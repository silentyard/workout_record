import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import "./globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workout Record",
  description: "Record workout volume and inspect training trends.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="zh-TW" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="app-shell">
          <header className="site-header">
            <Link className="brand-link" href="/">
              Workout Record
            </Link>
            <nav className="site-nav" aria-label="主要導覽">
              <Link href="/">首頁</Link>
              {user && (
                <>
                  <Link href="/workouts/new">新增訓練量</Link>
                  <Link href="/settings/exercises">部位 / 動作管理</Link>
                  <Link href="/trends">趨勢圖</Link>
                </>
              )}
            </nav>
            {user ? (
              <div className="user-menu">
                <span className="user-email">{user.email}</span>
                <form action={signOut}>
                  <button type="submit" className="signout-btn">登出</button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="secondary-action">登入</Link>
            )}
          </header>
          <main className="page-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
