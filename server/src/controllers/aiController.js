import { buildDashboardPayload } from "../services/dashboardService.js";
import { generateAdvisorReply } from "../services/aiAdvisorService.js";
import { sampleTransactions } from "../services/demoData.js";
import { fetchFinanceNews } from "../services/financeNewsService.js";
import { findTransactionsByUserId, findUserById } from "../services/dataStore.js";

export async function chatWithAdvisor(req, res, next) {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transactions = await findTransactionsByUserId(req.user.id);
    const dashboard = buildDashboardPayload(user, transactions.length ? transactions : sampleTransactions);
    const financeNews = await fetchFinanceNews();
    const reply = await generateAdvisorReply({
      question: req.body.question,
      dashboard,
      personalityMode: req.body.personalityMode || user.preferences?.personalityMode,
      financeNews
    });

    return res.json({
      answer: reply,
      financeNews,
      contextSummary: {
        safeDailyBudget: dashboard.dailyBudget.safeLimit,
        healthScore: dashboard.healthScore,
        topCategory: dashboard.patterns.topCategory
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function getFinanceNews(req, res, next) {
  try {
    const news = await fetchFinanceNews();
    return res.json(news);
  } catch (error) {
    return next(error);
  }
}

export async function canAfford(req, res, next) {
  try {
    const { amount } = req.body;
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transactions = await findTransactionsByUserId(req.user.id);
    const dashboard = buildDashboardPayload(user, transactions.length ? transactions : sampleTransactions);
    const affordable = amount <= dashboard.dailyBudget.safeLimit * 3 && amount <= dashboard.summary.balance * 0.15;

    return res.json({
      affordable,
      reason: affordable
        ? "This fits within your near-term cash flow."
        : "This purchase would strain your safe budget runway right now.",
      recommendedBudget: dashboard.dailyBudget.safeLimit
    });
  } catch (error) {
    return next(error);
  }
}
