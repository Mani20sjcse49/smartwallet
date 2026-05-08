import { dashboardSections } from "./Sidebar.jsx";

export function MobileDock({ activeSection, onNavigate }) {
  return (
    <nav className="mobile-dock glass-panel" aria-label="Mobile navigation">
      {dashboardSections.map((item) => (
        <button
          key={item.id}
          type="button"
          className={activeSection === item.id ? "dock-item active" : "dock-item"}
          onClick={() => onNavigate(item.id)}
        >
          <item.icon size={18} />
          <span>{item.mobileLabel || item.label}</span>
        </button>
      ))}
    </nav>
  );
}
