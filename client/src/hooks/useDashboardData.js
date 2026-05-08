import { useEffect, useState } from "react";
import { api, isConnectionError } from "../services/api.js";

const CACHE_KEY = "smart-wallet-dashboard-cache";

export function useDashboardData() {
  const [dashboard, setDashboard] = useState(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!dashboard);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!error || !isConnectionError({ message: error }) || typeof window === "undefined") {
      return undefined;
    }

    const retryTimer = window.setTimeout(() => {
      refresh({ silent: Boolean(dashboard) });
    }, 2500);

    return () => window.clearTimeout(retryTimer);
  }, [dashboard, error]);

  async function refresh(options = {}) {
    if (!options.silent) {
      setLoading(true);
    }

    setError("");

    try {
      const nextDashboard = await api.getDashboard();
      setDashboard(nextDashboard);
      setLastUpdated(new Date().toISOString());
      localStorage.setItem(CACHE_KEY, JSON.stringify(nextDashboard));
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      if (!options.silent) {
        setLoading(false);
      }
    }
  }

  async function addTransaction(payload) {
    const created = await api.createTransaction(payload);
    await refresh();
    return created;
  }

  async function updatePreferences(payload) {
    const response = await api.updatePreferences(payload);
    await refresh();
    return response;
  }

  return {
    dashboard,
    loading,
    error,
    lastUpdated,
    refresh,
    addTransaction,
    updatePreferences,
    setDashboard
  };
}
