import knock from "./knockClient";

export default function PreferenceCenter({ prefs, onChange }) {
  function resetWorkflow(key) {
    const updated = structuredClone(prefs);
    delete updated.workflows[key];
    onChange(updated);
    knock.preferences.set(updated);
  }

  function setChannel(path, value) {
    const updated = structuredClone(prefs);
    if (!updated.channel_types) updated.channel_types = {};
    path.reduce((obj, key, i) => (i === path.length - 1 ? (obj[key] = value) : obj[key]), updated);
    onChange(updated);
    knock.preferences.set(updated);
  }

  const channels = ["email", "in_app_feed"];

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem 1rem" }}>
      <h2>Notification Preferences</h2>

      <h3>Global</h3>
      <table>
        <tbody>
          <tr>
            <td>All notifications</td>
            {channels.map((ch) => (
              <td key={ch}>
                <label>{ch === "email" ? "Email" : "In-app"}<br />
                  <input
                    type="checkbox"
                    checked={prefs.channel_types?.[ch] ?? true}
                    onChange={(e) => setChannel(["channel_types", ch], e.target.checked)}
                  />
                </label>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <h3>Workflows</h3>
      <table>
        <tbody>
          {Object.entries(prefs.workflows ?? {}).map(([key, wf]) => (
            <tr key={key}>
              <td>{key} <button onClick={() => resetWorkflow(key)}>reset</button></td>
              {channels.map((ch) => (
                <td key={ch}>
                  <input
                    type="checkbox"
                    checked={wf.channel_types?.[ch] ?? true}
                    onChange={(e) => setChannel(["workflows", key, "channel_types", ch], e.target.checked)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
