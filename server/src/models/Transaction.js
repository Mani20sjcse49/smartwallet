import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    walletName: { type: String, default: "Main Bank" },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ["expense", "income", "transfer"], required: true },
    merchant: { type: String, default: "" },
    notes: { type: String, default: "" },
    source: {
      type: String,
      enum: ["manual", "voice", "ocr", "recurring", "demo"],
      default: "manual"
    },
    timestamp: { type: Date, default: Date.now },
    recurring: { type: Boolean, default: false },
    aiTags: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
