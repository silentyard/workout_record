import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              <Link href="/workouts/new">新增訓練量</Link>
              <Link href="/settings/exercises">部位 / 動作管理</Link>
              <Link href="/trends">趨勢圖</Link>
            </nav>
          </header>
          <main className="page-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
