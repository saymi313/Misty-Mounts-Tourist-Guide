import React, { useState, useEffect } from "react";
import { Package, Clock, Users, Plus, Pencil, Trash2, MapPin, X, CalendarDays } from "lucide-react";
import TravelAgencyLayout from "../TravelAgencyLayout";
import { Card, SectionHead, StatCard, StatusPill, Btn, BtnGhost, Field, adminInputCls } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import Pagination from "../../components/dashboard/Pagination";
import usePagination from "../../hooks/usePagination";
import ImageUploadButton from "../../components/dashboard/ImageUploadButton";
import { required, number, min, validate, hasErrors } from "../../utils/validation";
import { formatPKR } from "../../utils/currency";
import {
  listMyPackages, createMyPackage, updateMyPackage, deleteMyPackage,
} from "../../data/agencyApi";
import { getAllSpots, getAccommodations } from "../../data/mockApi";
import { LIVE } from "../../data/api";
import useCities from "../../hooks/useCities";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";

const emptyForm = {
  title: "", summary: "", coverImage: "", cities: [], durationDays: "1", pricePerPerson: "",
  spots: [], hotels: [], itinerary: [], inclusions: "", exclusions: "", departures: [], isPublished: true,
};
const toRow = (p) => ({ ...p, status: p.isApproved === false ? "Pending" : "Approved" });
const toDateInput = (v) => { try { return new Date(v).toISOString().slice(0, 10); } catch { return ""; } };
const textToArr = (s) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);

const secLabel = "mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500";
const rowInput = `${adminInputCls} !py-2`;
const iconBtn = "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50";

