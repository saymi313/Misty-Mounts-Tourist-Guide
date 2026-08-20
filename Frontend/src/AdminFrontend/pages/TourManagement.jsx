import React, { useState, useEffect } from "react";
import { Package, Clock, CheckCircle2, Check, Trash2, MapPin, Users, CalendarDays } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard, StatusPill } from "../../components/dashboard/ui";
import Pagination from "../../components/dashboard/Pagination";
import usePagination from "../../hooks/usePagination";
import { LIVE, listAdminTours, approveTour, deleteTour, getSettings, updateSettings } from "../../data/adminApi";
import { formatPKR } from "../../utils/currency";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";

export default function TourManagement() {
  const [tours, setTours] = useState([]);
  const [filter, setFilter] = useState("all"); // all | pending
  const [autoApprove, setAutoApprove] = useState(false);

  useEffect(() => {
    if (!LIVE) return;
    listAdminTours().then(setTours).catch(() => {});
    getSettings().then((s) => setAutoApprove(!!s.autoApprovePackages)).catch(() => {});
  }, []);

  const pending = tours.filter((t) => t.isApproved === false).length;
  const published = tours.filter((t) => t.isApproved !== false && t.isPublished !== false).length;
  const shown = filter === "pending" ? tours.filter((t) => t.isApproved === false) : tours;
  const pg = usePagination(shown, 8);

  const toggleAutoApprove = async () => {
    const next = !autoApprove;
    setAutoApprove(next);
    try { await updateSettings({ autoApprovePackages: next }); toast.success(next ? "New packages auto-approve now." : "New packages need review now."); }
    catch { setAutoApprove(!next); toast.error("Couldn't update the setting."); }
  };

  const handleApprove = async (t) => {
    try {
      await approveTour(t._id, true);
      setTours((prev) => prev.map((x) => (x._id === t._id ? { ...x, isApproved: true } : x)));
      toast.success(`"${t.title}" approved and now visible to travellers.`);
    } catch { toast.error("Couldn't approve this package."); }
  };

  const handleDelete = async (t) => {
    const ok = await confirmDialog({ title: "Delete package?", body: `"${t.title}" will be removed permanently.`, confirmLabel: "Delete" });
    if (!ok) return;
    try {
      await deleteTour(t._id);
      setTours((prev) => prev.filter((x) => x._id !== t._id));
      toast.success(`"${t.title}" deleted.`);
    } catch { toast.error("Couldn't delete this package."); }
  };

  return (
    <AdminLayout greeting="Tour Packages" subtitle="Review and approve travel-agency tours">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Package} tone="emerald" label="Total packages" value={tours.length} />
        <StatCard icon={Clock} tone="apricot" label="Pending review" value={pending} />
        <StatCard icon={CheckCircle2} tone="sky" label="Live" value={published} />
      </div>

      <Card className="mt-6">
        <SectionHead
          title="All packages"
          sub={`${shown.length} shown`}
          action={
            <button
              type="button"
              role="switch"
              aria-checked={autoApprove}
              onClick={toggleAutoApprove}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${autoApprove ? "bg-lime-400 text-night-950" : "bg-slate-100 text-slate-500"}`}
            >
              <span className={`flex h-4 w-7 items-center rounded-full p-0.5 transition-colors ${autoApprove ? "bg-night-950/20" : "bg-slate-300"}`}>
                <span className={`h-3 w-3 rounded-full bg-white transition-transform ${autoApprove ? "translate-x-3" : ""}`} />
              </span>
              Auto-approve new packages
            </button>
          }
        />

        <div className="mb-4 flex gap-2">
          {["all", "pending"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${filter === f ? "bg-lime-400 text-night-950" : "bg-slate-100 text-slate-500 hover:text-lime-700"}`}>
              {f === "all" ? "All" : "Pending"} <span className="opacity-70">{f === "all" ? tours.length : pending}</span>
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">No packages{filter === "pending" ? " pending review" : " yet"}.</p>
        ) : (
          <div className="space-y-3">
            {pg.pageItems.map((t) => {
              const departures = (t.departures || []).length;
              return (
                <div key={t._id} className={`flex items-start gap-4 rounded-2xl border p-4 ${t.isApproved === false ? "border-apricot-200 bg-apricot-50/40" : "border-slate-100"}`}>
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {t.coverImage ? <img loading="lazy" decoding="async" src={t.coverImage} alt={t.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-slate-300"><Package className="h-6 w-6" /></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-slate-900">{t.title}</p>
                      <StatusPill status={t.isApproved === false ? "Pending" : "Approved"} />
                      {t.agencyApproved === false && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">agency unapproved</span>}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {t.agencyName || "—"}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {(t.cities || []).join(", ") || "—"}</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {departures} departure{departures !== 1 ? "s" : ""}</span>
                      <span className="font-semibold text-slate-500">{formatPKR(t.pricePerPerson)}/person</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {t.isApproved === false && (
                      <button onClick={() => handleApprove(t)} className="inline-flex items-center gap-1 rounded-lg bg-lime-400 px-3 py-2 text-xs font-bold text-night-950 transition-colors hover:bg-lime-300">
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                    )}
                    <button onClick={() => handleDelete(t)} title="Delete" className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Pagination page={pg.page} pageCount={pg.pageCount} setPage={pg.setPage} />
      </Card>
    </AdminLayout>
  );
}
