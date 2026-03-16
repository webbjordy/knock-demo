import { useState } from "react";
import {
  KnockProvider,
  KnockSlackProvider,
  SlackAuthButton,
  SlackChannelCombobox,
  useKnockSlackClient,
} from "@knocklabs/react";

const apiKey = import.meta.env.VITE_KNOCK_PUBLIC_API_KEY;
const userId = import.meta.env.VITE_KNOCK_USER_ID;
const slackChannelId = import.meta.env.VITE_KNOCK_SLACK_CHANNEL_ID;
const tenantId = import.meta.env.VITE_KNOCK_TENANT_ID;
const slackClientId = import.meta.env.VITE_SLACK_CLIENT_ID;
const userToken = import.meta.env.VITE_KNOCK_USER_TOKEN;

// Reads the current Slack connection status from context — only works inside
// KnockSlackProvider, so it lives here as a separate component.
function ConnectionStatus() {
  const { connectionStatus } = useKnockSlackClient();
  const color = {
    connected: "#4ade80",
    disconnected: "#f87171",
    loading: "#fbbf24",
    error: "#f87171",
  }[connectionStatus] ?? "#6b7280";

  return (
    <span style={{ fontFamily: "monospace", fontSize: "12px", color }}>
      status: {connectionStatus ?? "—"}
    </span>
  );
}

// Shows what channel_data looks like on a tenant after connection.
// This is read-only context — not a live fetch, just the shape to know about.
function ChannelDataShape() {
  const shape = {
    channel_data: {
      connections: [
        { access_token: "<bot_token>", channel_id: "C0XXXXXXX", channel_name: "#general" },
      ],
    },
  };
  return (
    <pre style={{
      background: "#0f1117",
      color: "#86efac",
      fontFamily: "ui-monospace, Consolas, monospace",
      fontSize: "12px",
      lineHeight: "1.6",
      padding: "1rem",
      borderRadius: "6px",
      whiteSpace: "pre-wrap",
      margin: 0,
    }}>
      {JSON.stringify(shape, null, 2)}
    </pre>
  );
}

function Note({ children }) {
  return (
    <p style={{
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "4px",
      padding: "0.5rem 0.75rem",
      fontSize: "0.8rem",
      color: "#94a3b8",
      margin: "0.5rem 0",
    }}>
      {children}
    </p>
  );
}

function MissingVarBanner({ vars }) {
  const missing = vars.filter(([, val]) => !val);
  if (!missing.length) return null;
  return (
    <div style={{
      background: "#7c2d12",
      border: "1px solid #dc2626",
      borderRadius: "6px",
      padding: "0.75rem 1rem",
      marginBottom: "1.5rem",
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#fca5a5",
    }}>
      Missing env vars — components below will error:<br />
      {missing.map(([name]) => <span key={name} style={{ display: "block", paddingLeft: "1rem" }}>• {name}</span>)}
    </div>
  );
}

