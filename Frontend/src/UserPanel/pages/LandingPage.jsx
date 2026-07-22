import React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Mountain, ArrowUpRight, Star, MessageCircle, Compass, Send, Quote, MapPin,
} from "lucide-react";
import { allPlaces, feedbacks, img } from "../../data/mockData";
import { useCountUp } from "../../components/dashboard/motion";
import { Tile, PhotoTile, Eyebrow } from "../components/bento/tiles";
import Navbar from "../components/Navbar";

const byId = (id) => allPlaces.find((p) => p._id === id);

/* ── Section header ──────────────────────────────────────────────────── */
const SectionHead = ({ eyebrow, title, icon: Icon, to = "/destinations", link = "Explore all" }) => (
  <div className="mb-3 flex items-end justify-between gap-4 px-1">
    <div>
      <Eyebrow>{Icon && <Icon className="h-3.5 w-3.5" />} {eyebrow}</Eyebrow>
      <h2 className="mt-2 font-sans text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h2>
    </div>
    <Link to={to} className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-lime-400 hover:text-lime-300 sm:flex">
      {link} <ArrowUpRight className="h-4 w-4" />
    </Link>
  </div>
);

/* ── Count-up stat tile ──────────────────────────────────────────────── */
const StatTile = ({ value, decimals = 0, suffix = "", label, glow, className = "" }) => {
  const n = useCountUp(value, { decimals });
  return (
    <Tile glow={glow} className={`flex flex-col justify-center ${className}`}>
      <div className="font-sans text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        {decimals ? n : Number(n).toLocaleString()}
        <span className="text-lime-400">{suffix}</span>
      </div>
      <div className="mt-1 text-sm text-white/55">{label}</div>
    </Tile>
  );
};

