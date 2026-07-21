import React from "react";

/**
 * Seamless marquee. Renders two identical copies side by side and translates
 * the row by -50%, so the loop is continuous. Parent controls type size/colour
 * via `className`; `sep` is the glyph placed between items.
 */
export default function Marquee({
  items,
  className = "",
  reverse = false,
  speed = "default",
  sep = "◆",
  sepClassName = "text-glacier-400",
}) {
  const anim =
    reverse ? "animate-marquee-reverse" : speed === "slow" ? "animate-marquee-slow" : "animate-marquee";

  return (
    <div className={`marquee-mask overflow-hidden ${className}`}>
      <div className={`flex w-max ${anim}`}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {items.map((it, i) => (
              <span key={i} className="flex items-center">
                <span>{it}</span>
                <span className={`mx-6 sm:mx-10 ${sepClassName}`}>{sep}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
