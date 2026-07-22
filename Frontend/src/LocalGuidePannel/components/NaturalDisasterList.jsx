import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Plus, Pencil, Trash2, AlertTriangle, ShieldCheck } from "lucide-react";
import GuideLayout from "../GuideLayout";
import { Card, SectionHead, StatCard, StatusPill, Btn } from "../../components/dashboard/ui";
import { disasters as seedDisasters } from "../../data/mockData";
import { LIVE, listDisasters, deleteDisaster } from "../../data/adminApi";

const severityCls = {
  High: "bg-rose-50 text-rose-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-emerald-50 text-emerald-600",
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

/** Local Guide — safety alerts / natural-disaster reports. */
export default function NaturalDisasterList() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(seedDisasters);

  useEffect(() => {
    if (LIVE) listDisasters().then(setAlerts).catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    if (LIVE) {
      try { await deleteDisaster(id); } catch { return; }
    }
    setAlerts((prev) => prev.filter((a) => a._id !== id));
  };

  const active = alerts.filter((a) => !a.isResolved).length;
  const highSeverity = alerts.filter((a) => a.severity === "High").length;

  return (
    <GuideLayout
      greeting="Safety alerts"
      subtitle="Keep travellers informed about conditions on the ground."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={AlertTriangle} label="Active alerts" value={active} tone="rose" />
          <StatCard icon={ShieldCheck} label="Total reports" value={alerts.length} tone="emerald" />
          <StatCard icon={AlertTriangle} label="High severity" value={highSeverity} tone="amber" />
        </div>

        <Card>
          <SectionHead
            title="Posted alerts"
            sub={`${alerts.length} reports in your area`}
            action={
              <Btn onClick={() => navigate("/local-guide/add-natural-disaster")}>
                <Plus className="h-4 w-4" /> New alert
              </Btn>
            }
          />

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <p className="mt-4 text-sm font-semibold text-slate-900">All clear</p>
              <p className="mt-1 text-sm text-slate-400">No active alerts right now.</p>
              <Btn className="mt-5" onClick={() => navigate("/local-guide/add-natural-disaster")}>
                <Plus className="h-4 w-4" /> New alert
              </Btn>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className="rounded-3xl border border-slate-100 p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            severityCls[alert.severity] || "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <StatusPill status={alert.isResolved ? "Resolved" : "Active"} />
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-slate-900">{alert.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {alert.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {fmtDate(alert.date)}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => navigate(`/local-guide/edit-natural-disaster/${alert._id}`)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-emerald-600 transition-colors hover:bg-emerald-50"
                        aria-label={`Edit ${alert.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(alert._id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-rose-500 transition-colors hover:bg-rose-50"
                        aria-label={`Delete ${alert.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{alert.description}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </GuideLayout>
  );
}
