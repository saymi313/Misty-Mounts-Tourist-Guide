import { useSyncExternalStore } from "react";
import { getPack, subscribePack } from "../utils/offlineStore";

// Live offline-pack snapshot — re-renders whenever a pack is built/removed.
export default function useOfflinePack() {
  return useSyncExternalStore(subscribePack, getPack, getPack);
}
