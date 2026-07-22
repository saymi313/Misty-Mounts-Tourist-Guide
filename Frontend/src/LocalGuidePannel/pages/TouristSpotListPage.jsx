import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, Pencil, Trash2, Map as MapIcon, Gem, Building2 } from "lucide-react";
import GuideLayout from "../GuideLayout";
import { Card, SectionHead, StatCard, Btn } from "../../components/dashboard/ui";
import { LIVE, listPlaces, deletePlace } from "../../data/adminApi";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";

/** Local Guide — list of tourist spots the guide has curated. */
export default function TouristSpotListPage() {
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    if (LIVE) listPlaces().then((places) => setSpots(places.filter((p) => p.curatedBy))).catch(() => {});
  }, []);

  const handleDelete = async (spot) => {
    const ok = await confirmDialog({
      title: "Delete this spot?",
      body: `"${spot.name}" will be removed from your curated places.`,
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

  const citiesCovered = new Set(spots.map((s) => s.city)).size;
  const hiddenGems = spots.filter((s) => s.hiddenGem).length;

  return (
    <GuideLayout
      greeting="My tourist spots"
      subtitle="Curate and manage the places you show travellers."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={MapIcon} label="Curated spots" value={spots.length} tone="emerald" />
          <StatCard icon={Gem} label="Hidden gems" value={hiddenGems} tone="amber" />
          <StatCard icon={Building2} label="Cities covered" value={citiesCovered} tone="sky" />
        </div>

        <Card>
          <SectionHead
            title="Your spots"
            sub={`${spots.length} places under your guidance`}
            action={
              <Btn onClick={() => navigate("/local-guide/add-spot")}>
                <Plus className="h-4 w-4" /> Add spot
              </Btn>
            }
          />

          {spots.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-50 text-lime-600">
                <MapIcon className="h-6 w-6" />
              </span>
              <p className="mt-4 text-sm font-semibold text-slate-900">No spots yet</p>
              <p className="mt-1 text-sm text-slate-400">Add your first place to get started.</p>
              <Btn className="mt-5" onClick={() => navigate("/local-guide/add-spot")}>
                <Plus className="h-4 w-4" /> Add spot
              </Btn>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {spots.map((spot) => (
                <div
                  key={spot._id}
                  className="group overflow-hidden rounded-3xl border border-slate-100 bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={spot.picture}
                      alt={spot.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {spot.hiddenGem && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-lime-50 px-2.5 py-1 text-xs font-semibold text-lime-600">
                        Hidden gem
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900">{spot.name}</h3>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="h-3 w-3" /> {spot.location}
                        </p>
                        {(spot.uploaderName || spot.curatedBy) && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            By {spot.uploaderName || spot.curatedBy}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/local-guide/edit-spot/${spot._id}`)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-lime-600 transition-colors hover:bg-lime-50"
                          aria-label={`Edit ${spot.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(spot)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-rose-500 transition-colors hover:bg-rose-50"
                          aria-label={`Delete ${spot.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500">{spot.description}</p>
                    {spot.activities?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {spot.activities.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </GuideLayout>
  );
}
