import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, MapPin, Users, Moon, Ticket, ArrowUpRight, Compass,
  CalendarCheck, Wallet, X, ShieldCheck, Lock,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, Btn, Chip } from "../components/bento/tiles";
import { getBookings, saveBookings, fetchBookings, cancelBookingRemote } from "../../utils/bookingsStore";
import { listMyTourBookings } from "../../data/toursApi";
import { confirmStay, confirmTour } from "../../data/paymentApi";
import { formatPKR } from "../../utils/currency";
import { formatDate } from "../../utils/datetime";
import { toast } from "../../utils/toast";
import { LIVE } from "../../data/api";

const EASE = [0.16, 1, 0.3, 1];
const FILTERS = ["All", "Upcoming", "Completed", "Cancelled"];

const statusStyle = {
  Upcoming: "bg-lime-400/15 text-lime-300",
  Completed: "bg-white/10 text-white/70",
  Cancelled: "bg-rose-500/15 text-rose-300",
};

// Normalize a tour booking into the same card shape as a stay booking.
const normalizeTour = (t) => ({
  _id: t._id,
  kind: "tour",
  ref: t.ref,
  status: t.status || "Upcoming",
  paymentStatus: t.paymentStatus || "Pending",
  escrowStatus: t.escrowStatus || "None",
  hotel: t.packageTitle,
  city: t.city || "",
  image: t.image || "",
  amount: t.amount || 0,
  checkIn: t.departureDate,
  seats: t.seats || 1,
  packageId: t.packageId,
  bookedOn: t.createdAt,
});

