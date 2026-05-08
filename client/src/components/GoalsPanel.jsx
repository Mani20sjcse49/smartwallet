import { formatCurrency } from "../utils/formatters.js";

export function GoalsPanel({ goals, gamification, investment, currency }) {
  return (
    <section className="goals-grid">
      <article className="goal-card glass-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Savings Goals</p>
            <h3>Progress tracker</h3>
          </div>
        </div>

        {goals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
          return (
            <div key={goal.title} className="goal-item">
              <div className="goal-head">
                <strong>{goal.title}</strong>
                <span>{progress}%</span>
              </div>
              <div className="gauge-shell">
                <div className="gauge-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="muted">
                {formatCurrency(goal.savedAmount, currency)} of {formatCurrency(goal.targetAmount, currency)}
              </p>
            </div>
          );
        })}
      </article>

      <article className="goal-card glass-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Investment Advisor</p>
            <h3>Beginner-friendly plan</h3>
          </div>
        </div>
        <strong className="invest-number">{formatCurrency(investment.monthlyInvestable, currency)}</strong>
        <p className="muted">{investment.summary}</p>
        <div className="tag-row">
          {investment.plan.map((item) => (
            <span key={item} className="persona-chip">
              {item}
            </span>
          ))}
        </div>
      </article>

      <article className="goal-card glass-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Gamification</p>
            <h3>Momentum boosters</h3>
          </div>
        </div>
        <strong className="invest-number">{gamification.savingStreak} day streak</strong>
        <div className="tag-row">
          {gamification.achievements.map((achievement) => (
            <span key={achievement} className="persona-chip">
              {achievement}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}
