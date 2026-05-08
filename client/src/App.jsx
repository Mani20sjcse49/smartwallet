import { useEffect, useRef, useState } from "react";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { AuthPanel } from "./components/AuthPanel.jsx";
import { PwaInstallPrompt } from "./components/PwaInstallPrompt.jsx";
import { usePwaInstall } from "./hooks/usePwaInstall.js";
import { useTheme } from "./hooks/useTheme.js";
import { api, setAuthToken } from "./services/api.js";

function getStoredJson(key) {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch (error) {
    return null;
  }
}

const initialSession = getStoredJson("smart-wallet-session");

setAuthToken(initialSession?.token || "");

function App() {
  const [session, setSession] = useState(initialSession);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [installPopupOpen, setInstallPopupOpen] = useState(false);
  const installPopupShownRef = useRef(false);
  const { theme, setTheme } = useTheme();
  const { isInstalled, isInstallable, promptInstall, instructions } = usePwaInstall();

  useEffect(() => {
    setAuthToken(session?.token || "");
  }, [session]);

  useEffect(() => {
    if (session) {
      localStorage.setItem("smart-wallet-session", JSON.stringify(session));
      localStorage.setItem(
        "smart-wallet-last-user",
        JSON.stringify({
          name: session.user?.name || "",
          email: session.user?.email || ""
        })
      );
    } else {
      localStorage.removeItem("smart-wallet-session");
    }
  }, [session]);

  useEffect(() => {
    function handleExpiredSession() {
      setAuthToken("");
      setSession(null);
    }

    window.addEventListener("smart-wallet-session-expired", handleExpiredSession);
    return () => window.removeEventListener("smart-wallet-session-expired", handleExpiredSession);
  }, []);

  useEffect(() => {
    if (isInstalled) {
      setInstallPopupOpen(false);
      return;
    }

    if (isInstallable && !installPopupShownRef.current) {
      installPopupShownRef.current = true;
      setInstallPopupOpen(true);
    }
  }, [isInstallable, isInstalled]);

  const rememberedUser = (() => {
    return getStoredJson("smart-wallet-last-user");
  })();

  async function handleDemoStart() {
    setBootstrapping(true);
    try {
      const auth = await api.bootstrapDemo();
      if (auth?.token) {
        setAuthToken(auth.token);
        setSession(auth);
        return;
      }

      const loginAuth = await api.login({
        email: "demo@smartwallet.ai",
        password: "demo1234"
      });
      setAuthToken(loginAuth.token);
      setSession(loginAuth);
    } finally {
      setBootstrapping(false);
    }
  }

  if (!session) {
    return (
      <>
        <AuthPanel
          onAuthenticated={setSession}
          onDemoStart={handleDemoStart}
          bootstrapping={bootstrapping}
          rememberedUser={rememberedUser}
        />
        <PwaInstallPrompt
          open={installPopupOpen}
          onClose={() => setInstallPopupOpen(false)}
          onInstall={promptInstall}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
          instructions={instructions}
        />
      </>
    );
  }

  return (
    <>
      <DashboardPage
        session={session}
        onLogout={() => setSession(null)}
        theme={theme}
        onThemeChange={setTheme}
        onOpenInstallPrompt={() => setInstallPopupOpen(true)}
        canInstall={isInstallable}
        isInstalled={isInstalled}
      />
      <PwaInstallPrompt
        open={installPopupOpen}
        onClose={() => setInstallPopupOpen(false)}
        onInstall={promptInstall}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        instructions={instructions}
      />
    </>
  );
}

export default App;
