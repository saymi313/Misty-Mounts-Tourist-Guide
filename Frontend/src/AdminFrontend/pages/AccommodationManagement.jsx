import React, { useState } from "react";
import { BedDouble, DollarSign, Star, Plus, Pencil, Trash2, MapPin, UtensilsCrossed } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard, Btn, BtnGhost } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import { accommodations as seed } from "../../data/mockData";

const emptyForm = { name: "", type: "hotel", location: "", city: "", price: "", rating: "" };

const TypeBadge = ({ type }) => {
  const isFood = type === "food";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isFood ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
      }`}
    >
      {isFood ? <UtensilsCrossed className="h-3 w-3" /> : <BedDouble className="h-3 w-3" />}
      {isFood ? "Food" : "Hotel"}
    </span>
  );
};

const AccommodationManagement = () => {
  const [stays, setStays] = useState(seed);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      type: item.type,
      location: item.location,
      city: item.city,
      price: item.price,
      rating: item.rating,
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => setStays((prev) => prev.filter((s) => s._id !== id));

  const handleSave = (e) => {
    e.preventDefault();
    const parsed = { ...form, price: Number(form.price) || 0, rating: Number(form.rating) || 0 };
    if (editing) {
      setStays((prev) => prev.map((s) => (s._id === editing._id ? { ...s, ...parsed } : s)));
    } else {
      setStays((prev) => [
        { _id: `acc-${Date.now()}`, picture: "", reviews: 0, amenities: [], tags: [], description: "", ...parsed },
        ...prev,
      ]);
    }
    setModalOpen(false);
  };

  const total = stays.length;
  const avgPrice = total ? Math.round(stays.reduce((s, a) => s + a.price, 0) / total) : 0;
  const avgRating = total ? (stays.reduce((s, a) => s + a.rating, 0) / total).toFixed(1) : "0.0";

  return (
    <AdminLayout greeting="Accommodation" subtitle="Manage stays, cafés and restaurants">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={BedDouble} tone="emerald" label="Total stays & food" value={total} />
        <StatCard icon={DollarSign} tone="sky" label="Average price" value={`$${avgPrice}`} />
        <StatCard icon={Star} tone="amber" label="Average rating" value={avgRating} />
      </div>

      {/* Card grid */}
      <div className="mt-6">
        <SectionHead
          title="All accommodation"
          sub={`${total} listings`}
          action={
            <Btn onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add stay
            </Btn>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stays.map((item) => (
            <Card key={item._id} className="flex flex-col overflow-hidden !p-0">
              <div className="relative h-40 w-full">
                {item.picture ? (
                  <img src={item.picture} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-600">
                    <BedDouble className="h-8 w-8" />
                  </div>
                )}
                <span className="absolute left-3 top-3">
                  <TypeBadge type={item.type} />
                </span>
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {item.rating}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="h-3 w-3" /> {item.location}
                </p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-slate-900">${item.price}</span>
                    <span className="text-xs text-slate-400"> / {item.type === "food" ? "avg" : "night"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      title="Edit"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      title="Delete"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {stays.length === 0 && (
          <Card className="mt-4 text-center text-sm text-slate-400">No accommodation yet. Add your first stay.</Card>
        )}
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit accommodation" : "Add accommodation"}
        onSubmit={handleSave}
        footer={
          <>
            <BtnGhost type="button" onClick={() => setModalOpen(false)}>Cancel</BtnGhost>
            <Btn type="submit">{editing ? "Save changes" : "Add stay"}</Btn>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400"
            >
              <option value="hotel">Hotel</option>
              <option value="food">Food</option>
            </select>
          </div>
          <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price ($)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
            <Field label="Rating" type="number" value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>
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

export default AccommodationManagement;
