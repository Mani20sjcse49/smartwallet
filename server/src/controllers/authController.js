import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  updateUser
} from "../services/dataStore.js";
import { env } from "../config/env.js";

function buildDefaultGoals() {
  return [
    {
      title: "Emergency Fund",
      targetAmount: 120000,
      savedAmount: 25000,
      category: "Safety"
    }
  ];
}

function buildDefaultPreferences(email) {
  return {
    personalityMode: "friendly",
    aiStrictness: "balanced",
    riskLevel: "medium",
    dailyReportEnabled: false,
    dailyReportTime: "08:00",
    reportEmail: email
  };
}

function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, env.jwtSecret, {
    expiresIn: "7d"
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password, income, preferences, goals } = req.body;
    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPassword = password?.trim();
    const normalizedIncome = Number.isFinite(Number(income)) ? Number(income) : 0;

    if (!normalizedName) {
      return res.status(400).json({ message: "Full name is required" });
    }

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!normalizedPassword) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (normalizedPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
    const user = await createUser({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      income: normalizedIncome,
      preferences: {
        ...buildDefaultPreferences(normalizedEmail),
        ...(preferences || {}),
        reportEmail: normalizedEmail
      },
      goals: Array.isArray(goals) && goals.length ? goals : buildDefaultGoals()
    });

    return res.status(201).json({
      token: signToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPassword = password?.trim();

    if (!normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(normalizedPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      token: signToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function socialAuth(req, res, next) {
  try {
    const { provider, email, name } = req.body;

    if (!provider || !["google", "apple"].includes(provider)) {
      return res.status(400).json({ message: "Unsupported sign-in provider" });
    }

    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required for social sign-in" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const fallbackName = normalizedEmail.split("@")[0].replace(/[._-]+/g, " ");
    let user = await findUserByEmail(normalizedEmail);

    if (!user) {
      const generatedPassword = await bcrypt.hash(`${provider}-${normalizedEmail}-${env.jwtSecret}`, 10);
      user = await createUser({
        name: name?.trim() || fallbackName,
        email: normalizedEmail,
        password: generatedPassword,
        income: 0,
        goals: buildDefaultGoals().map((goal) => ({
          ...goal,
          savedAmount: 0
        })),
        preferences: buildDefaultPreferences(normalizedEmail)
      });
    } else if (name?.trim() && user.name !== name.trim()) {
      user = await updateUser(user._id, { name: name.trim() });
    }

    return res.json({
      token: signToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return next(error);
  }
}