export default function SlackKitPanel() {
  const [selectedChannels, setSelectedChannels] = useState([]);

  const envVars = [
    ["VITE_KNOCK_SLACK_CHANNEL_ID", slackChannelId],
    ["VITE_KNOCK_TENANT_ID", tenantId],
    ["VITE_SLACK_CLIENT_ID", slackClientId],
  ];

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem 1rem", maxWidth: "640px" }}>
      <h2 style={{ marginTop: 0 }}>SlackKit Explorer</h2>

      <MissingVarBanner vars={envVars} />

      {/* ── Provider nesting ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h3>Provider nesting</h3>
        <Note>
          SlackKit components need two providers. KnockProvider supplies the
          authenticated client. KnockSlackProvider adds Slack-specific context:
          which Knock Slack channel to operate on, and which tenant owns the
          workspace connection. Both are required.
        </Note>
        <pre style={{
          background: "#0f1117",
          color: "#c084fc",
          fontFamily: "ui-monospace, Consolas, monospace",
          fontSize: "12px",
          padding: "1rem",
          borderRadius: "6px",
          lineHeight: "1.6",
          margin: 0,
        }}>
{`<KnockProvider apiKey={...} userId={...} userToken={signedJwt}>
  <KnockSlackProvider
    knockSlackChannelId={slackChannelId}   // Knock channel UUID
    tenantId={tenantId}                    // your tenant slug
  >
    <SlackAuthButton ... />
    <SlackChannelCombobox ... />
  </KnockSlackProvider>
</KnockProvider>`}
        </pre>
        <Note>
          <strong>userToken vs authenticate()</strong> — the rest of this app
          calls knock.authenticate(userId) with no signed JWT. That works for
          preferences and feed. SlackKit is different: SlackAuthButton writes
          channel_data to a Tenant resource. Knock's API requires a signed user
          token that includes a resource grant for that tenant. Without it you
          get a silent 401. You mint this token server-side with the Knock Node
          SDK: Knock.signUserToken(userId, &#123; grants: [...] &#125;).
        </Note>
      </section>

      {/* ── Live components ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h3>Live components</h3>
        <Note>
          These mount the real @knocklabs/react components. If env vars are
          missing, they'll throw. If env vars are present but userToken is
          unsigned, auth will fail and connection status will stay "disconnected".
        </Note>

        {slackChannelId && tenantId && slackClientId ? (
          <KnockProvider apiKey={apiKey} userId={userId} userToken={userToken}>
            <KnockSlackProvider
              knockSlackChannelId={slackChannelId}
              tenantId={tenantId}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                <div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                    Connection status (from useSlackConnectionStatus hook):
                  </div>
                  <ConnectionStatus />
                </div>

                <div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                    {"<SlackAuthButton /> — kicks off the OAuth redirect:"}
                  </div>
                  <SlackAuthButton
                    slackClientId={slackClientId}
                    redirectUrl={window.location.href}
                  />
                </div>

                <div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                    {"<SlackChannelCombobox /> — fuzzy channel picker:"}
                  </div>
                  <SlackChannelCombobox
                    slackChannelsRecipientObject={{
                      objectId: tenantId,
                      collection: "$tenants",
                    }}
                    selectedChannels={selectedChannels}
                    onChannelSelectionChange={setSelectedChannels}
                  />
                </div>

                <div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                    Selected channels (what you'd pass to a workflow trigger via tenant):
                  </div>
                  <pre style={{
                    background: "#0f1117",
                    color: "#86efac",
                    fontFamily: "ui-monospace, Consolas, monospace",
                    fontSize: "12px",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    margin: 0,
                  }}>
                    {JSON.stringify(selectedChannels, null, 2) || "[]"}
                  </pre>
                </div>

              </div>
            </KnockSlackProvider>
          </KnockProvider>
        ) : (
          <div style={{ color: "#6b7280", fontSize: "0.85rem", padding: "1rem 0" }}>
            Fill in the three env vars above to mount the live components.
          </div>
        )}
      </section>

      {/* ── What gets stored ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h3>What gets stored after connection</h3>
        <Note>
          After a user completes OAuth, Knock stores the access token as
          channel_data on the Tenant (Pattern 1 — workspace-to-tenant). This is
          what you'd see if you called the Knock API to inspect the tenant's
          channel data for your Slack channel.
        </Note>
        <ChannelDataShape />
      </section>

      {/* ── Triggering ── */}
      <section>
        <h3>Triggering a Slack notification</h3>
        <Note>
          Once connected, triggering is a normal workflow trigger. The tenant
          context tells Knock which workspace token to use. No Slack API calls
          in your app code.
        </Note>
        <pre style={{
          background: "#0f1117",
          color: "#c084fc",
          fontFamily: "ui-monospace, Consolas, monospace",
          fontSize: "12px",
          padding: "1rem",
          borderRadius: "6px",
          lineHeight: "1.6",
          margin: 0,
        }}>
{`await knock.workflows.trigger("new-comment", {
  recipients: ["user_jordy"],
  tenant: "acme-corp",   // ← tells Knock which workspace token to pull
  data: { comment: "..." },
});`}
        </pre>
      </section>
    </div>
  );
}
