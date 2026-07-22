/** Turn a name into a URL-friendly slug, e.g. "Attabad Lake" → "attabad-lake". */
const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9\s-]/g, "")    // drop non-alphanumerics
    .trim()
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/-+/g, "-")             // collapse repeats
    .replace(/^-|-$/g, "") || "item";

module.exports = { slugify };
