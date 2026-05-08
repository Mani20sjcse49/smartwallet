import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const pieColors = ["#ef7c52", "#f5a623", "#ffbf8a", "#ea7f34", "#d96a2b", "#f8cf9a"];
const tooltipStyle = {
  backgroundColor: "rgba(255, 250, 245, 0.98)",
  border: "1px solid rgba(101, 75, 48, 0.12)",
  borderRadius: "16px",
  color: "#1f2430",
  boxShadow: "0 18px 40px rgba(173, 132, 97, 0.16)"
};

export function AnalyticsPanel({ charts }) {
  return (
    <section className="analytics-grid">
      <article className="chart-card glass-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Net Worth</p>
            <h3>6-month trajectory</h3>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={charts.netWorth}>
            <defs>
              <linearGradient id="worth" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ef7c52" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ef7c52" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(101, 75, 48, 0.1)" vertical={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="value" stroke="#ef7c52" strokeWidth={3} fill="url(#worth)" />
          </AreaChart>
        </ResponsiveContainer>
      </article>

      <article className="chart-card glass-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Daily Trend</p>
            <h3>Income vs spending</h3>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={charts.dailyTrend}>
            <CartesianGrid stroke="rgba(101, 75, 48, 0.1)" vertical={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="income" stroke="#f5a623" strokeWidth={3} />
            <Line type="monotone" dataKey="expense" stroke="#ef7c52" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </article>

      <article className="chart-card glass-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Category Mix</p>
            <h3>Where your money goes</h3>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={charts.categories} dataKey="value" nameKey="name" outerRadius={88} innerRadius={38}>
              {charts.categories.map((entry, index) => (
                <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </article>
    </section>
  );
}
