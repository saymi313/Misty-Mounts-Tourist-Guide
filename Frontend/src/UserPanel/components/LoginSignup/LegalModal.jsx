import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ScrollText, ShieldCheck } from "lucide-react";

const CONTENT = {
  terms: {
    icon: ScrollText,
    title: "Terms of Service",
    sections: [
      ["Acceptance", "By creating a Misty Mounts account you agree to use the platform lawfully and to keep your login credentials secure. You are responsible for activity under your account."],
      ["Bookings & payments", "Bookings made through Misty Mounts are subject to the terms of the individual stay or service provider. Prices are shown in Pakistani Rupees (PKR) and may change before confirmation."],
      ["Local guides", "Guides curate spots and respond to travellers in good faith. Misty Mounts is a connection platform and is not liable for third-party services, travel conditions, or safety on the ground."],
      ["Content", "You may not post unlawful, misleading, or harmful content. We may remove content or suspend accounts that violate these terms."],
      ["Changes", "We may update these terms from time to time. Continued use after an update constitutes acceptance of the revised terms."],
    ],
  },
  privacy: {
    icon: ShieldCheck,
    title: "Privacy Policy",
    sections: [
      ["What we collect", "Your name, email, and profile details you provide (city, bio, avatar, interests), plus content you create such as saved spots, bookings, reviews and messages."],
      ["How we use it", "To operate your account, verify your email via a one-time code, power bookings and guide chat, and improve the service. We do not sell your personal data."],
      ["Email & OTP", "We send a 6-digit verification code to confirm your email address at sign-up and for password resets. Codes expire after 10 minutes."],
      ["Images", "Photos you upload (e.g. your avatar or spot images) are stored with our image provider and served over secure URLs."],
      ["Your choices", "You can update or remove your profile details at any time, and request account deletion. Contact us to exercise your rights."],
    ],
  },
};

const LegalModal = ({ doc, onClose }) => {
  useEffect(() => {
    if (!doc) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [doc, onClose]);

  const data = doc ? CONTENT[doc] : null;
  const Icon = data?.icon || ScrollText;

  return createPortal(
    <AnimatePresence>
      {doc && data && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-night-950/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-[calc(100vh-3rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-night-900 shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-extrabold text-white">{data.title}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {data.sections.map(([heading, body]) => (
                <div key={heading}>
                  <h4 className="text-sm font-bold text-lime-400">{heading}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">{body}</p>
                </div>
              ))}
              <p className="pt-1 text-xs text-white/35">Last updated {new Date().getFullYear()} · Misty Mounts</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LegalModal;
