import React, { useState, useEffect } from "react";
import { CalendarCheck, Wallet, Clock } from "lucide-react";
import HotelLayout from "../HotelLayout";
import { Card, SectionHead, StatCard, StatusPill } from "../../components/dashboard/ui";
import { formatPKR } from "../../utils/currency";
import { formatDate } from "../../utils/datetime";
import { listMyBookings } from "../../data/hotelApi";
import { LIVE } from "../../data/api";

export default function HotelBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (LIVE) listMyBookings().then(setBookings).catch(() => {});
  }, []);

  const revenue = bookings.reduce((s, b) => s + (b.amount || 0), 0);
  const upcoming = bookings.filter((b) => b.status === "Upcoming").length;

  return (
    <HotelLayout greeting="Bookings" subtitle="Reservations made for your listings">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarCheck} tone="emerald" label="Total bookings" value={bookings.length} />
        <StatCard icon={Clock} tone="apricot" label="Upcoming" value={upcoming} />
        <StatCard icon={Wallet} tone="sky" label="Revenue" value={formatPKR(revenue)} />
      </div>

      <Card className="mt-6">
        <SectionHead title="All bookings" sub={`${bookings.length} reservation${bookings.length !== 1 ? "s" : ""}`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3">Guest</th>
                <th className="px-3 py-3">Listing</th>
                <th className="px-3 py-3">Check-in</th>
                <th className="px-3 py-3">Nights</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <p className="text-sm font-semibold text-slate-900">{b.guest}</p>
                    <p className="text-xs text-slate-400">Ref {b.ref}</p>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">{b.hotel}</td>
                  <td className="px-3 py-3 text-sm text-slate-500">{b.checkIn ? formatDate(b.checkIn) : "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-500">{b.nights}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-slate-900">{formatPKR(b.amount)}</td>
                  <td className="px-3 py-3"><StatusPill status={b.status} /></td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-400">No bookings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </HotelLayout>
  );
}
