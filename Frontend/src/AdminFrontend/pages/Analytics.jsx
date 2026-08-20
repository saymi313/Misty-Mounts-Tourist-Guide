import React, { useEffect, useState } from "react";
import { Banknote, CalendarCheck, Users, Map as MapIcon, TrendingUp, MapPin, PieChart } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard } from "../../components/dashboard/ui";
import { Stagger, Reveal } from "../../components/dashboard/motion";
import { PKR_PREFIX, formatPKR } from "../../utils/currency";
import { getAdminAnalytics, LIVE } from "../../data/adminApi";

// Validated categorical pair (light mode / white surface): hotels vs tours.
const C_HOTEL = "#65a30d";
const C_TOUR = "#2563eb";
const STATUS = {
  Completed: { c: "#059669", label: "Completed" },
  Upcoming: { c: "#d97706", label: "Upcoming" },
  Cancelled: { c: "#dc2626", label: "Cancelled" },
};

const short = (n) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return `${n}`;
};

// Monthly stacked bars — hotels + tours, same PKR axis (never dual-axis).
const RevenueChart = ({ series }) => {
  const W = 640, H = 260, padX = 34, padTop = 24, padBottom = 34;
  const chartH = H - padTop - padBottom;
  const max = Math.max(1, ...series.map((s) => s.revenue));
  const step = (W - padX * 2) / series.length;
  const bw = Math.min(46, step * 0.5);
  const y = (v) => padTop + chartH - (v / max) * chartH;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px]" role="img" aria-label="Monthly revenue by category">
        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={padX} x2={W - padX} y1={padTop + chartH * t} y2={padTop + chartH * t} stroke="#eef2f0" strokeWidth="1" />
            <text x={padX - 6} y={padTop + chartH * t + 3} textAnchor="end" fontSize="9" fill="#94a3b8">{short(max * (1 - t))}</text>
          </g>
        ))}
        {series.map((s, i) => {
          const cx = padX + step * i + step / 2;
          const x = cx - bw / 2;
          const hH = (s.hotelRevenue / max) * chartH;
          const tH = (s.tourRevenue / max) * chartH;
          const gap = s.tourRevenue > 0 && s.hotelRevenue > 0 ? 2 : 0;
          const hotelY = padTop + chartH - hH;
          const tourY = hotelY - gap - tH;
          return (
            <g key={s.label}>
              {s.hotelRevenue > 0 && (
                <rect x={x} y={hotelY} width={bw} height={hH} rx="3" fill={C_HOTEL}>
                  <title>{s.label} · Hotels: {formatPKR(s.hotelRevenue)}</title>
                </rect>
              )}
              {s.tourRevenue > 0 && (
                <rect x={x} y={tourY} width={bw} height={tH} rx="3" fill={C_TOUR}>
                  <title>{s.label} · Tours: {formatPKR(s.tourRevenue)}</title>
                </rect>
              )}
              {s.revenue > 0 && (
                <text x={cx} y={y(s.revenue) - 7} textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">{short(s.revenue)}</text>
              )}
              <text x={cx} y={H - 14} textAnchor="middle" fontSize="11" fill="#64748b">{s.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center gap-4 pl-8 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: C_HOTEL }} /> Hotels</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: C_TOUR }} /> Tours</span>
      </div>
    </div>
  );
};

