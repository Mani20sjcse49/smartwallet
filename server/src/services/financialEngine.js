const WEEKEND_DAYS = [0, 6];

export function inferCategory(input = "") {
  const text = input.toLowerCase();

  if (/uber|ola|metro|petrol|fuel|taxi|bus/.test(text)) return "Transport";
  if (/coffee|restaurant|swiggy|zomato|food|dinner|lunch/.test(text)) return "Food";
  if (/netflix|movie|game|spotify/.test(text)) return "Entertainment";
  if (/rent|emi|electricity|bill|internet/.test(text)) return "Bills";
  if (/doctor|medicine|pharmacy|hospital/.test(text)) return "Health";
  if (/salary|bonus|freelance/.test(text)) return "Salary";

  return "General";
}

export function summarizeTransactions(transactions = []) {
  return transactions.reduce(
    (summary, item) => {
      if (item.type === "income") summary.income += item.amount;
      if (item.type === "expense") summary.expenses += item.amount;
      if (item.type === "transfer") summary.transfers += item.amount;

      // Transfers move money between wallets and should not reduce overall net worth.
      summary.net = summary.income - summary.expenses;
      return summary;
    },
    { income: 0, expenses: 0, transfers: 0, net: 0 }
  );
}

export function calculateWalletBalance(user, transactions = []) {
  const baseBalance = (user.wallets || []).reduce((total, wallet) => total + wallet.balance, 0);
  const summary = summarizeTransactions(transactions);
  return baseBalance + summary.income - summary.expenses;
}

export function calculateDailyBudget({ balance, transactions, goals }) {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const remainingDays = Math.max(1, lastDay.getDate() - today.getDate());
  const goalCommitment = (goals || []).reduce((sum, goal) => {
    const pending = Math.max(0, goal.targetAmount - goal.savedAmount);
    return sum + pending * 0.1;
  }, 0);
  const recentExpenses = transactions
    .filter((item) => item.type === "expense")
    .slice(0, 10)
    .reduce((sum, item) => sum + item.amount, 0);
  const adaptiveFactor = recentExpenses > balance * 0.35 ? 0.82 : 0.95;
  const safeLimit = Math.max(0, ((balance - goalCommitment) / remainingDays) * adaptiveFactor);
  const spendVelocity = recentExpenses / Math.min(10, Math.max(1, transactions.length));

  let status = "safe";
  let message = "You are spending within a comfortable runway.";

  if (spendVelocity > safeLimit * 0.95) {
    status = "warning";
    message = "Your recent pace is close to your safe limit. Stay selective this week.";
  }

  if (spendVelocity > safeLimit * 1.15) {
    status = "overspending";
    message = "Your current pace will likely push you over budget unless you slow down.";
  }

  return {
    remainingDays,
    safeLimit: round(safeLimit),
    spendVelocity: round(spendVelocity),
    status,
    message
  };
}

export function buildBehavioralPatterns(transactions = []) {
  const expenses = transactions.filter((item) => item.type === "expense");
  const grouped = {};
  let weekendTotal = 0;
  let weekdayTotal = 0;
  let weekendCount = 0;
  let weekdayCount = 0;

  for (const item of expenses) {
    grouped[item.category] = (grouped[item.category] || 0) + item.amount;

    const day = new Date(item.timestamp).getDay();
    if (WEEKEND_DAYS.includes(day)) {
      weekendTotal += item.amount;
      weekendCount += 1;
    } else {
      weekdayTotal += item.amount;
      weekdayCount += 1;
    }
  }

  const weekendAverage = weekendCount ? weekendTotal / weekendCount : 0;
  const weekdayAverage = weekdayCount ? weekdayTotal / weekdayCount : 1;
  const sortedCategories = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0]?.[0] || "Food";
  const weekendSpikePercent = round(((weekendAverage - weekdayAverage) / weekdayAverage) * 100);

  return {
    byCategory: grouped,
    topCategory,
    weekendSpikePercent: Number.isFinite(weekendSpikePercent) ? weekendSpikePercent : 0
  };
}

