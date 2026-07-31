import { useSyncExternalStore } from "react";
import { getWishlist, subscribeWishlist, toggleWish, isWished, removeWish } from "../utils/wishlistStore";

/** Live wishlist: re-renders whenever the wishlist changes anywhere. */
export default function useWishlist() {
  const items = useSyncExternalStore(subscribeWishlist, getWishlist, getWishlist);
  return { items, toggle: toggleWish, isWished, remove: removeWish };
}
