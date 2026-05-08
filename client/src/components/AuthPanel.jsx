import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, TrendingUp, WalletCards } from "lucide-react";
import { api, setAuthToken } from "../services/api.js";

const benefits = [
  {
    icon: CheckCircle2,
    title: "One calm money view",
    description: "See balance, budget, goals, and alerts in one simple place."
  },
  {
    icon: TrendingUp,
    title: "Daily smart guidance",
    description: "Know how much feels safe to spend before the day gets expensive."
  },
  {
    icon: Sparkles,
    title: "Helpful AI answers",
    description: "Ask simple questions and get clear financial guidance back."
  }
];

const authModes = [
  {
    id: "login",
    title: "Login",
    hint: "Welcome back"
  },
  {
    id: "register",
    title: "Register",
    hint: "New account"
  }
];

export function AuthPanel({
  onAuthenticated,
  onDemoStart,
  bootstrapping,
  rememberedUser
}) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: rememberedUser?.name || "Aarav Mehta",
    email: rememberedUser?.email || "aarav@example.com",
    password: "demo1234",
    income: 85000
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.waitForConnection({ attempts: 2, delayMs: 900 });

      const response =
        mode === "login"
          ? await api.login({ email: form.email, password: form.password })
          : await api.register({
              name: form.name,
              email: form.email,
              password: form.password,
              income: Number(form.income),
              goals: [
                {
                  title: "Emergency Fund",
                  targetAmount: 120000,
                  savedAmount: 25000,
                  category: "Safety"
                }
              ],
              preferences: {
                personalityMode: "friendly",
                aiStrictness: "balanced",
                riskLevel: "medium",
                dailyReportEnabled: false,
                dailyReportTime: "08:00",
                reportEmail: form.email
              }
            });

      setAuthToken(response.token);
      onAuthenticated(response);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSocialAuth(provider) {
    setSubmitting(true);
    setError("");

    try {
      await api.waitForConnection({ attempts: 2, delayMs: 900 });

      const response = await api.socialAuth({
        provider,
        name: form.name,
        email: form.email
      });

      setAuthToken(response.token);
      onAuthenticated(response);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <motion.div
        className="auth-shell glass-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.section
          className="auth-hero auth-visual-panel"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
        >
          <div className="auth-hero-copy">
            <p className="eyebrow">Smart finance space</p>
            <h1>Money clarity for everyday life.</h1>
            <p className="muted auth-subtitle">
              Track spending, plan better, and get simple guidance that helps you feel more in control.
            </p>
          </div>

          <div className="hero-benefits">
            {benefits.map((item) => (
              <article key={item.title} className="benefit-card">
                <item.icon size={18} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.form
          className="auth-card auth-form-panel"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="auth-badge-row">
            <div className="auth-brand-chip">
              <img className="auth-chip-logo" src="/smart-wallet-logo.png" alt="Smart Wallet logo" />
              <span>Smart Wallet</span>
            </div>
          </div>

          <div className="auth-copy">
            <p className="eyebrow">{mode === "login" ? "Welcome back" : "Create account"}</p>
            <h2>{mode === "login" ? "Sign in to your wallet" : "Create an account"}</h2>
            <p className="muted">
              {mode === "login"
                ? "Access your wallet, insights, and AI guidance in one place."
                : "Sign up and get your wallet ready in a few simple steps."}
            </p>
          </div>

          <div className="mode-switch auth-mode-switch" role="tablist" aria-label="Authentication mode">
            {authModes.map((item) => {
              const isActive = mode === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  className={isActive ? "active" : ""}
                  onClick={() => setMode(item.id)}
                >
                  <span className="auth-mode-title">{item.title}</span>
                  <span className="auth-mode-hint">{item.hint}</span>
                </button>
              );
            })}
          </div>

          {mode === "register" ? (
            <label>
              <span className="auth-field-label">Full name</span>
              <input
                autoComplete="name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
          ) : null}

          <label>
            <span className="auth-field-label">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>

          <label>
            <span className="auth-field-label">Password</span>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>

          {mode === "register" ? (
            <label>
              <span className="auth-field-label">Monthly income</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={form.income}
                onChange={(event) => setForm({ ...form, income: event.target.value })}
              />
            </label>
          ) : null}

          {error ? <p className="error-text">{error}</p> : null}

          <button className="primary-button auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>

          <div className="auth-social-row">
            <button
              className="secondary-button auth-social"
              type="button"
              onClick={() => handleSocialAuth("apple")}
              disabled={submitting}
            >
              <img className="auth-social-icon" src="/apple-logo.svg" alt="" aria-hidden="true" />
              Apple
            </button>
            <button
              className="secondary-button auth-social"
              type="button"
              onClick={() => handleSocialAuth("google")}
              disabled={submitting}
            >
              <img className="auth-social-icon" src="/google-logo.png" alt="" aria-hidden="true" />
              Google
            </button>
          </div>

          <button className="secondary-button auth-demo" type="button" onClick={onDemoStart} disabled={bootstrapping}>
            <WalletCards size={16} />
            {bootstrapping ? "Preparing demo..." : "Use Demo Account"}
          </button>

          <div className="auth-footer">
            <span>
              {mode === "login" ? "Need an account?" : "Have an account?"}{" "}
              <button type="button" className="auth-inline-link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
                {mode === "login" ? "Register" : "Sign in"}
              </button>
            </span>
            <span>Terms & Conditions</span>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
