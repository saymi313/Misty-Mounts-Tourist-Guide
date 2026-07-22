import React, { useState, useEffect } from "react";
import { Wallet, Receipt, Clock, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard, StatusPill, Btn, BtnGhost, adminInputCls, Field } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import { bookings as seed } from "../../data/mockData";
import { formatPKR } from "../../utils/currency";
import { LIVE, listPayments, updatePaymentStatus } from "../../data/adminApi";

const money = formatPKR;

const PaymentManagement = () => {
  const [payments, setPayments] = useState(seed);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState("Upcoming");

  useEffect(() => {
    if (LIVE) listPayments().then(setPayments).catch(() => {});
  }, []);

  const openEdit = (payment) => {
    setEditing(payment);
    setStatus(payment.status);
    setModalOpen(true);
  };

  const handleDelete = (id) => setPayments((prev) => prev.filter((p) => p._id !== id));

  const handleSave = async (e) => {
    e.preventDefault();
    if (LIVE) {
      try { await updatePaymentStatus(editing._id, status); } catch { return; }
    }
    setPayments((prev) => prev.map((p) => (p._id === editing._id ? { ...p, status } : p)));
    setModalOpen(false);
  };

  const revenue = payments.reduce((s, p) => s + p.amount, 0);
  const count = payments.length;
  const pending = payments.filter((p) => p.status === "Pending").length;

  return (
    <AdminLayout greeting="Payments" subtitle="Track bookings, revenue and settlement status">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Wallet} tone="emerald" label="Total revenue" value={money(revenue)} delta="+12%" />
        <StatCard icon={Receipt} tone="sky" label="Transactions" value={count} />
        <StatCard icon={Clock} tone="amber" label="Pending" value={pending} />
      </div>

      {/* Table */}
      <Card className="mt-6">
        <SectionHead title="Recent bookings" sub={`${count} transactions`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3">Guest</th>
                <th className="px-3 py-3">Hotel</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Nights</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.avatar} alt={p.guest} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{p.guest}</p>
                        <p className="truncate text-xs text-slate-400">{p.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">{p.hotel}</td>
                  <td className="px-3 py-3 text-sm text-slate-500">{p.date}</td>
                  <td className="px-3 py-3 text-sm text-slate-500">{p.nights}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-slate-900">{money(p.amount)}</td>
                  <td className="px-3 py-3">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        title="Edit status"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        title="Delete record"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-400">
                    No payments recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit status modal */}
      <Modal
        open={modalOpen && !!editing}
        onClose={() => setModalOpen(false)}
        icon={Wallet}
        title="Update payment"
        subtitle="Change the settlement status for this booking."
        onSubmit={handleSave}
        footer={
          <>
            <BtnGhost type="button" onClick={() => setModalOpen(false)}>Cancel</BtnGhost>
            <Btn type="submit">Save changes</Btn>
          </>
        }
      >
        {editing && (
          <div className="space-y-5">
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <img src={editing.avatar} alt={editing.guest} className="h-12 w-12 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{editing.guest}</p>
                <p className="truncate text-xs text-slate-400">
                  {editing.hotel} · {editing.nights} nights · {money(editing.amount)}
                </p>
              </div>
              <span className="ml-auto shrink-0">
                <StatusPill status={editing.status} />
              </span>
            </div>
            <Field
              label="Payment status"
              hint="Mark as confirmed once payment clears, or cancelled to void the booking."
            >
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={adminInputCls}
              >
                <option>Upcoming</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </Field>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default PaymentManagement;
