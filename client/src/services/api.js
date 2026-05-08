const DEFAULT_API_BASE_URL = "/api";
const CONNECTION_ERROR_CODE = "SMART_WALLET_API_CONNECTION_ERROR";
const CONNECTION_ERROR_MESSAGE = "Unable to connect to Smart Wallet API. Start the server and try again.";
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const defaultOriginApiBaseUrl = typeof window !== "undefined" && window.location.origin.startsWith("http")
  ? `${window.location.origin}/api`
  : DEFAULT_API_BASE_URL;

const API_BASE_URLS = Array.from(
  new Set(
    [configuredApiBaseUrl, defaultOriginApiBaseUrl, DEFAULT_API_BASE_URL]
      .filter(Boolean)
      .map(normalizeBaseUrl)
  )
);

let authToken = "";
let activeApiBaseUrl = API_BASE_URLS[0] || DEFAULT_API_BASE_URL;
let connectionProbePromise = null;

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function emitSessionExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("smart-wallet-session-expired"));
  }
}

export function setAuthToken(token) {
  authToken = token;
}

function createConnectionError() {
  const error = new Error(CONNECTION_ERROR_MESSAGE);
  error.code = CONNECTION_ERROR_CODE;
  return error;
}

export function isConnectionError(error) {
  return error?.code === CONNECTION_ERROR_CODE || error?.message === CONNECTION_ERROR_MESSAGE;
}

function looksLikeHtml(text) {
  return /^\s*<!doctype html/i.test(text) || /^\s*<html/i.test(text);
}

function looksLikeProxyFailure(text) {
  return /proxy error|econnrefused|failed to proxy|socket hang up|bad gateway|service unavailable/i.test(text);
}

function parseResponseBody(responseText, contentType) {
  if (!responseText) {
    return {};
  }

  const shouldParseJson =
    contentType.includes("application/json") ||
    contentType.includes("+json") ||
    /^[\[{]/.test(responseText);

  if (!shouldParseJson) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    return {};
  }
}

function extractPlainTextMessage(responseText) {
  if (!responseText || looksLikeHtml(responseText)) {
    return "";
  }

  const firstLine = responseText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return "";
  }

  return firstLine.length > 180 ? `${firstLine.slice(0, 177)}...` : firstLine;
}

async function fetchFromApi(baseUrl, path, options = {}) {
  const { includeAuthToken = true, ...fetchOptions } = options;
  let response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...fetchOptions,
      headers: {
        ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
        ...(includeAuthToken && authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...fetchOptions.headers
      }
    });
  } catch (error) {
    throw createConnectionError();
  }

  const contentType = response.headers.get("content-type") || "";
  const responseText = await response.text().catch(() => "");
  const data = parseResponseBody(responseText, contentType);
  const plainTextMessage = extractPlainTextMessage(responseText);
  const proxyFallbackMiss =
    baseUrl === DEFAULT_API_BASE_URL && (looksLikeHtml(responseText) || looksLikeProxyFailure(responseText));

  if (!response.ok) {
    if (proxyFallbackMiss || [502, 503, 504].includes(response.status)) {
      throw createConnectionError();
    }

    const message = data.message || plainTextMessage || response.statusText || "Request failed";

    if (response.status === 401 || (response.status === 404 && /user not found/i.test(message))) {
      emitSessionExpired();
    }

    throw new Error(message);
  }

  if (proxyFallbackMiss) {
    throw createConnectionError();
  }

  return data;
}

function wait(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function resolveApiBaseUrl({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    return activeApiBaseUrl;
  }

  if (!connectionProbePromise) {
    const candidates = [activeApiBaseUrl, ...API_BASE_URLS].filter(
      (value, index, collection) => value && collection.indexOf(value) === index
    );

    connectionProbePromise = (async () => {
      for (const baseUrl of candidates) {
        try {
          const health = await fetchFromApi(baseUrl, "/health", {
            method: "GET",
            includeAuthToken: false
          });

          if (health?.status !== "ok") {
            throw createConnectionError();
          }

          activeApiBaseUrl = baseUrl;
          return baseUrl;
        } catch (error) {
          if (!isConnectionError(error)) {
            throw error;
          }
        }
      }

      throw createConnectionError();
    })().finally(() => {
      connectionProbePromise = null;
    });
  }

  return connectionProbePromise;
}

export async function waitForConnection({ attempts = 3, delayMs = 1200 } = {}) {
  let lastError = createConnectionError();

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await resolveApiBaseUrl({ forceRefresh: true });
    } catch (error) {
      if (!isConnectionError(error)) {
        throw error;
      }

      lastError = error;

      if (attempt < attempts - 1) {
        await wait(delayMs);
      }
    }
  }

  throw lastError;
}

async function request(path, options = {}) {
  const { retryOnConnectionError = true, ...fetchOptions } = options;

  try {
    return await fetchFromApi(activeApiBaseUrl, path, fetchOptions);
  } catch (error) {
    if (!retryOnConnectionError || !isConnectionError(error)) {
      throw error;
    }

    const nextApiBaseUrl = await waitForConnection();
    return fetchFromApi(nextApiBaseUrl, path, fetchOptions);
  }
}

export const api = {
  checkHealth: () => waitForConnection({ attempts: 1 }),
  waitForConnection,
  bootstrapDemo: () => request("/demo/bootstrap", { method: "POST" }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  socialAuth: (payload) => request("/auth/social", { method: "POST", body: JSON.stringify(payload) }),
  getDashboard: () => request("/wallet/dashboard"),
  updatePreferences: (payload) =>
    request("/wallet/preferences", { method: "PATCH", body: JSON.stringify(payload) }),
  sendTestReport: () => request("/wallet/reports/test", { method: "POST" }),
  createTransaction: (payload) =>
    request("/transactions", { method: "POST", body: JSON.stringify(payload) }),
  parseSmartInput: (payload) =>
    request("/transactions/parse", { method: "POST", body: JSON.stringify(payload) }),
  askAdvisor: (payload) => request("/ai/chat", { method: "POST", body: JSON.stringify(payload) }),
  getFinanceNews: () => request("/ai/news"),
  canAfford: (payload) =>
    request("/ai/can-afford", { method: "POST", body: JSON.stringify(payload) }),
  getInsights: () => request("/insights")
};
