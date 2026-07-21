import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import GuideLayout from "../GuideLayout";
import { Card, SectionHead, Btn, BtnGhost } from "../../components/dashboard/ui";
import { disasters } from "../../data/mockData";

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400";
const labelCls = "text-sm font-medium text-slate-700";

/** Local Guide — post or edit a safety alert (local only, no backend). */
export default function NaturalDisasterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const existing = id ? disasters.find((d) => d._id === id) : null;

  const [form, setForm] = useState({
    name: existing?.name || "",
    location: existing?.location || "",
    description: existing?.description || "",
    severity: existing?.severity || "Low",
    date: existing?.date || "",
    isResolved: existing?.isResolved || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Local only — the backend is disconnected. Navigate back to the list.
    navigate("/local-guide/natural-disasters");
  };

  return (
    <GuideLayout
      greeting={id ? "Edit alert" : "Post an alert"}
      subtitle="Share real-time safety information with travellers."
    >
      <form onSubmit={handleSubmit}>
        <Card className="mx-auto max-w-3xl">
          <SectionHead
            title="Alert details"
            sub="Be specific about the location and conditions."
          />

          <div className="space-y-1.5">
            <label htmlFor="name" className={labelCls}>Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Flash-flood Advisory — Hunza River"
              className={inputCls}
            />
          </div>

          <div className="mt-5 space-y-1.5">
            <label htmlFor="location" className={labelCls}>Location</label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="e.g. Lower Hunza & Nagar"
              className={inputCls}
            />
          </div>

          <div className="mt-5 space-y-1.5">
            <label htmlFor="description" className={labelCls}>Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the situation and any advice for travellers."
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="severity" className={labelCls}>Severity</label>
              <select
                id="severity"
                name="severity"
                value={form.severity}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="date" className={labelCls}>Date</label>
              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>
          </div>

          <label
            htmlFor="isResolved"
            className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"
          >
            <input
              id="isResolved"
              name="isResolved"
              type="checkbox"
              checked={form.isResolved}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-emerald-500 accent-emerald-500 focus:ring-emerald-400"
            />
            <span className="text-sm font-medium text-slate-700">Mark this alert as resolved</span>
          </label>

          <div className="mt-7 flex items-center justify-end gap-3">
            <BtnGhost type="button" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" /> Cancel
            </BtnGhost>
            <Btn type="submit">
              <Save className="h-4 w-4" /> {id ? "Save changes" : "Post alert"}
            </Btn>
          </div>
        </Card>
      </form>
    </GuideLayout>
  );
}
