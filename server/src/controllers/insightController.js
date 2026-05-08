import { buildDashboardPayload } from "../services/dashboardService.js";
import { sampleTransactions } from "../services/demoData.js";
import { findTransactionsByUserId, findUserById } from "../services/dataStore.js";

export async function getInsights(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    const transactions = await findTransactionsByUserId(req.user.id);
    const dashboard = buildDashboardPayload(user, transactions.length ? transactions : sampleTransactions);

    return res.json({
      predictions: dashboard.prediction,
      spendingPatterns: dashboard.patterns,
      alerts: dashboard.alerts,
      healthScore: dashboard.healthScore,
      investment: dashboard.investment
    });
  } catch (error) {
    return next(error);
  }
}
