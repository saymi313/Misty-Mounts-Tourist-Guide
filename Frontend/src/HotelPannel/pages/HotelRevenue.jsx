import React, { useState, useEffect } from "react";
import { Wallet, Banknote, Send, Clock } from "lucide-react";
import HotelLayout from "../HotelLayout";
import { Card, SectionHead, StatCard, Btn, BtnGhost, Field, adminInputCls } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import { formatPKR } from "../../utils/currency";
import { formatDate } from "../../utils/datetime";
import { getBalance, listMyPayouts, requestPayout } from "../../data/revenueApi";
import { LIVE } from "../../data/api";
import { toast } from "../../utils/toast";

const payoutPill = (s) => {
  const st = s || "Approved";
  const cls = st === "Approved" ? "bg-lime-50 text-lime-600" : st === "Rejected" ? "bg-rose-50 text-rose-600" : "bg-apricot-50 text-apricot-600";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{st}</span>;
};

export default function HotelRevenue() {
  const [balance, setBalance] = useState({ earnings: 0, withdrawn: 0, available: 0, minPayoutThreshold: 0, commissionPercent: 0 });
  const [payouts, setPayouts] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", accountDetails: "", note: "" });
  const [err, setErr] = useState("");

  const load = () => {
    getBalance().then(setBalance).catch(() => {});
    listMyPayouts().then(setPayouts).catch(() => {});
  };
  useEffect(() => { if (LIVE) load(); }, []);

  const canRequest = balance.available >= balance.minPayoutThreshold && balance.available > 0;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const amt = Number(form.amount) || 0;
    if (amt < balance.minPayoutThreshold) { setErr(`Minimum payout is ${formatPKR(balance.minPayoutThreshold)}.`); return; }
    if (amt > balance.available) { setErr(`You can request at most ${formatPKR(balance.available)}.`); return; }
    if (!form.accountDetails.trim()) { setErr("Add the account where you'd like to be paid."); return; }
    try {
      await requestPayout({ amount: amt, accountDetails: form.accountDetails, note: form.note });
      setOpen(false);
      setForm({ amount: "", accountDetails: "", note: "" });
      toast.success("Payout request submitted — the admin will review it.");
      load();
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Couldn't submit your request. Please try again.");
    }
  };

  return (
    <HotelLayout greeting="Revenue" subtitle="Your net earnings and payout requests">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Banknote} tone="emerald" label={`Net earnings (after ${balance.commissionPercent}%)`} value={formatPKR(balance.earnings)} />
        <StatCard icon={Wallet} tone="sky" label="Available to withdraw" value={formatPKR(balance.available)} />
        <StatCard icon={Send} tone="violet" label="Requested / paid" value={formatPKR(balance.withdrawn)} />
      </div>

      <Card className="mt-6">
        <SectionHead
          title="Payout requests"
          sub={canRequest ? "Request a withdrawal of your available balance." : `Minimum payout is ${formatPKR(balance.minPayoutThreshold)}.`}
          action={<Btn onClick={() => { setErr(""); setForm({ amount: String(balance.available || ""), accountDetails: "", note: "" }); setOpen(true); }} disabled={!canRequest}><Send className="h-4 w-4" /> Request payout</Btn>}
        />
        {payouts.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">No payout requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Send to</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Requested</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p._id} className="border-t border-slate-100">
                    <td className="px-3 py-3 text-sm font-bold text-slate-900">{formatPKR(p.amount)}</td>
                    <td className="max-w-[240px] truncate px-3 py-3 text-sm text-slate-500">{p.accountDetails || "—"}</td>
                    <td className="px-3 py-3">{payoutPill(p.status)}</td>
                    <td className="px-3 py-3 text-sm text-slate-500">{p.createdAt ? formatDate(p.createdAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        icon={Send}
        title="Request a payout"
        subtitle={`Available: ${formatPKR(balance.available)} · minimum ${formatPKR(balance.minPayoutThreshold)}`}
        onSubmit={submit}
        footer={<><BtnGhost type="button" onClick={() => setOpen(false)}>Cancel</BtnGhost><Btn type="submit">Submit request</Btn></>}
      >
        <div className="space-y-5">
          {err && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">{err}</p>}
          <Field label="Amount (PKR)" required type="number" min="0" step="100" value={form.amount} onChange={(v) => setForm((f) => ({ ...f, amount: v }))} placeholder={String(balance.available)} hint={`Up to ${formatPKR(balance.available)}.`} />
          <Field label="Pay me at (account)" required>
            <textarea rows="2" value={form.accountDetails} onChange={(e) => setForm((f) => ({ ...f, accountDetails: e.target.value }))} placeholder="Bank / IBAN / wallet + account name" className={`${adminInputCls} resize-none`} />
          </Field>
          <Field label="Note" value={form.note} onChange={(v) => setForm((f) => ({ ...f, note: v }))} placeholder="Optional" />
        </div>
      </Modal>
    </HotelLayout>
  );
}
