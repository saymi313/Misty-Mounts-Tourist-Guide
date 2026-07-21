import React, { useState } from "react";
import { Map as MapIcon, Gem, Building2, Plus, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard, StatusPill, Btn, BtnGhost } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import { allPlaces } from "../../data/mockData";

// Seed local state from the mock layer, deriving a moderation status per spot.
const seed = allPlaces.map((p) => ({ ...p, status: p.hiddenGem ? "Pending" : "Approved" }));

const emptyForm = { name: "", city: "", location: "", status: "Pending" };

const TouristSpotManagement = () => {
  const [spots, setSpots] = useState(seed);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // row being edited, or null when adding
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (spot) => {
    setEditing(spot);
    setForm({ name: spot.name, city: spot.city, location: spot.location, status: spot.status });
    setModalOpen(true);
  };

  const handleDelete = (id) => setSpots((prev) => prev.filter((s) => s._id !== id));

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) {
      setSpots((prev) => prev.map((s) => (s._id === editing._id ? { ...s, ...form } : s)));
    } else {
      setSpots((prev) => [
        { _id: `spot-${Date.now()}`, picture: "", hiddenGem: false, ...form },
        ...prev,
      ]);
    }
    setModalOpen(false);
  };

  const total = spots.length;
  const hiddenGems = spots.filter((s) => s.hiddenGem).length;
  const cityCount = new Set(spots.map((s) => s.city)).size;

  return (
    <AdminLayout greeting="Tourist Spots" subtitle="Curate and moderate the places on the map">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={MapIcon} tone="emerald" label="Total spots" value={total} />
        <StatCard icon={Gem} tone="violet" label="Hidden gems" value={hiddenGems} />
        <StatCard icon={Building2} tone="sky" label="Cities covered" value={cityCount} />
      </div>

      {/* Table */}
      <Card className="mt-6">
        <SectionHead
          title="All tourist spots"
          sub={`${total} places listed`}
          action={
            <Btn onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add spot
            </Btn>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3">Spot</th>
                <th className="px-3 py-3">City</th>
                <th className="px-3 py-3">Location</th>
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
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
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
                  <td className="px-3 py-3">
                    <StatusPill status={spot.status} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(spot)}
                        title="Edit spot"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(spot._id)}
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
                  <td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-400">
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
        title={editing ? "Edit spot" : "Add spot"}
        onSubmit={handleSave}
        footer={
          <>
            <BtnGhost type="button" onClick={() => setModalOpen(false)}>Cancel</BtnGhost>
            <Btn type="submit">{editing ? "Save changes" : "Add spot"}</Btn>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400"
            >
              <option>Pending</option>
              <option>Approved</option>
            </select>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

const Field = ({ label, value, onChange }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400"
    />
  </div>
);

export default TouristSpotManagement;
