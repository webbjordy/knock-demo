import Knock from "@knocklabs/node";

const knock = new Knock({ apiKey: process.env.KNOCK_SECRET_API_KEY });

await knock.users.setPreferences("user_jordy", "default", {
  workflows: {
    "new-comment": {
      channel_types: { email: true, in_app_feed: true },
    },
    "invoice-paid": {
      channel_types: { email: true, in_app_feed: false },
    },
    "trial-ending": {
      channel_types: { email: true, in_app_feed: true },
    },
  },
});

console.log("Seeded preferences for user_jordy");
