import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    savedAmount: { type: Number, default: 0 },
    deadline: { type: Date },
    category: { type: String, default: "General" }
  },
  { _id: false }
);

const walletSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["cash", "bank", "upi", "card", "shared"],
      default: "bank"
    },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "INR" }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    income: { type: Number, default: 0 },
    goals: { type: [goalSchema], default: [] },
    preferences: {
      currency: { type: String, default: "INR", enum: ["INR"] },
      aiStrictness: {
        type: String,
        enum: ["soft", "balanced", "strict"],
        default: "balanced"
      },
      personalityMode: {
        type: String,
        enum: ["friendly", "strict", "silent"],
        default: "friendly"
      },
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
      },
      customCategories: { type: [String], default: [] },
      familyMode: { type: Boolean, default: false },
      reportEmail: { type: String, default: "" },
      dailyReportEnabled: { type: Boolean, default: false },
      dailyReportTime: { type: String, default: "08:00" },
      lastDailyReportSentAt: { type: Date, default: null }
    },
    wallets: {
      type: [walletSchema],
      default: [
        { name: "Main Bank", type: "bank", balance: 42000, currency: "INR" },
        { name: "UPI Wallet", type: "upi", balance: 6500, currency: "INR" },
        { name: "Cash", type: "cash", balance: 1800, currency: "INR" }
      ]
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
