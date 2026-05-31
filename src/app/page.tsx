import Link from "next/link";

export default function Home() {
  return (
    <section className="placeholder-page" aria-labelledby="home-title">
      <p className="eyebrow">Dashboard placeholder</p>
      <h1 id="home-title">首頁</h1>
      <p className="lead-text">
        未來這裡會顯示近期訓練摘要、上次訓練日期，以及常用項目的快速入口。
      </p>
      <div className="action-row" aria-label="快速操作">
        <Link className="primary-action" href="/workouts/new">
          新增訓練量
        </Link>
        <Link className="secondary-action" href="/trends">
          查看趨勢圖
        </Link>
      </div>
    </section>
  );
}
