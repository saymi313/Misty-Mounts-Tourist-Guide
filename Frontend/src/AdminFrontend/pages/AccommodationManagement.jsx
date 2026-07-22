import React, { useState, useEffect } from "react";
import { BedDouble, Banknote, Star, Plus, Pencil, Trash2, MapPin, UtensilsCrossed } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard, Btn, BtnGhost, Field, adminInputCls } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import { accommodations as seed } from "../../data/mockData";
import { required, number, min, max, validate, hasErrors } from "../../utils/validation";
import { formatPKR } from "../../utils/currency";
import { LIVE, listAccommodations, createAccommodation, updateAccommodation, deleteAccommodation } from "../../data/adminApi";

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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (LIVE) listAccommodations().then(setStays).catch(() => {});
  }, []);

  const update = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
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
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (LIVE) {
      try { await deleteAccommodation(id); } catch { return; }
    }
    setStays((prev) => prev.filter((s) => s._id !== id));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const found = validate(form, {
      name: [required("Name is required")],
      location: [required("Location is required")],
      city: [required("City is required")],
      price: [required("Price is required"), number(), min(0, "Price can't be negative")],
      rating: [number(), min(0), max(5, "Rating is out of 5")],
    });
    if (hasErrors(found)) {
      setErrors(found);
      return;
    }
    const parsed = { ...form, price: Number(form.price) || 0, rating: Number(form.rating) || 0 };
    if (LIVE) {
      try {
        if (editing) {
          const updated = await updateAccommodation(editing._id, parsed);
          setStays((prev) => prev.map((s) => (s._id === editing._id ? (updated || { ...s, ...parsed }) : s)));
        } else {
          const created = await createAccommodation(parsed);
          setStays((prev) => [created || { _id: `acc-${Date.now()}`, ...parsed }, ...prev]);
        }
      } catch { return; }
    } else if (editing) {
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
        <StatCard icon={Banknote} tone="sky" label="Average price" value={formatPKR(avgPrice)} />
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
                    <span className="text-lg font-extrabold text-slate-900">{formatPKR(item.price)}</span>
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
        icon={BedDouble}
        title={editing ? "Edit accommodation" : "Add accommodation"}
        subtitle={
          editing
            ? "Update this listing's details."
            : "Add a hotel, café or restaurant travelers can find and book."
        }
        onSubmit={handleSave}
        size="lg"
        footer={
          <>
            <BtnGhost type="button" onClick={() => setModalOpen(false)}>Cancel</BtnGhost>
            <Btn type="submit">{editing ? "Save changes" : "Add stay"}</Btn>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Listing name"
              required
              value={form.name}
              onChange={(v) => update("name", v)}
              placeholder="e.g. Luxus Hunza Resort"
              hint="Business name as travelers will see it."
              error={errors.name}
            />
            <Field label="Type" hint="Whether this is a stay or a food spot.">
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className={adminInputCls}
              >
                <option value="hotel">Hotel</option>
                <option value="food">Food</option>
              </select>
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Location"
              required
              value={form.location}
              onChange={(v) => update("location", v)}
              placeholder="e.g. Karimabad, Hunza"
              hint="Street or area within the city."
              error={errors.location}
            />
            <Field
              label="City"
              required
              value={form.city}
              onChange={(v) => update("city", v)}
              placeholder="e.g. Hunza"
              hint="The city this listing sits in."
              error={errors.city}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Price (PKR)"
              required
              type="number"
              min="0"
              step="100"
              inputMode="numeric"
              value={form.price}
              onChange={(v) => update("price", v)}
              placeholder="27000"
              hint="Per night for hotels, average spend for food — in rupees."
              error={errors.price}
            />
            <Field
              label="Rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              inputMode="decimal"
              value={form.rating}
              onChange={(v) => update("rating", v)}
              placeholder="4.5"
              hint="Average guest rating out of 5."
              error={errors.rating}
            />
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AccommodationManagement;
