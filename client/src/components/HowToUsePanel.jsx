const steps = [
  {
    title: "1. Start in Overview",
    description: "Check your balance, safe daily budget, and key alerts before you spend."
  },
  {
    title: "2. Use Activity daily",
    description: "Add expenses, income, or voice entries so your wallet stays accurate."
  },
  {
    title: "3. Ask the AI advisor",
    description: "Use simple questions like can I afford this, where am I overspending, or how can I save more."
  },
  {
    title: "4. Adjust Settings",
    description: "Choose your currency, advisor style, and daily report email in one place."
  }
];

export function HowToUsePanel() {
  return (
    <section className="howto-panel glass-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">How To Use</p>
          <h3>Simple guide for everyday use</h3>
        </div>
      </div>

      <div className="howto-grid">
        {steps.map((step) => (
          <article key={step.title} className="howto-card soft-panel">
            <strong>{step.title}</strong>
            <p className="muted">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
