import React from "react";
import { BadgeCheck } from "lucide-react";

/**
 * Trust badge for admin-vetted listings (guides publicly listed have passed
 * account approval). `size="sm"` for cards, default for detail headers.
 */
const VerifiedBadge = ({ label = "Verified", size = "md", className = "" }) => {
  const sm = size === "sm";
  return (
    <span
      title="Vetted by Misty Mounts"
      className={`inline-flex items-center gap-1 rounded-full bg-lime-400/15 font-bold text-lime-400 ${
        sm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      } ${className}`}
    >
      <BadgeCheck className={sm ? "h-3 w-3" : "h-3.5 w-3.5"} /> {label}
    </span>
  );
};

export default VerifiedBadge;
