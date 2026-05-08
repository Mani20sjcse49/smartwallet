import { BarChart3, BookOpen, Brain, CreditCard, Goal, Settings, WalletCards } from "lucide-react";

export const dashboardSections = [
  { id: "overview", icon: Brain, label: "Overview", mobileLabel: "Home" },
  { id: "advisor", icon: WalletCards, label: "AI Advisor", mobileLabel: "Advisor" },
  { id: "activity", icon: CreditCard, label: "Activity", mobileLabel: "Activity" },
  { id: "analytics", icon: BarChart3, label: "Analytics", mobileLabel: "Stats" },
  { id: "docs", icon: BookOpen, label: "How To Use", mobileLabel: "Guide" },
  { id: "settings", icon: Settings, label: "Settings", mobileLabel: "Settings" },
  { id: "goals", icon: Goal, label: "Goals", mobileLabel: "Goals" }
];

export function Sidebar({ activeSection, onNavigate }) {
  return (
    <aside className="sidebar glass-panel">
      <div className="brand-lockup">
        <img className="brand-mark" src="/smart-wallet-logo.png" alt="Smart Wallet logo" />
        <div>
          <strong>Smart Wallet</strong>
          <p>Money intelligence system</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {dashboardSections.map((item) => (
          <button
            key={item.id}
            className={activeSection === item.id ? "nav-item active" : "nav-item"}
            type="button"
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer soft-panel">
        <p>Money guidance live</p>
        <span>Track, predict, and act faster with cleaner daily decisions across desktop and mobile.</span>
      </div>
    </aside>
  );
}
