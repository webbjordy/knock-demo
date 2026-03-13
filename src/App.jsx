import PreferenceCenter from "./PreferenceCenter";
import NotificationFeedPanel from "./NotificationFeed";

export default function App() {
  return (
    <div>
      <div style={{ padding: "1rem", display: "flex", justifyContent: "flex-end" }}>
        <NotificationFeedPanel />
      </div>
      <PreferenceCenter />
    </div>
  );
}
