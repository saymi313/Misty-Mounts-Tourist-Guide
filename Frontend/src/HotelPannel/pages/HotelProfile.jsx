import React, { useState, useEffect } from "react";
import { MapPin, Check, BedDouble } from "lucide-react";
import HotelLayout from "../HotelLayout";
import { Card, SectionHead, Btn, Field, adminInputCls } from "../../components/dashboard/ui";
import ImageUploadButton from "../../components/dashboard/ImageUploadButton";
import { useAuth } from "../../context/AuthContext";
import { required, email as emailRule, phone as phoneRule, validate, hasErrors } from "../../utils/validation";
import useCities from "../../hooks/useCities";
import { toast } from "../../utils/toast";
import api, { LIVE } from "../../data/api";

/** Hotel-manager profile — business details shown to travellers. */
export default function HotelProfile() {
  const { user, updateUser } = useAuth();
  const cities = useCities();
  const [form, setForm] = useState({ hotelName: "", name: "", email: "", phone: "", city: "", bio: "" });
  const [avatar, setAvatar] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (LIVE) {
          const { data } = await api.get("/user/me");
          const u = data.user || {};
          if (!alive) return;
          setForm({
            hotelName: u.hotelName || "", name: u.name || "", email: u.email || "",
            phone: u.phone || "", city: u.city || "", bio: u.bio || "",
          });
          setAvatar(u.avatar || "");
        } else {
          setForm((f) => ({ ...f, name: user?.name || "", email: user?.email || "" }));
          setAvatar(user?.avatar || "");
        }
      } catch { /* ignore */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onAvatar = (url) => { setAvatar(url); updateUser({ avatar: url }); toast.success("Logo updated."); };

  const handleSave = (e) => {
    e.preventDefault();
    const found = validate(form, {
      hotelName: [required("Hotel name is required")],
      name: [required("Contact name is required")],
      email: [required("Email is required"), emailRule()],
      phone: [phoneRule()],
    });
    if (hasErrors(found)) { setErrors(found); return; }
    updateUser({ ...form, avatar });
    toast.success("Profile saved.");
  };

  const cityOptions = [...new Set([...cities.map((c) => c.name), form.city].filter(Boolean))];
  const initial = (form.hotelName || form.name || "H").charAt(0).toUpperCase();

  if (loading) {
    return (
      <HotelLayout greeting="My profile" subtitle="Manage your hotel details">
        <Card className="text-center text-sm text-slate-400">Loading your profile…</Card>
      </HotelLayout>
    );
  }

  return (
    <HotelLayout greeting="My profile" subtitle="Manage your hotel details and how travellers see you">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_1.4fr]">
        <Card className="h-fit">
          <div className="flex items-center gap-4">
            {avatar ? (
              <img src={avatar} alt={form.hotelName} className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-lime-400 text-2xl font-extrabold text-night-950">{initial}</span>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-900">{form.hotelName || form.name || "Your hotel"}</h2>
              <p className="truncate text-sm text-slate-400">{form.email}</p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-600">
                <BedDouble className="h-3 w-3" /> Hotel
              </span>
            </div>
          </div>
          <div className="mt-4">
            <ImageUploadButton folder="avatars" label={avatar ? "Change logo" : "Upload logo"} onUploaded={onAvatar} />
          </div>
          <div className="mt-5 rounded-2xl border border-slate-100 p-3 text-center">
            <MapPin className="mx-auto h-4 w-4 text-lime-600" />
            <p className="mt-1 truncate text-sm font-bold text-slate-900">{form.city || "—"}</p>
            <p className="text-[11px] text-slate-400">City</p>
          </div>
        </Card>

        <Card>
          <SectionHead title="Edit your info" sub="Travellers see this on your listings." />
          <form onSubmit={handleSave} noValidate className="space-y-5">
            <Field label="Hotel / business name" required value={form.hotelName} onChange={(v) => update("hotelName", v)} placeholder="e.g. Luxus Hunza Resort" error={errors.hotelName} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Contact name" required value={form.name} onChange={(v) => update("name", v)} placeholder="Manager name" error={errors.name} />
              <Field label="Email" type="email" required value={form.email} onChange={(v) => update("email", v)} placeholder="you@example.com" error={errors.email} />
              <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+92 300 1234567" error={errors.phone} />
              <Field label="City" hint={cityOptions.length ? "The city your hotel is in." : "Ask an admin to add cities."}>
                <select value={form.city} onChange={(e) => update("city", e.target.value)} className={adminInputCls}>
                  <option value="">Select a city</option>
                  {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">About your hotel</label>
              <textarea
                rows="4"
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                maxLength={500}
                placeholder="Tell travellers about your rooms, amenities and what makes your stay special…"
                className={`${adminInputCls} resize-none`}
              />
              <p className="mt-1 text-right text-xs text-slate-400">{form.bio.length}/500</p>
            </div>
            <div className="flex justify-end border-t border-slate-100 pt-5">
              <Btn type="submit"><Check className="h-4 w-4" /> Save changes</Btn>
            </div>
          </form>
        </Card>
      </div>
    </HotelLayout>
  );
}
