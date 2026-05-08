import cron from "node-cron";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { sendDailyReportEmail } from "./reportEmailService.js";

function shouldSendNow(preferences, now) {
  if (!preferences?.dailyReportEnabled || !preferences?.reportEmail) {
    return false;
  }

  const [hours, minutes] = (preferences.dailyReportTime || "08:00").split(":").map(Number);
  if (now.getHours() !== hours || now.getMinutes() !== minutes) {
    return false;
  }

  if (!preferences.lastDailyReportSentAt) {
    return true;
  }

  const lastSent = new Date(preferences.lastDailyReportSentAt);
  return lastSent.toDateString() !== now.toDateString();
}

export function startReportScheduler() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const users = await User.find({
      "preferences.dailyReportEnabled": true
    });

    for (const user of users) {
      if (!shouldSendNow(user.preferences, now)) {
        continue;
      }

      try {
        const transactions = await Transaction.find({ userId: user._id }).sort({ timestamp: -1 }).lean();
        await sendDailyReportEmail({ user, transactions });
        user.preferences.lastDailyReportSentAt = now;
        await user.save();
      } catch (error) {
        console.error(`Daily report failed for ${user.email}:`, error.message);
      }
    }
  });
}
