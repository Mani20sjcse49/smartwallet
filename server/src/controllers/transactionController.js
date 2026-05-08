import { inferCategory } from "../services/financialEngine.js";
import { createTransaction as createStoredTransaction, findTransactionsByUserId, findUserById, updateUser } from "../services/dataStore.js";

export async function listTransactions(req, res, next) {
  try {
    const transactions = await findTransactionsByUserId(req.user.id);

    return res.json(transactions.slice(0, 50));
  } catch (error) {
    return next(error);
  }
}

export async function createTransaction(req, res, next) {
  try {
    const payload = req.body;
    const amount = Number(payload.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Enter a valid amount greater than zero" });
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const walletIndex = user.wallets.findIndex((wallet) => wallet.name === payload.walletName);
    if (walletIndex < 0) {
      return res.status(400).json({ message: "Select a valid wallet" });
    }

    if (payload.type === "expense" && amount > user.wallets[walletIndex].balance) {
      return res.status(400).json({ message: "This wallet does not have enough balance" });
    }

    const category = payload.category || inferCategory(`${payload.notes || ""} ${payload.merchant || ""}`);

    const transaction = await createStoredTransaction({
      ...payload,
      amount,
      category,
      userId: req.user.id
    });

    if (payload.type === "income" || payload.type === "expense") {
      const delta = payload.type === "income" ? amount : -amount;
      user.wallets[walletIndex].balance += delta;
      await updateUser(user._id, {
        wallets: user.wallets
      });
    }

    return res.status(201).json(transaction);
  } catch (error) {
    return next(error);
  }
}

export async function parseSmartInput(req, res) {
  const { text } = req.body;
  const cleanedText = text || "";
  const amountMatch = cleanedText.match(/(?:rs|inr|rupees|spent|paid|received)?\s*(\d+(?:\.\d+)?)/i);
  const amount = amountMatch ? Number(amountMatch[1]) : 0;
  const type = /received|salary|credited|income/i.test(cleanedText) ? "income" : "expense";
  const category = inferCategory(cleanedText);
  const merchant = cleanedText
    .replace(/spent|paid|received|credited|income|rs|inr|rupees|\d+(?:\.\d+)?/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return res.json({
    amount,
    type,
    category,
    merchant: merchant || cleanedText,
    notes: cleanedText,
    source: "voice"
  });
}
