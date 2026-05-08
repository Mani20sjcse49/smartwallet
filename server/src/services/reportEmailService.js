import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { buildDashboardPayload } from "./dashboardService.js";
import { sampleTransactions } from "./demoData.js";

let transporter;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (env.smtpHost && env.smtpUser && env.smtpPass) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    jsonTransport: true
  });
  return transporter;
}

export function buildDailyReportEmail(user, transactions = sampleTransactions) {
  const dashboard = buildDashboardPayload(user, transactions);
  const recipient = user.preferences?.reportEmail || user.email;

  return {
    recipient,
    subject: `Daily Money Report for ${user.name}`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;background:#fffaf4;color:#1f2430;padding:24px">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #f0e3d2;border-radius:24px;padding:28px">
          <p style="margin:0 0 8px;color:#1594a5;font-size:12px;letter-spacing:2px;text-transform:uppercase">AI Smart Wallet</p>
          <h1 style="margin:0 0 12px;font-size:32px;line-height:1.05">Your daily money report</h1>
          <p style="margin:0 0 24px;color:#6f7b8e">A simple snapshot of your balance, budget, and next smart move.</p>

          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:22px">
            <div style="padding:18px;border-radius:18px;background:#fff5eb;border:1px solid #f6e5d3">
              <div style="color:#7a8498;font-size:13px;margin-bottom:6px">Current balance</div>
              <strong style="font-size:28px">Rs ${dashboard.summary.balance}</strong>
            </div>
            <div style="padding:18px;border-radius:18px;background:#eefbf7;border:1px solid #d7f3ea">
              <div style="color:#7a8498;font-size:13px;margin-bottom:6px">Safe to spend today</div>
              <strong style="font-size:28px">Rs ${dashboard.dailyBudget.safeLimit}</strong>
            </div>
            <div style="padding:18px;border-radius:18px;background:#fffaf1;border:1px solid #f8e5b8">
              <div style="color:#7a8498;font-size:13px;margin-bottom:6px">Top spend category</div>
              <strong style="font-size:24px">${dashboard.patterns.topCategory}</strong>
            </div>
            <div style="padding:18px;border-radius:18px;background:#f5f9ff;border:1px solid #dde8fb">
              <div style="color:#7a8498;font-size:13px;margin-bottom:6px">Month-end prediction</div>
              <strong style="font-size:28px">Rs ${dashboard.prediction.endOfMonthBalance}</strong>
            </div>
          </div>

          <div style="padding:18px;border-radius:18px;background:#fffaf4;border:1px solid #f0e3d2">
            <div style="font-weight:700;margin-bottom:8px">Today’s guidance</div>
            <p style="margin:0;color:#516074;line-height:1.6">${dashboard.dailyBudget.message}</p>
          </div>
        </div>
      </div>
    `
  };
}

export async function sendDailyReportEmail({ user, transactions }) {
  const { recipient, subject, html } = buildDailyReportEmail(user, transactions);
  const transport = getTransporter();

  const result = await transport.sendMail({
    from: env.smtpFrom,
    to: recipient,
    subject,
    html
  });

  return {
    recipient,
    transportMode: env.smtpHost ? "smtp" : "demo-json",
    messageId: result.messageId || "",
    preview: typeof result.message === "string" ? result.message : undefined
  };
}
