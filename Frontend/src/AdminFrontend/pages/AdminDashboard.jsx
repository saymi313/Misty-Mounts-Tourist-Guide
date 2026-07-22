import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Map as MapIcon, BedDouble, SlidersHorizontal, ArrowUpRight, Mountain } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard, DestinationCard, ListRow, BtnGhost, Contour } from "../../components/dashboard/ui";
import { Stagger, Reveal } from "../../components/dashboard/motion";
import { img } from "../../data/mockData";
import { formatPKR, PKR_PREFIX } from "../../utils/currency";
import { LIVE, listPlaces, listAccommodations, listPayments } from "../../data/adminApi";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [accs, setAccs] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!LIVE) return;
    listPlaces().then(setPlaces).catch(() => {});
    listAccommodations().then(setAccs).catch(() => {});
    listPayments().then(setBookings).catch(() => {});
  }, []);

  const revenue = bookings.reduce((s, b) => s + (b.amount || 0), 0);
  const featured = places.slice(0, 3);
  const best = accs.slice(0, 5);
  const trend = [14, 19, 16, 24, 21, 28, 34];

  return (
    <AdminLayout greeting="Hello, Saymi" subtitle="Welcome back and explore the world" rightRail>
      <Stagger className="space-y-6">
        {/* Stats — one featured metric + three supporting (not four clones) */}
        <Reveal>
          <div className="grid gap-4 lg:grid-cols-3">
            <StatCard featured tone="emerald" label="Total revenue" count={revenue} prefix={PKR_PREFIX} delta="+12%" spark={trend} />
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
              <StatCard icon={CalendarCheck} tone="apricot" label="Bookings" count={bookings.length} delta="+4" />
              <StatCard icon={MapIcon} tone="emerald" label="Tourist spots" count={places.length} />
              <StatCard icon={BedDouble} tone="violet" label="Stays & food" count={accs.length} />
            </div>
          </div>
        </Reveal>

        {/* Featured valleys */}
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <DestinationCard key={p._id} image={p.picture} title={p.name} location={p.city} rating={4.8} onClick={() => navigate("/admin/tourist-spots")} />
            ))}
          </div>
        </Reveal>

        {/* Best stays + explore */}
        <Reveal>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <SectionHead
                title="Top-booked stays"
                sub={`${accs.length} places across 6 valleys`}
                action={<BtnGhost><SlidersHorizontal className="h-4 w-4" /> Filters</BtnGhost>}
              />
              <div className="divide-y divide-slate-100">
                {best.map((a) => (
                  <ListRow
                    key={a._id}
                    image={a.picture}
                    title={a.name}
                    location={a.location}
                    rating={a.rating}
                    onClick={() => navigate("/admin/accommodation")}
                    hoverMeta={<><span className="text-apricot-600">●</span> {a.reviews} reviews</>}
                    right={
                      <span className="text-right">
                        <span className="block font-display text-base font-bold text-slate-900">{formatPKR(a.price)}</span>
                        <span className="text-xs text-slate-400">/ night</span>
                      </span>
                    }
                  />
                ))}
              </div>
            </Card>

            {/* Explore card — real photography, no blob */}
            <div className="relative flex flex-col overflow-hidden rounded-[1.75rem] text-white">
              <img src={img("skardu-hero", 700, 900)} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-lime-950 via-lime-950/70 to-lime-900/30" />
              <Contour className="pointer-events-none absolute inset-x-0 top-0 h-40 w-full text-white" opacity={0.14} />
              <div className="relative mt-auto p-6">
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                  <Mountain className="h-3.5 w-3.5 text-apricot-300" /> Platform pulse
                </span>
                <h3 className="font-display text-2xl font-bold leading-tight">Explore the beauty you manage</h3>
                <p className="mt-2 text-sm text-white/75">Revenue, approvals and guide activity — all in one report.</p>
                <button
                  onClick={() => navigate("/admin/payments")}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-apricot-400 px-5 py-3 text-sm font-bold text-lime-950 transition-colors hover:bg-apricot-300"
                >
                  View reports <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </Stagger>
    </AdminLayout>
  );
};

export default AdminDashboard;
