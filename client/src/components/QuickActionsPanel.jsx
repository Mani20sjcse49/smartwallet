import { useMemo, useState } from "react";
import { BadgeIndianRupee, ShieldCheck, Siren, Target } from "lucide-react";
import { api } from "../services/api.js";
import { formatCurrency } from "../utils/formatters.js";

export function QuickActionsPanel({ currency, dailyBudget }) {
  const [amount, setAmount] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const quickTarget = useMemo(
    () => Math.max(200, Math.round(dailyBudget.safeLimit * 0.6)),
    [dailyBudget.safeLimit]
  );

  async function handleCheck() {
    if (!amount) return;

    setChecking(true);
    try {
      const response = await api.canAfford({ amount: Number(amount) });
      setResult(response);
    } finally {
      setChecking(false);
    }
  }

  return (
    <section className="quick-actions glass-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Decision Center</p>
          <h3>Fast financial checks</h3>
        </div>
      </div>

      <div className="quick-grid">
        <article className="mini-card">
          <BadgeIndianRupee size={18} />
          <div>
            <strong>{formatCurrency(dailyBudget.safeLimit, currency)}</strong>
            <span>Recommended daily ceiling</span>
          </div>
        </article>
        <article className="mini-card">
          <Target size={18} />
          <div>
            <strong>{formatCurrency(quickTarget, currency)}</strong>
            <span>Good daily saving target</span>
          </div>
        </article>
      </div>

      <div className="affordability-box soft-panel">
        <label>
          Can I afford this?
          <input
            type="number"
            min="0"
            placeholder="Enter amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>
        <button className="primary-button" type="button" onClick={handleCheck} disabled={checking || !amount}>
          {checking ? "Checking..." : "Check Purchase"}
        </button>
        {result ? (
          <div className={result.affordable ? "afford-result good" : "afford-result bad"}>
            {result.affordable ? <ShieldCheck size={18} /> : <Siren size={18} />}
            <div>
              <strong>{result.affordable ? "Looks manageable" : "Pause this purchase"}</strong>
              <span>{result.reason}</span>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
