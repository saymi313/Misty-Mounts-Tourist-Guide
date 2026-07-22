import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Map as MapIcon, AlertTriangle, MessageSquare, Plus, MapPin } from "lucide-react";
import GuideLayout from "../GuideLayout";
import { useAuth } from "../../context/AuthContext";
import { Card, SectionHead, StatCard, DestinationCard, ListRow, StatusPill, Btn, BtnGhost } from "../../components/dashboard/ui";
import { Stagger, Reveal } from "../../components/dashboard/motion";
import { allPlaces as seedPlaces, disasters as seedDisasters, feedbacks as seedFeedbacks } from "../../data/mockData";
import { LIVE, listPlaces, listDisasters } from "../../data/adminApi";
import { getFeedbacks } from "../../data/mockApi";

const GuideDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const first = (user?.name || "Karim").split(" ")[0];
  const [places, setPlaces] = useState(seedPlaces);
  const [disasters, setDisasters] = useState(seedDisasters);
  const [feedbacks, setFeedbacks] = useState(seedFeedbacks);

  useEffect(() => {
    if (!LIVE) return;
    listPlaces().then((p) => setPlaces(p.length ? p : seedPlaces)).catch(() => {});
    listDisasters().then((d) => setDisasters(d || [])).catch(() => {});
    getFeedbacks().then((r) => setFeedbacks(r.feedbacks?.length ? r.feedbacks : seedFeedbacks)).catch(() => {});
  }, []);

  const mySpots = places.filter((p) => p.curatedBy);
  const activeAlerts = disasters.filter((d) => !d.isResolved);
  const avgNum = feedbacks.length ? feedbacks.reduce((s, r) => s + r.rating, 0) / feedbacks.length : 0;
  const ratingTrend = [4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.7];

  return (
    <GuideLayout greeting={`Hello, ${first}`} subtitle="Here's what's happening across your valley" rightRail>
      <Stagger className="space-y-6">
        {/* Stats — featured rating + supporting */}
        <Reveal>
          <div className="grid gap-4 lg:grid-cols-3">
            <StatCard featured tone="emerald" label="Traveller rating" count={avgNum} decimals={1} delta="Top 5%" spark={ratingTrend} />
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
              <StatCard icon={MapIcon} tone="apricot" label="My tourist spots" count={mySpots.length} />
              <StatCard icon={AlertTriangle} tone="rose" label="Active alerts" count={activeAlerts.length} />
              <StatCard icon={MessageSquare} tone="violet" label="New messages" count={3} delta="+2" />
            </div>
          </div>
        </Reveal>

        {/* Featured curated spots */}
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mySpots.slice(0, 3).map((p) => (
              <DestinationCard key={p._id} image={p.picture} title={p.name} location={p.city} rating={4.8} onClick={() => navigate("/local-guide/spots")} />
            ))}
          </div>
        </Reveal>

        {/* My spots (hover reveals elevation) + active alerts */}
        <Reveal>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <SectionHead
                title="My tourist spots"
                sub={`${mySpots.length} curated places`}
                action={<Btn onClick={() => navigate("/local-guide/spots")}><Plus className="h-4 w-4" /> Add spot</Btn>}
              />
              <div className="divide-y divide-slate-100">
                {mySpots.slice(0, 5).map((p) => (
                  <ListRow
                    key={p._id}
                    image={p.picture}
                    title={p.name}
                    location={p.location}
                    rating={4.8}
                    onClick={() => navigate("/local-guide/spots")}
                    hoverMeta={<><span className="text-apricot-600">▲</span> {p.elevation}</>}
                    right={<StatusPill status="Active" />}
                  />
                ))}
              </div>
            </Card>

            <Card>
              <SectionHead title="Active alerts" action={<BtnGhost onClick={() => navigate("/local-guide/natural-disasters")}>All</BtnGhost>} />
              <div className="space-y-3">
                {activeAlerts.map((a) => (
                  <div key={a._id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <AlertTriangle className="h-4 w-4 text-rose-500" /> {a.severity}
                      </span>
                      <StatusPill status={a.isResolved ? "Resolved" : "Active"} />
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-800">{a.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3 w-3" /> {a.location}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Reveal>
      </Stagger>
    </GuideLayout>
  );
};

export default GuideDashboard;
