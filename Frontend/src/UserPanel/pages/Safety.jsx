import React from "react";
import { Phone, ShieldCheck, WifiOff, LifeBuoy, HeartPulse, Info } from "lucide-react";
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

    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      {/* Header */}
      <header className="mb-8">
        <Eyebrow><ShieldCheck className="h-3.5 w-3.5" /> Travel safe</Eyebrow>
        <h1 className="mt-3 text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight">
          Your safety toolkit for <span className="text-lime-400">the north.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-white/60">
          Emergency contacts, live hazard alerts and a one-tap SOS — because the mountains are
          breathtaking, and we want you back home to tell the story.
        </p>
      </header>

      {/* SOS + emergency numbers */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SosCard />
        <Tile pad="p-6 sm:p-7">
          <Eyebrow><Phone className="h-3.5 w-3.5" /> Emergency numbers</Eyebrow>
          <div className="mt-4 space-y-2.5">
            {EMERGENCY_NUMBERS.map((e) => (
              <a key={e.number} href={`tel:${e.number}`}
                className="flex items-center gap-3 rounded-2xl bg-night-700/50 px-4 py-3 transition-colors hover:bg-night-700">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-extrabold ${TONE[e.tone]}`}>
                  {e.number}
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-white">{e.label}</span>
                  <span className="block text-xs text-white/50">{e.desc}</span>
                </span>
                <Phone className="ml-auto h-4 w-4 text-white/30" />
              </a>
            ))}
          </div>
        </Tile>
      </section>

      {/* Live hazard alerts */}
      <section className="mt-12">
        <SectionHead eyebrow="Right now" title="Active hazard alerts" icon={LifeBuoy} />
        <HazardAlerts />
      </section>

      {/* Offline maps + regional guidance */}
      <section className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Tile glow="sky" pad="p-6" className="lg:col-span-1">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
            <WifiOff className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-lg font-extrabold text-white">Works offline</h3>
          <p className="mt-1.5 text-sm text-white/60">
            Misty Mounts is installable as an app and caches your saved trips and maps, so your
            plan is with you even when the signal isn't. Add it to your home screen before you go.
          </p>
        </Tile>

        <Tile pad="p-6" className="lg:col-span-2">
          <Eyebrow><HeartPulse className="h-3.5 w-3.5" /> Nearest medical help by region</Eyebrow>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Object.entries(REGION_SAFETY).map(([region, info]) => (
              <div key={region} className="rounded-2xl bg-night-700/40 p-4">
                <h4 className="font-bold text-lime-400">{region}</h4>
                <ul className="mt-2 space-y-1 text-sm text-white/70">
                  {info.hospitals.map((h) => <li key={h}>{h}</li>)}
                </ul>
                <p className="mt-2 flex items-start gap-1.5 text-xs text-white/45">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" /> {info.note}
                </p>
              </div>
            ))}
          </div>
        </Tile>
      </section>

      {/* Safety tips */}
      <section className="mt-12">
        <SectionHead eyebrow="Before & during" title="Mountain safety tips" icon={ShieldCheck} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAFETY_TIPS.map((t, i) => (
            <Tile key={t.title} delay={i * 0.04} pad="p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/15 text-sm font-extrabold text-lime-400">{i + 1}</span>
              <h3 className="mt-3 font-extrabold text-white">{t.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">{t.body}</p>
            </Tile>
          ))}
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default Safety;