export function buildPrediction({ balance, transactions, income }) {
  const summary = summarizeTransactions(transactions);
  const expenses = transactions.filter((item) => item.type === "expense");
  const averageExpense = expenses.length
    ? expenses.reduce((sum, item) => sum + item.amount, 0) / expenses.length
    : 0;
  const projectedExpenses = averageExpense * 8;
  const projectedIncome = income || summary.income;
  const endOfMonthBalance = round(balance + projectedIncome * 0.2 - projectedExpenses);
  const nextOverspendRiskDate = new Date();
  nextOverspendRiskDate.setDate(nextOverspendRiskDate.getDate() + (endOfMonthBalance < balance * 0.2 ? 3 : 7));

  return {
    projectedExpenses: round(projectedExpenses),
    endOfMonthBalance,
    nextOverspendRiskDate
  };
}

export function buildAlerts({ patterns, dailyBudget, prediction, goals }) {
  const alerts = [];

  if (patterns.weekendSpikePercent > 20) {
    alerts.push({
      title: "Weekend spending spike",
      severity: "warning",
      message: `You spend ${patterns.weekendSpikePercent}% more on weekends. Plan a lighter Saturday.`
    });
  }

  if (dailyBudget.status === "overspending") {
    alerts.push({
      title: "Overspending risk",
      severity: "critical",
      message: "You are likely to overspend in 3 days if this pace continues."
    });
  }

  if (goals?.[0]) {
    const pending = Math.max(0, goals[0].targetAmount - goals[0].savedAmount);
    alerts.push({
      title: "Goal nudge",
      severity: "info",
      message: `Save ${Math.ceil(pending / 30)} daily to hit your ${goals[0].title} goal on time.`
    });
  }

  if (prediction.projectedExpenses > prediction.endOfMonthBalance * 0.45) {
    alerts.push({
      title: "Expense pressure",
      severity: "warning",
      message: "Projected expenses are rising faster than your month-end runway."
    });
  }

  return alerts.slice(0, 4);
}

export function calculateHealthScore({ balance, income, dailyBudget, goals, patterns }) {
  let score = 55;

  if (income > 0 && balance > income * 0.25) score += 15;
  if (dailyBudget.status === "safe") score += 12;
  if (dailyBudget.status === "warning") score += 4;
  if (dailyBudget.status === "overspending") score -= 10;
  if ((goals || []).length > 0) score += 8;
  if (patterns.weekendSpikePercent > 20) score -= 6;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function buildTrendSeries(transactions = []) {
  const map = new Map();

  transactions.forEach((item) => {
    const date = new Date(item.timestamp).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric"
    });
    const existing = map.get(date) || { date, income: 0, expense: 0 };

    if (item.type === "income") existing.income += item.amount;
    if (item.type === "expense") existing.expense += item.amount;

    map.set(date, existing);
  });

  return Array.from(map.values()).slice(-10);
}

export function buildNetWorthSeries(balance) {
  return Array.from({ length: 6 }, (_, index) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index],
    value: Math.max(0, round(balance * (0.72 + index * 0.06)))
  }));
}

export function buildInvestmentPlan({ income, balance, riskLevel }) {
  const monthlyInvestable = Math.max(0, round(income * 0.18));
  const emergencyFundTarget = round(income * 6);
  const emergencyAllocation = balance < emergencyFundTarget ? round(monthlyInvestable * 0.45) : round(monthlyInvestable * 0.2);

  const riskMix = {
    low: ["40% FD", "30% Gold", "30% Index Mutual Fund"],
    medium: ["20% FD", "20% Gold", "60% Equity Mutual Fund"],
    high: ["10% FD", "10% Gold", "80% Equity SIP"]
  };

  return {
    monthlyInvestable,
    emergencyFundTarget,
    emergencyAllocation,
    plan: riskMix[riskLevel] || riskMix.medium,
    summary:
      riskLevel === "low"
        ? "Focus on stability first, then grow with conservative market exposure."
        : riskLevel === "high"
          ? "You can take more market exposure, but keep a real emergency cushion."
          : "Balance safety and growth with a steady SIP and a healthy emergency reserve."
  };
}

function round(value) {
  return Math.round(value);
}
