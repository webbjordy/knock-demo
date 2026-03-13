import Knock from "@knocklabs/client";

const knock = new Knock(import.meta.env.VITE_KNOCK_PUBLIC_API_KEY);
knock.authenticate(import.meta.env.VITE_KNOCK_USER_ID);

export default knock;
