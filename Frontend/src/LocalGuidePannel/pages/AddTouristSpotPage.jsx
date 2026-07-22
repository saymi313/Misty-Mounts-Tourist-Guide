import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ImageIcon, AlertCircle } from "lucide-react";
import GuideLayout from "../GuideLayout";
import { Card, SectionHead, Btn, BtnGhost } from "../../components/dashboard/ui";
import { required, url, minLen, validate, hasErrors } from "../../utils/validation";
import { LIVE, createPlace } from "../../data/adminApi";
import ImageUploadButton from "../../components/dashboard/ImageUploadButton";

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none [color-scheme:light] focus:border-emerald-400";
const labelCls = "text-sm font-medium text-slate-700";
const errNote = "mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500";

/** Local Guide — add a new tourist spot (local only, no backend). */
export default function AddTouristSpotPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    city: "",
    location: "",
    description: "",
    picture: "",
    activities: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const errCls = (k) => (errors[k] ? " !border-rose-300 focus:!border-rose-400" : "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form, {
      name: [required("Name is required")],
      city: [required("City is required")],
      location: [required("Location is required")],
      description: [required("Description is required"), minLen(10, "Add at least 10 characters")],
      picture: [url("Enter a valid image URL (https://…)")],
    });
    if (hasErrors(found)) {
      setErrors(found);
      return;
    }
    if (LIVE) {
      try {
        await createPlace({
          name: form.name,
          city: form.city,
          location: form.location,
          description: form.description,
          picture: form.picture,
          activities: form.activities ? form.activities.split(",").map((s) => s.trim()).filter(Boolean) : [],
          curatedBy: "Local guide",
        });
      } catch { /* fall through and navigate back */ }
    }
    navigate("/local-guide/spots");
  };

  return (
    <GuideLayout
      greeting="Add a tourist spot"
      subtitle="Share a new place for travellers to discover."
    >
      <form onSubmit={handleSubmit} noValidate>
        <Card className="mx-auto max-w-3xl">
          <SectionHead
            title="Spot details"
            sub="Tell travellers what makes this place special."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="name" className={labelCls}>Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Attabad Lake"
                aria-invalid={!!errors.name}
                className={inputCls + errCls("name")}
              />
              {errors.name && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="city" className={labelCls}>City</label>
              <input
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Hunza"
                aria-invalid={!!errors.city}
                className={inputCls + errCls("city")}
              />
              {errors.city && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.city}</p>}
            </div>
          </div>

          <div className="mt-5 space-y-1.5">
            <label htmlFor="location" className={labelCls}>Location</label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Gojal, Upper Hunza"
              aria-invalid={!!errors.location}
              className={inputCls + errCls("location")}
            />
            {errors.location && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.location}</p>}
          </div>

          <div className="mt-5 space-y-1.5">
            <label htmlFor="description" className={labelCls}>Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="What should travellers know about this place?"
              aria-invalid={!!errors.description}
              className={`${inputCls} resize-none${errCls("description")}`}
            />
            {errors.description && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.description}</p>}
          </div>

          <div className="mt-5 space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="picture" className={labelCls}>Image</label>
              <ImageUploadButton
                folder="spots"
                onUploaded={(url) => {
                  setForm((f) => ({ ...f, picture: url }));
                  if (errors.picture) setErrors((er) => ({ ...er, picture: undefined }));
                }}
              />
            </div>
            <input
              id="picture"
              name="picture"
              type="url"
              value={form.picture}
              onChange={handleChange}
              placeholder="https://…  or use Upload"
              aria-invalid={!!errors.picture}
              className={inputCls + errCls("picture")}
            />
            {errors.picture && <p className={errNote}><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.picture}</p>}
          </div>

          {form.picture ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
              <img src={form.picture} alt="Preview" className="h-44 w-full object-cover" />
            </div>
          ) : (
            <div className="mt-4 flex h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 text-slate-300">
              <ImageIcon className="h-7 w-7" />
              <span className="text-xs">Image preview</span>
            </div>
          )}

          <div className="mt-5 space-y-1.5">
            <label htmlFor="activities" className={labelCls}>Activities</label>
            <input
              id="activities"
              name="activities"
              value={form.activities}
              onChange={handleChange}
              placeholder="Comma separated — e.g. Boating, Photography, Hiking"
              className={inputCls}
            />
            <p className="text-xs text-slate-400">Separate each activity with a comma.</p>
          </div>

          <div className="mt-7 flex items-center justify-end gap-3">
            <BtnGhost type="button" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" /> Cancel
            </BtnGhost>
            <Btn type="submit">
              <Save className="h-4 w-4" /> Save spot
            </Btn>
          </div>
        </Card>
      </form>
    </GuideLayout>
  );
}
