import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BedDouble, Clock, Wallet, Plus } from "lucide-react";
import HotelLayout from "../HotelLayout";
import { Card, SectionHead, StatCard, StatusPill, Btn, BtnGhost, ListRow } from "../../components/dashboard/ui";
import { Stagger, Reveal } from "../../components/dashboard/motion";
import { formatPKR } from "../../utils/currency";
import { useAuth } from "../../context/AuthContext";
import { listMyAccommodations, listMyBookings } from "../../data/hotelApi";
import { LIVE } from "../../data/api";

export default function HotelDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const first = (user?.hotelName || user?.name || "there").split(" ")[0];
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!LIVE) return;
    listMyAccommodations().then(setListings).catch(() => {});
    listMyBookings().then(setBookings).catch(() => {});
  }, []);

  const pending = listings.filter((l) => l.isApproved === false).length;
  const revenue = bookings.reduce((s, b) => s + (b.amount || 0), 0);

  return (
    <HotelLayout greeting={`Hello, ${first}`} subtitle="Here's how your listings are doing" rightRail>
      <Stagger className="space-y-6">
        <Reveal>
          <div className="grid gap-4 lg:grid-cols-3">
            <StatCard featured tone="emerald" label="Total bookings" count={bookings.length} spark={[3, 5, 4, 7, 6, 9, 11]} />
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
              <StatCard icon={BedDouble} tone="apricot" label="Listings" count={listings.length} />
              <StatCard icon={Clock} tone="rose" label="Pending review" count={pending} />
              <StatCard icon={Wallet} tone="violet" label="Revenue" value={formatPKR(revenue)} />
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <SectionHead
                title="Your listings"
                sub={`${listings.length} total`}
                action={<Btn onClick={() => navigate("/hotel/listings")}><Plus className="h-4 w-4" /> Add listing</Btn>}
              />
              {listings.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No listings yet — add your first one.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {listings.slice(0, 5).map((l) => (
                    <ListRow
                      key={l._id}
                      image={l.picture}
                      title={l.name}
                      location={l.location || l.city}
                      onClick={() => navigate("/hotel/listings")}
                      right={
                        <span className="text-right">
                          <span className="block font-display text-base font-bold text-slate-900">{formatPKR(l.price)}</span>
                          <span className="text-xs text-slate-400">{l.isApproved === false ? "Pending" : "Approved"}</span>
                        </span>
                      }
                    />
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <SectionHead title="Recent bookings" action={<BtnGhost onClick={() => navigate("/hotel/bookings")}>All</BtnGhost>} />
              {bookings.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((b) => (
                    <div key={b._id} className="rounded-2xl border border-slate-100 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{b.guest}</span>
                        <StatusPill status={b.status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{b.hotel} · {b.nights} night{b.nights !== 1 ? "s" : ""} · {formatPKR(b.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </Reveal>
      </Stagger>
    </HotelLayout>
  );
}
