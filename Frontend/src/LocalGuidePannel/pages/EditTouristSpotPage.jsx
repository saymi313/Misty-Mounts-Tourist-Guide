import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, ImageIcon, AlertCircle } from "lucide-react";
import GuideLayout from "../GuideLayout";
import { Card, SectionHead, Btn, BtnGhost } from "../../components/dashboard/ui";
import { allPlaces } from "../../data/mockData";
import { required, url, minLen, validate, hasErrors } from "../../utils/validation";

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none [color-scheme:light] focus:border-emerald-400";
const labelCls = "text-sm font-medium text-slate-700";
const errNote = "mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500";

/** Local Guide — edit an existing tourist spot (local only, no backend). */
export default function EditTouristSpotPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const existing = allPlaces.find((p) => p._id === id);

  const [form, setForm] = useState({
    name: existing?.name || "",
    city: existing?.city || "",
    location: existing?.location || "",
    description: existing?.description || "",
    picture: existing?.picture || "",
    activities: existing?.activities?.join(", ") || "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const errCls = (k) => (errors[k] ? " !border-rose-300 focus:!border-rose-400" : "");

  const handleSubmit = (e) => {
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
    // Local only — the backend is disconnected. Navigate back to the list.
    navigate("/local-guide/spots");
  };

  if (!existing) {
    return (
      <GuideLayout greeting="Edit tourist spot" subtitle="Update the details of your spot.">
        <Card className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-slate-900">Spot not found</p>
          <p className="mt-1 text-sm text-slate-400">This spot may have been removed.</p>
          <BtnGhost className="mt-5" onClick={() => navigate("/local-guide/spots")}>
            <ArrowLeft className="h-4 w-4" /> Back to spots
          </BtnGhost>
        </Card>
      </GuideLayout>
    );
  }

  return (
    <GuideLayout greeting="Edit tourist spot" subtitle="Update the details of your spot.">
      <form onSubmit={handleSubmit} noValidate>
        <Card className="mx-auto max-w-3xl">
          <SectionHead
            title="Spot details"
            sub="Refine what travellers see about this place."
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
            <label htmlFor="picture" className={labelCls}>Image URL</label>
            <input
              id="picture"
              name="picture"
              type="url"
              value={form.picture}
              onChange={handleChange}
              placeholder="https://..."
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
              <Save className="h-4 w-4" /> Save changes
            </Btn>
          </div>
        </Card>
      </form>
    </GuideLayout>
  );
}
