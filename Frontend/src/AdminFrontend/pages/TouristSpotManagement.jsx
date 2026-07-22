import React, { useState, useEffect } from "react";
import { Map as MapIcon, Gem, Building2, Plus, Pencil, Trash2, Check, Clock, Shield, User as UserIcon } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard, StatusPill, Btn, BtnGhost, Field, adminInputCls } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import { required, validate, hasErrors } from "../../utils/validation";
import { LIVE, listPlaces, createPlace, updatePlace, approvePlace, deletePlace, getSettings, updateSettings } from "../../data/adminApi";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";
import ImageUploadButton from "../../components/dashboard/ImageUploadButton";
import useCities from "../../hooks/useCities";

// Flat place → row shape (status derived from approval).
const toRow = (p) => ({ ...p, status: p.isApproved === false ? "Pending" : "Approved" });

// Chip showing who uploaded a spot — the admin, or a named local guide.
const UploaderBadge = ({ place }) => {
  const role = place.uploaderRole || (place.curatedBy ? "local guide" : "");
  const name = place.uploaderName || place.curatedBy || "";
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-lime-50 px-2.5 py-1 text-xs font-semibold text-lime-700">
        <Shield className="h-3 w-3" /> Admin{name && name.toLowerCase() !== "admin" ? ` · ${name}` : ""}
      </span>
    );
  }
  if (role === "local guide") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600">
        <UserIcon className="h-3 w-3" /> {name || "Local guide"}
      </span>
    );
  }
  return <span className="text-xs text-slate-400">—</span>;
};

const emptyForm = { name: "", city: "", location: "", picture: "", status: "Pending" };

