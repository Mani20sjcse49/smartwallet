import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Newspaper, SendHorizonal, Sparkles, TrendingUp } from "lucide-react";
import { api, isConnectionError } from "../services/api.js";
import { formatCurrency } from "../utils/formatters.js";

const quickPrompts = [
  "What should I do with my salary this month?",
  "Give me today's finance news in simple words.",
  "Suggest an SIP plan for a beginner.",
  "How can I save more in daily life?",
  "Where is my money leaking right now?",
  "Can I afford a new laptop this month?"
];

function getPersonaLabel(mode) {
  if (mode === "strict") {
    return "Strict Advisor";
  }

  if (mode === "silent") {
    return "Minimal Silent";
  }

  return "Friendly Coach";
}

function buildWelcomeMessage(dashboard) {
  const currency = dashboard.user.preferences.currency || "INR";
  const personalityMode = dashboard.user.preferences.personalityMode;
  const intro =
    personalityMode === "strict"
      ? "Hi. I am your Strict Advisor AI. I will give direct financial guidance, call out weak habits clearly, and keep recommendations practical."
      : personalityMode === "silent"
        ? "Hi. I am your Minimal Silent advisor. I will keep answers short, useful, and focused on only the most important next step."
        : "Hi. I am your Friendly Coach AI. I will guide you with clear, supportive advice on spending, savings, investing, and finance news.";

  return {
    id: "welcome-message",
    role: "assistant",
    text: `${intro} Right now your safe daily budget is ${formatCurrency(dashboard.dailyBudget.safeLimit, currency)} and your biggest spend area is ${dashboard.patterns.topCategory}.`,
    meta: `${getPersonaLabel(personalityMode)} active`
  };
}