// Horizontal magnitude bars (single hue).
const HBars = ({ rows, color = "#65a30d", suffix = "" }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-2.5">
      {rows.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-sm text-slate-600" title={r.label}>{r.label}</span>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${Math.max(4, (r.value / max) * 100)}%`, background: r.color || color }} />
          </div>
          <span className="w-12 shrink-0 text-right text-sm font-bold text-slate-700">{r.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
};

// Monthly sign-ups — demand (travellers) vs supply (providers), same axis.
const SignupsChart = ({ rows }) => {
  const W = 640, H = 220, padX = 34, padTop = 18, padBottom = 30;
  const chartH = H - padTop - padBottom;
  const max = Math.max(1, ...rows.map((r) => r.travellers + r.providers));
  const step = (W - padX * 2) / rows.length;
  const bw = Math.min(40, step * 0.5);
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px]" role="img" aria-label="Monthly sign-ups">
        {[0, 0.5, 1].map((tk) => (
          <g key={tk}>
            <line x1={padX} x2={W - padX} y1={padTop + chartH * tk} y2={padTop + chartH * tk} stroke="#eef2f0" strokeWidth="1" />
            <text x={padX - 6} y={padTop + chartH * tk + 3} textAnchor="end" fontSize="9" fill="#94a3b8">{Math.round(max * (1 - tk))}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const cx = padX + step * i + step / 2;
          const x = cx - bw / 2;
          const tH = (r.travellers / max) * chartH;
          const pH = (r.providers / max) * chartH;
          const gap = r.travellers > 0 && r.providers > 0 ? 2 : 0;
          const tY = padTop + chartH - tH;
          const pY = tY - gap - pH;
          return (
            <g key={r.label}>
              {r.travellers > 0 && <rect x={x} y={tY} width={bw} height={tH} rx="3" fill="#65a30d"><title>{r.label} · Travellers: {r.travellers}</title></rect>}
              {r.providers > 0 && <rect x={x} y={pY} width={bw} height={pH} rx="3" fill="#2563eb"><title>{r.label} · Providers: {r.providers}</title></rect>}
              <text x={cx} y={H - 12} textAnchor="middle" fontSize="11" fill="#64748b">{r.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center gap-4 pl-8 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#65a30d" }} /> Travellers</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#2563eb" }} /> Providers</span>
      </div>
    </div>
  );
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!LIVE) return;
    getAdminAnalytics().then(setData).catch(() => setErr(true));
  }, []);

  const t = data?.totals || { revenue: 0, bookings: 0, users: 0, spots: 0 };
  const series = data?.series || [];
  const cities = (data?.topCities || []).map((c) => ({ label: c.city, value: c.n }));
  const usersByType = data?.usersByType || {};
  const userRows = [
    { label: "Travellers", value: usersByType.user || 0 },
    { label: "Local guides", value: usersByType["local guide"] || 0 },
    { label: "Hotels", value: usersByType.hotel || 0 },
    { label: "Travel agencies", value: usersByType["travel agency"] || 0 },
  ];
  const status = data?.bookingsByStatus || {};
  const spark = series.map((s) => s.revenue);

  const kpis = data?.kpis || {};
  const signups = data?.signups || [];
  const KPI = [
    { label: "GMV (approved)", value: formatPKR(kpis.gmv || 0) },
    { label: "Take rate", value: `${kpis.takeRatePct || 0}%` },
    { label: "Net revenue", value: formatPKR(kpis.netRevenue || 0) },
    { label: "Avg order value", value: formatPKR(kpis.aov || 0) },
    { label: "Repeat rate", value: `${kpis.repeatRate || 0}%`, sub: `${kpis.repeatCustomers || 0} of ${kpis.customers || 0} customers` },
    { label: "Waitlist", value: String(kpis.waitlist || 0), sub: "email signups" },
  ];

  return (
    <AdminLayout greeting="Analytics" subtitle="Bookings, revenue & growth at a glance">
      <Stagger className="space-y-6">
        {err && <Card><p className="text-sm text-rose-500">Couldn't load analytics. Is the backend running?</p></Card>}

        {/* Totals */}
        <Reveal>
          <div className="grid gap-4 lg:grid-cols-3">
            <StatCard featured tone="emerald" label="Approved revenue" count={t.revenue} prefix={PKR_PREFIX} spark={spark.length ? spark : undefined} />
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
              <StatCard icon={CalendarCheck} tone="apricot" label="Bookings" count={t.bookings} />
              <StatCard icon={Users} tone="violet" label="Users" count={t.users} />
              <StatCard icon={MapIcon} tone="emerald" label="Spots" count={t.spots} />
            </div>
          </div>
        </Reveal>

        {/* Marketplace KPIs */}
        <Reveal>
          <Card>
            <SectionHead title="Marketplace KPIs" sub="The metrics investors ask for." />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {KPI.map((k) => (
                <div key={k.label} className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{k.label}</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">{k.value}</p>
                  {k.sub && <p className="mt-0.5 text-[11px] text-slate-400">{k.sub}</p>}
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        {/* Revenue trend */}
        <Reveal>
          <Card>
            <SectionHead title="Revenue — last 6 months" sub="Approved bookings, hotels vs tours" />
            <div className="mt-4">
              {series.some((s) => s.revenue > 0) ? <RevenueChart series={series} /> : <p className="py-10 text-center text-sm text-slate-400">No approved revenue in this window yet.</p>}
            </div>
          </Card>
        </Reveal>

        {/* Sign-ups (supply + demand growth) */}
        <Reveal>
          <Card>
            <SectionHead title="New sign-ups — last 6 months" sub="Demand (travellers) vs supply (providers)" />
            <div className="mt-4">
              {signups.some((s) => s.travellers + s.providers > 0) ? <SignupsChart rows={signups} /> : <p className="py-10 text-center text-sm text-slate-400">No sign-ups in this window yet.</p>}
            </div>
          </Card>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top cities */}
          <Reveal>
            <Card>
              <SectionHead title="Top destinations" sub="By approved bookings" />
              <div className="mt-4"><HBars rows={cities} /></div>
            </Card>
          </Reveal>

          {/* Bookings by status + users */}
          <Reveal>
            <Card>
              <SectionHead title="Bookings by status" />
              <div className="mt-4 space-y-3">
                {Object.keys(STATUS).map((k) => {
                  const total = Object.values(status).reduce((a, b) => a + b, 0) || 1;
                  const n = status[k] || 0;
                  return (
                    <div key={k} className="flex items-center gap-3">
                      <span className="flex w-28 shrink-0 items-center gap-2 text-sm text-slate-600">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS[k].c }} /> {STATUS[k].label}
                      </span>
                      <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${Math.max(2, (n / total) * 100)}%`, background: STATUS[k].c }} />
                      </div>
                      <span className="w-10 shrink-0 text-right text-sm font-bold text-slate-700">{n}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <SectionHead title="Users by role" />
                <div className="mt-3"><HBars rows={userRows} color="#0891b2" /></div>
              </div>
            </Card>
          </Reveal>
        </div>
      </Stagger>
    </AdminLayout>
  );
};

export default Analytics;
