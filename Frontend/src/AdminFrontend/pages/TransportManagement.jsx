import React, { useState } from "react";
import { Bus, Route, Users, Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard, Btn, BtnGhost } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import { transportationBySpot } from "../../data/mockData";

const seed = transportationBySpot.default;

const emptyForm = { type: "", from: "", to: "", provider: "", duration: "", price: "", seats: "", schedule: "" };

const TransportManagement = () => {
  const [routes, setRoutes] = useState(seed);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (route) => {
    setEditing(route);
    setForm({
      type: route.type,
      from: route.from,
      to: route.to,
      provider: route.provider,
      duration: route.duration,
      price: route.price,
      seats: route.seats,
      schedule: route.schedule,
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => setRoutes((prev) => prev.filter((r) => r._id !== id));

  const handleSave = (e) => {
    e.preventDefault();
    const parsed = { ...form, price: Number(form.price) || 0, seats: Number(form.seats) || 0 };
    if (editing) {
      setRoutes((prev) => prev.map((r) => (r._id === editing._id ? { ...r, ...parsed } : r)));
    } else {
      setRoutes((prev) => [{ _id: `tr-${Date.now()}`, ...parsed }, ...prev]);
    }
    setModalOpen(false);
  };

  const total = routes.length;
  const totalSeats = routes.reduce((s, r) => s + (Number(r.seats) || 0), 0);
  const avgPrice = total ? Math.round(routes.reduce((s, r) => s + (Number(r.price) || 0), 0) / total) : 0;

  return (
    <AdminLayout greeting="Transport" subtitle="Manage routes, providers and schedules">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Route} tone="emerald" label="Total routes" value={total} />
        <StatCard icon={Users} tone="sky" label="Total seats" value={totalSeats} />
        <StatCard icon={Bus} tone="amber" label="Average fare" value={`$${avgPrice}`} />
      </div>

      {/* Table */}
      <Card className="mt-6">
        <SectionHead
          title="All routes"
          sub={`${total} routes available`}
          action={
            <Btn onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add route
            </Btn>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Route</th>
                <th className="px-3 py-3">Provider</th>
                <th className="px-3 py-3">Duration</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Seats</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route._id} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Bus className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{route.type}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1.5 text-sm text-slate-600">
                      {route.from} <ArrowRight className="h-3.5 w-3.5 text-slate-400" /> {route.to}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-500">{route.provider}</td>
                  <td className="px-3 py-3 text-sm text-slate-500">{route.duration}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-slate-900">${route.price}</td>
                  <td className="px-3 py-3 text-sm text-slate-500">{route.seats}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(route)}
                        title="Edit route"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(route._id)}
                        title="Delete route"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-400">
                    No routes yet. Add your first route.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit route" : "Add route"}
        onSubmit={handleSave}
        size="lg"
        footer={
          <>
            <BtnGhost type="button" onClick={() => setModalOpen(false)}>Cancel</BtnGhost>
            <Btn type="submit">{editing ? "Save changes" : "Add route"}</Btn>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
          <Field label="Provider" value={form.provider} onChange={(v) => setForm({ ...form, provider: v })} />
          <Field label="From" value={form.from} onChange={(v) => setForm({ ...form, from: v })} />
          <Field label="To" value={form.to} onChange={(v) => setForm({ ...form, to: v })} />
          <Field label="Duration" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} />
          <Field label="Schedule" value={form.schedule} onChange={(v) => setForm({ ...form, schedule: v })} />
          <Field label="Price ($)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
          <Field label="Seats" type="number" value={form.seats} onChange={(v) => setForm({ ...form, seats: v })} />
        </div>
      </Modal>
    </AdminLayout>
  );
};

const Field = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400"
    />
  </div>
);

export default TransportManagement;
