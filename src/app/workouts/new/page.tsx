export default function NewWorkoutPage() {
  return (
    <section className="placeholder-page" aria-labelledby="new-workout-title">
      <p className="eyebrow">Input placeholder</p>
      <h1 id="new-workout-title">新增訓練量</h1>
      <p className="lead-text">
        這個頁面之後會放訓練紀錄表單，用來記錄日期、訓練項目、重量、次數、組數與備註。
      </p>
      <ul className="placeholder-list">
        <li>日期選擇</li>
        <li>項目名稱與分類</li>
        <li>重量、次數、組數欄位</li>
      </ul>
    </section>
  );
}