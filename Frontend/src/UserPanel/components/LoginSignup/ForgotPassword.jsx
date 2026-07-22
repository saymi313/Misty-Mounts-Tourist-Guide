import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft, KeyRound, Check } from "lucide-react";
import { Btn } from "../bento/tiles";
import { Field, inputClass } from "./Login";
import { isEmail, passwordChecks } from "../../../utils/validation";
import api, { LIVE } from "../../../data/api";
import OtpBoxes from "./OtpBoxes";

const EASE = [0.16, 1, 0.3, 1];

/** OTP-based password reset. onDone(data) receives the auth payload for auto-login. */
const ForgotPassword = ({ onDone, onBack, initialEmail = "" }) => {
  const [step, setStep] = useState("email"); // 'email' | 'reset'
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const pw = passwordChecks(password);
  const pwOk = pw.length && pw.letter && pw.number;

  const requestCode = async (e) => {
    e.preventDefault();
    setError("");
    if (!isEmail(email)) { setError("Enter a valid email address."); return; }
    setLoading(true);
    try {
      if (LIVE) await api.post("/user/auth/forgot-password", { email });
      else await new Promise((r) => setTimeout(r, 500));
      setInfo(`If an account exists for ${email}, a reset code is on its way.`);
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send the code.");
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) { setError("Enter the 6-digit code."); return; }
    if (!pwOk) { setError("Use 8+ characters with a letter and a number."); return; }
    setLoading(true);
    try {
      if (LIVE) {
        const { data } = await api.post("/user/auth/reset-password", { email, otp, password });
        onDone?.(data);
      } else {
        await new Promise((r) => setTimeout(r, 600));
        onBack?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed.");
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }}>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-white">Reset password</h2>
          <p className="text-sm text-white/60">
            {step === "email" ? "We'll email you a reset code." : "Enter the code and your new password."}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {!error && info && (
        <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-lime-400/25 bg-lime-400/10 px-4 py-3 text-sm text-lime-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {info}
        </div>
      )}

      {step === "email" ? (
        <form onSubmit={requestCode} className="space-y-5">
          <Field label="Email address">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com" className={inputClass} />
          </Field>
          <Btn type="submit" disabled={loading} className="w-full">
            {loading ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-night-950/30 border-t-night-950" /> Sending…</>) : (<>Send reset code <ArrowRight className="h-4 w-4" /></>)}
          </Btn>
        </form>
      ) : (
        <form onSubmit={reset} className="space-y-5">
          <OtpBoxes value={otp} onChange={(v) => { setOtp(v); setError(""); }} />
          <Field label="New password">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Create a new password"
              className={`${inputClass} pr-12`}
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/40 transition-colors hover:text-lime-400" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </Field>
          {password && (
            <ul className="-mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              {[["8+ characters", pw.length], ["A letter", pw.letter], ["A number", pw.number]].map(([label, ok]) => (
                <li key={label} className={`flex items-center gap-1.5 ${ok ? "text-lime-400" : "text-white/40"}`}>
                  {ok ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/25" />} {label}
                </li>
              ))}
            </ul>
          )}
          <Btn type="submit" disabled={loading} className="w-full">
            {loading ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-night-950/30 border-t-night-950" /> Resetting…</>) : (<>Reset password <ArrowRight className="h-4 w-4" /></>)}
          </Btn>
        </form>
      )}

      <div className="mt-6 flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 font-semibold text-white/60 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </button>
        {step === "reset" && (
          <button type="button" onClick={() => setStep("email")} className="font-semibold text-lime-400 transition-colors hover:text-lime-300">
            Change email
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