const LandingPage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

  const dest = ["skardu-deosai", "naran-saiful", "swat-mahodand", "fairy-meadows", "gilgit-naltar"].map(byId).filter(Boolean);
  const gems = ["skardu-cold-desert", "hunza-eagles-nest", "gilgit-naltar"].map(byId).filter(Boolean);
  const reviews = feedbacks.slice(0, 3);

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />

      <main className="mx-auto max-w-[1400px] space-y-4 px-4 pb-6 pt-4 sm:px-6">
        {/* ── HERO BENTO ─────────────────────────────────────────────── */}
        <section ref={heroRef} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-3 md:h-[82vh] md:min-h-[640px]">
          {/* Headline */}
          <Tile glow="green" pad="p-6 sm:p-8" className="col-span-2 flex flex-col justify-between md:row-span-2">
            <Eyebrow><Compass className="h-3.5 w-3.5" /> Hazara · unfiltered</Eyebrow>
            <div>
              <h1 className="font-sans text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[0.98] tracking-tight text-white">
                Explore the <span className="text-lime-400">high valleys</span> of the north.
              </h1>
              <p className="mt-4 max-w-md text-white/60">
                Turquoise lakes, hidden gems and local guides who know the way — from Hunza to the Deosai plains.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/destinations" className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5">
                  Explore destinations <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link to="/feedback" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-lime-400 hover:text-lime-400">
                  Meet the guides
                </Link>
              </div>
            </div>
          </Tile>

          {/* Hero photo (parallax) */}
          <motion.div {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8 } }} className="group relative col-span-2 min-h-[240px] overflow-hidden rounded-[1.4rem] border border-white/[0.07] md:row-span-2">
            <motion.img style={{ y: heroImgY }} src={img("bento-hero", 1100, 1100)} alt="Hunza Valley" className="absolute inset-0 h-[116%] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-lime-300">Featured valley</p>
                <h3 className="mt-1 text-2xl font-extrabold text-white">Hunza Valley</h3>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">2,438 m</span>
            </div>
          </motion.div>

          {/* Rating stat */}
          <Tile glow="lime" className="flex flex-col justify-center">
            <div className="flex items-center gap-1 text-lime-400">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-sans text-3xl font-extrabold text-white">4.8</span>
            </div>
            <p className="mt-1 text-xs text-white/55">1,900+ traveller reviews</p>
          </Tile>

          {/* Small photo */}
          <PhotoTile image={img("attabad", 600, 600)} title="Attabad Lake" meta="Hunza" to="/city/Hunza/spot/hunza-attabad" className="min-h-[150px]" />

          {/* Guide chat teaser — a live mini chat preview */}
          <Link to="/feedback" className="group col-span-2 flex items-center gap-4 rounded-[1.4rem] border border-white/[0.07] bg-night-800 p-4 transition-colors hover:border-lime-400/40">
            <span className="relative shrink-0">
              <img src={img("guide-0", 120, 120)} alt="" className="h-14 w-14 rounded-2xl object-cover ring-2 ring-lime-400/30" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-lime-400 ring-2 ring-night-800" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-extrabold text-white">Karim · Hunza guide</p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">online</span>
              </div>
              <p className="mt-1 truncate rounded-xl rounded-tl-sm bg-night-700 px-3 py-1.5 text-sm text-white/80">
                “Aim for a sunrise boat on Attabad — best light.”
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-400 text-night-950 transition-transform group-hover:scale-110">
              <MessageCircle className="h-4 w-4" />
            </span>
          </Link>
        </section>

        {/* ── DESTINATIONS BENTO ─────────────────────────────────────── */}
        <section className="pt-6">
          <SectionHead eyebrow="Where to go" title="Six valleys, one map." icon={Compass} />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[190px]">
            <PhotoTile
              image={img("attabad", 900, 900)}
              title="Attabad Lake"
              meta="Hunza"
              to="/city/Hunza/spot/hunza-attabad"
              className="col-span-2 row-span-2 min-h-[300px] md:min-h-0"
              badge="Featured"
            />
            {dest.slice(0, 4).map((p, i) => (
              <PhotoTile
                key={p._id}
                image={p.picture}
                title={p.name}
                meta={p.city}
                to={`/city/${encodeURIComponent(p.city)}/spot/${p._id}`}
                className="min-h-[150px] md:min-h-0"
                delay={i * 0.05}
                badge={p.hiddenGem ? "Gem" : undefined}
              />
            ))}
          </div>
        </section>

        {/* ── HIDDEN GEMS BENTO ──────────────────────────────────────── */}
        <section className="pt-8">
          <SectionHead eyebrow="Guide-curated · off the map" title="Spots the crowds never find." link="See all gems" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:auto-rows-[210px]">
            {/* Feature gem (fills a clean 2×2 block) */}
            <Link
              to={`/city/${encodeURIComponent(gems[0]?.city)}/spot/${gems[0]?._id}`}
              className="group relative col-span-1 block min-h-[340px] overflow-hidden rounded-[1.4rem] border border-white/[0.07] sm:col-span-2 sm:row-span-2 sm:min-h-0"
            >
              <img src={gems[0]?.picture} alt={gems[0]?.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] group-hover:scale-[1.05]" />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/55 to-night-950/10" />
              <span className="absolute left-5 top-5 rounded-full bg-lime-400 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-night-950">Hidden gem</span>
              <span className="absolute right-5 top-5 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-3xl font-extrabold text-white">{gems[0]?.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
                  <MapPin className="h-3.5 w-3.5 text-lime-400" /> {gems[0]?.city} · {gems[0]?.elevation}
                </p>
                <p className="mt-1 text-sm font-semibold text-lime-400">Curated by {(gems[0]?.curatedBy || "").split(",")[0]}</p>
              </div>
            </Link>

            {/* Two gem photo cards, stacked in the third column */}
            {gems.slice(1).map((g, i) => (
              <Link
                key={g._id}
                to={`/city/${encodeURIComponent(g.city)}/spot/${g._id}`}
                className="group relative block min-h-[190px] overflow-hidden rounded-[1.4rem] border border-white/[0.07] sm:min-h-0"
              >
                <img src={g.picture} alt={g.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] group-hover:scale-[1.06]" />
                <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-lg font-extrabold leading-tight text-white">{g.name}</h3>
                  <p className="mt-0.5 text-xs text-white/60">{g.city} · {g.elevation}</p>
                  <p className="mt-0.5 text-xs font-semibold text-lime-400">Curated by {(g.curatedBy || "").split(",")[0]}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Guide-connect banner */}
          <Link
            to="/feedback"
            className="group relative mt-3 flex flex-col gap-5 overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-night-800 p-6 transition-colors hover:border-lime-400/30 sm:flex-row sm:items-center sm:p-8"
          >
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-lime-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
            <span className="relative shrink-0">
              <img src={img("guide-0", 200, 200)} alt="" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-lime-400/40 sm:h-20 sm:w-20" />
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-lime-400 ring-2 ring-night-800" />
            </span>
            <div className="relative min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-lime-400">People, not itineraries</p>
              <h3 className="mt-1 text-2xl font-extrabold leading-tight text-white">A local guide, a message away.</h3>
              <p className="mt-1 max-w-md text-sm text-white/60">Chat in real time about routes, weather windows and the best time to visit each valley.</p>
            </div>
            <span className="relative inline-flex shrink-0 items-center gap-2 rounded-full bg-lime-400 px-5 py-3 text-sm font-bold text-night-950 transition-transform group-hover:-translate-y-0.5">
              Start chatting <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </section>

        {/* ── REVIEWS + STATS BENTO ──────────────────────────────────── */}
        <section className="pt-8">
          <SectionHead eyebrow="Word from the trail" title="Trusted by travellers." icon={Star} to="/feedback" link="All reviews" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile value={6} label="Valleys covered" glow="green" />
            <StatTile value={120} suffix="+" label="Curated spots" glow="lime" />
            {reviews.slice(0, 1).map((r) => (
              <Tile key={r._id} className="col-span-2 flex flex-col justify-between" glow="sky">
                <Quote className="h-7 w-7 text-lime-400/40" />
                <p className="text-[15px] font-medium leading-relaxed text-white/85">“{r.message}”</p>
                <div className="mt-3 flex items-center gap-2.5">
                  <img src={r.avatar} alt={r.name} className="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-bold text-white">{r.name}</p>
                    <p className="text-xs text-white/50">{r.locationName}</p>
                  </div>
                </div>
              </Tile>
            ))}
            {reviews.slice(1, 3).map((r, i) => (
              <Tile key={r._id} className="flex flex-col justify-between" delay={i * 0.06}>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s < r.rating ? "fill-lime-400 text-lime-400" : "fill-white/15 text-white/15"}`} />
                  ))}
                </div>
                <p className="line-clamp-3 text-sm text-white/75">“{r.message}”</p>
                <p className="mt-2 text-xs font-semibold text-white/60">{r.name} · {r.locationName.split(",")[0]}</p>
              </Tile>
            ))}
            <StatTile value={24} label="Local guides" glow="lime" />
            <StatTile value={4.8} decimals={1} label="Avg. rating" glow="green" />
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────────────────────────────── */}
        <section className="pt-8">
          <div className="relative overflow-hidden rounded-[1.8rem] border border-white/[0.07]">
            <img src={img("final-cta", 1600, 700)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-night-950 via-night-950/70 to-night-950/20" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl" />
            <div className="relative px-6 py-14 sm:px-14 sm:py-20">
              <Eyebrow>Ready when you are</Eyebrow>
              <h2 className="mt-3 max-w-2xl font-sans text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl">
                The mountains are <span className="text-lime-400">waiting.</span>
              </h2>
              <p className="mt-4 max-w-lg text-white/70">Start with a valley — we'll handle the spots, stays and a local who knows the way.</p>
              <Link to="/destinations" className="mt-7 inline-flex items-center gap-2 rounded-full bg-lime-400 px-7 py-3.5 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5">
                Explore destinations <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <footer className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-sm text-white/40 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-400 text-night-950">
              <Mountain className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <span className="font-extrabold text-white/80">Misty<span className="text-lime-400">Mounts</span></span>
          </div>
          <p>© {new Date().getFullYear()} Misty Mounts · Hazara, Pakistan</p>
          <p>Prototype · dummy data</p>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
