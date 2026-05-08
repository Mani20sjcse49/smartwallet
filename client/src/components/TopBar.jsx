import { Bell, Download, LogOut, RefreshCw, Sparkles } from "lucide-react";
import { formatRelativeLabel } from "../utils/formatters.js";
import { ThemeToggle } from "./ThemeToggle.jsx";

export function TopBar({
  user,
  onLogout,
  onRefresh,
  onOpenAlerts,
  onOpenAdvisor,
  refreshing,
  lastUpdated,
  theme,
  onThemeChange,
  onOpenInstallPrompt,
  canInstall,
  isInstalled
}) {
  async function handleRefreshClick() {
    await onRefresh?.();
  }

  return (
    <header className="topbar glass-panel">
      <div className="topbar-copy">
        <p className="eyebrow">Welcome back</p>
        <h2>{user.name}</h2>
        <span className="topbar-meta">{formatRelativeLabel(lastUpdated)}</span>
      </div>

      <div className="topbar-actions">
        <div className="topbar-primary-actions">
          <ThemeToggle theme={theme} onChange={onThemeChange} compact />
          <button className="secondary-button topbar-install-button" type="button" onClick={() => onOpenInstallPrompt?.()}>
            <Download size={16} />
            {isInstalled ? "Installed" : canInstall ? "Install App" : "Install Guide"}
          </button>
          <button
            className="advisor-chip topbar-advisor-button"
            type="button"
            onClick={() => onOpenAdvisor?.()}
            aria-label="Open AI advisor"
            title="Open AI advisor"
          >
            <Sparkles size={16} />
            AI Active
          </button>
        </div>

        <div className="topbar-icon-actions">
          <button
            className="icon-button"
            type="button"
            onClick={handleRefreshClick}
            disabled={refreshing}
            aria-label="Refresh dashboard"
            title="Refresh dashboard"
          >
            <RefreshCw size={18} className={refreshing ? "spinning" : ""} />
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => onOpenAlerts?.()}
            aria-label="Open alerts"
            title="Open alerts"
          >
            <Bell size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => onLogout?.()}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
