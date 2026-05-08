import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Download, Smartphone, X } from "lucide-react";

export function PwaInstallPrompt({ open, onClose, onInstall, isInstallable, isInstalled, instructions }) {
  const [installing, setInstalling] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!open) {
      setInstalling(false);
      setFeedback("");
    }
  }, [open]);

  async function handleInstallClick() {
    if (!onInstall) {
      return;
    }

    setInstalling(true);
    setFeedback("");

    try {
      const result = await onInstall();

      if (result?.outcome === "accepted") {
        setFeedback("Install dialog opened. Finish the install in the browser prompt.");
      } else if (result?.outcome === "dismissed") {
        setFeedback("Install was dismissed. You can reopen it anytime.");
      } else {
        setFeedback("This browser has not exposed the install prompt yet.");
      }
    } finally {
      setInstalling(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="app-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose?.()}
        >
          <motion.section
            className="install-modal glass-panel"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="install-modal-head">
              <div>
                <p className="eyebrow">PWA Install</p>
                <h3>{isInstalled ? "Smart Wallet is already installed" : "Install Smart Wallet on this device"}</h3>
              </div>
              <button className="icon-button install-close" type="button" onClick={() => onClose?.()} aria-label="Close install popup">
                <X size={18} />
              </button>
            </div>

            <div className={isInstalled ? "install-status install-status-success" : "install-status"}>
              {isInstalled ? <CheckCircle2 size={20} /> : <Smartphone size={20} />}
              <div>
                <strong>{isInstalled ? "Installed and ready to launch" : instructions.title}</strong>
                <span className="muted">
                  {isInstalled
                    ? "You can open Smart Wallet from your home screen, app drawer, or desktop launcher."
                    : isInstallable
                      ? "Your browser is ready. Use the install button below to open the native install dialog."
                      : instructions.description}
                </span>
              </div>
            </div>

            {!isInstalled ? (
              <div className="install-steps">
                {instructions.steps.map((step, index) => (
                  <article key={step} className="install-step soft-panel">
                    <span>{index + 1}</span>
                    <p>{step}</p>
                  </article>
                ))}
              </div>
            ) : null}

            {feedback ? <p className="install-feedback">{feedback}</p> : null}

            <div className="install-actions">
              <button className="secondary-button" type="button" onClick={() => onClose?.()}>
                {isInstalled ? "Close" : "Maybe Later"}
              </button>
              {!isInstalled ? (
                <button className="primary-button" type="button" onClick={handleInstallClick} disabled={!isInstallable || installing}>
                  <Download size={16} />
                  {installing ? "Opening..." : isInstallable ? "Install App" : "Install Prompt Unavailable"}
                </button>
              ) : null}
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
