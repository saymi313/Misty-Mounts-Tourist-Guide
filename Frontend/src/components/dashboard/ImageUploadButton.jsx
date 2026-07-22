import React, { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { LIVE, uploadImage } from "../../data/adminApi";

/**
 * Small "Upload" button for the light admin/guide forms. Uploads to Cloudinary
 * via /api/upload and calls onUploaded(url). Falls back with a hint in mock mode.
 */
export default function ImageUploadButton({ onUploaded, folder = "uploads", label = "Upload" }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErr("Choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setErr("Image must be under 5 MB."); return; }
    if (!LIVE) { setErr("Uploads need the live backend — paste a URL for now."); return; }
    setErr("");
    setBusy(true);
    try {
      const url = await uploadImage(file, folder);
      onUploaded(url);
    } catch {
      setErr("Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {busy ? "Uploading…" : label}
      </button>
      <input ref={ref} type="file" accept="image/*" onChange={onChange} className="hidden" />
      {err && <span className="text-xs text-rose-500">{err}</span>}
    </span>
  );
}
