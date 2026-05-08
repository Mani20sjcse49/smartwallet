import { AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";

const iconMap = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  info: Sparkles
};

export function AlertTicker({ alerts }) {
  return (
    <section id="dashboard-alerts" className="alert-strip" tabIndex={-1}>
      {alerts.map((alert) => {
        const Icon = iconMap[alert.severity] || Sparkles;
        return (
          <article key={alert.title} className={`alert-card severity-${alert.severity}`}>
            <Icon size={16} />
            <div>
              <strong>{alert.title}</strong>
              <span>{alert.message}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
