import React, { useState, useEffect } from "react";
import { Star, MapPin, Check, ShieldCheck } from "lucide-react";
import GuideLayout from "../GuideLayout";
import { Card, SectionHead, Btn, Field, adminInputCls } from "../../components/dashboard/ui";
import ImageUploadButton from "../../components/dashboard/ImageUploadButton";
import { useAuth } from "../../context/AuthContext";
import { required, email as emailRule, phone as phoneRule, validate, hasErrors } from "../../utils/validation";
import useCities from "../../hooks/useCities";
import { toast } from "../../utils/toast";
import api, { LIVE } from "../../data/api";

const toList = (s) => (s || "").split(",").map((x) => x.trim()).filter(Boolean);

/** Local-guide profile — like the traveller profile, with guide-specific detail. */
export default function GuideProfile() {
  const { user, updateUser } = useAuth();
  const cities = useCities();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", city: "", bio: "", experience: "",
    languages: "", specialties: "", serviceAreas: "",
  });
  const [avatar, setAvatar] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Load the full profile — the guide extras live server-side, not in the
  // lightweight session user.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (LIVE) {
          const { data } = await api.get("/user/me");
          const u = data.user || {};
          if (!alive) return;
          setForm({
            name: u.name || "", email: u.email || "", phone: u.phone || "", city: u.city || "",
            bio: u.bio || "", experience: u.experience || "",
            languages: (u.languages || []).join(", "),
            specialties: (u.specialties || []).join(", "),
            serviceAreas: (u.serviceAreas || []).join(", "),
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

  const onAvatar = (url) => { setAvatar(url); updateUser({ avatar: url }); toast.success("Photo updated."); };

  const handleSave = (e) => {
    e.preventDefault();
    const found = validate(form, {
      name: [required("Name is required")],
      email: [required("Email is required"), emailRule()],
      phone: [phoneRule()],
    });
    if (hasErrors(found)) { setErrors(found); return; }
    updateUser({
      name: form.name, email: form.email, phone: form.phone, city: form.city, bio: form.bio,
      experience: form.experience,
      languages: toList(form.languages),
      specialties: toList(form.specialties),
      serviceAreas: toList(form.serviceAreas),
      avatar,
    });
    toast.success("Profile saved.");
  };

  const cityOptions = [...new Set([...cities.map((c) => c.name), form.city].filter(Boolean))];
  const initial = (form.name || "G").charAt(0).toUpperCase();

  if (loading) {
    return (
      <GuideLayout greeting="My profile" subtitle="Manage your guide details">
        <Card className="text-center text-sm text-slate-400">Loading your profile…</Card>
      </GuideLayout>
    );
  }

  return (
    <GuideLayout greeting="My profile" subtitle="Manage your guide details and how travellers see you">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_1.4fr]">
        {/* Summary */}
        <Card className="h-fit">
          <div className="flex items-center gap-4">
            {avatar ? (
              <img src={avatar} alt={form.name} className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-lime-400 text-2xl font-extrabold text-night-950">{initial}</span>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-900">{form.name || "Local guide"}</h2>
              <p className="truncate text-sm text-slate-400">{form.email}</p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600">
                <ShieldCheck className="h-3 w-3" /> Local Guide
              </span>
            </div>
          </div>
          <div className="mt-4">
            <ImageUploadButton folder="avatars" label={avatar ? "Change photo" : "Upload photo"} onUploaded={onAvatar} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-slate-100 p-3 text-center">
              <MapPin className="mx-auto h-4 w-4 text-lime-600" />
              <p className="mt-1 truncate text-sm font-bold text-slate-900">{form.city || "—"}</p>
              <p className="text-[11px] text-slate-400">Home base</p>
            </div>
            <div className="rounded-2xl border border-slate-100 p-3 text-center">
              <Star className="mx-auto h-4 w-4 text-amber-500" />
              <p className="mt-1 truncate text-sm font-bold text-slate-900">{form.experience || "—"}</p>
              <p className="text-[11px] text-slate-400">Experience</p>
            </div>
          </div>
        </Card>

        {/* Edit form */}
        <Card>
          <SectionHead title="Edit your info" sub="Travellers see this on your guide profile." />
          <form onSubmit={handleSave} noValidate className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" required value={form.name} onChange={(v) => update("name", v)} placeholder="Your name" error={errors.name} />
              <Field label="Email" type="email" required value={form.email} onChange={(v) => update("email", v)} placeholder="you@example.com" error={errors.email} />
              <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+92 300 1234567" error={errors.phone} />
              <Field label="Home base" hint={cityOptions.length ? "The city you're based in." : "Ask an admin to add cities."}>
                <select value={form.city} onChange={(e) => update("city", e.target.value)} className={adminInputCls}>
                  <option value="">Select a city</option>
                  {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Years of experience" value={form.experience} onChange={(v) => update("experience", v)} placeholder="e.g. 6 years" />
              <Field label="Languages" value={form.languages} onChange={(v) => update("languages", v)} placeholder="Urdu, English, Burushaski" hint="Comma separated." />
            </div>
            <Field label="Specialties" value={form.specialties} onChange={(v) => update("specialties", v)} placeholder="Trekking, Photography tours, Cultural walks" hint="Comma separated." />
            <Field label="Areas you cover" value={form.serviceAreas} onChange={(v) => update("serviceAreas", v)} placeholder="Hunza, Nagar, Gojal" hint="Comma separated." />
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">About you</label>
              <textarea
                rows="4"
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                maxLength={500}
                placeholder="Tell travellers about your experience and what makes your tours special…"
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
    </GuideLayout>
  );
}
