const options = [
  {
    value: "friendly",
    label: "Friendly Coach",
    description: "Warm, encouraging answers with simple guidance."
  },
  {
    value: "strict",
    label: "Strict Advisor",
    description: "Direct money advice with stronger caution."
  },
  {
    value: "silent",
    label: "Minimal Silent",
    description: "Short, low-noise answers focused on essentials."
  }
];

export function PersonaSwitcher({ mode, onChange, saving, feedback }) {
  const activeOption = options.find((item) => item.value === mode) || options[0];

  return (
    <section className="persona-panel soft-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AI Personality</p>
          <h3>{activeOption.label}</h3>
          <p className="muted">{activeOption.description}</p>
        </div>
      </div>
      <div className="persona-list">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={saving}
            className={option.value === mode ? "persona-chip active" : "persona-chip"}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {saving ? <p className="muted">Updating advisor personality...</p> : null}
      {!saving && feedback ? <p className="success-text">{feedback}</p> : null}
    </section>
  );
}