export default function AgencyPackages() {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const cities = useCities();
  const [catalogSpots, setCatalogSpots] = useState([]);
  const [catalogHotels, setCatalogHotels] = useState([]);

  const cityOptions = [...new Set([...cities.map((c) => c.name), ...form.cities].filter(Boolean))];
  const pg = usePagination(items, 9);

  useEffect(() => {
    if (!LIVE) return;
    listMyPackages().then((rows) => setItems(rows.map(toRow))).catch(() => {});
    getAllSpots()
      .then((data) => setCatalogSpots((data || []).flatMap((c) => (c.nearbyPlaces || []).map((p) => ({ spotId: p._id, name: p.name, city: c.city })))))
      .catch(() => {});
    getAccommodations()
      .then((rows) => setCatalogHotels((rows || []).map((a) => ({ accId: a._id, name: a.name, city: a.city }))))
      .catch(() => {});
  }, []);

  const update = (k, v) => { setForm((f) => ({ ...f, [k]: v })); if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined })); };
  const toggleCity = (c) => setForm((f) => ({ ...f, cities: f.cities.includes(c) ? f.cities.filter((x) => x !== c) : [...f.cities, c] }));

  // Generic dynamic-row helpers
  const addRow = (key, row) => setForm((f) => ({ ...f, [key]: [...f[key], row] }));
  const setRow = (key, i, patch) => setForm((f) => ({ ...f, [key]: f[key].map((r, idx) => (idx === i ? { ...r, ...patch } : r)) }));
  const delRow = (key, i) => setForm((f) => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) }));

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || "", summary: p.summary || "", coverImage: p.coverImage || "",
      cities: p.cities || [], durationDays: String(p.durationDays || 1), pricePerPerson: String(p.pricePerPerson ?? ""),
      spots: (p.spots || []).map((s) => ({ ...s })),
      hotels: (p.hotels || []).map((h) => ({ ...h, nights: String(h.nights ?? 1) })),
      itinerary: (p.itinerary || []).map((d) => ({ ...d })),
      inclusions: (p.inclusions || []).join(", "),
      exclusions: (p.exclusions || []).join(", "),
      departures: (p.departures || []).map((d) => ({ _id: d._id, date: toDateInput(d.date), seatsTotal: String(d.seatsTotal), seatsBooked: d.seatsBooked })),
      isPublished: p.isPublished !== false,
    });
    setErrors({}); setModalOpen(true);
  };

  const handleDelete = async (p) => {
    const ok = await confirmDialog({ title: "Delete package?", body: `"${p.title}" will be removed permanently.`, confirmLabel: "Delete" });
    if (!ok) return;
    if (LIVE) { try { await deleteMyPackage(p._id); } catch { toast.error("Couldn't delete this package."); return; } }
    setItems((prev) => prev.filter((x) => x._id !== p._id));
    toast.success(`"${p.title}" deleted.`);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const found = validate(form, {
      title: [required("Title is required")],
      pricePerPerson: [required("Price is required"), number(), min(0, "Price can't be negative")],
    });
    if (hasErrors(found)) { setErrors(found); return; }
    if (form.departures.length === 0) { toast.error("Add at least one departure date."); return; }

    const payload = {
      title: form.title,
      summary: form.summary,
      coverImage: form.coverImage,
      cities: form.cities,
      durationDays: Number(form.durationDays) || 1,
      pricePerPerson: Number(form.pricePerPerson) || 0,
      spots: form.spots.filter((s) => s.name).map((s) => ({ spotId: s.spotId || "", name: s.name, city: s.city || "" })),
      hotels: form.hotels.filter((h) => h.name).map((h) => ({ accId: h.accId || "", name: h.name, city: h.city || "", nights: Number(h.nights) || 1 })),
      itinerary: form.itinerary.filter((d) => d.title || d.detail).map((d, i) => ({ day: Number(d.day) || i + 1, title: d.title || "", detail: d.detail || "" })),
      inclusions: textToArr(form.inclusions),
      exclusions: textToArr(form.exclusions),
      departures: form.departures.filter((d) => d.date).map((d) => ({
        ...(d._id ? { _id: d._id, seatsBooked: d.seatsBooked } : {}),
        date: d.date, seatsTotal: Number(d.seatsTotal) || 1,
      })),
      isPublished: !!form.isPublished,
    };

    if (LIVE) {
      try {
        if (editing) {
          const updated = await updateMyPackage(editing._id, payload);
          setItems((prev) => prev.map((x) => (x._id === editing._id ? toRow(updated || { ...x, ...payload }) : x)));
        } else {
          const created = await createMyPackage(payload);
          setItems((prev) => [toRow(created), ...prev]);
        }
      } catch (e2) {
        toast.error(e2?.response?.data?.error || (editing ? "Couldn't save changes." : "Couldn't create this package."));
        return;
      }
    }
    setModalOpen(false);
    toast.success(editing ? `"${payload.title}" updated.` : `"${payload.title}" submitted for review.`);
  };

  const total = items.length;
  const pending = items.filter((i) => i.status === "Pending").length;
  const seats = items.reduce((s, p) => s + (p.departures || []).reduce((a, d) => a + (d.seatsTotal || 0), 0), 0);

  return (
    <TravelAgencyLayout greeting="Tour Packages" subtitle="Design itineraries and open group departures">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Package} tone="emerald" label="Packages" value={total} />
        <StatCard icon={Clock} tone="apricot" label="Pending review" value={pending} />
        <StatCard icon={Users} tone="sky" label="Total seats offered" value={seats} />
      </div>

      <div className="mt-6">
        <SectionHead
          title="All packages"
          sub={`${total} package${total !== 1 ? "s" : ""}${pending ? ` · ${pending} pending` : ""}`}
          action={<Btn onClick={openAdd}><Plus className="h-4 w-4" /> New package</Btn>}
        />
        {items.length === 0 ? (
          <Card className="text-center text-sm text-slate-400">No packages yet. Create your first tour.</Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pg.pageItems.map((p) => (
              <Card key={p._id} className="flex flex-col overflow-hidden !p-0">
                <div className="relative h-40 w-full">
                  {p.coverImage ? (
                    <img loading="lazy" decoding="async" src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400"><Package className="h-8 w-8" /></div>
                  )}
                  <span className="absolute left-3 top-3"><StatusPill status={p.status} /></span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3 w-3" /> {(p.cities || []).join(", ") || "—"} · {p.durationDays} day{p.durationDays !== 1 ? "s" : ""}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><CalendarDays className="h-3 w-3" /> {(p.departures || []).length} departure{(p.departures || []).length !== 1 ? "s" : ""}</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div><span className="text-lg font-extrabold text-slate-900">{formatPKR(p.pricePerPerson)}</span><span className="text-xs text-slate-400"> / person</span></div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg text-lime-600 transition-colors hover:bg-lime-50"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(p)} title="Delete" className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        <Pagination page={pg.page} pageCount={pg.pageCount} setPage={pg.setPage} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        icon={Package}
        title={editing ? "Edit package" : "Create a package"}
        subtitle={editing ? "Update this tour's details." : "Build an itinerary and open group departures."}
        onSubmit={handleSave}
        size="xl"
        footer={<><BtnGhost type="button" onClick={() => setModalOpen(false)}>Cancel</BtnGhost><Btn type="submit">{editing ? "Save changes" : "Create package"}</Btn></>}
      >
        <div className="space-y-6">
          {/* Basics */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Package title" required value={form.title} onChange={(v) => update("title", v)} placeholder="e.g. 6-Day Hunza Explorer" error={errors.title} />
            <Field label="Price per person (PKR)" required type="number" min="0" step="500" value={form.pricePerPerson} onChange={(v) => update("pricePerPerson", v)} placeholder="45000" error={errors.pricePerPerson} />
            <Field label="Duration (days)" type="number" min="1" value={form.durationDays} onChange={(v) => update("durationDays", v)} placeholder="6" />
          </div>
          <Field label="Summary" hint="A one-liner travellers see first.">
            <textarea rows="2" value={form.summary} onChange={(e) => update("summary", e.target.value)} placeholder="Turquoise lakes, ancient forts and the Karakoram Highway." className={`${adminInputCls} resize-none`} />
          </Field>

          {/* Cover image */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cover photo</span>
              <ImageUploadButton folder="tours" onUploaded={(url) => update("coverImage", url)} />
            </div>
            <input value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)} placeholder="https://…  or use Upload" className={adminInputCls} />
            {form.coverImage && <img loading="lazy" decoding="async" src={form.coverImage} alt="" className="mt-2 h-32 w-full rounded-xl object-cover" />}
          </div>

          {/* Cities */}
          <div>
            <p className={secLabel}>Cities covered</p>
            {cityOptions.length === 0 ? (
              <p className="text-sm text-slate-400">Ask an admin to add cities.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {cityOptions.map((c) => (
                  <button key={c} type="button" onClick={() => toggleCity(c)}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${form.cities.includes(c) ? "bg-lime-400 text-night-950" : "bg-slate-100 text-slate-500 hover:text-lime-700"}`}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Spots (hybrid) */}
          <div>
            <div className={secLabel}>
              <span>Spots visited</span>
              <select value="" onChange={(e) => { const s = catalogSpots.find((x) => x.spotId === e.target.value); if (s) addRow("spots", { ...s }); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 [color-scheme:light]">
                <option value="">+ Add from catalog</option>
                {catalogSpots.map((s) => <option key={s.spotId} value={s.spotId}>{s.name} · {s.city}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              {form.spots.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={s.name} onChange={(e) => setRow("spots", i, { name: e.target.value })} placeholder="Spot name" className={rowInput} />
                  <input value={s.city || ""} onChange={(e) => setRow("spots", i, { city: e.target.value })} placeholder="City" className={`${rowInput} max-w-[38%]`} />
                  <button type="button" onClick={() => delRow("spots", i)} className={iconBtn}><X className="h-4 w-4" /></button>
                </div>
              ))}
              <BtnGhost type="button" onClick={() => addRow("spots", { spotId: "", name: "", city: "" })}><Plus className="h-4 w-4" /> Add spot</BtnGhost>
            </div>
          </div>

          {/* Hotels (hybrid) */}
          <div>
            <div className={secLabel}>
              <span>Hotel stays</span>
              <select value="" onChange={(e) => { const h = catalogHotels.find((x) => x.accId === e.target.value); if (h) addRow("hotels", { ...h, nights: "1" }); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 [color-scheme:light]">
                <option value="">+ Add from catalog</option>
                {catalogHotels.map((h) => <option key={h.accId} value={h.accId}>{h.name} · {h.city}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              {form.hotels.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={h.name} onChange={(e) => setRow("hotels", i, { name: e.target.value })} placeholder="Hotel name" className={rowInput} />
                  <input value={h.city || ""} onChange={(e) => setRow("hotels", i, { city: e.target.value })} placeholder="City" className={`${rowInput} max-w-[28%]`} />
                  <input type="number" min="0" value={h.nights} onChange={(e) => setRow("hotels", i, { nights: e.target.value })} placeholder="Nights" className={`${rowInput} max-w-[90px]`} />
                  <button type="button" onClick={() => delRow("hotels", i)} className={iconBtn}><X className="h-4 w-4" /></button>
                </div>
              ))}
              <BtnGhost type="button" onClick={() => addRow("hotels", { accId: "", name: "", city: "", nights: "1" })}><Plus className="h-4 w-4" /> Add hotel</BtnGhost>
            </div>
          </div>

          {/* Itinerary */}
          <div>
            <p className={secLabel}>Day-by-day itinerary</p>
            <div className="space-y-2">
              {form.itinerary.map((d, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-2 w-14 shrink-0 text-xs font-bold text-slate-400">Day {i + 1}</span>
                  <div className="flex-1 space-y-2">
                    <input value={d.title} onChange={(e) => setRow("itinerary", i, { title: e.target.value })} placeholder="Title (e.g. Arrive in Hunza)" className={rowInput} />
                    <textarea rows="2" value={d.detail} onChange={(e) => setRow("itinerary", i, { detail: e.target.value })} placeholder="What happens this day…" className={`${rowInput} resize-none`} />
                  </div>
                  <button type="button" onClick={() => delRow("itinerary", i)} className={iconBtn}><X className="h-4 w-4" /></button>
                </div>
              ))}
              <BtnGhost type="button" onClick={() => addRow("itinerary", { day: form.itinerary.length + 1, title: "", detail: "" })}><Plus className="h-4 w-4" /> Add day</BtnGhost>
            </div>
          </div>

          {/* Inclusions / exclusions */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Inclusions" value={form.inclusions} onChange={(v) => update("inclusions", v)} placeholder="Transport, Breakfast, Guide" hint="Comma separated." />
            <Field label="Exclusions" value={form.exclusions} onChange={(v) => update("exclusions", v)} placeholder="Flights, Lunch, Tips" hint="Comma separated." />
          </div>

          {/* Departures */}
          <div>
            <p className={secLabel}>Group departures <span className="font-normal normal-case text-slate-400">(date + seat capacity)</span></p>
            <div className="space-y-2">
              {form.departures.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="date" value={d.date} onChange={(e) => setRow("departures", i, { date: e.target.value })} className={`${rowInput} max-w-[200px]`} />
                  <input type="number" min="1" value={d.seatsTotal} onChange={(e) => setRow("departures", i, { seatsTotal: e.target.value })} placeholder="Seats" className={`${rowInput} max-w-[110px]`} />
                  {d.seatsBooked != null && <span className="text-xs text-slate-400">{d.seatsBooked} booked</span>}
                  <button type="button" onClick={() => delRow("departures", i)} className={iconBtn}><X className="h-4 w-4" /></button>
                </div>
              ))}
              <BtnGhost type="button" onClick={() => addRow("departures", { date: "", seatsTotal: "10" })}><Plus className="h-4 w-4" /> Add departure</BtnGhost>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-lime-500 accent-lime-500" />
            Published (visible to travellers once approved)
          </label>
        </div>
      </Modal>
    </TravelAgencyLayout>
  );
}
