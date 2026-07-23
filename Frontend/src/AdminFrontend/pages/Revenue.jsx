import React, { useState, useEffect } from "react";
import { Wallet, Clock, Banknote, TrendingUp, Eye, Check, X, Send, Landmark } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard, StatusPill, Btn, BtnGhost, Field, adminInputCls } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import { formatPKR } from "../../utils/currency";
import { formatDate } from "../../utils/datetime";
import { LIVE, getSettings, listUsers } from "../../data/adminApi";
import { listPayments, verifyPayment, listPayouts, verifyPayout, creditGuide } from "../../data/revenueApi";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";

export default function Revenue() {
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [commission, setCommission] = useState(15);
  const [recipients, setRecipients] = useState([]);
  const [viewing, setViewing] = useState(null); // payment proof modal
  const [creditOpen, setCreditOpen] = useState(false);
  const [creditForm, setCreditForm] = useState({ guideId: "", amount: "", note: "" });
  const [creditErr, setCreditErr] = useState("");

  const guides = recipients.filter((r) => r.type === "local guide");

  const load = () => {
    listPayments().then(setPayments).catch(() => {});
    listPayouts().then(setPayouts).catch(() => {});
  };

  useEffect(() => {
    if (!LIVE) return;
    load();
    getSettings().then((s) => setCommission(s.commissionPercent ?? 15)).catch(() => {});
    listUsers().then((u) => setRecipients(u.filter((x) => x.type === "hotel" || x.type === "local guide"))).catch(() => {});
  }, []);

  const collected = payments.filter((p) => p.paymentStatus === "Approved").reduce((s, p) => s + (p.amount || 0), 0);
  const pending = payments.filter((p) => p.paymentStatus === "Pending");
  const statusOf = (p) => p.status || "Approved"; // legacy payouts had no status
  const paidOut = payouts.filter((p) => statusOf(p) === "Approved").reduce((s, p) => s + (p.amount || 0), 0);
  const pendingRequests = payouts.filter((p) => statusOf(p) === "Requested");
  const retained = collected - paidOut;

  const handleVerifyPayout = async (payout, approved) => {
    if (!approved) {
      const ok = await confirmDialog({
        title: "Reject payout request?",
        body: `${payout.recipientName}'s request for ${formatPKR(payout.amount)} will be declined.`,
        confirmLabel: "Reject",
      });
      if (!ok) return;
    }
    try {
      const updated = await verifyPayout(payout._id, approved);
      setPayouts((prev) => prev.map((p) => (p._id === payout._id ? { ...p, status: updated?.status || (approved ? "Approved" : "Rejected") } : p)));
      toast.success(approved ? "Payout approved." : "Payout request rejected.");
    } catch {
      toast.error("Couldn't update this request. Please try again.");
    }
  };

  const handleVerify = async (payment, approved) => {
    if (!approved) {
      const ok = await confirmDialog({
        title: "Reject this payment?",
        body: `${payment.guest}'s booking (ref ${payment.ref}) will be cancelled and they'll be notified.`,
        confirmLabel: "Reject",
      });
      if (!ok) return;
    }
    try {
      const updated = await verifyPayment(payment._id, approved);
      setPayments((prev) => prev.map((p) => (p._id === payment._id ? { ...p, paymentStatus: updated?.paymentStatus || (approved ? "Approved" : "Rejected"), status: updated?.status || p.status } : p)));
      if (viewing?._id === payment._id) setViewing(null);
      toast.success(approved ? "Payment approved — booking confirmed." : "Payment rejected.");
    } catch {
      toast.error("Couldn't update this payment. Please try again.");
    }
  };

  const submitCredit = async (e) => {
    e.preventDefault();
    setCreditErr("");
    if (!creditForm.guideId) { setCreditErr("Pick a guide."); return; }
    if (!creditForm.amount || Number(creditForm.amount) <= 0) { setCreditErr("Enter a valid amount."); return; }
    try {
      await creditGuide({
        guideId: creditForm.guideId,
        amount: Number(creditForm.amount),
        note: creditForm.note,
      });
      setCreditOpen(false);
      setCreditForm({ guideId: "", amount: "", note: "" });
      toast.success("Guide earnings credited.");
    } catch {
      setCreditErr("Couldn't credit the guide. Please try again.");
    }
  };

  return (
    <AdminLayout greeting="Revenue" subtitle="Verify payments, track earnings and pay out partners">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Banknote} tone="emerald" label="Collected" value={formatPKR(collected)} />
        <StatCard icon={Clock} tone="apricot" label="Pending review" value={pending.length} />
        <StatCard icon={Send} tone="violet" label="Paid out" value={formatPKR(paidOut)} />
        <StatCard icon={TrendingUp} tone="sky" label="Net retained" value={formatPKR(retained)} />
      </div>

      {/* Payments */}
      <Card className="mt-6">
        <SectionHead
          title="Payments"
          sub={`${payments.length} total · ${pending.length} awaiting verification · commission ${commission}%`}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3">Guest</th>
                <th className="px-3 py-3">Stay</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Submitted</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <p className="text-sm font-semibold text-slate-900">{p.guest}</p>
                    <p className="text-xs text-slate-400">Ref {p.ref}</p>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">{p.hotel}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-slate-900">{formatPKR(p.amount)}</td>
                  <td className="px-3 py-3 text-sm text-slate-500">{p.bookedOn ? formatDate(p.bookedOn) : "—"}</td>
                  <td className="px-3 py-3"><StatusPill status={p.paymentStatus} /></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewing(p)} title="View proof & details" className="flex h-8 w-8 items-center justify-center rounded-lg text-lime-600 transition-colors hover:bg-lime-50">
                        <Eye className="h-4 w-4" />
                      </button>
                      {p.paymentStatus === "Pending" && (
                        <>
                          <button onClick={() => handleVerify(p, true)} title="Approve" className="flex h-8 items-center gap-1 rounded-lg bg-lime-400 px-2.5 text-xs font-semibold text-night-950 transition-colors hover:bg-lime-300">
                            <Check className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button onClick={() => handleVerify(p, false)} title="Reject" className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-400">No payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payout requests */}
      <Card className="mt-6">
        <SectionHead
          title="Payout requests"
          sub={`${pendingRequests.length} awaiting · you keep a ${commission}% margin`}
          action={<Btn onClick={() => { setCreditErr(""); setCreditOpen(true); }}><Send className="h-4 w-4" /> Credit guide</Btn>}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3">Requested by</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Send to</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => {
                const st = statusOf(p);
                const cls = st === "Approved" ? "bg-lime-50 text-lime-600" : st === "Rejected" ? "bg-rose-50 text-rose-600" : "bg-apricot-50 text-apricot-600";
                return (
                  <tr key={p._id} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <p className="text-sm font-semibold text-slate-900">{p.recipientName}</p>
                      <p className="text-xs text-slate-400">{p.createdAt ? formatDate(p.createdAt) : ""}{p.note ? ` · ${p.note}` : ""}</p>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-600">{p.recipientType === "hotel" ? "Hotel" : "Local Guide"}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-slate-900">{formatPKR(p.amount)}</td>
                    <td className="max-w-[220px] truncate px-3 py-3 text-sm text-slate-500" title={p.accountDetails}>{p.accountDetails || "—"}</td>
                    <td className="px-3 py-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{st}</span></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {st === "Requested" && (
                          <>
                            <button onClick={() => handleVerifyPayout(p, true)} title="Approve & mark paid" className="flex h-8 items-center gap-1 rounded-lg bg-lime-400 px-2.5 text-xs font-semibold text-night-950 transition-colors hover:bg-lime-300">
                              <Check className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button onClick={() => handleVerifyPayout(p, false)} title="Reject" className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50">
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {payouts.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-400">No payout requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Proof / details modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        icon={Landmark}
        title="Payment details"
        subtitle={viewing ? `Ref ${viewing.ref}` : ""}
        footer={
          viewing?.paymentStatus === "Pending" ? (
            <>
              <BtnGhost onClick={() => handleVerify(viewing, false)}>Reject</BtnGhost>
              <Btn onClick={() => handleVerify(viewing, true)}><Check className="h-4 w-4" /> Approve</Btn>
            </>
          ) : (
            <BtnGhost onClick={() => setViewing(null)}>Close</BtnGhost>
          )
        }
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusPill status={viewing.paymentStatus} />
              <span className="text-lg font-extrabold text-slate-900">{formatPKR(viewing.amount)}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Guest" value={viewing.guest} />
              <Detail label="Stay" value={viewing.hotel} />
              <Detail label="Email" value={viewing.email || "—"} />
              <Detail label="Phone" value={viewing.phone || "—"} />
              <Detail label="Paid from (name)" value={viewing.senderName || "—"} />
              <Detail label="Paid to" value={viewing.paymentAccountLabel || "—"} />
              <Detail label="Transaction ID" value={viewing.paymentRef || "—"} />
              <Detail label="Nights" value={String(viewing.nights ?? "—")} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Payment screenshot</p>
              {viewing.paymentProof ? (
                <a href={viewing.paymentProof} target="_blank" rel="noreferrer">
                  <img src={viewing.paymentProof} alt="Payment proof" className="max-h-80 w-full rounded-xl border border-slate-200 object-contain" />
                </a>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">No screenshot attached.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Credit guide modal */}
      <Modal
        open={creditOpen}
        onClose={() => setCreditOpen(false)}
        icon={Send}
        title="Credit guide earnings"
        subtitle="Add earnings to a local guide's balance — they can then request a payout."
        onSubmit={submitCredit}
        footer={
          <>
            <BtnGhost type="button" onClick={() => setCreditOpen(false)}>Cancel</BtnGhost>
            <Btn type="submit">Credit earnings</Btn>
          </>
        }
      >
        <div className="space-y-5">
          {creditErr && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">{creditErr}</p>
          )}
          <Field label="Local guide" required hint="Hotels earn automatically from bookings; guides are credited here.">
            <select
              value={creditForm.guideId}
              onChange={(e) => setCreditForm((f) => ({ ...f, guideId: e.target.value }))}
              className={adminInputCls}
            >
              <option value="">Select a guide</option>
              {guides.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Amount (PKR)"
            required
            type="number"
            min="0"
            step="100"
            value={creditForm.amount}
            onChange={(v) => setCreditForm((f) => ({ ...f, amount: v }))}
            placeholder="e.g. 15000"
            hint="Added to the guide's withdrawable balance."
          />
          <Field
            label="Note"
            value={creditForm.note}
            onChange={(v) => setCreditForm((f) => ({ ...f, note: v }))}
            placeholder="e.g. June tour commissions"
          />
        </div>
      </Modal>
    </AdminLayout>
  );
}

const Detail = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-100 p-3">
    <p className="text-xs text-slate-400">{label}</p>
    <p className="truncate text-sm font-medium text-slate-800">{value}</p>
  </div>
);
