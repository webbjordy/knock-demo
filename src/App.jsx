import { useState, useEffect, useRef } from "react";
import PreferenceCenter from "./PreferenceCenter";
import NotificationFeedPanel from "./NotificationFeed";
import SlackKitPanel from "./SlackKitPanel";
import knock from "./knockClient";

function colorize(json) {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span style="color:#c084fc">${match}</span>`;
        return `<span style="color:#86efac">${match}</span>`;
      }
      if (/true|false/.test(match)) return `<span style="color:#60a5fa">${match}</span>`;
      if (/null/.test(match)) return `<span style="color:#f87171">${match}</span>`;
      return `<span style="color:#fbbf24">${match}</span>`;
    }
  );
}

function JsonPanel({ prefs, savedAt }) {
  const json = JSON.stringify(prefs, null, 2);
  return (
    <div style={{
      position: "sticky",
      top: 0,
      height: "100vh",
      overflowY: "auto",
      background: "#0f1117",
      borderRight: "1px solid #2e303a",
      padding: "1.5rem",
      boxSizing: "border-box",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          PreferenceSet (live)
        </span>
        {savedAt && (
          <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#4ade80" }}>
            saved {savedAt}
          </span>
        )}
      </div>
      <pre
        style={{
          margin: 0,
          fontFamily: "ui-monospace, Consolas, monospace",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#e5e7eb",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        dangerouslySetInnerHTML={{ __html: colorize(json) }}
      />
    </div>
  );
}

const TABS = ["Preferences", "Slack"];

export default function App() {
  const [tab, setTab] = useState("Preferences");
  const [prefs, setPrefs] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    knock.preferences.get().then(setPrefs);
  }, []);

  function handlePrefsChange(updated) {
    setPrefs(updated);
    const now = new Date().toLocaleTimeString();
    setSavedAt(now);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSavedAt(null), 3000);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left panel: JSON inspector (only on Preferences tab) */}
      <div style={{ width: "45%", flexShrink: 0 }}>
        {tab === "Preferences" && prefs ? <JsonPanel prefs={prefs} savedAt={savedAt} /> : null}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "4px",
                  border: "1px solid",
                  borderColor: tab === t ? "#6366f1" : "#d1d5db",
                  background: tab === t ? "#6366f1" : "transparent",
                  color: tab === t ? "#fff" : "#374151",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <NotificationFeedPanel />
        </div>

        {/* Tab content */}
        {tab === "Preferences" && (
          prefs
            ? <PreferenceCenter prefs={prefs} onChange={handlePrefsChange} />
            : <p style={{ padding: "2rem" }}>Loading...</p>
        )}
        {tab === "Slack" && <SlackKitPanel />}
      </div>
    </div>
  );
}
