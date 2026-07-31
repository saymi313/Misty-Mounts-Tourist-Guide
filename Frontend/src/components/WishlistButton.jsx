import React from "react";
import { Heart } from "lucide-react";
import useWishlist from "../hooks/useWishlist";

/**
 * Heart toggle for any content item. Drop onto a card (overlay) or a detail
 * page. `item` = { type, id, title, image, city, price, href }.
 */
export default function WishlistButton({ item, className = "", floating = false }) {
  const { toggle, isWished } = useWishlist();
  const wished = isWished(item.type, item.id);

  const base = floating
    ? "flex h-9 w-9 items-center justify-center rounded-full bg-night-950/50 backdrop-blur transition-colors hover:bg-night-950/70"
    : "flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-rose-400/60";

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(item); }}
      aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
      title={wished ? "Saved" : "Save"}
      className={`${base} ${className}`}
    >
      <Heart className={`h-[18px] w-[18px] transition-colors ${wished ? "fill-rose-500 text-rose-500" : "text-white"}`} />
    </button>
  );
}
