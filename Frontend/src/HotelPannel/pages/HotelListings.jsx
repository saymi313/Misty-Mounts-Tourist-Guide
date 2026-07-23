import React, { useState, useEffect } from "react";
import { BedDouble, Banknote, Clock, Plus, Pencil, Trash2, MapPin, UtensilsCrossed } from "lucide-react";
import HotelLayout from "../HotelLayout";
import { Card, SectionHead, StatCard, StatusPill, Btn, BtnGhost, Field, adminInputCls } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import { required, number, min, validate, hasErrors } from "../../utils/validation";
import { formatPKR } from "../../utils/currency";
import {
  listMyAccommodations, createMyAccommodation, updateMyAccommodation, deleteMyAccommodation,
} from "../../data/hotelApi";
import { LIVE } from "../../data/api";
import ImageUploadButton from "../../components/dashboard/ImageUploadButton";
import useCities from "../../hooks/useCities";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";

const emptyForm = {
  name: "", type: "hotel", city: "", location: "", price: "",
  description: "", amenities: "", specialOffer: "", picture: "", isAvailable: true,
};
const toRow = (a) => ({ ...a, status: a.isApproved === false ? "Pending" : "Approved" });

export default function HotelListings() {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const cities = useCities();
  const cityOptions = [...new Set([...cities.map((c) => c.name), form.city].filter(Boolean))];

  useEffect(() => {
    if (LIVE) listMyAccommodations().then((rows) => setItems(rows.map(toRow))).catch(() => {});
  }, []);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name, type: item.type || "hotel", city: item.city || "", location: item.location || "",
      price: item.price, description: item.description || "",
      amenities: (item.amenities || []).join(", "), specialOffer: item.specialOffer || "",
      picture: item.picture || "", isAvailable: item.isAvailable !== false,
    });
    setErrors({}); setModalOpen(true);
  };

  const handleDelete = async (item) => {
    const ok = await confirmDialog({
      title: "Delete listing?",
      body: `"${item.name}" will be removed permanently. This can't be undone.`,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    if (LIVE) {
      try { await deleteMyAccommodation(item._id); }
      catch { toast.error("Couldn't delete this listing. Please try again."); return; }
    }
    setItems((prev) => prev.filter((x) => x._id !== item._id));
    toast.success(`"${item.name}" deleted.`);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const found = validate(form, {
      name: [required("Name is required")],
      city: [required("City is required")],
      price: [required("Price is required"), number(), min(0, "Price can't be negative")],
    });
    if (hasErrors(found)) { setErrors(found); return; }
    const payload = {
      name: form.name, type: form.type, city: form.city, location: form.location,
      price: Number(form.price) || 0, description: form.description,
      amenities: form.amenities ? form.amenities.split(",").map((s) => s.trim()).filter(Boolean) : [],
      specialOffer: form.specialOffer, picture: form.picture, isAvailable: !!form.isAvailable,
    };
    if (LIVE) {
      try {
        if (editing) {
          const updated = await updateMyAccommodation(editing._id, payload);
          setItems((prev) => prev.map((x) => (x._id === editing._id ? toRow(updated || { ...x, ...payload }) : x)));
        } else {
          const created = await createMyAccommodation(payload);
          setItems((prev) => [toRow(created), ...prev]);
        }
      } catch {
        toast.error(editing ? "Couldn't save changes. Please try again." : "Couldn't add this listing. Please try again.");
        return;
      }
    }
    setModalOpen(false);
    toast.success(editing ? `"${payload.name}" updated.` : `"${payload.name}" submitted for review.`);
  };

  const total = items.length;
  const pending = items.filter((i) => i.status === "Pending").length;
  const avgPrice = total ? Math.round(items.reduce((s, a) => s + (a.price || 0), 0) / total) : 0;

  return (
    <HotelLayout greeting="My Listings" subtitle="List and manage your hotels & dining spots">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={BedDouble} tone="emerald" label="Total listings" value={total} />
        <StatCard icon={Clock} tone="apricot" label="Pending review" value={pending} />
        <StatCard icon={Banknote} tone="sky" label="Average price" value={formatPKR(avgPrice)} />
      </div>

      <div className="mt-6">
        <SectionHead
          title="All listings"
          sub={`${total} listing${total !== 1 ? "s" : ""}${pending ? ` · ${pending} pending` : ""}`}
          action={<Btn onClick={openAdd}><Plus className="h-4 w-4" /> Add listing</Btn>}
        />
        {items.length === 0 ? (
          <Card className="text-center text-sm text-slate-400">No listings yet. Add your first hotel or dining spot.</Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <Card key={item._id} className="flex flex-col overflow-hidden !p-0">
                <div className="relative h-40 w-full">
                  {item.picture ? (
                    <img src={item.picture} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                      {item.type === "food" ? <UtensilsCrossed className="h-8 w-8" /> : <BedDouble className="h-8 w-8" />}
                    </div>
                  )}
                  <span className="absolute left-3 top-3"><StatusPill status={item.status} /></span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3 w-3" /> {item.location || item.city}</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-slate-900">{formatPKR(item.price)}</span>
                      <span className="text-xs text-slate-400"> / {item.type === "food" ? "avg" : "night"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg text-lime-600 transition-colors hover:bg-lime-50"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(item)} title="Delete" className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        icon={BedDouble}
        title={editing ? "Edit listing" : "Add a listing"}
        subtitle={editing ? "Update this listing's details." : "Add a hotel or dining spot travellers can find and book."}
        onSubmit={handleSave}
        size="lg"
        footer={
          <>
            <BtnGhost type="button" onClick={() => setModalOpen(false)}>Cancel</BtnGhost>
            <Btn type="submit">{editing ? "Save changes" : "Add listing"}</Btn>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Listing name" required value={form.name} onChange={(v) => update("name", v)} placeholder="e.g. Luxus Hunza Resort" error={errors.name} />
            <Field label="Type" hint="Lodging or a dining spot.">
              <select value={form.type} onChange={(e) => update("type", e.target.value)} className={adminInputCls}>
                <option value="hotel">Hotel</option>
                <option value="food">Food</option>
              </select>
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="City" required hint={cityOptions.length ? "Pick the city this listing is in." : "Ask an admin to add cities."} error={errors.city}>
              <select value={form.city} onChange={(e) => update("city", e.target.value)} className={adminInputCls}>
                <option value="">Select a city</option>
                {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Location" value={form.location} onChange={(v) => update("location", v)} placeholder="e.g. Karimabad, Hunza" hint="Street or area within the city." />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price (PKR)" required type="number" min="0" step="100" inputMode="numeric" value={form.price} onChange={(v) => update("price", v)} placeholder="27000" hint="Per night for hotels, average spend for food." error={errors.price} />
            <Field label="Special offer" value={form.specialOffer} onChange={(v) => update("specialOffer", v)} placeholder="e.g. 15% off in winter" hint="Optional promo shown to travellers." />
          </div>
          <Field label="Description" hint="What makes your place special?">
            <textarea rows="3" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe rooms, amenities, the view…" className={`${adminInputCls} resize-none`} />
          </Field>
          <Field label="Amenities" value={form.amenities} onChange={(v) => update("amenities", v)} placeholder="Wifi, Parking, Breakfast, Mountain view" hint="Comma separated." />
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Photo</span>
              <ImageUploadButton folder="accommodations" onUploaded={(url) => update("picture", url)} />
            </div>
            <input value={form.picture} onChange={(e) => update("picture", e.target.value)} placeholder="https://…  or use Upload" className={adminInputCls} />
            {form.picture && <img src={form.picture} alt="" className="mt-2 h-32 w-full rounded-xl object-cover" />}
          </div>
          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
            <input type="checkbox" checked={form.isAvailable} onChange={(e) => update("isAvailable", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-lime-500 accent-lime-500" />
            Available for booking
          </label>
        </div>
      </Modal>
    </HotelLayout>
  );
}
