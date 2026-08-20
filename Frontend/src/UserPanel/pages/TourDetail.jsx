import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, CalendarDays, Compass, Check, X, Clock, Landmark, Upload, Loader2,
  AlertCircle, ShieldCheck, Users, BedDouble, ChevronRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, Btn, inputCls } from "../components/bento/tiles";
import WishlistButton from "../../components/WishlistButton";
import AddToTripButton from "../../components/AddToTripButton";
import WeatherWidget from "../../components/WeatherWidget";
import Seo from "../../components/Seo";
import MistyGuarantee from "../../components/MistyGuarantee";
import { CITY_COORDS } from "../../data/geo";
import { useAuth } from "../../context/AuthContext";
import { getTour, bookTour } from "../../data/toursApi";
import { getPaymentAccounts } from "../../data/revenueApi";
import { getPayConfig, startCheckout } from "../../data/paymentApi";
import { formatPKR } from "../../utils/currency";
import { formatDate } from "../../utils/datetime";
import { required, email as emailRule, phone as phoneRule, validate, hasErrors } from "../../utils/validation";
import api, { LIVE } from "../../data/api";

const labelCls = "mb-1.5 block text-sm font-semibold text-white/70";
const inputErr = "!border-rose-400/60";
const errNote = "mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-400";

const Shell = ({ children }) => (
  <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
    <Navbar />
    <main className="mx-auto max-w-7xl px-5 pb-8 pt-6 sm:px-8">{children}</main>
    <Footer />
  </div>
);

