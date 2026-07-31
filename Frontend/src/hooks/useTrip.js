import { useSyncExternalStore } from "react";
import { getTrip, subscribeTrip, toggleTrip, isInTrip, removeFromTrip, setDay, clearTrip, setTrip } from "../utils/tripStore";

/** Live trip: re-renders whenever the trip changes anywhere. */
export default function useTrip() {
  const items = useSyncExternalStore(subscribeTrip, getTrip, getTrip);
  return { items, toggle: toggleTrip, isInTrip, remove: removeFromTrip, setDay, clear: clearTrip, setAll: setTrip };
}
