import { useState } from "react";
import knock from "./knockClient";

const CATEGORIES = [
  { key: "social", label: "Social", description: "Follows, comments, mentions" },
  { key: "billing", label: "Billing", description: "Invoices, payments, plan changes" },
];

const OPERATORS = [
  "equal_to",
  "not_equal_to",
  "greater_than",
  "less_than",
  "greater_than_or_equal_to",
  "less_than_or_equal_to",
  "contains",
  "not_contains",
  "empty",
  "not_empty",
];

// Suggested variables — user can type anything; these just aid discovery
const VARIABLE_SUGGESTIONS = [
  "recipient.plan",
  "recipient.locale",
  "recipient.tier",
  "data.urgent",
  "data.environment",
  "vars.env",
];

const inputStyle = {
  fontFamily: "ui-monospace, monospace",
  fontSize: "0.8rem",
  padding: "2px 6px",
  border: "1px solid #d1d5db",
  borderRadius: "3px",
};

function ConditionsEditor({ conditions = [], onChange }) {
  const [draft, setDraft] = useState({ variable: "", operator: "equal_to", argument: "" });

  function addCondition() {
    if (!draft.variable.trim()) return;
    const entry = { variable: draft.variable.trim(), operator: draft.operator };
    if (!["empty", "not_empty"].includes(draft.operator)) {
      entry.argument = draft.argument;
    }
    onChange([...conditions, entry]);
    setDraft({ variable: "", operator: "equal_to", argument: "" });
  }

  function removeCondition(i) {
    onChange(conditions.filter((_, idx) => idx !== i));
  }

  const noArgNeeded = ["empty", "not_empty"].includes(draft.operator);

  return (
    <div style={{ padding: "0.5rem 0.75rem", background: "#f9fafb", borderTop: "1px dashed #e5e7eb" }}>
      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        conditions
      </div>

      {/* Existing conditions */}
      {conditions.length === 0 && (
        <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.5rem" }}>No conditions — workflow always runs.</div>
      )}
      {conditions.map((c, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem", fontSize: "0.8rem", fontFamily: "ui-monospace, monospace" }}>
          <span style={{ color: "#7c3aed" }}>{c.variable}</span>
          <span style={{ color: "#6b7280" }}>{c.operator}</span>
          {c.argument !== undefined && <span style={{ color: "#059669" }}>"{c.argument}"</span>}
          <button
            onClick={() => removeCondition(i)}
            style={{ marginLeft: "0.25rem", border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.85rem", lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      ))}

      {/* Add new condition */}
      <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", marginTop: "0.5rem", flexWrap: "wrap" }}>
        <input
          list="knock-variables"
          placeholder="variable"
          value={draft.variable}
          onChange={(e) => setDraft((d) => ({ ...d, variable: e.target.value }))}
          style={{ ...inputStyle, width: "160px" }}
        />
        <datalist id="knock-variables">
          {VARIABLE_SUGGESTIONS.map((v) => <option key={v} value={v} />)}
        </datalist>

        <select
          value={draft.operator}
          onChange={(e) => setDraft((d) => ({ ...d, operator: e.target.value }))}
          style={inputStyle}
        >
          {OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
        </select>

        {!noArgNeeded && (
          <input
            placeholder="argument"
            value={draft.argument}
            onChange={(e) => setDraft((d) => ({ ...d, argument: e.target.value }))}
            style={{ ...inputStyle, width: "120px" }}
          />
        )}

        <button
          onClick={addCondition}
          style={{ ...inputStyle, background: "#6366f1", color: "#fff", border: "none", cursor: "pointer" }}
        >
          + add
        </button>
      </div>
    </div>
  );
}

export default function PreferenceCenter({ prefs, onChange }) {
  const [expandedWorkflows, setExpandedWorkflows] = useState({});

  function toggleExpand(key) {
    setExpandedWorkflows((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function resetWorkflow(key) {
    const updated = structuredClone(prefs);
    delete updated.workflows[key];
    onChange(updated);
    knock.preferences.set(updated);
  }

  function setChannel(path, value) {
    const updated = structuredClone(prefs);
    path.slice(0, -1).reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, updated);
    path.reduce((obj, key, i) => (i === path.length - 1 ? (obj[key] = value) : obj[key]), updated);
    onChange(updated);
    knock.preferences.set(updated);
  }

  function setWorkflowConditions(workflowKey, conditions) {
    const updated = structuredClone(prefs);
    if (!updated.workflows) updated.workflows = {};
    if (!updated.workflows[workflowKey]) updated.workflows[workflowKey] = {};
    if (conditions.length === 0) {
      delete updated.workflows[workflowKey].conditions;
    } else {
      updated.workflows[workflowKey].conditions = conditions;
    }
    onChange(updated);
    knock.preferences.set(updated);
  }

  const channels = ["email", "in_app_feed"];

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem 1rem" }}>
      <h2>Notification Preferences</h2>

      {/* Global */}
      <h3>Global</h3>
      <table>
        <thead>
          <tr>
            <th />
            {channels.map((ch) => (
              <th key={ch} style={{ fontWeight: "normal", fontSize: "0.85em", paddingBottom: "0.25rem" }}>
                {ch === "email" ? "Email" : "In-app"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>All notifications</td>
            {channels.map((ch) => (
              <td key={ch} style={{ textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={prefs.channel_types?.[ch] ?? true}
                  onChange={(e) => setChannel(["channel_types", ch], e.target.checked)}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Categories */}
      <h3>Categories</h3>
      <table>
        <thead>
          <tr>
            <th />
            {channels.map((ch) => (
              <th key={ch} style={{ fontWeight: "normal", fontSize: "0.85em", paddingBottom: "0.25rem" }}>
                {ch === "email" ? "Email" : "In-app"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map(({ key, label, description }) => (
            <tr key={key}>
              <td>
                <span>{label}</span>
                <span style={{ fontSize: "0.8em", color: "#6b7280", marginLeft: "0.5rem" }}>
                  {description}
                </span>
              </td>
              {channels.map((ch) => (
                <td key={ch} style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={prefs.categories?.[key]?.channel_types?.[ch] ?? true}
                    onChange={(e) => setChannel(["categories", key, "channel_types", ch], e.target.checked)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Workflows */}
      <h3>Workflows</h3>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", fontWeight: "normal", fontSize: "0.85em", paddingBottom: "0.25rem" }} />
            {channels.map((ch) => (
              <th key={ch} style={{ fontWeight: "normal", fontSize: "0.85em", paddingBottom: "0.25rem" }}>
                {ch === "email" ? "Email" : "In-app"}
              </th>
            ))}
            <th style={{ fontWeight: "normal", fontSize: "0.85em", paddingBottom: "0.25rem" }}>Conditions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(prefs.workflows ?? {}).map(([key, wf]) => {
            const isExpanded = expandedWorkflows[key];
            const conditionCount = wf.conditions?.length ?? 0;
            return [
              <tr key={key} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ paddingTop: "0.4rem", paddingBottom: isExpanded ? "0.1rem" : "0.4rem" }}>
                  {key}{" "}
                  <button onClick={() => resetWorkflow(key)} style={{ fontSize: "0.75rem", marginLeft: "0.25rem" }}>
                    reset
                  </button>
                </td>
                {channels.map((ch) => (
                  <td key={ch} style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={wf.channel_types?.[ch] ?? true}
                      onChange={(e) => setChannel(["workflows", key, "channel_types", ch], e.target.checked)}
                    />
                  </td>
                ))}
                <td style={{ textAlign: "center" }}>
                  <button
                    onClick={() => toggleExpand(key)}
                    style={{
                      fontSize: "0.75rem",
                      padding: "2px 8px",
                      border: "1px solid",
                      borderColor: conditionCount > 0 ? "#6366f1" : "#d1d5db",
                      borderRadius: "3px",
                      background: conditionCount > 0 ? "#eef2ff" : "transparent",
                      color: conditionCount > 0 ? "#4338ca" : "#6b7280",
                      cursor: "pointer",
                    }}
                  >
                    {conditionCount > 0 ? `${conditionCount} rule${conditionCount > 1 ? "s" : ""}` : "none"} {isExpanded ? "▲" : "▼"}
                  </button>
                </td>
              </tr>,
              isExpanded && (
                <tr key={`${key}-conditions`}>
                  <td colSpan={channels.length + 2} style={{ padding: 0 }}>
                    <ConditionsEditor
                      conditions={wf.conditions ?? []}
                      onChange={(conditions) => setWorkflowConditions(key, conditions)}
                    />
                  </td>
                </tr>
              ),
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}
