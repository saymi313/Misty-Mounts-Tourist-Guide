import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { img } from "../../data/mockData";
import { required, validate, hasErrors } from "../../utils/validation";
import api, { LIVE } from "../../data/api";

const inputBase =
  "w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none [color-scheme:light] focus:border-lime-400";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");

  const clear = (key) => errors[key] && setErrors((e) => ({ ...e, [key]: undefined }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    const found = validate(
      { email, password },
      {
        email: [required("Email or username is required")],
        password: [required("Password is required")],
      }
    );
    if (hasErrors(found)) {
      setErrors(found);
      return;
    }
    setLoading(true);

    if (LIVE) {
      try {
        const { data } = await api.post("/admin/auth/login", { username: email, password });
        localStorage.setItem("adminToken", data.token);
        navigate("/admin/dashboard");
      } catch (err) {
        setLoginError(
          err.response?.data?.error ||
            (err.response ? "Login failed" : "Couldn't reach the server — please try again.")
        );
        setLoading(false);
      }
      return;
    }

    // No backend configured — admin access requires valid credentials via the API.
    setLoginError("Admin login is unavailable — the backend is not configured.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] lg:grid lg:grid-cols-2">
      {/* Left: brand photo panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <img src={img("admin-hero", 1200, 1600)} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <img src="/Logo.png" alt="Misty Mounts" className="h-9 w-9 rounded-xl object-cover" />
            <span className="text-lg font-bold">Misty Mounts</span>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-lime-300">Admin console</p>
            <h1 className="mt-3 max-w-md text-4xl font-bold leading-tight">
              Manage the north, all in one place.
            </h1>
            <p className="mt-3 max-w-sm text-white/70">
              Spots, stays, transport, payments and guides — the whole platform at a glance.
            </p>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src="/Logo.png" alt="Misty Mounts" className="h-9 w-9 rounded-xl object-cover" />
            <span className="text-lg font-bold text-slate-900">Misty Mounts</span>
          </div>

          <p className="text-sm font-semibold uppercase tracking-widest text-lime-600">Welcome back</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Sign in to admin</h2>
          <p className="mt-2 text-sm text-slate-400">Sign in with your admin email and password.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
            {loginError && (
              <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                <AlertCircle className="h-4 w-4 shrink-0" /> {loginError}
              </div>
            )}
            <div>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clear("email");
                  }}
                  placeholder="Email or username"
                  aria-invalid={!!errors.email}
                  className={`${inputBase} ${errors.email ? "!border-rose-300 focus:!border-rose-400" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.email}
                </p>
              )}
            </div>
            <div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clear("password");
                  }}
                  placeholder="Enter your password"
                  aria-invalid={!!errors.password}
                  className={`${inputBase} ${errors.password ? "!border-rose-300 focus:!border-rose-400" : ""}`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.password}
                </p>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 py-3.5 text-sm font-semibold text-night-950 transition-colors hover:bg-lime-300 disabled:opacity-60">
              {loading ? "Signing in…" : (<>Sign in <ArrowRight className="h-4 w-4" /></>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
