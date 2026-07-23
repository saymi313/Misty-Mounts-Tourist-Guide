import React, { useState, useEffect } from "react";
import { Mail, MailOpen, Trash2, MessageSquare, Check } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard } from "../../components/dashboard/ui";
import { LIVE } from "../../data/adminApi";
import { listQueries, markQueryRead, deleteQuery } from "../../data/queriesApi";
import { formatDate } from "../../utils/datetime";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";

export default function Queries() {
  const [queries, setQueries] = useState([]);
  const [filter, setFilter] = useState("all"); // all | unread

  useEffect(() => {
    if (LIVE) listQueries().then(setQueries).catch(() => {});
  }, []);

  const unread = queries.filter((q) => !q.isRead).length;
  const shown = filter === "unread" ? queries.filter((q) => !q.isRead) : queries;

  const toggleRead = async (q) => {
    const next = !q.isRead;
    setQueries((prev) => prev.map((x) => (x._id === q._id ? { ...x, isRead: next } : x)));
    try { await markQueryRead(q._id, next); } catch { toast.error("Couldn't update this query."); }
  };

  const remove = async (q) => {
    const ok = await confirmDialog({
      title: "Delete query?",
      body: `The message from ${q.name} will be removed.`,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try {
      await deleteQuery(q._id);
      setQueries((prev) => prev.filter((x) => x._id !== q._id));
      toast.success("Query deleted.");
    } catch {
      toast.error("Couldn't delete this query.");
    }
  };

  return (
    <AdminLayout greeting="Queries" subtitle="Messages from the contact page">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={MessageSquare} tone="emerald" label="Total queries" value={queries.length} />
        <StatCard icon={Mail} tone="apricot" label="Unread" value={unread} />
        <StatCard icon={MailOpen} tone="sky" label="Read" value={queries.length - unread} />
      </div>

      <Card className="mt-6">
        <SectionHead title="Contact messages" sub={`${shown.length} shown`} />
        <div className="mb-4 flex gap-2">
          {["all", "unread"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${filter === f ? "bg-lime-400 text-night-950" : "bg-slate-100 text-slate-500 hover:text-lime-700"}`}
            >
              {f === "all" ? "All" : "Unread"} <span className="opacity-70">{f === "all" ? queries.length : unread}</span>
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">No queries{filter === "unread" ? " unread" : " yet"}.</p>
        ) : (
          <div className="space-y-3">
            {shown.map((q) => (
              <div key={q._id} className={`rounded-2xl border p-4 ${q.isRead ? "border-slate-100" : "border-lime-300 bg-lime-50/50"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {!q.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-lime-500" />}
                      <p className="truncate text-sm font-bold text-slate-900">{q.name}</p>
                      <a href={`mailto:${q.email}`} className="truncate text-xs font-medium text-lime-600 hover:underline">{q.email}</a>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{q.message}</p>
                    <p className="mt-2 text-xs text-slate-400">{q.createdAt ? formatDate(q.createdAt) : ""}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => toggleRead(q)}
                      title={q.isRead ? "Mark unread" : "Mark read"}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-lime-600 transition-colors hover:bg-lime-50"
                    >
                      {q.isRead ? <Mail className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => remove(q)}
                      title="Delete"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
