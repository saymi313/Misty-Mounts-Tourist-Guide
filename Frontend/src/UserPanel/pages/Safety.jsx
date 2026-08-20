import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Home/Footer";
import { Tile, Eyebrow, SectionHead } from "../components/bento/tiles";
import SosCard from "../../components/SosCard";
import HazardAlerts from "../../components/HazardAlerts";
import { EMERGENCY_NUMBERS, REGION_SAFETY, SAFETY_TIPS } from "../../data/safety";

const TONE = {
  rose: "bg-rose-500/15 text-rose-300",
  sky: "bg-sky-500/15 text-sky-300",
  lime: "bg-lime-400/15 text-lime-400",
  amber: "bg-amber-500/15 text-amber-300",
};

const Safety = () => (
  <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
    <Navbar />

    <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:pt-14">
      {/* Header */}
      <header className="max-w-2xl">
        <Eyebrow>Travel safe</Eyebrow>
        <h1 className="mt-3 text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight">
          Your safety toolkit for <span className="text-lime-400">the north.</span>
        </h1>
        <p className="mt-4 text-white/60">
          Emergency contacts, live hazard alerts and a one-tap SOS, so the mountains stay the adventure and never the emergency.
        </p>
      </header>

      {/* Command deck: SOS console beside a stacked emergency + offline column */}
      <section className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <SosCard />
        <div className="grid gap-4">
          <Tile pad="p-5 sm:p-6">
            <SectionHead eyebrow="Save these" title="Emergency numbers" className="mb-4" />
            <div className="grid gap-2 sm:grid-cols-2">
              {EMERGENCY_NUMBERS.map((e) => (
                <a key={e.number} href={`tel:${e.number}`} className="flex items-center gap-3 rounded-xl bg-night-700/50 px-3.5 py-2.5 transition-colors hover:bg-night-700">
                  <span className={`flex h-8 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${TONE[e.tone]}`}>{e.number}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-white">{e.label}</span>
                    <span className="block truncate text-xs text-white/50">{e.desc}</span>
                  </span>
                </a>
              ))}
            </div>
          </Tile>

          <Tile glow="sky" pad="p-5 sm:p-6">
            <h3 className="font-extrabold text-white">Works offline</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/60">
              Install Misty Mounts to your home screen and your saved trips and maps travel with you, even where the signal drops.
            </p>
          </Tile>
        </div>
      </section>

      {/* Live hazard alerts */}
      <section className="mt-14">
        <SectionHead eyebrow="Conditions right now" title="Live hazard alerts" />
        <HazardAlerts />
      </section>

      {/* Before you go - one tile, numbered two-column list */}
      <section className="mt-14">
        <SectionHead eyebrow="Before you go" title="Mountain safety, sorted" />
        <Tile pad="p-2 sm:p-3">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {SAFETY_TIPS.map((t, i) => (
              <div key={t.title} className="flex gap-3.5 rounded-xl p-4 transition-colors hover:bg-white/[0.03]">
                <span className="text-base font-extrabold text-lime-400/70">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-sm font-bold text-white">{t.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Tile>
      </section>

      {/* Regional medical */}
      <section className="mt-14">
        <SectionHead eyebrow="If something happens" title="Nearest medical help" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Object.entries(REGION_SAFETY).map(([region, info], i) => (
            <Tile key={region} glow={i === 0 ? "lime" : undefined} pad="p-5">
              <h3 className="font-extrabold text-lime-400">{region}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-white/70">
                {info.hospitals.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <p className="mt-4 border-t border-white/[0.07] pt-3 text-xs leading-relaxed text-white/45">{info.note}</p>
            </Tile>
          ))}
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default Safety;