const TouristSpotManagement = () => {
  const [spots, setSpots] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // row being edited, or null when adding
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [autoApprove, setAutoApprove] = useState(false);
  const cities = useCities();
  const cityOptions = [...new Set([...cities.map((c) => c.name), form.city].filter(Boolean))];

  useEffect(() => {
    if (!LIVE) return;
    listPlaces().then((places) => setSpots(places.map(toRow))).catch(() => {});
    getSettings().then((s) => setAutoApprove(!!s.autoApproveSpots)).catch(() => {});
  }, []);

  const handleApprove = async (spot) => {
    if (LIVE) {
      try {
        const place = await approvePlace(spot._id, true);
        setSpots((prev) => prev.map((s) => (s._id === spot._id ? toRow(place || { ...s, isApproved: true }) : s)));
      } catch { toast.error("Couldn't approve this spot. Please try again."); return; }
    } else {
      setSpots((prev) => prev.map((s) => (s._id === spot._id ? { ...s, status: "Approved", isApproved: true } : s)));
    }
    toast.success(`"${spot.name}" approved and now visible to travellers.`);
  };

  const toggleAutoApprove = async () => {
    const next = !autoApprove;
    setAutoApprove(next); // optimistic
    if (LIVE) {
      try { await updateSettings({ autoApproveSpots: next }); }
      catch { setAutoApprove(!next); toast.error("Couldn't update auto-approval. Please try again."); return; }
    }
    toast.success(
      next
        ? "Auto-approval on — new guide spots go live instantly."
        : "Auto-approval off — new guide spots wait for review."
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

  const openEdit = (spot) => {
    setEditing(spot);
    setForm({ name: spot.name, city: spot.city, location: spot.location, picture: spot.picture || "", status: spot.status });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (spot) => {
    const ok = await confirmDialog({
      title: "Delete tourist spot?",
      body: `"${spot.name}" will be removed from the map and destination pages.`,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    if (LIVE) {
      try { await deletePlace(spot._id); }
      catch { toast.error("Couldn't delete this spot. Please try again."); return; }
    }
    setSpots((prev) => prev.filter((s) => s._id !== spot._id));
    toast.success(`"${spot.name}" deleted.`);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const found = validate(form, {
      name: [required("Name is required")],
      city: [required("City is required")],
    });
    if (hasErrors(found)) {
      setErrors(found);
      return;
    }
    if (LIVE) {
      const payload = {
        name: form.name,
        city: form.city,
        location: form.location,
        picture: form.picture,
        isApproved: form.status !== "Pending",
      };
      try {
        if (editing) {
          const place = await updatePlace(editing._id, payload);
          setSpots((prev) => prev.map((s) => (s._id === editing._id ? toRow(place || { ...s, ...payload }) : s)));
        } else {
          const place = await createPlace(payload);
          setSpots((prev) => [toRow(place), ...prev]);
        }
      } catch {
        toast.error(editing ? "Couldn't save changes. Please try again." : "Couldn't add this spot. Please try again.");
        return;
      }
    } else if (editing) {
      setSpots((prev) => prev.map((s) => (s._id === editing._id ? { ...s, ...form } : s)));
    } else {
      setSpots((prev) => [
        { _id: `spot-${Date.now()}`, picture: "", hiddenGem: false, ...form },
        ...prev,
      ]);
    }
    setModalOpen(false);
    toast.success(editing ? `"${form.name}" updated.` : `"${form.name}" added.`);
  };

  const total = spots.length;
  const pending = spots.filter((s) => s.status === "Pending").length;
  const cityCount = new Set(spots.map((s) => s.city)).size;

  return (
    <AdminLayout greeting="Tourist Spots" subtitle="Curate and moderate the places on the map">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={MapIcon} tone="emerald" label="Total spots" value={total} />
        <StatCard icon={Clock} tone="apricot" label="Pending review" value={pending} />
        <StatCard icon={Building2} tone="sky" label="Cities covered" value={cityCount} />
      </div>

      {/* Table */}
      <Card className="mt-6">
        <SectionHead
          title="All tourist spots"
          sub={`${total} places listed${pending ? ` · ${pending} pending` : ""}`}
          action={
            <div className="flex flex-wrap items-center gap-4">
              <label
                className="flex cursor-pointer select-none items-center gap-2.5"
                title="When on, spots submitted by local guides are approved automatically."
              >
                <span className="text-sm font-medium text-slate-600">Auto-approve guide spots</span>
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
                <Plus className="h-4 w-4" /> Add spot
              </Btn>
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3">Spot</th>
                <th className="px-3 py-3">City</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Uploaded by</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {spots.map((spot) => (
                <tr key={spot._id} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      {spot.picture ? (
                        <img src={spot.picture} alt={spot.name} className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-50 text-lime-600">
                          <MapIcon className="h-5 w-5" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{spot.name}</p>
                        {spot.hiddenGem && (
                          <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-violet-600">
                            <Gem className="h-3 w-3" /> Hidden gem
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">{spot.city}</td>
                  <td className="px-3 py-3 text-sm text-slate-500">{spot.location}</td>
                  <td className="px-3 py-3"><UploaderBadge place={spot} /></td>
                  <td className="px-3 py-3">
                    <StatusPill status={spot.status} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {spot.status === "Pending" && (
                        <button
                          onClick={() => handleApprove(spot)}
                          title="Approve spot"
                          className="flex h-8 items-center gap-1 rounded-lg bg-lime-400 px-2.5 text-xs font-semibold text-night-950 transition-colors hover:bg-lime-300"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(spot)}
                        title="Edit spot"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-lime-600 transition-colors hover:bg-lime-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(spot)}
                        title="Delete spot"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {spots.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-400">
                    No tourist spots yet. Add your first one.
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
        icon={MapIcon}
        title={editing ? "Edit spot" : "Add a tourist spot"}
        subtitle={
          editing
            ? "Update the details for this place."
            : "Add a new place to the interactive map and destination pages."
        }
        onSubmit={handleSave}
        size="lg"
        footer={
          <>
            <BtnGhost type="button" onClick={() => setModalOpen(false)}>Cancel</BtnGhost>
            <Btn type="submit">{editing ? "Save changes" : "Add spot"}</Btn>
          </>
        }
      >
        <div className="space-y-5">
          <Field
            label="Spot name"
            required
            value={form.name}
            onChange={(v) => update("name", v)}
            placeholder="e.g. Attabad Lake"
            hint="The public name shown on the map, cards and search."
            error={errors.name}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="City / valley"
              required
              hint={cityOptions.length ? "Pick the city this spot belongs to." : "Add cities in Settings first."}
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
            <Field
              label="Location"
              value={form.location}
              onChange={(v) => update("location", v)}
              placeholder="e.g. Gojal, Upper Hunza"
              hint="A short area or district description."
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Photo</span>
              <ImageUploadButton folder="spots" onUploaded={(url) => update("picture", url)} />
            </div>
            <input
              value={form.picture}
              onChange={(e) => update("picture", e.target.value)}
              placeholder="https://…  or use Upload"
              className={adminInputCls}
            />
            {form.picture && <img src={form.picture} alt="" className="mt-2 h-32 w-full rounded-xl object-cover" />}
          </div>
          <Field
            label="Moderation status"
            hint="Approved spots are visible to tourists; pending ones await review."
          >
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={adminInputCls}
            >
              <option>Pending</option>
              <option>Approved</option>
            </select>
          </Field>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default TouristSpotManagement;
