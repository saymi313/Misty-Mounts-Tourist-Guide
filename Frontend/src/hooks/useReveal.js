import { useEffect, useRef } from "react";

/**
 * Scroll-reveal hook. Attach the returned ref to any element that has the
 * `reveal` utility class; it adds `is-visible` when the element scrolls into
 * view, driving the CSS transition. Reveals once, then stops observing.
 *
 * @param {Object} [opts]
 * @param {number} [opts.threshold=0.15]
 * @param {string} [opts.rootMargin="0px 0px -10% 0px"]
 */
export default function useReveal({ threshold = 0.15, rootMargin = "0px 0px -10% 0px" } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Reduced-motion / no-IO fallback: show immediately.
    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
