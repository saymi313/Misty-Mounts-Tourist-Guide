import { useSyncExternalStore } from "react";

// Live online/offline state — re-renders when connectivity changes.
const subscribe = (cb) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); };
};

export default function useOnline() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}
