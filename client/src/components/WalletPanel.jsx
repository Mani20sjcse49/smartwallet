import { formatCurrency } from "../utils/formatters.js";

export function WalletPanel({ wallets, summary, prediction, currency }) {
  return (
    <section className="wallet-panel glass-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Dynamic Balance System</p>
          <h3>Live wallet view</h3>
        </div>
        <strong>{formatCurrency(summary.balance, currency)}</strong>
      </div>

      <div className="wallet-list">
        {wallets.map((wallet) => (
          <article key={wallet.name} className="wallet-item soft-panel">
            <div>
              <p>{wallet.name}</p>
              <span>{wallet.type}</span>
            </div>
            <strong>{formatCurrency(wallet.balance, currency)}</strong>
          </article>
        ))}
      </div>

      <div className="prediction-band">
        <span>Predicted month-end balance</span>
        <strong>{formatCurrency(prediction.endOfMonthBalance, currency)}</strong>
      </div>
    </section>
  );
}
