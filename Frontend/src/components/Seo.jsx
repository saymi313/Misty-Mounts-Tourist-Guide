import { useEffect } from "react";

/**
 * Dependency-free SEO head manager for the SPA. Sets <title>, meta description,
 * Open Graph / Twitter tags, canonical URL, and an optional JSON-LD structured
 * data block (schema.org) — so pages are share-friendly and discoverable by
 * crawlers that execute JS (Google). Each page overwrites the previous one's tags.
 */

const SITE = "Misty Mounts";
const DEFAULT_DESC =
  "Discover Northern Pakistan — vetted local guides, stays and group tours with safe escrow booking.";

const setMeta = (attr, key, content) => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const Seo = ({ title, description, image, type = "website", jsonLd }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE}` : `${SITE} — Northern Pakistan Travel`;
    const desc = description || DEFAULT_DESC;
    const url = window.location.href.split("?")[0];

    document.title = fullTitle;
    setMeta("name", "description", desc);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", url);
    setMeta("property", "og:site_name", SITE);
    if (image) setMeta("property", "og:image", image);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    if (image) setMeta("name", "twitter:image", image);

    let canon = document.head.querySelector('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      document.head.appendChild(canon);
    }
    canon.href = url;

    let script = document.getElementById("mm-jsonld");
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.id = "mm-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [title, description, image, type, JSON.stringify(jsonLd)]);

  return null;
};

export default Seo;
