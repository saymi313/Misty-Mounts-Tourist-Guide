import React, { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { getPushState, enablePush, disablePush } from "../utils/push";
import { toast } from "../utils/toast";

/**
 * "Enable push notifications" toggle. Requires the service worker, which is only
 * registered in production builds — in dev it will report unsupported/unavailable.
 */
const PushToggle = ({ className = "" }) => {
  const [state, setState] = useState({ supported: true, subscribed: false });
  const [busy, setBusy] = useState(false);

  const refresh = () => getPushState().then(setState).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const onClick = async () => {
    setBusy(true);
    try {
      if (state.subscribed) {
        await disablePush();
        toast.info("Push notifications turned off");
      } else {
        await enablePush();
        toast.success("Push notifications enabled 🔔");
      }
      await refresh();
    } catch (e) {
      const msg = {
        unsupported: "This browser doesn't support push notifications.",
        "not-configured": "Push isn't configured on the server yet.",
        denied: "Notifications are blocked — enable them in your browser settings.",
      }[e.message] || "Couldn't update push notifications.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  if (!state.supported) return null;

  const on = state.subscribed;
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors disabled:opacity-60 ${
        on ? "bg-lime-400 text-night-950 hover:bg-lime-300" : "border border-white/12 bg-night-800 text-white/80 hover:border-lime-400/50"
      } ${className}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : on ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      {on ? "Push on" : "Enable push"}
    </button>
  );
};

export default PushToggle;