export default function TourDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking form
  const [departureId, setDepartureId] = useState("");
  const [seats, setSeats] = useState(1);
  const [form, setForm] = useState({ guestName: "", email: "", phone: "", senderName: "", paymentRef: "" });
  const [errors, setErrors] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState("");
  const [proof, setProof] = useState("");
  const [proofErr, setProofErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [payCfg, setPayCfg] = useState({ enabled: false });

  useEffect(() => {
    if (!LIVE) { setLoading(false); return; }
    let alive = true;
    getTour(id).then((t) => { if (alive) setTour(t); }).catch(() => {}).finally(() => { if (alive) setLoading(false); });
    getPaymentAccounts().then((a) => { setAccounts(a || []); if (a?.length) setAccount(a[0].label || a[0].accountNumber); }).catch(() => {});
    getPayConfig().then((c) => { if (alive) setPayCfg(c); }).catch(() => {});
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, guestName: f.guestName || user.name || "", email: f.email || user.email || "" }));
  }, [user]);

  const upcoming = (tour?.departures || []).filter((d) => new Date(d.date) >= new Date() && d.status !== "closed");
  const selectedDep = upcoming.find((d) => d._id === departureId) || null;
  const seatsLeft = selectedDep ? selectedDep.seatsTotal - selectedDep.seatsBooked : 0;
  const total = (Number(seats) || 0) * (tour?.pricePerPerson || 0);

  const update = (k, v) => { setForm((f) => ({ ...f, [k]: v })); if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined })); };

  const handleProof = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setProofErr("Choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setProofErr("Image must be under 5 MB."); return; }
    setProofErr("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await api.post("/upload?folder=payments", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setProof(data.url);
    } catch { setProofErr("Upload failed. Please try again."); }
    finally { setUploading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!departureId) { setError("Please choose a departure date."); return; }
    const n = Number(seats) || 0;
    if (n < 1) { setError("Add at least one traveller."); return; }
    if (n > seatsLeft) { setError(`Only ${seatsLeft} seat(s) left on this departure.`); return; }
    const found = validate(form, {
      guestName: [required("Your name is required")],
      email: [required("Email is required"), emailRule()],
      phone: [required("Phone is required"), phoneRule()],
      senderName: [required("Enter the name on the account you paid from")],
      paymentRef: [required("Enter the transaction ID")],
    });
    if (hasErrors(found)) { setErrors(found); return; }
    if (accounts.length && !account) { setError("Pick the account you paid into."); return; }
    if (!proof) { setProofErr("Please attach your payment screenshot."); return; }

    setSubmitting(true);
    try {
      const res = await bookTour({
        packageId: tour._id, departureId, seats: n,
        guestName: form.guestName, email: form.email, phone: form.phone,
        paymentProof: proof, paymentRef: form.paymentRef, paymentAccountLabel: account, senderName: form.senderName,
      });
      setDone(res);
    } catch (e2) {
      setError(e2?.response?.data?.error || "Couldn't submit your booking. Please try again.");
    } finally { setSubmitting(false); }
  };

  // Gateway checkout: create the booking, then redirect to hosted payment.
  const payOnline = async () => {
    const found = validate(form, {
      guestName: [required("Your name is required")],
      email: [required("Email is required"), emailRule()],
      phone: [required("Phone is required"), phoneRule()],
    });
    if (hasErrors(found)) { setErrors(found); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await bookTour({ packageId: tour._id, departureId, seats: n, guestName: form.guestName, email: form.email, phone: form.phone });
      const { url } = await startCheckout("tour", res.bookingId);
      window.location.href = url; // leaves the app for the gateway
    } catch (e2) {
      setError(e2?.response?.data?.error || "Couldn't start payment. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) return <Shell><Tile className="py-16 text-center"><p className="text-white/60">Loading tour…</p></Tile></Shell>;
  if (!tour) {
    return (
      <Shell>
        <Tile className="py-16 text-center">
          <p className="text-white/60">Tour not found.</p>
          <Link to="/tours" className="mt-4 inline-block font-semibold text-lime-400">← Back to tours</Link>
        </Tile>
      </Shell>
    );
  }

  return (
    <Shell>
      <Link to="/tours" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 transition-colors hover:text-lime-400">
        <ArrowLeft className="h-4 w-4" /> All tours
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-5 overflow-hidden rounded-[1.6rem] border border-white/[0.07]">
        <div className="relative h-64 w-full sm:h-80">
          {tour.coverImage ? (
            <img loading="lazy" decoding="async" src={tour.coverImage} alt={tour.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-night-700 text-white/25"><Compass className="h-12 w-12" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/40 to-transparent" />
          <div className="absolute right-4 top-4 flex gap-2">
            <AddToTripButton compact item={{ type: "tour", id: tour._id, title: tour.title, image: tour.coverImage, city: (tour.cities || [])[0] || "", price: tour.pricePerPerson, href: `/tours/${tour._id}` }} />
            <WishlistButton floating item={{ type: "tour", id: tour._id, title: tour.title, image: tour.coverImage, city: (tour.cities || [])[0] || "", price: tour.pricePerPerson, href: `/tours/${tour._id}` }} />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <Eyebrow><Compass className="h-3.5 w-3.5" /> {tour.durationDays} day{tour.durationDays !== 1 ? "s" : ""} · group tour</Eyebrow>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{tour.title}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-lime-400" /> {(tour.cities || []).join(", ") || "—"}</span>
              {tour.agency?.name && <span className="flex items-center gap-1"><Users className="h-4 w-4 text-lime-400" /> by {tour.agency.name}</span>}
            </p>
          </div>
        </div>
      </motion.div>

      <Seo
        title={tour.title}
        description={tour.summary || `A ${tour.durationDays}-day group tour across ${(tour.cities || []).join(", ")} with Misty Mounts.`}
        image={tour.coverImage}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: tour.title,
          description: tour.summary,
          image: tour.coverImage,
          ...(tour.pricePerPerson
            ? { offers: { "@type": "Offer", price: tour.pricePerPerson, priceCurrency: "PKR", availability: "https://schema.org/InStock" } }
            : {}),
        }}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: details */}
        <div className="space-y-6">
          {tour.summary && <Tile pad="p-6"><p className="text-white/75">{tour.summary}</p></Tile>}

          {tour.itinerary?.length > 0 && (
            <Tile pad="p-6">
              <h2 className="text-xl font-extrabold text-white">Itinerary</h2>
              <div className="mt-4 space-y-4">
                {tour.itinerary.map((d, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-sm font-extrabold text-lime-400">{d.day || i + 1}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-white">{d.title || `Day ${d.day || i + 1}`}</p>
                      {d.detail && <p className="mt-0.5 text-sm leading-relaxed text-white/60">{d.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Tile>
          )}

          {tour.hotels?.length > 0 && (
            <Tile pad="p-6">
              <h2 className="text-xl font-extrabold text-white">Where you'll stay</h2>
              <div className="mt-3 space-y-2">
                {tour.hotels.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-night-700/60 px-4 py-3">
                    <BedDouble className="h-4 w-4 shrink-0 text-lime-400" />
                    <span className="min-w-0 flex-1 truncate text-sm text-white/80">{h.name}{h.city ? ` · ${h.city}` : ""}</span>
                    {h.nights ? <span className="shrink-0 text-xs text-white/40">{h.nights} night{h.nights !== 1 ? "s" : ""}</span> : null}
                  </div>
                ))}
              </div>
            </Tile>
          )}

          {tour.spots?.length > 0 && (
            <Tile pad="p-6">
              <h2 className="text-xl font-extrabold text-white">Spots you'll visit</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {tour.spots.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-night-700 px-3 py-1.5 text-sm text-white/75"><MapPin className="h-3 w-3 text-lime-400" /> {s.name}</span>
                ))}
              </div>
            </Tile>
          )}

          {(() => {
            const c = (tour.cities || []).map((city) => CITY_COORDS[city]).find(Boolean);
            return c ? <WeatherWidget lat={c[0]} lng={c[1]} placeName={(tour.cities || [])[0]} /> : null;
          })()}

          {(tour.inclusions?.length > 0 || tour.exclusions?.length > 0) && (
            <div className="grid gap-6 sm:grid-cols-2">
              {tour.inclusions?.length > 0 && (
                <Tile pad="p-6">
                  <h3 className="font-extrabold text-white">What's included</h3>
                  <ul className="mt-3 space-y-2">
                    {tour.inclusions.map((x, i) => <li key={i} className="flex items-start gap-2 text-sm text-white/70"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-400" /> {x}</li>)}
                  </ul>
                </Tile>
              )}
              {tour.exclusions?.length > 0 && (
                <Tile pad="p-6">
                  <h3 className="font-extrabold text-white">Not included</h3>
                  <ul className="mt-3 space-y-2">
                    {tour.exclusions.map((x, i) => <li key={i} className="flex items-start gap-2 text-sm text-white/50"><X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" /> {x}</li>)}
                  </ul>
                </Tile>
              )}
            </div>
          )}
        </div>

        {/* Right: booking */}
        <div className="h-fit lg:sticky lg:top-24">
          <Tile glow="lime" pad="p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">{formatPKR(tour.pricePerPerson)}</span>
              <span className="text-sm text-white/50">/ person</span>
            </div>

            {done ? (
              <div className="mt-5 rounded-2xl border border-lime-400/25 bg-lime-400/[0.06] p-5 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lime-400 text-night-950"><Clock className="h-6 w-6" strokeWidth={2.6} /></span>
                <h3 className="mt-3 text-lg font-extrabold text-white">Booking submitted!</h3>
                <p className="mt-1 text-sm text-white/60">Ref <span className="font-semibold text-lime-400">{done.bookingId}</span> — pending verification. You'll be notified once confirmed.</p>
                <Link to="/bookings" className="mt-4 inline-block text-sm font-semibold text-lime-400 hover:underline">View my bookings →</Link>
              </div>
            ) : !user ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-night-900 p-5 text-center">
                <p className="text-sm text-white/70">Sign in to book this tour.</p>
                <Link to="/auth" className="mt-3 inline-block rounded-full bg-lime-400 px-5 py-2.5 text-sm font-bold text-night-950">Sign in</Link>
              </div>
            ) : upcoming.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">No upcoming departures right now — check back soon.</p>
            ) : (
              <form onSubmit={submit} noValidate className="mt-5 space-y-4">
                {/* Departures */}
                <div>
                  <label className={labelCls}>Choose a departure</label>
                  <div className="space-y-2">
                    {upcoming.map((d) => {
                      const left = d.seatsTotal - d.seatsBooked;
                      const active = departureId === d._id;
                      const full = left <= 0;
                      return (
                        <button type="button" key={d._id} disabled={full} onClick={() => { setDepartureId(d._id); setSeats(1); }}
                          className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors disabled:opacity-40 ${active ? "border-lime-400/50 bg-lime-400/[0.06]" : "border-white/10 bg-night-800 hover:border-lime-400/30"}`}>
                          <span className="flex items-center gap-2 text-sm font-semibold text-white"><CalendarDays className="h-4 w-4 text-lime-400" /> {formatDate(d.date)}</span>
                          <span className={`text-xs font-medium ${full ? "text-rose-400" : "text-white/50"}`}>{full ? "Full" : `${left} seat${left !== 1 ? "s" : ""} left`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDep && (
                  <>
                    <div>
                      <label className={labelCls}>Travellers (seats)</label>
                      <input type="number" min="1" max={seatsLeft} value={seats} onChange={(e) => setSeats(e.target.value)} className={inputCls} />
                      <p className="mt-1 text-xs text-white/40">{seatsLeft} seat{seatsLeft !== 1 ? "s" : ""} available.</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>Full name</label>
                        <input value={form.guestName} onChange={(e) => update("guestName", e.target.value)} className={`${inputCls} ${errors.guestName ? inputErr : ""}`} />
                        {errors.guestName && <p className={errNote}><AlertCircle className="h-3.5 w-3.5" /> {errors.guestName}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>Phone</label>
                        <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+92 300 1234567" className={`${inputCls} ${errors.phone ? inputErr : ""}`} />
                        {errors.phone && <p className={errNote}><AlertCircle className="h-3.5 w-3.5" /> {errors.phone}</p>}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={`${inputCls} ${errors.email ? inputErr : ""}`} />
                      {errors.email && <p className={errNote}><AlertCircle className="h-3.5 w-3.5" /> {errors.email}</p>}
                    </div>

                    {/* Payment (manual proof) — used only when online checkout is off */}
                    {!payCfg.enabled && (
                    <div className="rounded-2xl border border-white/[0.08] bg-night-900 p-4">
                      <h4 className="flex items-center gap-2 text-sm font-extrabold text-white"><Landmark className="h-4 w-4 text-lime-400" /> Pay {formatPKR(total)} &amp; attach proof</h4>
                      {accounts.length === 0 ? (
                        <p className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">Payment accounts aren't set up yet — contact support.</p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {accounts.map((a, i) => {
                            const key = a.label || a.accountNumber || `acc-${i}`;
                            const active = account === key;
                            return (
                              <button type="button" key={key} onClick={() => setAccount(key)} className={`flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left transition-colors ${active ? "border-lime-400/50 bg-lime-400/[0.06]" : "border-white/10 bg-night-800 hover:border-lime-400/30"}`}>
                                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? "border-lime-400 bg-lime-400 text-night-950" : "border-white/30"}`}>{active && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-bold text-white">{a.label || a.bank || "Account"}</span>
                                  {a.accountName && <span className="block text-xs text-white/60">{a.accountName}</span>}
                                  <span className="block font-mono text-sm text-lime-300">{a.accountNumber}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className={labelCls}>Your account name</label>
                          <input value={form.senderName} onChange={(e) => update("senderName", e.target.value)} className={`${inputCls} ${errors.senderName ? inputErr : ""}`} />
                          {errors.senderName && <p className={errNote}><AlertCircle className="h-3.5 w-3.5" /> {errors.senderName}</p>}
                        </div>
                        <div>
                          <label className={labelCls}>Transaction ID</label>
                          <input value={form.paymentRef} onChange={(e) => update("paymentRef", e.target.value)} placeholder="TXN123456" className={`${inputCls} ${errors.paymentRef ? inputErr : ""}`} />
                          {errors.paymentRef && <p className={errNote}><AlertCircle className="h-3.5 w-3.5" /> {errors.paymentRef}</p>}
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/12 bg-night-800 px-4 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:border-lime-400/40">
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {uploading ? "Uploading…" : proof ? "Replace screenshot" : "Upload screenshot"}
                          <input type="file" accept="image/*" onChange={handleProof} className="hidden" />
                        </label>
                        {proof && <img loading="lazy" decoding="async" src={proof} alt="Payment proof" className="mt-2 h-28 w-full rounded-xl border border-white/10 object-cover" />}
                        {proofErr && <p className={errNote}><AlertCircle className="h-3.5 w-3.5" /> {proofErr}</p>}
                      </div>
                    </div>
                    )}

                    <div className="flex items-center justify-between border-t border-white/10 pt-3 text-lg font-extrabold text-white">
                      <span>Total</span><span className="text-lime-400">{formatPKR(total)}</span>
                    </div>
                    {error && <p className="text-sm font-medium text-rose-400">{error}</p>}
                    {payCfg.enabled ? (
                      <>
                        <Btn type="button" onClick={payOnline} disabled={submitting} className="w-full">
                          {submitting ? "Redirecting…" : (<><ShieldCheck className="h-4 w-4" /> Pay {formatPKR(total)} securely</>)}
                        </Btn>
                        <p className="flex items-center justify-center gap-1.5 text-xs text-white/50"><ShieldCheck className="h-3.5 w-3.5 text-lime-400" /> Secure checkout. You'll be redirected to pay, then brought back.</p>
                      </>
                    ) : (
                      <>
                        <Btn type="submit" disabled={submitting || uploading} className="w-full">
                          {submitting ? "Submitting…" : (<><ShieldCheck className="h-4 w-4" /> Submit booking</>)}
                        </Btn>
                        <p className="flex items-center justify-center gap-1.5 text-xs text-white/50"><ShieldCheck className="h-3.5 w-3.5 text-lime-400" /> Confirmed once the admin verifies your payment.</p>
                      </>
                    )}
                  </>
                )}
              </form>
            )}
          </Tile>
          <MistyGuarantee className="mt-4" />
        </div>
      </div>
    </Shell>
  );
}
