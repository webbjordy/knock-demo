import { KnockProvider, KnockFeedProvider, NotificationFeed, NotificationIconButton } from "@knocklabs/react";
import "@knocklabs/react/dist/index.css";
import { useState } from "react";

const apiKey = import.meta.env.VITE_KNOCK_PUBLIC_API_KEY;
const userId = import.meta.env.VITE_KNOCK_USER_ID;
const feedChannelId = import.meta.env.VITE_KNOCK_FEED_CHANNEL_ID;

export default function NotificationFeedPanel() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <KnockProvider apiKey={apiKey} userId={userId}>
      <KnockFeedProvider feedId={feedChannelId}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <NotificationIconButton
            onClick={() => setIsVisible((prev) => !prev)}
          />
          {isVisible && (
            <div style={{ position: "absolute", top: "100%", right: 0, zIndex: 100 }}>
              <NotificationFeed onNotificationClick={() => setIsVisible(false)} />
            </div>
          )}
        </div>
      </KnockFeedProvider>
    </KnockProvider>
  );
}
