import React, { useState, useEffect } from "react";
import { Building2, Plus, Pencil, Trash2, MapPin, Image as ImageIcon, Landmark, Percent } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Card, SectionHead, StatCard, Btn, BtnGhost, Field, adminInputCls } from "../../components/dashboard/ui";
import Modal from "../../components/dashboard/Modal";
import { LIVE, listCities, createCity, updateCity, deleteCity, getSettings, updateSettings } from "../../data/adminApi";
import ImageUploadButton from "../../components/dashboard/ImageUploadButton";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";

const emptyAccount = { label: "", bank: "", accountName: "", accountNumber: "", instructions: "" };

const emptyForm = { name: "", tagline: "", photo: "" };
const byName = (a, b) => a.name.localeCompare(b.name);

export default function AdminSettings() {
  const [cities, setCities] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // Revenue & payment settings
  const [commission, setCommission] = useState(15);
  const [threshold, setThreshold] = useState(5000);
  const [accounts, setAccounts] = useState([]);
  const [savingPay, setSavingPay] = useState(false);

  useEffect(() => {
    if (!LIVE) return;
    listCities().then(setCities).catch(() => {});
    getSettings().then((s) => {
      setCommission(s.commissionPercent ?? 15);
      setThreshold(s.minPayoutThreshold ?? 5000);
      setAccounts(s.paymentAccounts || []);
    }).catch(() => {});
  }, []);

  const setAccount = (i, key, val) => setAccounts((prev) => prev.map((a, idx) => (idx === i ? { ...a, [key]: val } : a)));
  const addAccount = () => setAccounts((prev) => [...prev, { ...emptyAccount }]);
  const removeAccount = (i) => setAccounts((prev) => prev.filter((_, idx) => idx !== i));

  const savePaymentSettings = async () => {
    const cleaned = accounts.filter((a) => a.accountNumber?.trim() || a.label?.trim());
    setSavingPay(true);
    try {
      if (LIVE) await updateSettings({ commissionPercent: Number(commission) || 0, minPayoutThreshold: Number(threshold) || 0, paymentAccounts: cleaned });
      setAccounts(cleaned);
      toast.success("Payment settings saved.");
    } catch {
      toast.error("Couldn't save payment settings. Please try again.");
    } finally {
      setSavingPay(false);
    }
  };

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, tagline: c.tagline || "", photo: c.photo || "" });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (city) => {
    const ok = await confirmDialog({
      title: "Delete city?",
      body: `"${city.name}" will be removed from the dropdown and traveller panel. Spots already tagged to it keep their city name.`,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    if (LIVE) {
      try { await deleteCity(city._id); }
      catch { toast.error("Couldn't delete this city. Please try again."); return; }
    }
    setCities((prev) => prev.filter((c) => c._id !== city._id));
    toast.success(`"${city.name}" deleted.`);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErrors({ name: "City name is required" }); return; }
    const payload = { name: form.name.trim(), tagline: form.tagline, photo: form.photo };
    if (LIVE) {
      try {
        if (editing) {
          const c = await updateCity(editing._id, payload);
          setCities((prev) => prev.map((x) => (x._id === editing._id ? (c || { ...x, ...payload }) : x)).sort(byName));
        } else {
          const c = await createCity(payload);
          setCities((prev) => [...prev, c].sort(byName));
        }
      } catch (err) {
        toast.error(err?.response?.data?.error || (editing ? "Couldn't save changes." : "Couldn't add this city."));
        return;
      }
    } else if (editing) {
      setCities((prev) => prev.map((x) => (x._id === editing._id ? { ...x, ...payload } : x)));
    } else {
      setCities((prev) => [...prev, { _id: `city-${Date.now()}`, ...payload }].sort(byName));
    }
    setModalOpen(false);
    toast.success(editing ? `"${payload.name}" updated.` : `"${payload.name}" added.`);
  };

  return (
    <AdminLayout greeting="Settings" subtitle="Cities, commission and the accounts travellers pay into">
      {/* Revenue & payment accounts */}
      <Card>
        <SectionHead
          title="Revenue & payments"
          sub="Your commission and the accounts shown to travellers at checkout."
          action={<Btn onClick={savePaymentSettings} disabled={savingPay}>{savingPay ? "Saving…" : "Save payment settings"}</Btn>}
        />
        <div className="grid max-w-lg gap-5 sm:grid-cols-2">
          <Field
            label="Platform commission (%)"
            type="number"
            min="0"
            max="100"
            step="1"
            value={commission}
            onChange={(v) => setCommission(v)}
            hint="Kept by the platform; the rest is a partner's earnings."
          />
          <Field
            label="Minimum payout (PKR)"
            type="number"
            min="0"
            step="500"
            value={threshold}
            onChange={(v) => setThreshold(v)}
            hint="Partners can only request a payout at or above this balance."
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Landmark className="h-4 w-4 text-lime-600" /> Payment accounts</p>
          <BtnGhost onClick={addAccount}><Plus className="h-4 w-4" /> Add account</BtnGhost>
        </div>
        {accounts.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            No accounts yet. Add a bank or wallet account travellers can pay into.
          </p>
        ) : (
          <div className="mt-3 space-y-4">
            {accounts.map((a, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Label" value={a.label} onChange={(v) => setAccount(i, "label", v)} placeholder="e.g. Meezan Bank" />
                  <Field label="Bank / wallet" value={a.bank} onChange={(v) => setAccount(i, "bank", v)} placeholder="e.g. Bank / JazzCash / Easypaisa" />
                  <Field label="Account name" value={a.accountName} onChange={(v) => setAccount(i, "accountName", v)} placeholder="Account holder name" />
                  <Field label="Account number / IBAN" value={a.accountNumber} onChange={(v) => setAccount(i, "accountNumber", v)} placeholder="PK.. / 03xx.." />
                </div>
                <div className="mt-3">
                  <Field label="Instructions" value={a.instructions} onChange={(v) => setAccount(i, "instructions", v)} placeholder="e.g. Add your booking name in the reference" />
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={() => removeAccount(i)} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 transition-colors hover:text-rose-600">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} tone="emerald" label="Cities" value={cities.length} />
        <StatCard icon={ImageIcon} tone="sky" label="With photos" value={cities.filter((c) => c.photo).length} />
        <StatCard icon={MapPin} tone="apricot" label="Missing photo" value={cities.filter((c) => !c.photo).length} />
      </div>

      <Card className="mt-6">
        <SectionHead
          title="Cities"
          sub="These feed the city dropdown when adding spots, and their photos appear in the traveller app."
          action={<Btn onClick={openAdd}><Plus className="h-4 w-4" /> Add city</Btn>}
        />
        {cities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-14 text-center text-sm text-slate-400">
            No cities yet. Add your first city to populate the spot dropdown.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cities.map((city) => (
              <Card key={city._id} className="flex flex-col overflow-hidden !p-0">
                <div className="relative h-36 w-full">
                  {city.photo ? (
                    <img src={city.photo} alt={city.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                      <ImageIcon className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-base font-bold text-slate-900">{city.name}</h3>
                  {city.tagline && <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{city.tagline}</p>}
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(city)} title="Edit city" className="flex h-8 w-8 items-center justify-center rounded-lg text-lime-600 transition-colors hover:bg-lime-50">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(city)} title="Delete city" className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        icon={Building2}
        title={editing ? "Edit city" : "Add a city"}
        subtitle={editing ? "Update this city's details." : "Add a city travellers can explore and spots can be tagged to."}
        onSubmit={handleSave}
        size="lg"
        footer={
          <>
            <BtnGhost type="button" onClick={() => setModalOpen(false)}>Cancel</BtnGhost>
            <Btn type="submit">{editing ? "Save changes" : "Add city"}</Btn>
          </>
        }
      >
        <div className="space-y-5">
          <Field
            label="City name"
            required
            value={form.name}
            onChange={(v) => update("name", v)}
            placeholder="e.g. Abbottabad"
            hint="Shown in the spot dropdown and the traveller app."
            error={errors.name}
          />
          <Field
            label="Tagline"
            value={form.tagline}
            onChange={(v) => update("tagline", v)}
            placeholder="e.g. Pine forests and colonial charm"
            hint="A short line shown under the city."
          />
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">City photo</span>
              <ImageUploadButton folder="cities" onUploaded={(url) => update("photo", url)} />
            </div>
            <input
              value={form.photo}
              onChange={(e) => update("photo", e.target.value)}
              placeholder="https://…  or use Upload"
              className={adminInputCls}
            />
            {form.photo && <img src={form.photo} alt="" className="mt-2 h-32 w-full rounded-xl object-cover" />}
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
