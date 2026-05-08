import { formatCurrency } from "../utils/formatters.js";

export function BudgetGauge({ dailyBudget, currency }) {
  const ratio = Math.min(100, Math.round((dailyBudget.spendVelocity / Math.max(1, dailyBudget.safeLimit)) * 100));

  return (
    <section className="budget-gauge glass-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Intelligent Daily Budget</p>
          <h3>Spend with foresight</h3>
        </div>
        <span className={`badge badge-${dailyBudget.status}`}>{dailyBudget.status}</span>
      </div>

      <div className="gauge-shell">
        <div className="gauge-fill" style={{ width: `${Math.min(100, ratio)}%` }} />
      </div>

      <div className="budget-meta">
        <div>
          <span>Safe limit</span>
          <strong>{formatCurrency(dailyBudget.safeLimit, currency)}</strong>
        </div>
        <div>
          <span>Recent pace</span>
          <strong>{formatCurrency(dailyBudget.spendVelocity, currency)}</strong>
        </div>
        <div>
          <span>Days left</span>
          <strong>{dailyBudget.remainingDays}</strong>
        </div>
      </div>

      <p className="muted">{dailyBudget.message}</p>
    </section>
  );
}
