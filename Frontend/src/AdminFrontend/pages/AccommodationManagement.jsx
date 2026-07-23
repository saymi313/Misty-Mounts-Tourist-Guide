import React, { useState, useEffect } from "react";
import { BedDouble, Banknote, Star, Clock, Check, Plus, Pencil, Trash2, MapPin, UtensilsCrossed } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard, StatusPill, Btn, BtnGhost, Field, adminInputCls } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import { required, number, min, max, validate, hasErrors } from "../../utils/validation";
import { formatPKR } from "../../utils/currency";
import { LIVE, listAccommodations, createAccommodation, updateAccommodation, approveAccommodation, deleteAccommodation, getSettings, updateSettings } from "../../data/adminApi";
import ImageUploadButton from "../../components/dashboard/ImageUploadButton";
import useCities from "../../hooks/useCities";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";

const emptyForm = { name: "", type: "hotel", location: "", city: "", price: "", rating: "", picture: "" };

const TypeBadge = ({ type }) => {
  const isFood = type === "food";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isFood ? "bg-amber-50 text-amber-600" : "bg-lime-50 text-lime-600"
      }`}
    >
      {isFood ? <UtensilsCrossed className="h-3 w-3" /> : <BedDouble className="h-3 w-3" />}
      {isFood ? "Food" : "Hotel"}
    </span>
  );
};

const AccommodationManagement = () => {
  const [stays, setStays] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [autoApprove, setAutoApprove] = useState(false);
  const cities = useCities();
  const cityOptions = [...new Set([...cities.map((c) => c.name), form.city].filter(Boolean))];

  useEffect(() => {
    if (!LIVE) return;
    listAccommodations().then(setStays).catch(() => {});
    getSettings().then((s) => setAutoApprove(!!s.autoApproveListings)).catch(() => {});
  }, []);

  const handleApprove = async (item) => {
    if (LIVE) {
      try {
        const updated = await approveAccommodation(item._id, true);
        setStays((prev) => prev.map((s) => (s._id === item._id ? (updated || { ...s, isApproved: true }) : s)));
      } catch { toast.error("Couldn't approve this listing. Please try again."); return; }
    } else {
      setStays((prev) => prev.map((s) => (s._id === item._id ? { ...s, isApproved: true } : s)));
    }
    toast.success(`"${item.name}" approved and now visible to travellers.`);
  };

  const toggleAutoApprove = async () => {
    const next = !autoApprove;
    setAutoApprove(next);
    if (LIVE) {
      try { await updateSettings({ autoApproveListings: next }); }
      catch { setAutoApprove(!next); toast.error("Couldn't update auto-approval. Please try again."); return; }
    }
    toast.success(
      next
        ? "Auto-approval on — new hotel listings go live instantly."
        : "Auto-approval off — new hotel listings wait for review."
    );
  };

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
      picture: item.picture || "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    const ok = await confirmDialog({
      title: "Delete accommodation?",
      body: `"${item.name}" will be removed permanently. This can't be undone.`,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    if (LIVE) {
      try { await deleteAccommodation(item._id); }
      catch { toast.error("Couldn't delete this listing. Please try again."); return; }
    }
    setStays((prev) => prev.filter((s) => s._id !== item._id));
    toast.success(`"${item.name}" deleted.`);
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
      } catch {
        toast.error(editing ? "Couldn't save changes. Please try again." : "Couldn't add this listing. Please try again.");
        return;
      }
    } else if (editing) {
      setStays((prev) => prev.map((s) => (s._id === editing._id ? { ...s, ...parsed } : s)));
    } else {
      setStays((prev) => [
        { _id: `acc-${Date.now()}`, picture: "", reviews: 0, amenities: [], tags: [], description: "", ...parsed },
        ...prev,
      ]);
    }
    setModalOpen(false);
    toast.success(editing ? `"${parsed.name}" updated.` : `"${parsed.name}" added.`);
  };

  const total = stays.length;
  const pending = stays.filter((a) => a.isApproved === false).length;
  const avgPrice = total ? Math.round(stays.reduce((s, a) => s + a.price, 0) / total) : 0;

  return (
    <AdminLayout greeting="Accommodation" subtitle="Manage stays, cafés and restaurants">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={BedDouble} tone="emerald" label="Total stays & food" value={total} />
        <StatCard icon={Clock} tone="apricot" label="Pending review" value={pending} />
        <StatCard icon={Banknote} tone="sky" label="Average price" value={formatPKR(avgPrice)} />
      </div>

      {/* Card grid */}
      <div className="mt-6">
        <SectionHead
          title="All accommodation"
          sub={`${total} listings${pending ? ` · ${pending} pending` : ""}`}
          action={
            <div className="flex flex-wrap items-center gap-4">
              <label
                className="flex cursor-pointer select-none items-center gap-2.5"
                title="When on, listings submitted by hotels are approved automatically."
              >
                <span className="text-sm font-medium text-slate-600">Auto-approve hotel listings</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoApprove}
                  onClick={toggleAutoApprove}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${autoApprove ? "bg-lime-400" : "bg-slate-200"}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${autoApprove ? "translate-x-5" : ""}`} />
                </button>
              </label>
              <Btn onClick={openAdd}>
                <Plus className="h-4 w-4" /> Add stay
              </Btn>
            </div>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stays.map((item) => (
            <Card key={item._id} className="flex flex-col overflow-hidden !p-0">
              <div className="relative h-40 w-full">
                {item.picture ? (
                  <img src={item.picture} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-lime-50 text-lime-600">
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
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                  <StatusPill status={item.isApproved === false ? "Pending" : "Approved"} />
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="h-3 w-3" /> {item.location}
                </p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-slate-900">{formatPKR(item.price)}</span>
                    <span className="text-xs text-slate-400"> / {item.type === "food" ? "avg" : "night"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.isApproved === false && (
                      <button
                        onClick={() => handleApprove(item)}
                        title="Approve listing"
                        className="flex h-8 items-center gap-1 rounded-lg bg-lime-400 px-2.5 text-xs font-semibold text-night-950 transition-colors hover:bg-lime-300"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(item)}
                      title="Edit"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-lime-600 transition-colors hover:bg-lime-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
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
              hint={cityOptions.length ? "The city this listing sits in." : "Add cities in Settings first."}
              error={errors.city}
            >
              <select
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className={adminInputCls}
              >
                <option value="">Select a city</option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
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
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Photo</span>
              <ImageUploadButton folder="accommodations" onUploaded={(url) => update("picture", url)} />
            </div>
            <input
              value={form.picture}
              onChange={(e) => update("picture", e.target.value)}
              placeholder="https://…  or use Upload"
              className={adminInputCls}
            />
            {form.picture && <img src={form.picture} alt="" className="mt-2 h-28 w-full rounded-xl object-cover" />}
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AccommodationManagement;
