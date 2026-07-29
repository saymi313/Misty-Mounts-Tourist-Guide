import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Clock, CalendarCheck, Wallet, Plus, ArrowUpRight } from "lucide-react";
import TravelAgencyLayout from "../TravelAgencyLayout";
import { Card, SectionHead, StatCard, Btn, BtnGhost, StatusPill } from "../../components/dashboard/ui";
import { formatPKR } from "../../utils/currency";
import { formatDate } from "../../utils/datetime";
import { useAuth } from "../../context/AuthContext";
import { listMyPackages, listMyTourBookings } from "../../data/agencyApi";
import { LIVE } from "../../data/api";

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!LIVE) return;
    listMyPackages().then(setPackages).catch(() => {});
    listMyTourBookings().then(setBookings).catch(() => {});
  }, []);

  const pending = packages.filter((p) => p.isApproved === false).length;
  const upcomingDepartures = packages.reduce(
    (s, p) => s + (p.departures || []).filter((d) => new Date(d.date) >= new Date()).length,
    0
  );
  const confirmed = bookings.filter((b) => b.paymentStatus === "Approved" && b.status !== "Cancelled");
  const revenue = confirmed.reduce((s, b) => s + (b.amount || 0), 0);

  return (
    <TravelAgencyLayout
      greeting={`Welcome, ${user?.agencyName || user?.name || "Agency"}`}
      subtitle="Your tours, departures and bookings at a glance"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} tone="emerald" label="Tour packages" value={packages.length} />
        <StatCard icon={Clock} tone="apricot" label="Pending approval" value={pending} />
        <StatCard icon={CalendarCheck} tone="sky" label="Upcoming departures" value={upcomingDepartures} />
        <StatCard icon={Wallet} tone="violet" label="Confirmed revenue" value={formatPKR(revenue)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHead
            title="Your packages"
            sub={`${packages.length} total`}
            action={<Link to="/travel-agency/packages"><Btn><Plus className="h-4 w-4" /> New package</Btn></Link>}
          />
          {packages.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No packages yet — create your first tour.</p>
          ) : (
            <div className="space-y-2">
              {packages.slice(0, 5).map((p) => (
                <div key={p._id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{p.title}</p>
                    <p className="truncate text-xs text-slate-400">{(p.cities || []).join(", ") || "—"} · {formatPKR(p.pricePerPerson)}/person</p>
                  </div>
                  <StatusPill status={p.isApproved === false ? "Pending" : "Approved"} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionHead
            title="Recent bookings"
            sub={`${bookings.length} total`}
            action={<Link to="/travel-agency/bookings"><BtnGhost>View all <ArrowUpRight className="h-4 w-4" /></BtnGhost></Link>}
          />
          {bookings.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No bookings yet.</p>
          ) : (
            <div className="space-y-2">
              {bookings.slice(0, 5).map((b) => (
                <div key={b._id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{b.packageTitle}</p>
                    <p className="truncate text-xs text-slate-400">{b.guest} · {b.seats} seat(s) · {b.departureDate ? formatDate(b.departureDate) : "—"}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-900">{formatPKR(b.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </TravelAgencyLayout>
  );
}
