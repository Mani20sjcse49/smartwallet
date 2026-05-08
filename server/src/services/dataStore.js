import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { sampleTransactions } from "./demoData.js";

let mode = "mongo";
const fallback = {
  users: [],
  transactions: []
};

function debugStore(operation) {
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[dataStore] ${operation} mode=${mode}`);
  }
}

function initializeFallbackStore() {
  const demoUserId = crypto.randomUUID();
  const demoUser = {
    _id: demoUserId,
    name: "Aarav Mehta",
    email: "demo@smartwallet.ai",
    password: bcrypt.hashSync("demo1234", 10),
    income: 85000,
    goals: [
      {
        title: "Goa Vacation",
        targetAmount: 40000,
        savedAmount: 14500,
        deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 15),
        category: "Travel"
      }
    ],
    preferences: {
      currency: "INR",
      aiStrictness: "balanced",
      personalityMode: "friendly",
      riskLevel: "medium",
      customCategories: [],
      familyMode: false,
      reportEmail: "demo@smartwallet.ai",
      dailyReportEnabled: false,
      dailyReportTime: "08:00",
      lastDailyReportSentAt: null
    },
    wallets: [
      { name: "Main Bank", type: "bank", balance: 42000, currency: "INR" },
      { name: "UPI Wallet", type: "upi", balance: 6500, currency: "INR" },
      { name: "Cash", type: "cash", balance: 1800, currency: "INR" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  fallback.users.push(demoUser);
  fallback.transactions.push(
    ...sampleTransactions.map((transaction) => ({
      ...transaction,
      _id: crypto.randomUUID(),
      userId: demoUserId,
      timestamp: transaction.timestamp || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  );
}

export function useFallbackStore() {
  if (mode !== "fallback") {
    mode = "fallback";
    if (!fallback.users.length) {
      initializeFallbackStore();
    }
  }
}

export function isFallbackStore() {
  return mode === "fallback";
}

export async function findUserByEmail(email) {
  debugStore("findUserByEmail");
  if (mode === "mongo") {
    return User.findOne({ email }).lean();
  }

  return fallback.users.find((user) => user.email === email) || null;
}

export async function findUserById(id) {
  debugStore("findUserById");
  if (mode === "mongo") {
    return User.findById(id).lean();
  }

  return fallback.users.find((user) => user._id === id) || null;
}

export async function createUser(userData) {
  debugStore("createUser");
  if (mode === "mongo") {
    return User.create(userData);
  }

  const user = {
    ...userData,
    _id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  fallback.users.push(user);
  return user;
}

export async function updateUser(id, updates) {
  debugStore("updateUser");
  if (mode === "mongo") {
    return User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });
  }

  const user = fallback.users.find((item) => item._id === id);
  if (!user) {
    return null;
  }

  Object.assign(user, updates, { updatedAt: new Date() });
  return user;
}

export async function findOrCreateDemoUser(email, updateData) {
  debugStore("findOrCreateDemoUser");
  if (mode === "mongo") {
    return User.findOneAndUpdate(
      { email },
      {
        $set: updateData,
        $setOnInsert: { email }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
  }

  let user = fallback.users.find((item) => item.email === email);
  if (user) {
    Object.assign(user, updateData, { updatedAt: new Date() });
    return user;
  }

  user = {
    ...updateData,
    _id: crypto.randomUUID(),
    email,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  fallback.users.push(user);
  return user;
}

export async function findTransactionsByUserId(userId) {
  debugStore("findTransactionsByUserId");
  if (mode === "mongo") {
    return Transaction.find({ userId }).sort({ timestamp: -1 }).lean();
  }

  return fallback.transactions
    .filter((item) => item.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export async function createTransaction(transactionData) {
  debugStore("createTransaction");
  if (mode === "mongo") {
    return Transaction.create(transactionData);
  }

  const transaction = {
    ...transactionData,
    _id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  fallback.transactions.push(transaction);
  return transaction;
}

export async function findUsersForReports() {
  if (mode === "mongo") {
    return User.find({ "preferences.dailyReportEnabled": true }).lean();
  }

  return fallback.users.filter((user) => user.preferences?.dailyReportEnabled === true);
}
