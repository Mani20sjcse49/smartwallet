import { useRef, useState } from "react";
import Tesseract from "tesseract.js";
import { Mic, MicOff, ReceiptText, Upload, WandSparkles } from "lucide-react";
import { api } from "../services/api.js";

export function TransactionComposer({ wallets, addTransaction }) {
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("Spent 150 on food");
  const [entryMode, setEntryMode] = useState("manual");
  const [voiceText, setVoiceText] = useState("Spent 150 on food");
  const [form, setForm] = useState({
    amount: 0,
    category: "Food",
    type: "expense",
    walletName: wallets[0]?.name || "Main Bank",
    merchant: "",
    notes: "",
    source: "manual"
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const recognitionSupported =
    typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  async function handleSmartParse(sourceText = voiceText, source = "voice") {
    setError("");
    const parsed = await api.parseSmartInput({ text: sourceText });
    setForm((current) => ({
      ...current,
      ...parsed,
      walletName: wallets[0]?.name || current.walletName,
      source
    }));
    setFeedback(source === "ocr" ? "Receipt text scanned into a smart entry." : "Voice input converted into a smart entry.");
    setEntryMode("manual");
  }

  function toggleRecording() {
    if (!recognitionSupported) {
      setError("Voice recording is not supported in this browser.");
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setFeedback("Listening for your transaction...");
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");

      transcriptRef.current = transcript;
      setVoiceText(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
      setError("Voice capture failed. Please try again.");
    };

    recognition.onend = async () => {
      setListening(false);
      if (transcriptRef.current.trim()) {
        await handleSmartParse(transcriptRef.current, "voice");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  async function handleReceiptScan(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setError("");
    setFeedback("");

    try {
      const result = await Tesseract.recognize(file, "eng");
      const extractedText = result.data.text.replace(/\s+/g, " ").trim();
      setVoiceText(extractedText);
      await handleSmartParse(extractedText, "ocr");
    } catch (nextError) {
      setError("Receipt scan failed. Try a clearer image.");
    } finally {
      setOcrLoading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFeedback("");

    if (!Number(form.amount) || Number(form.amount) <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      await addTransaction({
        ...form,
        amount: Number(form.amount)
      });
      setForm((current) => ({
        ...current,
        amount: 0,
        merchant: "",
        notes: "",
        source: "manual"
      }));
      setFeedback("Transaction added and wallet totals updated.");
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="composer-card glass-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Smart Input</p>
          <h3>Add a transaction</h3>
        </div>
      </div>

      <div className="entry-mode-row">
        <button type="button" className={entryMode === "manual" ? "active" : ""} onClick={() => setEntryMode("manual")}>
          <WandSparkles size={16} />
          Manual
        </button>
        <button type="button" className={entryMode === "voice" ? "active" : ""} onClick={() => setEntryMode("voice")}>
          <Mic size={16} />
          Voice
        </button>
        <button type="button" className={entryMode === "ocr" ? "active" : ""} onClick={() => setEntryMode("ocr")}>
          <ReceiptText size={16} />
          OCR
        </button>
      </div>

      {entryMode === "voice" ? (
        <div className="voice-box soft-panel">
          <textarea value={voiceText} onChange={(event) => setVoiceText(event.target.value)} rows={3} />
          <div className="action-row">
            <button className="secondary-button" type="button" onClick={toggleRecording}>
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
              {listening ? "Stop Recording" : "Record Voice"}
            </button>
            <button className="secondary-button" type="button" onClick={() => handleSmartParse(voiceText, "voice")}>
              Convert to smart entry
            </button>
          </div>
        </div>
      ) : null}

      {entryMode === "ocr" ? (
        <div className="voice-box soft-panel">
          <label className="upload-box">
            <Upload size={18} />
            <span>{ocrLoading ? "Scanning receipt..." : "Upload a receipt image"}</span>
            <input type="file" accept="image/*" onChange={handleReceiptScan} hidden />
          </label>
          <p className="muted">Best results come from clear receipts with visible amount and store name.</p>
        </div>
      ) : null}

      <form className="transaction-form" onSubmit={handleSubmit}>
        <label>
          Amount
          <input
            type="number"
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
          />
        </label>
        <label>
          Category
          <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
        </label>
        <label>
          Type
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </select>
        </label>
        <label>
          Wallet
          <select
            value={form.walletName}
            onChange={(event) => setForm({ ...form, walletName: event.target.value })}
          >
            {wallets.map((wallet) => (
              <option key={wallet.name} value={wallet.name}>
                {wallet.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Merchant
          <input value={form.merchant} onChange={(event) => setForm({ ...form, merchant: event.target.value })} />
        </label>
        <label>
          Notes
          <input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </label>

        {error ? <p className="error-text form-span">{error}</p> : null}
        {feedback ? <p className="success-text form-span">{feedback}</p> : null}

        <button className="primary-button form-span" type="submit" disabled={submitting}>
          {submitting ? "Syncing..." : "Add Transaction"}
        </button>
      </form>
    </section>
  );
}
