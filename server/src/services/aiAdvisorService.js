import { getOpenAIClient } from "./openaiService.js";

export async function generateAdvisorReply({ question, dashboard, personalityMode, financeNews = [] }) {
  const client = getOpenAIClient();
  const personaInstruction =
    personalityMode === "strict"
      ? "Adopt a strict advisor persona. Be direct, disciplined, and candid about overspending or weak decisions. Use short paragraphs and tell the user what to do next."
      : personalityMode === "silent"
        ? "Adopt a minimal persona. Keep the reply brief, low-noise, and sharply focused on the essential answer. Avoid extra encouragement or long explanations."
        : "Adopt a friendly coach persona. Sound warm, encouraging, and easy to understand while staying practical and concise.";

  if (!client) {
    return fallbackAdvisorReply({ question, dashboard, personalityMode, financeNews });
  }

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                `You are AI Smart Wallet, a personal finance advisor. Use the user's financial data to give concise, practical, beginner-friendly advice. Never sound robotic. ${personaInstruction}`
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                personalityMode,
                question,
                context: dashboard,
                financeNews
              })
            }
          ]
        }
      ]
    });

    return response.output_text || fallbackAdvisorReply({ question, dashboard, personalityMode, financeNews });
  } catch (error) {
    console.error("OpenAI advisor fallback triggered:", error.message);
    return fallbackAdvisorReply({ question, dashboard, personalityMode, financeNews });
  }
}

export function fallbackAdvisorReply({ question, dashboard, personalityMode, financeNews = [] }) {
  const budget = dashboard.dailyBudget.safeLimit;
  const balance = dashboard.summary.balance;
  const topCategory = dashboard.patterns.topCategory;
  const investment = dashboard.investment;
  const tone =
    personalityMode === "strict"
      ? "Strict view:"
      : personalityMode === "silent"
        ? "Short answer:"
        : "Coach view:";

  if (/afford/i.test(question)) {
    return personalityMode === "silent"
      ? `${tone} Balance is Rs ${balance}. If the purchase is above Rs ${budget * 3}, wait unless it is essential.`
      : `${tone} Your current balance is Rs ${balance}. A comfortable daily spend is about Rs ${budget}. If this purchase is above 3 times your daily safe limit, ${personalityMode === "strict" ? "do not buy it unless it is necessary." : "I would pause unless it is essential."}`;
  }

  if (/wast|spend/i.test(question)) {
    return personalityMode === "silent"
      ? `${tone} Biggest leak: ${topCategory}. Cut one non-essential spend this week.`
      : `${tone} Your biggest leak right now is ${topCategory}. Weekend behavior is also elevated, so trimming one discretionary outing can improve your month-end balance quickly.${personalityMode === "strict" ? " Stop treating that category like a small issue." : ""}`;
  }

  if (/save/i.test(question)) {
    return personalityMode === "silent"
      ? `${tone} Move Rs 200 to savings daily, cap spending at Rs ${budget}, and trim ${topCategory}.`
      : `${tone} To save more this month, lock Rs 200 into a savings wallet every morning, cap flexible spending to Rs ${budget}, and cut one recurring non-essential expense from ${topCategory}.`;
  }

  if (/invest|sip|mutual fund|gold|fd|portfolio/i.test(question)) {
    return personalityMode === "silent"
      ? `${tone} Invest about Rs ${investment.monthlyInvestable} monthly. Start with Rs ${investment.emergencyAllocation} for emergency cover, then continue SIPs.`
      : `${tone} You can invest about Rs ${investment.monthlyInvestable} monthly. A beginner-friendly mix for you is ${investment.plan.join(", ")}. Start with an emergency allocation of Rs ${investment.emergencyAllocation} and then continue a steady SIP.`;
  }

  if (/news|market|finance update|stock/i.test(question)) {
    const topHeadlines = financeNews
      .slice(0, 3)
      .map((item, index) => `${index + 1}. ${item.title}`)
      .join(" ");

    return personalityMode === "silent"
      ? `${tone} ${topHeadlines || "No live finance headlines are available right now."}`
      : `${tone} Here are the latest finance headlines I found: ${topHeadlines || "No live headlines are available right now."}`;
  }

  return personalityMode === "silent"
    ? `${tone} Month-end balance may land near Rs ${dashboard.prediction.endOfMonthBalance}. Watch ${topCategory} and keep daily spend near Rs ${budget}.`
    : `${tone} You are trending toward a month-end balance of Rs ${dashboard.prediction.endOfMonthBalance}. Focus on your ${topCategory} spending, protect at least Rs ${budget} as your daily ceiling, and keep feeding your goal contributions consistently.`;
}
