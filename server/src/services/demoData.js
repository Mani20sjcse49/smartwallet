export const sampleTransactions = [
  { amount: 350, category: "Food", type: "expense", merchant: "Cafe Brew", timestamp: daysAgo(1), source: "demo" },
  { amount: 1100, category: "Transport", type: "expense", merchant: "Fuel Station", timestamp: daysAgo(2), source: "demo" },
  { amount: 599, category: "Entertainment", type: "expense", merchant: "MoviePass", timestamp: daysAgo(3), source: "demo" },
  { amount: 2400, category: "Bills", type: "expense", merchant: "Electricity", timestamp: daysAgo(4), recurring: true, source: "demo" },
  { amount: 900, category: "Shopping", type: "expense", merchant: "Market Hub", timestamp: daysAgo(5), source: "demo" },
  { amount: 480, category: "Food", type: "expense", merchant: "Lunch Box", timestamp: daysAgo(6), source: "demo" },
  { amount: 85000, category: "Salary", type: "income", merchant: "Employer", timestamp: daysAgo(12), source: "demo" },
  { amount: 1500, category: "Health", type: "expense", merchant: "Pharmacy", timestamp: daysAgo(9), source: "demo" },
  { amount: 700, category: "Food", type: "expense", merchant: "Weekend Dinner", timestamp: daysAgo(8), source: "demo" },
  { amount: 3000, category: "Savings", type: "transfer", merchant: "Emergency Fund", timestamp: daysAgo(10), source: "demo" }
];

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}
