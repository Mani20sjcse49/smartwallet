import { motion } from "framer-motion";

export function StatCard({ title, value, subtitle, tone = "default" }) {
  return (
    <motion.article
      className={`stat-card soft-panel tone-${tone}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{subtitle}</span>
    </motion.article>
  );
}
