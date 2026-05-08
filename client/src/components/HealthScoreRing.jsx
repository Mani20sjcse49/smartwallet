export function HealthScoreRing({ score }) {
  const strokeDashoffset = 339 - (339 * score) / 100;

  return (
    <section className="health-card soft-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Financial Health</p>
          <h3>Resilience score</h3>
        </div>
      </div>

      <div className="score-ring">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" />
          <circle className="score-progress" cx="60" cy="60" r="54" style={{ strokeDashoffset }} />
        </svg>
        <div>
          <strong>{score}</strong>
          <span>/100</span>
        </div>
      </div>
      <p className="muted">
        A blend of cash runway, goal momentum, and spending discipline.
      </p>
    </section>
  );
}
