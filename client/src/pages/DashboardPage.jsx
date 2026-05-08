import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTicker } from "../components/AlertTicker.jsx";
import { AnalyticsPanel } from "../components/AnalyticsPanel.jsx";
import { AssistantPanel } from "../components/AssistantPanel.jsx";
import { BudgetGauge } from "../components/BudgetGauge.jsx";
import { CustomizationPanel } from "../components/CustomizationPanel.jsx";
import { GoalsPanel } from "../components/GoalsPanel.jsx";
import { HealthScoreRing } from "../components/HealthScoreRing.jsx";
import { HowToUsePanel } from "../components/HowToUsePanel.jsx";
import { MobileDock } from "../components/MobileDock.jsx";
import { PersonaSwitcher } from "../components/PersonaSwitcher.jsx";
import { QuickActionsPanel } from "../components/QuickActionsPanel.jsx";
import { RecentTransactions } from "../components/RecentTransactions.jsx";
import { Sidebar, dashboardSections } from "../components/Sidebar.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { TopBar } from "../components/TopBar.jsx";
import { TransactionComposer } from "../components/TransactionComposer.jsx";
import { WalletPanel } from "../components/WalletPanel.jsx";
import { useDashboardData } from "../hooks/useDashboardData.js";
import { formatCurrency } from "../utils/formatters.js";

function DashboardHero({ dashboard, currency }) {
  const heroMessage =
    dashboard.dailyBudget.status === "overspending"
      ? "Spending pressure is high. Pull back on flexible expenses for the next few days."
      : dashboard.dailyBudget.status === "warning"
        ? "You are close to your edge. A little discipline now protects your month-end balance."
        : "You are in control. Keep this pace and your month-end runway stays healthy.";

  return (
    <section className="spotlight-panel glass-panel">
      <div className="spotlight-copy">
        <p className="eyebrow">AI Snapshot</p>
        <h1>Money guidance that feels calm, clear, and ahead of you.</h1>
        <p className="muted">{heroMessage}</p>
        <div className="spotlight-tags">
          <span className="persona-chip">Health score {dashboard.healthScore}/100</span>
          <span className="persona-chip">
            Save target {formatCurrency(Math.max(200, Math.round(dashboard.dailyBudget.safeLimit * 0.6)), currency)}
          </span>
          <span className="persona-chip">{dashboard.patterns.topCategory} is your highest spend zone</span>
        </div>
      </div>

      <div className="spotlight-metrics soft-panel">
        <div>
          <span>Safe to spend today</span>
          <strong>{formatCurrency(dashboard.dailyBudget.safeLimit, currency)}</strong>
        </div>
        <div>
          <span>Projected month end</span>
          <strong>{formatCurrency(dashboard.prediction.endOfMonthBalance, currency)}</strong>
        </div>
        <div>
          <span>Overspend risk date</span>
          <strong>{new Date(dashboard.prediction.nextOverspendRiskDate).toLocaleDateString("en-IN")}</strong>
        </div>
      </div>
    </section>
  );
}

