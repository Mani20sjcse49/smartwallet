import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authRoutes from "./routes/authRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { findOrCreateDemoUser } from "./services/dataStore.js";
import { env } from "./config/env.js";

function isAllowedOrigin(origin, clientUrl) {
  if (!origin) {
    return true;
  }

  if (origin === clientUrl) {
    return true;
  }

  if (process.env.NODE_ENV !== "production") {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  }

  return false;
}

export function createApp(clientUrl) {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin, clientUrl)) {
          return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (req, res) => {
    return res.json({ status: "ok", app: "AI Smart Wallet API" });
  });

  app.post("/api/demo/bootstrap", async (req, res, next) => {
    try {
      const demoEmail = "demo@smartwallet.ai";
      const hashedPassword = await bcrypt.hash("demo1234", 10);
      const demoGoals = [
        {
          title: "Goa Vacation",
          targetAmount: 40000,
          savedAmount: 14500,
          deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 15),
          category: "Travel"
        }
      ];

      const user = await findOrCreateDemoUser(demoEmail, {
        name: "Aarav Mehta",
        password: hashedPassword,
        income: 85000,
        goals: demoGoals,
        preferences: {
          currency: "INR",
          aiStrictness: "balanced",
          personalityMode: "friendly",
          riskLevel: "medium",
          customCategories: [],
          familyMode: false,
          reportEmail: demoEmail,
          dailyReportEnabled: false,
          dailyReportTime: "08:00",
          lastDailyReportSentAt: null
        }
      });

      return res.json({
        token: jwt.sign({ id: user._id, email: user.email }, env.jwtSecret, {
          expiresIn: "7d"
        }),
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        email: demoEmail,
        password: "demo1234",
        message: "Demo account ready"
      });
    } catch (error) {
      return next(error);
    }
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/wallet", walletRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/insights", insightRoutes);
  app.use("/api/ai", aiRoutes);

  app.use(errorHandler);

  return app;
}
