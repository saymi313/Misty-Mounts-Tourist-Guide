import React from 'react';
import { motion } from 'framer-motion';
import { Users, Mountain, Quote, Heart } from 'lucide-react';
import HeroSection from '../components/Aboutus/HeroSection';
import OwnerCard from '../components/Aboutus/OwnerCard';
import Navbar from "../components/Navbar";
import Footer from '../components/Home/Footer';
import { Tile, PhotoTile, Eyebrow, SectionHead } from '../components/bento/tiles';

const EASE = [0.16, 1, 0.3, 1];
const GLOWS = ['green', 'lime', 'sky', 'lime'];

const About = () => {
  const founders = [
    {
      name: 'Usairam Saeed',
      role: 'Founder & Lead Developer',
      location: 'Mansehra, Pakistan',
      image: '/usairam.jpg',
      bio: 'Founder of Misty Mounts and the architect of its vision. Usairam conceived the platform and led the majority of its engineering, with a singular mission — to bring Northern Pakistan to the world.',
      linkedin: 'https://linkedin.com/in/usairamsaeed',
    },
    {
      name: 'Syed Ali Hassan',
      role: 'Co-founder · Engineering',
      location: 'Islamabad, Pakistan',
      image: '/ali.jpg',
      bio: 'Co-founder and full-stack engineer. Ali helped bring Misty Mounts to life, engineering the booking flows and traveller experience that power the platform end to end.',
      linkedin: 'https://linkedin.com/in/johnsmith',
    },
    {
      name: 'Obaidullah',
      role: 'Co-founder · Engineering',
      location: 'Abbottabad, Pakistan',
      image: '/obaid.jpeg',
      bio: 'Co-founder and developer. Obaidullah shapes the product with a focus on craft and detail, ensuring every journey through the north feels effortless.',
      linkedin: 'https://linkedin.com/in/emilybrown',
    },
  ];

  const stats = [
    ['6', 'Valleys covered'],
    ['120+', 'Curated spots'],
    ['24', 'Local guides'],
    ['1,900+', 'Traveller reviews'],
  ];

  const pkFacts = [
    ['5 / 14', "of Earth's highest peaks"],
    ['3', 'great ranges collide'],
    ['7,000+', 'glaciers'],
    ['8,611 m', 'K2 · 2nd on Earth'],
  ];

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <HeroSection />

      <main className="mx-auto max-w-[1400px] space-y-16 px-4 pb-16 sm:px-6 lg:space-y-24 lg:pb-24">
        {/* Stats band */}
        <section className="relative z-10 -mt-12 sm:-mt-16">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map(([n, l], i) => (
              <Tile key={l} glow={GLOWS[i % GLOWS.length]} delay={i * 0.05} className="flex flex-col justify-center">
                <div className="text-4xl font-extrabold tracking-tight text-lime-400 sm:text-5xl">{n}</div>
                <div className="mt-1 text-sm text-white/60">{l}</div>
              </Tile>
            ))}
          </div>
        </section>

        {/* ── Patriotic · promoting Pakistan ─────────────────────────────── */}
        <section className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
          <PhotoTile
            image="/Hunza.jpg"
            title="Gilgit-Baltistan"
            meta="The roof of the world"
            to="/destinations"
            className="min-h-[340px] lg:min-h-full"
          />
          <Tile glow="green" pad="p-7 sm:p-10" className="flex flex-col justify-center">
            <Eyebrow><Mountain className="h-3.5 w-3.5" /> Made in Pakistan 🇵🇰</Eyebrow>
            <h2 className="mt-4 text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              The world's most beautiful <span className="text-lime-400">secret.</span>
            </h2>
            <p className="mt-5 leading-relaxed text-white/70">
              Where the <span className="font-semibold text-white">Karakoram, Himalaya and Hindu Kush</span> collide,
              Pakistan cradles five of the world's fourteen highest peaks — including <span className="font-semibold text-white">K2</span>.
              From the Deosai plains, the <span className="italic">Land of Giants</span>, to Hunza's apricot valleys,
              this is a country carved by ice and lit by impossible turquoise.
            </p>
            <p className="mt-4 leading-relaxed text-white/70">
              We built Misty Mounts to show the world what Pakistanis have always known — and to send every rupee
              back to the guides, families and valleys that make it magic.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-6 sm:grid-cols-4">
              {pkFacts.map(([n, l]) => (
                <div key={l}>
                  <div className="text-xl font-extrabold text-lime-400 sm:text-2xl">{n}</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-white/50">{l}</div>
                </div>
              ))}
            </div>
          </Tile>
        </section>

        {/* ── Iqbal · poetry for the mountains (Nastaʿlīq) ───────────────── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-night-900/60 px-6 py-14 text-center sm:px-12 sm:py-20"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-lime-400">
                <Quote className="h-3.5 w-3.5" /> Words for the mountains
              </span>

              {/* decorative divider */}
              <div className="mx-auto mt-6 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-lime-400/50" />
                <span className="h-1.5 w-1.5 rotate-45 bg-lime-400/70" />
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-lime-400/50" />
              </div>

              <p
                dir="rtl"
                lang="ur"
                style={{ fontFamily: '"Noto Nastaliq Urdu", serif' }}
                className="font-nastaliq mx-auto mt-8 max-w-3xl text-[clamp(1.35rem,3.6vw,2.4rem)] font-medium leading-[2.6] text-white/95"
              >
                <span className="block">نہیں تیرا نشیمن قصرِ سلطانی کے گنبد پر</span>
                <span className="block">تُو شاہیں ہے، بسیرا کر پہاڑوں کی چٹانوں میں</span>
              </p>

              <p className="mx-auto mt-9 max-w-xl text-[15px] italic leading-relaxed text-white/60">
                “Your nest is not on the dome of a royal palace — you are a falcon;
                make your home among the mountain cliffs.”
              </p>
              <p className="mt-4 text-sm font-semibold text-lime-400">
                — Allama Muhammad Iqbal
              </p>
            </div>
          </motion.div>
        </section>

        {/* Mission bento */}
        <section>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <PhotoTile
              image="/Front.jpg"
              title="From Hunza to the Deosai plains"
              meta="Northern Pakistan"
              to="/destinations"
              className="min-h-[280px] md:col-span-2 md:min-h-[360px]"
            />
            <Tile glow="lime" pad="p-6 sm:p-8" className="flex flex-col justify-between">
              <Eyebrow><Mountain className="h-3.5 w-3.5" /> Why we exist</Eyebrow>
              <div>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  The north, told by the people who <span className="text-lime-400">live it.</span>
                </h2>
                <p className="mt-4 text-white/70">
                  Every route, stay and hidden gem on Misty Mounts is vetted by a local guide — so
                  your trip is shaped by the people who know the mountains best.
                </p>
              </div>
            </Tile>
          </div>
        </section>

        {/* Founders */}
        <section>
          <SectionHead eyebrow="The people behind it" title="Meet the founders" icon={Users} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {founders.map((f, index) => (
              <OwnerCard key={index} {...f} delay={index * 0.06} />
            ))}
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-white/50">
            <Heart className="h-4 w-4 text-lime-400" /> Built in Pakistan, for the world.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