const MyBookings = () => {
  const [stays, setStays] = useState(getBookings);
  const [tours, setTours] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchBookings().then((b) => setStays([...b]));
    if (LIVE) listMyTourBookings().then((t) => setTours((t || []).map(normalizeTour))).catch(() => {});
  }, []);

  const bookings = [...stays, ...tours].sort(
    (a, b) => new Date(b.bookedOn || b.checkIn || 0) - new Date(a.bookedOn || a.checkIn || 0)
  );

  const cancel = (id) =>
    setStays((prev) => {
      const next = prev.map((b) => (b._id === id ? { ...b, status: "Cancelled" } : b));
      saveBookings(next);
      cancelBookingRemote(id);
      return next;
    });

  // Milestone: traveller confirms the trip happened → releases escrow to the partner.
  const confirm = async (b) => {
    try {
      if (b.kind === "tour") await confirmTour(b._id); else await confirmStay(b._id);
      const patch = (x) => (x._id === b._id ? { ...x, escrowStatus: "Released", status: "Completed" } : x);
      setStays((prev) => { const n = prev.map(patch); saveBookings(n); return n; });
      setTours((prev) => prev.map(patch));
      toast.success("Thanks for confirming — funds released to your host.");
    } catch (e) {
      toast.error(e?.response?.data?.error || "Couldn't confirm right now.");
    }
  };

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All" ? bookings.length : bookings.filter((b) => b.status === f).length;
    return acc;
  }, {});
  const shown = filter === "All" ? bookings : bookings.filter((b) => b.status === filter);

  const upcoming = bookings.filter((b) => b.status === "Upcoming").length;
  const spent = bookings.filter((b) => b.status !== "Cancelled").reduce((s, b) => s + b.amount, 0);

  const summary = [
    { icon: CalendarCheck, label: "Total trips", value: bookings.length },
    { icon: Ticket, label: "Upcoming", value: upcoming },
    { icon: Wallet, label: "Total spent", value: formatPKR(spent) },
  ];

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Eyebrow><Ticket className="h-3.5 w-3.5" /> Trips</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight text-white">
            My <span className="text-lime-400">bookings</span>
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/70">
            Every stay you've booked across the north — upcoming, past and cancelled.
          </p>
        </motion.div>

        {/* Summary */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {summary.map(({ icon: Icon, label, value }) => (
            <Tile key={label} pad="p-4 sm:p-5">
              <Icon className="h-5 w-5 text-lime-400" />
              <p className="mt-3 text-xl font-extrabold text-white sm:text-2xl">{value}</p>
              <p className="text-xs text-white/50">{label}</p>
            </Tile>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f} <span className="ml-1 opacity-60">{counts[f]}</span>
            </Chip>
          ))}
        </div>

        {/* List */}
        {shown.length === 0 ? (
          <Tile className="mt-6 flex flex-col items-center justify-center py-16 text-center" pad="p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-night-700 text-lime-400">
              <Ticket className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-extrabold text-white">No {filter.toLowerCase()} bookings</h2>
            <p className="mt-2 max-w-sm text-sm text-white/60">
              When you book a stay it'll show up here with all its details.
            </p>
            <Link to="/destinations" className="mt-6">
              <Btn><Compass className="h-4 w-4" /> Find a stay</Btn>
            </Link>
          </Tile>
        ) : (
          <div className="mt-6 space-y-3">
            {shown.map((b, i) => (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.05, ease: EASE }}
              >
                <Tile pad="p-0" className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <img loading="lazy" decoding="async" src={b.image} alt={b.hotel} className="h-40 w-full object-cover sm:h-auto sm:w-52" />
                    <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${statusStyle[b.status]}`}>
                            {b.status}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-white/40">
                            <Ticket className="h-3 w-3" /> {b.ref}
                          </span>
                        </div>
                        <h3 className="mt-2 truncate text-lg font-extrabold text-white">
                          {b.hotel}
                          {b.kind === "tour" && <span className="ml-2 rounded-full bg-violet-400/15 px-2 py-0.5 align-middle text-[0.6rem] font-bold uppercase tracking-wider text-violet-300">Tour</span>}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-white/60">
                          <MapPin className="h-3.5 w-3.5 text-lime-400" /> {b.city}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/60">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-lime-400" /> {b.checkIn ? formatDate(b.checkIn) : "—"}{b.kind === "tour" ? " · departure" : ""}
                          </span>
                          {b.kind === "tour" ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 text-lime-400" /> {b.seats} seat{b.seats > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-1.5">
                                <Moon className="h-3.5 w-3.5 text-lime-400" /> {b.nights} night{b.nights > 1 ? "s" : ""}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-lime-400" /> {b.guests} guest{b.guests > 1 ? "s" : ""}
                              </span>
                            </>
                          )}
                          {b.kind === "tour" && b.paymentStatus && b.paymentStatus !== "Approved" && (
                            <span className="inline-flex items-center gap-1.5 text-apricot-300">
                              <Ticket className="h-3.5 w-3.5" /> Payment {b.paymentStatus.toLowerCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                        <div className="sm:text-right">
                          <p className="text-xl font-extrabold text-lime-400">{formatPKR(b.amount)}</p>
                          <p className="text-[11px] text-white/40">total paid</p>
                          {b.escrowStatus === "Held" && (
                            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300"><Lock className="h-3 w-3" /> Held in escrow</p>
                          )}
                          {b.escrowStatus === "Released" && (
                            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-lime-300"><ShieldCheck className="h-3 w-3" /> Released to host</p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={b.kind === "tour" ? `/tours/${b.packageId}` : b.accId ? `/accommodations/${b.accId}` : "/destinations"}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:border-lime-400 hover:text-lime-400"
                          >
                            {b.kind === "tour" ? "View tour" : "View stay"} <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                          {b.paymentStatus === "Approved" && b.escrowStatus === "Held" && (
                            <button
                              onClick={() => confirm(b)}
                              title="Confirm your trip happened to release payment from escrow"
                              className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/40 bg-lime-400/10 px-3.5 py-2 text-xs font-bold text-lime-300 transition-colors hover:bg-lime-400/20"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" /> Confirm &amp; release
                            </button>
                          )}
                          {b.kind !== "tour" && b.status === "Upcoming" && (
                            <button
                              onClick={() => cancel(b._id)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 px-3.5 py-2 text-xs font-bold text-rose-300 transition-colors hover:bg-rose-500/10"
                            >
                              <X className="h-3.5 w-3.5" /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Tile>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyBookings;
