import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { api } from "../services/api.js";
import { ThemeToggle } from "./ThemeToggle.jsx";
const strictnessModes = ["soft", "balanced", "strict"];
const personalities = ["friendly", "strict", "silent"];
const riskLevels = ["low", "medium", "high"];

export function CustomizationPanel({
  user,
  updatePreferences,
  theme,
  onThemeChange,
  onOpenInstallPrompt,
  canInstall,
  isInstalled
}) {
  const [preferences, setPreferences] = useState(user.preferences);
  const [categoryInput, setCategoryInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setPreferences(user.preferences);
  }, [user.preferences]);

  async function handleSave() {
    setSaving(true);
    setFeedback("");
    try {
      await updatePreferences({ preferences });
      setFeedback("Preferences saved.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTestReport() {
    setSendingReport(true);
    setFeedback("");
    try {
      const response = await api.sendTestReport();
      setFeedback(`${response.message} using ${response.transportMode}.`);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setSendingReport(false);
    }
  }

  function addCustomCategory() {
    const nextCategory = categoryInput.trim();
    if (!nextCategory) return;

    if (preferences.customCategories?.includes(nextCategory)) {
      setCategoryInput("");
      return;
    }

    setPreferences((current) => ({
      ...current,
      customCategories: [...(current.customCategories || []), nextCategory]
    }));
    setCategoryInput("");
  }

  function removeCustomCategory(category) {
    setPreferences((current) => ({
      ...current,
      customCategories: (current.customCategories || []).filter((item) => item !== category)
    }));
  }

  return (
    <section className="composer-card glass-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Customization Engine</p>
          <h3>Wallet and report settings</h3>
        </div>
      </div>

      <div className="transaction-form">
        <label>
          Currency
          <input value="Indian Rupee (INR)" disabled />
        </label>
        <label>
          AI Strictness
          <select
            value={preferences.aiStrictness}
            onChange={(event) => setPreferences({ ...preferences, aiStrictness: event.target.value })}
          >
            {strictnessModes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Personality
          <select
            value={preferences.personalityMode}
            onChange={(event) => setPreferences({ ...preferences, personalityMode: event.target.value })}
          >
            {personalities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Risk Level
          <select
            value={preferences.riskLevel}
            onChange={(event) => setPreferences({ ...preferences, riskLevel: event.target.value })}
          >
            {riskLevels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="toggle-row">
        <input
          type="checkbox"
          checked={preferences.familyMode}
          onChange={(event) => setPreferences({ ...preferences, familyMode: event.target.checked })}
        />
        <span>Enable family/shared wallet mode</span>
      </label>

      <div className="report-card soft-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Appearance</p>
            <h3>Choose your viewing mode</h3>
          </div>
        </div>

        <ThemeToggle theme={theme} onChange={onThemeChange} />
        <p className="muted">Switch between light and dark mode anytime. Your choice is saved on this device.</p>
      </div>

      <div className="category-builder soft-panel">
        <label>
          Custom category
          <input
            type="text"
            value={categoryInput}
            placeholder="Add category like Pets or Travel"
            onChange={(event) => setCategoryInput(event.target.value)}
          />
        </label>
        <button className="secondary-button" type="button" onClick={addCustomCategory}>
          Add Category
        </button>
        <div className="tag-row">
          {(preferences.customCategories || []).map((item) => (
            <button
              key={item}
              type="button"
              className="persona-chip removable-chip"
              onClick={() => removeCustomCategory(item)}
            >
              {item} x
            </button>
          ))}
        </div>
      </div>

      <div className="report-card soft-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Install Smart Wallet</p>
            <h3>Use the app like a native install</h3>
          </div>
        </div>

        <p className="muted">
          {isInstalled
            ? "Smart Wallet is already installed on this device."
            : canInstall
              ? "Open the install popup and confirm the browser prompt to pin Smart Wallet to your device."
              : "Open the install popup to see the browser steps for adding Smart Wallet to your home screen or desktop."}
        </p>

        <button className="secondary-button" type="button" onClick={() => onOpenInstallPrompt?.()}>
          <Download size={16} />
          {isInstalled ? "Installed" : canInstall ? "Open Install Popup" : "Open Install Guide"}
        </button>
      </div>

      <div className="report-card soft-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Daily Email Report</p>
            <h3>Send your summary to email</h3>
          </div>
        </div>

        <div className="transaction-form">
          <label>
            Report email
            <input
              type="email"
              value={preferences.reportEmail || ""}
              placeholder="name@example.com"
              onChange={(event) => setPreferences({ ...preferences, reportEmail: event.target.value })}
            />
          </label>
          <label>
            Delivery time
            <input
              type="time"
              value={preferences.dailyReportTime || "08:00"}
              onChange={(event) => setPreferences({ ...preferences, dailyReportTime: event.target.value })}
            />
          </label>
        </div>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={Boolean(preferences.dailyReportEnabled)}
            onChange={(event) => setPreferences({ ...preferences, dailyReportEnabled: event.target.checked })}
          />
          <span>Send a daily money summary to this email</span>
        </label>

        <button className="secondary-button" type="button" onClick={handleSendTestReport} disabled={sendingReport}>
          {sendingReport ? "Sending..." : "Send Test Email"}
        </button>
      </div>

      <button className="primary-button" type="button" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save All Settings"}
      </button>
      {feedback ? <p className="success-text">{feedback}</p> : null}
    </section>
  );
}
