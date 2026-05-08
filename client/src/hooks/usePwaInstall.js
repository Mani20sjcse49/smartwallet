import { useEffect, useMemo, useState } from "react";

function detectInstalledState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function detectPlatform() {
  if (typeof window === "undefined") {
    return "desktop";
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "ios";
  }

  if (userAgent.includes("android")) {
    return "android";
  }

  return "desktop";
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(detectInstalledState);
  const [platform, setPlatform] = useState(detectPlatform);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia?.("(display-mode: standalone)");

    function syncInstalledState() {
      setIsInstalled(detectInstalledState());
      setPlatform(detectPlatform());
    }

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }

    function handleInstalled() {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }

    syncInstalledState();

    mediaQuery?.addEventListener("change", syncInstalledState);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      mediaQuery?.removeEventListener("change", syncInstalledState);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) {
      return { outcome: "unavailable" };
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return choice;
  }

  const instructions = useMemo(() => {
    if (platform === "ios") {
      return {
        title: "Install from Safari",
        description: "Safari on iPhone and iPad does not show the Chrome-style install popup.",
        steps: [
          "Open Smart Wallet in Safari.",
          "Tap the Share button in the browser toolbar.",
          "Choose Add to Home Screen and confirm."
        ]
      };
    }

    if (platform === "android") {
      return {
        title: "Install from Chrome or Edge",
        description: "If the install popup does not appear yet, the browser menu can still offer installation.",
        steps: [
          "Open Smart Wallet in Chrome or Edge.",
          "Tap the browser menu in the top corner.",
          "Choose Install app or Add to Home screen."
        ]
      };
    }

    return {
      title: "Install from your browser",
      description: "Desktop browsers usually show the install button in the address bar or browser menu.",
      steps: [
        "Open Smart Wallet in Chrome or Edge.",
        "Use the install icon in the address bar, or open the browser menu.",
        "Choose Install Smart Wallet and confirm."
      ]
    };
  }, [platform]);

  return {
    isInstalled,
    isInstallable: Boolean(deferredPrompt),
    promptInstall,
    instructions
  };
}
