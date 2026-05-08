import mongoose from "mongoose";

const insightSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    predictions: {
      endOfMonthBalance: { type: Number, default: 0 },
      projectedExpenses: { type: Number, default: 0 },
      nextOverspendRiskDate: { type: Date }
    },
    spendingPatterns: {
      weekendSpikePercent: { type: Number, default: 0 },
      topCategory: { type: String, default: "Food" },
      recurringExpenses: { type: [String], default: [] }
    },
    alerts: {
      type: [
        {
          title: String,
          severity: String,
          message: String
        }
      ],
      default: []
    },
    healthScore: { type: Number, default: 70 }
  },
  { timestamps: true }
);

export const Insight = mongoose.model("Insight", insightSchema);