export function AssistantPanel({ dashboard, refresh }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(() => [buildWelcomeMessage(dashboard)]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [financeNews, setFinanceNews] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const chatBodyRef = useRef(null);
  const reconnectPromiseRef = useRef(null);
  const currency = dashboard.user.preferences.currency || "INR";

  useEffect(() => {
    setMessages([buildWelcomeMessage(dashboard)]);
  }, [
    dashboard.healthScore,
    dashboard.dailyBudget.safeLimit,
    dashboard.patterns.topCategory,
    dashboard.user.preferences.personalityMode,
    currency
  ]);

  useEffect(() => {
    reconnectAssistant({ includeNews: true, silent: true });
  }, []);

  useEffect(() => {
    if (connectionStatus !== "offline" || typeof window === "undefined") {
      return undefined;
    }

    const reconnectTimer = window.setInterval(() => {
      reconnectAssistant({ includeNews: true, silent: true });
    }, 4000);

    return () => window.clearInterval(reconnectTimer);
  }, [connectionStatus]);

  useEffect(() => {
    if (!chatBodyRef.current) {
      return;
    }

    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, loading]);

  async function reconnectAssistant({ includeNews = false, silent = false } = {}) {
    if (reconnectPromiseRef.current) {
      return reconnectPromiseRef.current;
    }

    const reconnectPromise = (async () => {
      if (!silent) {
        setConnectionStatus("connecting");
      }

      try {
        await api.waitForConnection({ attempts: silent ? 1 : 4, delayMs: 1200 });
        setConnectionStatus("online");
        setError("");

        if (includeNews) {
          await loadFinanceNews({ silent: true });
        }

        return true;
      } catch (nextError) {
        setConnectionStatus("offline");

        if (!silent) {
          setError(nextError.message);
        }

        return false;
      }
    })();

    reconnectPromiseRef.current = reconnectPromise;

    try {
      return await reconnectPromise;
    } finally {
      reconnectPromiseRef.current = null;
    }
  }

  async function loadFinanceNews({ silent = false } = {}) {
    try {
      const news = await api.getFinanceNews();
      setFinanceNews(news);
      setConnectionStatus("online");

      if (!silent) {
        setError("");
      }
    } catch (nextError) {
      setFinanceNews([]);

      if (isConnectionError(nextError)) {
        setConnectionStatus("offline");

        if (!silent) {
          setError(nextError.message);
        }
      }
    }
  }

  async function submitQuestion(nextQuestion) {
    const trimmedQuestion = nextQuestion.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    const isConnected =
      connectionStatus === "online"
        ? true
        : await reconnectAssistant({ includeNews: false });

    if (!isConnected) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmedQuestion
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await api.askAdvisor({
        question: trimmedQuestion,
        personalityMode: dashboard.user.preferences.personalityMode
      });
      setConnectionStatus("online");
      setError("");

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: response.answer,
          meta: "AI advisor reply"
        }
      ]);

      if (response.financeNews?.length) {
        setFinanceNews(response.financeNews);
      }

      refresh();
    } catch (nextError) {
      if (isConnectionError(nextError)) {
        setConnectionStatus("offline");
      }

      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAsk(event) {
    event.preventDefault();
    await submitQuestion(question);
  }

  const hasNewsFallback =
    financeNews.length === 1 && /unavailable/i.test(financeNews[0]?.title || "");
  const isConnecting = connectionStatus === "connecting";
  const statusEyebrow =
    connectionStatus === "online"
      ? "We are online"
      : connectionStatus === "connecting"
        ? "Connecting to API"
        : "Waiting for API";
  const statusMessage =
    connectionStatus === "online"
      ? "Responsive and user-friendly"
      : connectionStatus === "connecting"
        ? "Trying to reconnect automatically"
        : "The assistant will reconnect when the server is ready";

  return (
    <section className="assistant-experience">
      <div className="advisor-hero glass-panel">
        <div className="advisor-hero-copy">
          <p className="eyebrow">Finance Advisor AI</p>
          <h3>Chat for money answers, finance news, and daily investment guidance.</h3>
          <p className="muted">
            A simple money assistant for budgeting, market updates, savings, and beginner-friendly planning.
          </p>
        </div>

        <div className="advisor-hero-stats">
          <div className="advisor-stat-pill">
            <span>Safe today</span>
            <strong>{formatCurrency(dashboard.dailyBudget.safeLimit, currency)}</strong>
          </div>
          <div className="advisor-stat-pill">
            <span>Investable</span>
            <strong>{formatCurrency(dashboard.investment.monthlyInvestable, currency)}</strong>
          </div>
          <div className="advisor-stat-pill">
            <span>Health score</span>
            <strong>{dashboard.healthScore}/100</strong>
          </div>
        </div>
      </div>

      <div className="advisor-chat-layout">
        <section className="assistant-panel glass-panel">
          <div className="chat-shell">
            <div className="chat-header">
              <div className="chat-status">
                <div className="chat-avatar">
                  <Bot size={20} />
                </div>
                <div>
                  <p className="eyebrow">{statusEyebrow}</p>
                  <h3>Smart Finance Chat</h3>
                </div>
              </div>
              <span className="chat-presence">{statusMessage}</span>
            </div>

            <div className="chat-suggestion-row">
              {quickPrompts.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="suggestion-chip chat-prompt-chip"
                  onClick={() => submitQuestion(item)}
                  disabled={loading || isConnecting}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="chat-body" ref={chatBodyRef}>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={message.role === "user" ? "chat-message user" : "chat-message assistant"}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index === 0 ? 0.05 : 0 }}
                >
                  <div className="chat-bubble">
                    {message.meta ? <span className="chat-meta">{message.meta}</span> : null}
                    <p>{message.text}</p>
                  </div>
                </motion.div>
              ))}

              {loading ? (
                <motion.div
                  className="chat-message assistant"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="chat-bubble typing-bubble">
                    <span className="chat-meta">Analyzing your question</span>
                    <div className="typing-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </div>

            <form className="chat-composer" onSubmit={handleAsk}>
              <label className="chat-input-wrap" htmlFor="finance-chat-input">
                <textarea
                  id="finance-chat-input"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={2}
                  placeholder="Ask about budget, news, mutual funds, SIP, savings, or daily money tips..."
                />
                <button className="chat-send-button" type="submit" disabled={loading || isConnecting}>
                  <SendHorizonal size={18} />
                </button>
              </label>
            </form>

            {error ? (
              <div className="inline-feedback error-state">
                <strong>
                  {connectionStatus === "offline"
                    ? "Chat is reconnecting right now."
                    : "Chat is not connected right now."}
                </strong>
                <span>{error}</span>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => reconnectAssistant({ includeNews: true })}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Reconnect"}
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="advisor-side-stack">
          <div className="assistant-side-card soft-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Today Focus</p>
                <h3>Money action plan</h3>
              </div>
              <Sparkles size={18} />
            </div>

            <div className="advisor-focus-list">
              <div className="advisor-focus-item">
                <span>Top spend zone</span>
                <strong>{dashboard.patterns.topCategory}</strong>
              </div>
              <div className="advisor-focus-item">
                <span>Month-end balance</span>
                <strong>{formatCurrency(dashboard.prediction.endOfMonthBalance, currency)}</strong>
              </div>
              <div className="advisor-focus-item">
                <span>Daily limit</span>
                <strong>{formatCurrency(dashboard.dailyBudget.safeLimit, currency)}</strong>
              </div>
            </div>
          </div>

          <div className="assistant-side-card soft-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Investment</p>
                <h3>Starter plan</h3>
              </div>
              <TrendingUp size={18} />
            </div>

            <div className="mini-card advisor-side-metric">
              <div>
                <strong>{formatCurrency(dashboard.investment.monthlyInvestable, currency)}</strong>
                <span>{dashboard.investment.summary}</span>
              </div>
            </div>

            <div className="advisor-plan-list">
              {dashboard.investment.plan.map((item) => (
                <span key={item} className="persona-chip">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="assistant-side-card news-panel soft-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Finance News</p>
                <h3>Latest headlines</h3>
              </div>
              <button className="secondary-button" type="button" onClick={() => loadFinanceNews()} disabled={isConnecting}>
                <Newspaper size={16} />
                Refresh
              </button>
            </div>

            <div className="news-list">
              {financeNews.slice(0, 4).map((item) => (
                <a
                  key={`${item.title}-${item.pubDate}`}
                  className="news-item"
                  href={item.link || "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <strong>{item.title}</strong>
                  <span>
                    {item.source} {" | "} {item.pubDate ? new Date(item.pubDate).toLocaleDateString("en-IN") : "Today"}
                  </span>
                </a>
              ))}

              {!financeNews.length ? (
                <div className="news-item">
                  <strong>News will appear here</strong>
                  <span>Refresh to load the latest market and finance headlines.</span>
                </div>
              ) : null}

              {hasNewsFallback ? (
                <div className="inline-feedback">
                  <strong>Live news source is temporarily unavailable.</strong>
                  <span>The app is still working. Try refresh again in a moment.</span>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
