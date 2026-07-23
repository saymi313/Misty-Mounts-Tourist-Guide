import React, { useState, useEffect } from "react";
import { Wallet, Banknote, Send } from "lucide-react";
import GuideLayout from "../GuideLayout";
import { Card, SectionHead, StatCard, Btn, BtnGhost, Field, adminInputCls } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import { formatPKR } from "../../utils/currency";
import { formatDate } from "../../utils/datetime";
import { getBalance, listMyPayouts, listMyEarnings, requestPayout } from "../../data/revenueApi";
import { LIVE } from "../../data/api";
import { toast } from "../../utils/toast";

const payoutPill = (s) => {
  const st = s || "Approved";
  const cls = st === "Approved" ? "bg-lime-50 text-lime-600" : st === "Rejected" ? "bg-rose-50 text-rose-600" : "bg-apricot-50 text-apricot-600";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{st}</span>;
};

export default function GuideRevenue() {
  const [balance, setBalance] = useState({ earnings: 0, withdrawn: 0, available: 0, minPayoutThreshold: 0 });
  const [payouts, setPayouts] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", accountDetails: "", note: "" });
  const [err, setErr] = useState("");

  const load = () => {
    getBalance().then(setBalance).catch(() => {});
    listMyPayouts().then(setPayouts).catch(() => {});
    listMyEarnings().then(setEarnings).catch(() => {});
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
    <GuideLayout greeting="Revenue" subtitle="Your earnings and payout requests">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Banknote} tone="emerald" label="Total earned" value={formatPKR(balance.earnings)} />
        <StatCard icon={Wallet} tone="sky" label="Available to withdraw" value={formatPKR(balance.available)} />
        <StatCard icon={Send} tone="violet" label="Requested / paid" value={formatPKR(balance.withdrawn)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Payout requests */}
        <Card>
          <SectionHead
            title="Payout requests"
            sub={canRequest ? "Withdraw your available balance." : `Minimum payout is ${formatPKR(balance.minPayoutThreshold)}.`}
            action={<Btn onClick={() => { setErr(""); setForm({ amount: String(balance.available || ""), accountDetails: "", note: "" }); setOpen(true); }} disabled={!canRequest}><Send className="h-4 w-4" /> Request</Btn>}
          />
          {payouts.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No payout requests yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {payouts.map((p) => (
                <div key={p._id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{formatPKR(p.amount)}</p>
                    <p className="text-xs text-slate-400">{p.createdAt ? formatDate(p.createdAt) : ""}</p>
                  </div>
                  {payoutPill(p.status)}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Earnings credited */}
        <Card>
          <SectionHead title="Earnings credited" sub="Added to your balance by the admin" />
          {earnings.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No earnings credited yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {earnings.map((e) => (
                <div key={e._id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{formatPKR(e.amount)}</p>
                    <p className="text-xs text-slate-400">{e.note || "Credit"} · {e.createdAt ? formatDate(e.createdAt) : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

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
    </GuideLayout>
  );
}
