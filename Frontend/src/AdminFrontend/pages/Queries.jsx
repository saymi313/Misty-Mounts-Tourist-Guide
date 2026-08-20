import React, { useState, useEffect } from "react";
import { Mail, MailOpen, Trash2, MessageSquare, Check, Reply, Send, CornerDownRight } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard, Btn, BtnGhost, adminInputCls } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import Pagination from "../../components/dashboard/Pagination";
import usePagination from "../../hooks/usePagination";
import { LIVE } from "../../data/adminApi";
import { listQueries, markQueryRead, replyToQuery, deleteQuery } from "../../data/queriesApi";
import { formatDate } from "../../utils/datetime";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";

export default function Queries() {
  const [queries, setQueries] = useState([]);
  const [filter, setFilter] = useState("all"); // all | unread
  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  useEffect(() => {
    if (LIVE) listQueries().then(setQueries).catch(() => {});
  }, []);

  const unread = queries.filter((q) => !q.isRead).length;
  const shown = filter === "unread" ? queries.filter((q) => !q.isRead) : queries;
  const pg = usePagination(shown, 8);

  const toggleRead = async (q) => {
    const next = !q.isRead;
    setQueries((prev) => prev.map((x) => (x._id === q._id ? { ...x, isRead: next } : x)));
    try { await markQueryRead(q._id, next); } catch { toast.error("Couldn't update this query."); }
  };

  const openReply = (q) => {
    setReplyFor(q);
    setReplyText("");
  };

  const closeReply = () => {
    if (replySending) return;
    setReplyFor(null);
    setReplyText("");
  };

  const sendReply = async (e) => {
    e.preventDefault();
    const msg = replyText.trim();
    if (!msg) return;
    setReplySending(true);
    try {
      const updated = await replyToQuery(replyFor._id, msg);
      setQueries((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
      toast.success(`Reply sent to ${replyFor.email}.`);
      setReplyFor(null);
      setReplyText("");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Couldn't send the reply.");
    } finally {
      setReplySending(false);
    }
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

  const iconBtn = "flex h-8 w-8 items-center justify-center rounded-lg transition-colors";

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
            {pg.pageItems.map((q) => (
              <div key={q._id} className={`rounded-2xl border p-4 ${q.isRead ? "border-slate-100 bg-slate-50/60" : "border-lime-300 bg-lime-50"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {!q.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-lime-500" />}
                      <p className="truncate text-sm font-bold text-slate-900">{q.name}</p>
                      <a href={`mailto:${q.email}`} className="truncate text-xs font-medium text-lime-600 hover:underline">{q.email}</a>
                      {q.replies?.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-lime-100 px-2.5 py-0.5 text-[11px] font-semibold text-lime-700">
                          <CornerDownRight className="h-3 w-3" /> Replied{q.replies.length > 1 ? ` ×${q.replies.length}` : ""}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{q.message}</p>
                    <p className="mt-2 text-xs text-slate-400">{q.createdAt ? formatDate(q.createdAt) : ""}</p>

                    {q.replies?.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                        {q.replies.map((r, i) => (
                          <div key={i} className="rounded-xl bg-lime-50 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-lime-600">
                              Your reply{r.sentAt ? ` · ${formatDate(r.sentAt)}` : ""}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{r.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => openReply(q)}
                      title="Reply by email"
                      className={`${iconBtn} text-lime-600 hover:bg-lime-50`}
                    >
                      <Reply className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleRead(q)}
                      title={q.isRead ? "Mark unread" : "Mark read"}
                      className={`${iconBtn} text-slate-500 hover:bg-slate-100`}
                    >
                      {q.isRead ? <Mail className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => remove(q)}
                      title="Delete"
                      className={`${iconBtn} text-rose-500 hover:bg-rose-50`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination page={pg.page} pageCount={pg.pageCount} setPage={pg.setPage} />
      </Card>

      <Modal
        open={!!replyFor}
        onClose={closeReply}
        title="Reply to query"
        subtitle={replyFor ? `${replyFor.name} · ${replyFor.email}` : ""}
        icon={Reply}
        onSubmit={sendReply}
        footer={
          <>
            <BtnGhost type="button" onClick={closeReply} disabled={replySending}>Cancel</BtnGhost>
            <Btn type="submit" disabled={replySending || !replyText.trim()}>
              {replySending ? "Sending…" : (<>Send reply <Send className="h-4 w-4" /></>)}
            </Btn>
          </>
        }
      >
        {replyFor && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Original message</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{replyFor.message}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Your reply</label>
              <textarea
                autoFocus
                rows={6}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Hi ${replyFor.name?.split(" ")[0] || "there"}, thanks for reaching out…`}
                className={adminInputCls}
              />
              <p className="mt-1.5 text-xs text-slate-400">
                This will be emailed to <span className="font-medium text-slate-500">{replyFor.email}</span> from Misty Mounts.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
