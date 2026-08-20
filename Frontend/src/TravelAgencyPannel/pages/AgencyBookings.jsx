import React, { useState, useEffect } from "react";
import { CalendarCheck, Wallet, Users } from "lucide-react";
import TravelAgencyLayout from "../TravelAgencyLayout";
import { Card, SectionHead, StatCard, StatusPill } from "../../components/dashboard/ui";
import Pagination from "../../components/dashboard/Pagination";
import usePagination from "../../hooks/usePagination";
import { formatPKR } from "../../utils/currency";
import { formatDate } from "../../utils/datetime";
import { listMyTourBookings } from "../../data/agencyApi";
import { LIVE } from "../../data/api";

const payPill = (s) => {
  const st = s || "Pending";
  const cls = st === "Approved" ? "bg-lime-50 text-lime-600" : st === "Rejected" ? "bg-rose-50 text-rose-600" : "bg-apricot-50 text-apricot-600";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{st}</span>;
};

export default function AgencyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (LIVE) listMyTourBookings().then(setBookings).catch(() => {});
  }, []);

  // Only confirmed (Approved) bookings count toward earned revenue + seats sold.
  const confirmed = bookings.filter((b) => b.paymentStatus === "Approved" && b.status !== "Cancelled");
  const revenue = confirmed.reduce((s, b) => s + (b.amount || 0), 0);
  const seatsSold = confirmed.reduce((s, b) => s + (b.seats || 0), 0);
  const pg = usePagination(bookings, 10);

  return (
    <TravelAgencyLayout greeting="Bookings" subtitle="Reservations made on your tour packages">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarCheck} tone="emerald" label="Total bookings" value={bookings.length} />
        <StatCard icon={Users} tone="apricot" label="Seats sold" value={seatsSold} />
        <StatCard icon={Wallet} tone="sky" label="Confirmed revenue" value={formatPKR(revenue)} />
      </div>

      <Card className="mt-6">
        <SectionHead title="All bookings" sub={`${bookings.length} reservation${bookings.length !== 1 ? "s" : ""}`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3">Traveller</th>
                <th className="px-3 py-3">Package</th>
                <th className="px-3 py-3">Departure</th>
                <th className="px-3 py-3">Seats</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {pg.pageItems.map((b) => (
                <tr key={b._id} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <p className="text-sm font-semibold text-slate-900">{b.guest}</p>
                    <p className="text-xs text-slate-400">Ref {b.ref}</p>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">{b.packageTitle}</td>
                  <td className="px-3 py-3 text-sm text-slate-500">{b.departureDate ? formatDate(b.departureDate) : "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-500">{b.seats}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-slate-900">{formatPKR(b.amount)}</td>
                  <td className="px-3 py-3">{payPill(b.paymentStatus)}</td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-400">No bookings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pg.page} pageCount={pg.pageCount} setPage={pg.setPage} />
      </Card>
    </TravelAgencyLayout>
  );
}
