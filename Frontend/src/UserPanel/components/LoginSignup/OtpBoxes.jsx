import React, { useRef, useEffect } from "react";

const LEN = 6;

/** Controlled 6-digit code input (auto-advance, paste, backspace nav). */
const OtpBoxes = ({ value = "", onChange, autoFocus = true }) => {
  const refs = useRef([]);
  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const digits = Array.from({ length: LEN }, (_, i) => value[i] || "");

  const setAt = (i, v) => {
    const clean = v.replace(/\D/g, "");
    const next = digits.slice();
    if (!clean) {
      next[i] = "";
      onChange(next.join(""));
      return;
    }
    clean.split("").slice(0, LEN - i).forEach((ch, k) => { next[i + k] = ch; });
    onChange(next.join(""));
    refs.current[Math.min(i + clean.length, LEN - 1)]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e) => {
    const t = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, LEN);
    if (!t) return;
    e.preventDefault();
    onChange(t);
    refs.current[Math.min(t.length, LEN - 1)]?.focus();
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3" onPaste={onPaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          onChange={(e) => setAt(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          inputMode="numeric"
          maxLength={LEN}
          aria-label={`Digit ${i + 1}`}
          className="h-14 w-full rounded-2xl border border-white/12 bg-night-900 text-center text-2xl font-bold text-white outline-none transition-colors focus:border-lime-400/60 focus:ring-2 focus:ring-lime-400/15 sm:h-16"
        />
      ))}
    </div>
  );
};

export default OtpBoxes;
