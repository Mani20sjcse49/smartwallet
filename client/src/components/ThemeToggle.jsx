import { MoonStar, SunMedium } from "lucide-react";

const themeOptions = [
  { id: "light", label: "Light", icon: SunMedium },
  { id: "dark", label: "Dark", icon: MoonStar }
];

export function ThemeToggle({ theme, onChange, compact = false }) {
  return (
    <div className={compact ? "theme-toggle theme-toggle-compact" : "theme-toggle"} role="group" aria-label="Color theme">
      {themeOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          className={theme === option.id ? `theme-toggle-option theme-toggle-${option.id} active` : `theme-toggle-option theme-toggle-${option.id}`}
          onClick={() => onChange?.(option.id)}
          aria-pressed={theme === option.id}
        >
          <span className="theme-toggle-icon" aria-hidden="true">
            <option.icon size={16} />
          </span>
          <span className="theme-toggle-label">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
