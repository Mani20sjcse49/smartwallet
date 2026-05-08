import { sampleTransactions } from "./demoData.js";
import {
  buildAlerts,
  buildBehavioralPatterns,
  buildInvestmentPlan,
  buildNetWorthSeries,
  buildPrediction,
  buildTrendSeries,
  calculateDailyBudget,
  calculateHealthScore,
  calculateWalletBalance,
  summarizeTransactions
} from "./financialEngine.js";

export function buildDashboardPayload(user, transactions = sampleTransactions) {
  const enrichedTransactions = transactions
    .map((item) => ({
      ...item,
      timestamp: item.timestamp || new Date()
    }))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const balance = calculateWalletBalance(user, enrichedTransactions);
  const dailyBudget = calculateDailyBudget({
    balance,
    transactions: enrichedTransactions,
    goals: user.goals
  });
  const patterns = buildBehavioralPatterns(enrichedTransactions);
  const prediction = buildPrediction({
    balance,
    transactions: enrichedTransactions,
    income: user.income
  });
  const alerts = buildAlerts({
    patterns,
    dailyBudget,
    prediction,
    goals: user.goals
  });
  const summary = summarizeTransactions(enrichedTransactions);
  const healthScore = calculateHealthScore({
    balance,
    income: user.income,
    dailyBudget,
    goals: user.goals,
    patterns
  });
  const investment = buildInvestmentPlan({
    income: user.income,
    balance,
    riskLevel: user.preferences?.riskLevel
  });

  return {
    user: {
      name: user.name,
      email: user.email,
      income: user.income,
      preferences: user.preferences,
      goals: user.goals,
      wallets: user.wallets
    },
    summary: {
      ...summary,
      balance,
      savingsRate: user.income ? Math.max(0, Math.round((summary.net / user.income) * 100)) : 0
    },
    dailyBudget,
    prediction,
    patterns,
    alerts,
    healthScore,
    investment,
    charts: {
      netWorth: buildNetWorthSeries(balance),
      dailyTrend: buildTrendSeries(enrichedTransactions),
      categories: Object.entries(patterns.byCategory).map(([name, value]) => ({ name, value }))
    },
    gamification: {
      savingStreak: 8,
      achievements: ["Budget Guardian", "Weekend Warrior", "Emergency Buffer Builder"]
    },
    transactions: enrichedTransactions.slice(0, 12)
  };
}
