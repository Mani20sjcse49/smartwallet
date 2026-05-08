import { buildDashboardPayload } from "../services/dashboardService.js";
import { sampleTransactions } from "../services/demoData.js";
import { sendDailyReportEmail } from "../services/reportEmailService.js";
import {
  findUserById,
  findTransactionsByUserId,
  updateUser
} from "../services/dataStore.js";

export async function getDashboard(req, res, next) {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transactions = await findTransactionsByUserId(user._id);
    const dashboard = buildDashboardPayload(user, transactions.length ? transactions : sampleTransactions);

    return res.json(dashboard);
  } catch (error) {
    return next(error);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentPreferences = user.preferences || {};

    const updatedUser = await updateUser(user._id, {
      preferences: {
        ...currentPreferences,
        ...req.body.preferences,
        currency: "INR"
      },
      goals: Array.isArray(req.body.goals) ? req.body.goals : user.goals,
      wallets: Array.isArray(req.body.wallets) ? req.body.wallets : user.wallets
    });

    return res.json({
      message: "Preferences updated",
      preferences: updatedUser.preferences,
      goals: updatedUser.goals,
      wallets: updatedUser.wallets
    });
  } catch (error) {
    return next(error);
  }
}

export async function sendTestReport(req, res, next) {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transactions = await findTransactionsByUserId(user._id);
    const result = await sendDailyReportEmail({ user, transactions: transactions.length ? transactions : sampleTransactions });

    return res.json({
      message: `Report prepared for ${result.recipient}`,
      transportMode: result.transportMode
    });
  } catch (error) {
    return next(error);
  }
}