export function DashboardPage({ session, onLogout, theme, onThemeChange, onOpenInstallPrompt, canInstall, isInstalled }) {
  const { dashboard, loading, error, refresh, addTransaction, updatePreferences, lastUpdated, setDashboard } =
    useDashboardData();
  const [activeSection, setActiveSection] = useState("overview");
  const [pendingTopBarAction, setPendingTopBarAction] = useState("");
  const [personaSaving, setPersonaSaving] = useState(false);
  const [personaFeedback, setPersonaFeedback] = useState("");

  const currency = dashboard?.user.preferences.currency || "INR";
  const activeLabel = useMemo(
    () => dashboardSections.find((item) => item.id === activeSection)?.label || "Overview",
    [activeSection]
  );

  useEffect(() => {
    if (!pendingTopBarAction || typeof window === "undefined") {
      return undefined;
    }

    let retryTimer;
    let cancelled = false;

    const focusTargetWhenReady = (attempt = 0) => {
      if (cancelled) {
        return;
      }

      const targetElement =
        pendingTopBarAction === "alerts"
          ? document.getElementById("dashboard-alerts")
          : document.getElementById("finance-chat-input");

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: pendingTopBarAction === "alerts" ? "start" : "center"
        });

        if (typeof targetElement.focus === "function") {
          targetElement.focus();
        }

        setPendingTopBarAction("");
        return;
      }

      if (attempt >= 10) {
        setPendingTopBarAction("");
        return;
      }

      retryTimer = window.setTimeout(() => {
        focusTargetWhenReady(attempt + 1);
      }, 120);
    };

    retryTimer = window.setTimeout(() => {
      focusTargetWhenReady();
    }, 60);

    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
    };
  }, [activeSection, pendingTopBarAction]);

  if (loading && !dashboard) {
    return <div className="loading-screen">Loading your money brain...</div>;
  }

  if (!dashboard) {
    return <div className="loading-screen">Unable to load dashboard. {error}</div>;
  }

  async function handlePersonaChange(nextMode) {
    if (nextMode === dashboard.user.preferences.personalityMode) {
      return;
    }

    const previousMode = dashboard.user.preferences.personalityMode;
    setPersonaSaving(true);
    setPersonaFeedback("");

    setDashboard((current) => ({
      ...current,
      user: {
        ...current.user,
        preferences: {
          ...current.user.preferences,
          personalityMode: nextMode
        }
      }
    }));

    try {
      await updatePreferences({
        preferences: {
          ...dashboard.user.preferences,
          personalityMode: nextMode
        }
      });
      setPersonaFeedback(`Advisor personality changed to ${nextMode}.`);
    } catch (nextError) {
      setDashboard((current) => ({
        ...current,
        user: {
          ...current.user,
          preferences: {
            ...current.user.preferences,
            personalityMode: previousMode
          }
        }
      }));
      setPersonaFeedback(nextError.message || "Unable to change advisor personality right now.");
    } finally {
      setPersonaSaving(false);
    }
  }

  function handleOpenAlerts() {
    setActiveSection("overview");
    setPendingTopBarAction("alerts");
  }

  function handleOpenAdvisor() {
    setActiveSection("advisor");
    setPendingTopBarAction("advisor");
  }

  return (
    <div className="dashboard-shell">
      <div className="dashboard-layout">
        <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

        <main className="dashboard-main">
          <TopBar
            user={session.user}
            onLogout={onLogout}
            onRefresh={refresh}
            onOpenAlerts={handleOpenAlerts}
            onOpenAdvisor={handleOpenAdvisor}
            refreshing={loading}
            lastUpdated={lastUpdated}
            theme={theme}
            onThemeChange={onThemeChange}
            onOpenInstallPrompt={onOpenInstallPrompt}
            canInstall={canInstall}
            isInstalled={isInstalled}
          />

          <div className="section-switcher glass-panel">
            <div>
              <p className="eyebrow">Current Section</p>
              <h3>{activeLabel}</h3>
            </div>
            <div className="switcher-chips">
              {dashboardSections.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={activeSection === item.id ? "persona-chip active" : "persona-chip"}
                  onClick={() => setActiveSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div className="inline-feedback error-state">
              <strong>Dashboard refresh did not complete.</strong>
              <span>{error}</span>
              <button className="secondary-button" type="button" onClick={() => refresh()}>
                Try Refresh Again
              </button>
            </div>
          ) : null}

          {(activeSection === "overview" || activeSection === "analytics") && (
            <>
              <AlertTicker alerts={dashboard.alerts} />
              <DashboardHero dashboard={dashboard} currency={currency} />

              <motion.section
                className="hero-grid-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <StatCard
                  title="Total Balance"
                  value={formatCurrency(dashboard.summary.balance, currency)}
                  subtitle="Live across all wallets"
                  tone="accent"
                />
                <StatCard
                  title="Month-end Prediction"
                  value={formatCurrency(dashboard.prediction.endOfMonthBalance, currency)}
                  subtitle="Forecast after recurring spend"
                />
                <StatCard
                  title="Savings Rate"
                  value={`${dashboard.summary.savingsRate}%`}
                  subtitle="Net income retained this cycle"
                />
                <StatCard
                  title="Top Leak"
                  value={dashboard.patterns.topCategory}
                  subtitle={`Weekend spend is ${dashboard.patterns.weekendSpikePercent}% higher`}
                  tone="warning"
                />
              </motion.section>
            </>
          )}

          {activeSection === "overview" && (
            <>
              <section className="primary-grid">
                <BudgetGauge dailyBudget={dashboard.dailyBudget} currency={currency} />
                <HealthScoreRing score={dashboard.healthScore} />
                <WalletPanel
                  wallets={dashboard.user.wallets}
                  summary={dashboard.summary}
                  prediction={dashboard.prediction}
                  currency={currency}
                />
              </section>
              <QuickActionsPanel currency={currency} dailyBudget={dashboard.dailyBudget} />
              <HowToUsePanel />
            </>
          )}

          {activeSection === "advisor" && (
            <section className="advisor-page-stack">
              <AssistantPanel dashboard={dashboard} refresh={refresh} />
              <div className="content-grid-two">
                <PersonaSwitcher
                  mode={dashboard.user.preferences.personalityMode}
                  onChange={handlePersonaChange}
                  saving={personaSaving}
                  feedback={personaFeedback}
                />
                <QuickActionsPanel currency={currency} dailyBudget={dashboard.dailyBudget} />
              </div>
            </section>
          )}

          {activeSection === "activity" && (
            <section className="content-grid-two">
              <div className="secondary-column">
                <WalletPanel
                  wallets={dashboard.user.wallets}
                  summary={dashboard.summary}
                  prediction={dashboard.prediction}
                  currency={currency}
                />
                <TransactionComposer wallets={dashboard.user.wallets} addTransaction={addTransaction} />
              </div>
              <RecentTransactions transactions={dashboard.transactions} currency={currency} />
            </section>
          )}

          {activeSection === "analytics" && <AnalyticsPanel charts={dashboard.charts} />}

          {activeSection === "docs" && <HowToUsePanel />}

          {activeSection === "settings" && (
            <section className="content-grid-two">
              <CustomizationPanel
                user={dashboard.user}
                updatePreferences={updatePreferences}
                theme={theme}
                onThemeChange={onThemeChange}
                onOpenInstallPrompt={onOpenInstallPrompt}
                canInstall={canInstall}
                isInstalled={isInstalled}
              />
              <div className="secondary-column">
                <QuickActionsPanel currency={currency} dailyBudget={dashboard.dailyBudget} />
                <PersonaSwitcher
                  mode={dashboard.user.preferences.personalityMode}
                  onChange={handlePersonaChange}
                  saving={personaSaving}
                  feedback={personaFeedback}
                />
              </div>
            </section>
          )}

          {activeSection === "goals" && (
            <GoalsPanel
              goals={dashboard.user.goals}
              gamification={dashboard.gamification}
              investment={dashboard.investment}
              currency={currency}
            />
          )}
        </main>
      </div>

      <MobileDock activeSection={activeSection} onNavigate={setActiveSection} />
    </div>
  );
}
