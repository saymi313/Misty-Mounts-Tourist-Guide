import React, { useEffect, useState } from "react";
import { Banknote, Lock, Users, Percent } from "lucide-react";
import TravelAgencyLayout from "../TravelAgencyLayout";
import { Card, SectionHead, StatCard } from "../../components/dashboard/ui";
import BarChart from "../../components/dashboard/BarChart";
import { formatPKR } from "../../utils/currency";
import { getMyAnalytics } from "../../data/agencyApi";
import { LIVE } from "../../data/api";

const EMPTY = { kpis: {}, series: [], byStatus: {}, topPackages: [] };

export default function AgencyInsights() {
  const [a, setA] = useState(EMPTY);
  useEffect(() => { if (LIVE) getMyAnalytics().then(setA).catch(() => {}); }, []);
  const k = a.kpis || {};

  return (
    <TravelAgencyLayout greeting="Insights" subtitle="Your tours, seat utilization and revenue">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Banknote} tone="emerald" label={`Net revenue (after ${k.commissionPercent || 0}%)`} value={formatPKR(k.net || 0)} />
        <StatCard icon={Lock} tone="apricot" label="In escrow (held)" value={formatPKR(k.held || 0)} />
        <StatCard icon={Users} tone="sky" label="Seats sold" value={k.seatsSold || 0} />
        <StatCard icon={Percent} tone="violet" label="Seat fill rate" value={`${k.fillRate || 0}%`} />
      </div>

      <Card className="mt-6">
        <SectionHead title="Revenue — last 6 months" sub="Confirmed tour revenue by month" />
        <div className="mt-4">
          <BarChart data={(a.series || []).map((s) => ({ label: s.label, value: s.revenue }))} format={formatPKR} />
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHead title="Bookings — last 6 months" />
          <div className="mt-4">
            <BarChart data={(a.series || []).map((s) => ({ label: s.label, value: s.bookings }))} color="#2563eb" />
          </div>
        </Card>
        <Card>
          <SectionHead title="Top packages" sub="By confirmed revenue" />
          <div className="mt-4 space-y-2">
            {(a.topPackages || []).filter((p) => p.revenue > 0).length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No revenue yet — it'll appear here as tours are booked.</p>
            ) : (
              a.topPackages.filter((p) => p.revenue > 0).map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
                  <span className="truncate text-sm font-semibold text-slate-800">{p.name}</span>
                  <span className="shrink-0 text-sm font-bold text-lime-600">{formatPKR(p.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </TravelAgencyLayout>
  );
}
