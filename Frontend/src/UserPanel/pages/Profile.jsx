import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Heart, CalendarCheck, Star, Bell, LogOut, Check,
  AlertCircle, ChevronRight, Camera, Trash2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, SectionHead, Btn, Chip, inputCls } from "../components/bento/tiles";
import { useAuth } from "../../context/AuthContext";
import { cities, feedbacks } from "../../data/mockData";
import { required, email as emailRule, phone as phoneRule, maxLen, validate, hasErrors } from "../../utils/validation";
import { formatDate } from "../../utils/datetime";
import { getSaved, hydrateSaved, subscribeSaved } from "../../utils/savedStore";
import { getBookings, fetchBookings } from "../../utils/bookingsStore";
import api, { LIVE } from "../../data/api";

const EASE = [0.16, 1, 0.3, 1];
const inputErr = "!border-rose-400/60 focus:!border-rose-400/60 focus:!ring-rose-400/15";
const errNote = "mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-400";
const labelCls = "mb-1.5 block text-sm font-semibold text-white/70";

const INTERESTS = [
  "Trekking", "Photography", "Culture & forts", "Lakes",
  "Food & cafés", "Stargazing", "Road trips", "Wildlife",
];

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "+92 300 1234567",
    city: user?.city || cities[0],
    bio: user?.bio || "",
  });
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [photoErr, setPhotoErr] = useState("");
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [interests, setInterests] = useState(user?.interests || ["Trekking", "Lakes", "Food & cafés"]);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoErr("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoErr("Image must be under 2 MB.");
      return;
    }
    setPhotoErr("");

    // Live: upload to the server and use the returned URL. Else: inline base64.
    if (LIVE) {
      try {
        const fd = new FormData();
        fd.append("avatar", file);
        const { data } = await api.post("/user/avatar", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAvatar(data.avatar);
        updateUser({ avatar: data.avatar });
        setSaved(false);
      } catch {
        setPhotoErr("Upload failed. Please try again.");
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      updateUser({ avatar: reader.result });
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setAvatar("");
    setPhotoErr("");
    updateUser({ avatar: "" });
    setSaved(false);
  };

  // Refresh the saved / bookings counts from the API when live.
  const [, forceTick] = useState(0);
  useEffect(() => {
    hydrateSaved();
    fetchBookings().then(() => forceTick((t) => t + 1));
    return subscribeSaved(() => forceTick((t) => t + 1));
  }, []);

  const update = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    setSaved(false);
  };

  const toggleInterest = (i) => {
    setInterests((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const found = validate(form, {
      name: [required("Name is required")],
      email: [required("Email is required"), emailRule()],
      phone: [phoneRule()],
      bio: [maxLen(240, "Keep your bio under 240 characters")],
    });
    if (hasErrors(found)) {
      setErrors(found);
      return;
    }
    updateUser({ ...form, avatar, interests });
    setSaved(true);
  };

  const initial = (form.name || "U").charAt(0).toUpperCase();
  const stats = [
    { icon: CalendarCheck, label: "Bookings", value: getBookings().length, to: "/bookings" },
    { icon: Heart, label: "Saved", value: getSaved().length, to: "/saved" },
    { icon: Star, label: "Reviews", value: feedbacks.length, to: "/feedback" },
  ];
  const quickLinks = [
    [Heart, "Saved spots", "/saved"],
    [CalendarCheck, "My bookings", "/bookings"],
    [Bell, "Notifications", "/notifications"],
  ];

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Eyebrow>Account</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight text-white">
            Your <span className="text-lime-400">profile</span>
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/70">
            Manage your details, travel interests and how we keep in touch.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,0.95fr)_1.35fr]">
          {/* Summary column */}
          <div className="flex flex-col gap-3">
            <Tile glow="lime" pad="p-6 sm:p-7">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {avatar ? (
                    <img src={avatar} alt={form.name || "You"} className="h-16 w-16 rounded-2xl object-cover" />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-400 text-2xl font-extrabold text-night-950">
                      {initial}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    aria-label="Upload photo"
                    title="Upload photo"
                    className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-night-800 bg-night-900 text-lime-400 transition-colors hover:bg-night-700"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-extrabold text-white">{form.name || "Traveller"}</h2>
                  <p className="truncate text-sm text-white/60">{form.email}</p>
                  <p className="mt-1 text-xs text-white/40">
                    Member since {formatDate(user?.memberSince || "2026-01-08", { month: "long", year: "numeric" })}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="text-xs font-semibold text-lime-400 hover:text-lime-300"
                    >
                      {avatar ? "Change photo" : "Upload photo"}
                    </button>
                    {avatar && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-white/40 hover:text-rose-400"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {photoErr && (
                <p className="mt-3 flex items-center gap-1 text-xs font-medium text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {photoErr}
                </p>
              )}

              <div className="mt-6 grid grid-cols-3 gap-2">
                {stats.map(({ icon: Icon, label, value, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="rounded-2xl border border-white/[0.07] bg-night-900 p-3 text-center transition-colors hover:border-lime-400/40"
                  >
                    <Icon className="mx-auto h-4 w-4 text-lime-400" />
                    <p className="mt-1.5 text-lg font-extrabold text-white">{value}</p>
                    <p className="text-[11px] text-white/50">{label}</p>
                  </Link>
                ))}
              </div>
            </Tile>

            <Tile pad="p-4">
              <p className="px-2 pt-1 text-xs font-bold uppercase tracking-wider text-white/40">Quick links</p>
              <div className="mt-1 space-y-0.5">
                {quickLinks.map(([Icon, label, to]) => (
                  <Link
                    key={label}
                    to={to}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-white/75 transition-colors hover:bg-night-700 hover:text-white"
                  >
                    <Icon className="h-4 w-4 text-lime-400" /> {label}
                    <ChevronRight className="ml-auto h-4 w-4 text-white/30" />
                  </Link>
                ))}
                <button
                  onClick={logout}
                  className="mt-1 flex w-full items-center gap-3 rounded-2xl border-t border-white/8 px-3 py-3 text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </Tile>
          </div>

          {/* Edit column */}
          <div className="flex flex-col gap-3">
            <Tile pad="p-6 sm:p-8">
              <SectionHead eyebrow="Personal details" title="Edit your info" icon={User} />

              {saved && (
                <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-lime-400/25 bg-lime-400/10 px-4 py-3 text-sm font-semibold text-lime-300">
                  <Check className="h-4 w-4" /> Profile saved — looking good, {form.name.split(" ")[0] || "traveller"}.
                </div>
              )}

              <form onSubmit={handleSave} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pf-name" className={labelCls}>Full name</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        id="pf-name"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="Your name"
                        aria-invalid={!!errors.name}
                        className={`${inputCls} !pl-11 ${errors.name ? inputErr : ""}`}
                      />
                    </div>
                    {errors.name && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="pf-email" className={labelCls}>Email</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        id="pf-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="you@example.com"
                        aria-invalid={!!errors.email}
                        className={`${inputCls} !pl-11 ${errors.email ? inputErr : ""}`}
                      />
                    </div>
                    {errors.email && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="pf-phone" className={labelCls}>Phone</label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        id="pf-phone"
                        type="tel"
                        inputMode="tel"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="+92 300 1234567"
                        aria-invalid={!!errors.phone}
                        className={`${inputCls} !pl-11 ${errors.phone ? inputErr : ""}`}
                      />
                    </div>
                    {errors.phone && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="pf-city" className={labelCls}>Home base</label>
                    <select
                      id="pf-city"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      className={`${inputCls} cursor-pointer`}
                    >
                      {cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="pf-bio" className={labelCls}>About you</label>
                  <textarea
                    id="pf-bio"
                    rows="3"
                    value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder="Tell guides a little about how you like to travel…"
                    aria-invalid={!!errors.bio}
                    className={`${inputCls} resize-none ${errors.bio ? inputErr : ""}`}
                  />
                  <div className="mt-1.5 flex items-center justify-between">
                    {errors.bio ? (
                      <p className={errNote.replace("mt-1.5 ", "")}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.bio}</p>
                    ) : (
                      <span className="text-xs text-white/40">A short line shown to your local guides.</span>
                    )}
                    <span className={`text-xs ${form.bio.length > 240 ? "text-rose-400" : "text-white/40"}`}>{form.bio.length}/240</span>
                  </div>
                </div>

                <div>
                  <p className={labelCls}>Travel interests</p>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((i) => (
                      <Chip key={i} type="button" active={interests.includes(i)} onClick={() => toggleInterest(i)}>
                        {i}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-white/8 pt-5">
                  <Btn type="submit">
                    <Check className="h-4 w-4" /> Save changes
                  </Btn>
                </div>
              </form>
            </Tile>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
