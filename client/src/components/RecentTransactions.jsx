import { formatCurrency, formatDate } from "../utils/formatters.js";

export function RecentTransactions({ transactions, currency }) {
  return (
    <section className="recent-card glass-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Expense Intelligence</p>
          <h3>Recent activity</h3>
        </div>
      </div>

      <div className="transaction-list">
        {transactions.map((transaction) => (
          <article key={`${transaction.merchant}-${transaction.timestamp}`} className="transaction-row">
            <div className="transaction-copy">
              <strong>{transaction.merchant || transaction.category}</strong>
              <span>
                {transaction.category} | {formatDate(transaction.timestamp)}
              </span>
            </div>
            <strong
              className={`transaction-amount ${transaction.type === "income" ? "positive" : "negative"}`}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatCurrency(transaction.amount, currency)}
            </strong>
          </article>
        ))}
      </div>
    </section>
  );
}
