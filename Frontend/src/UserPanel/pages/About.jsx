import { Link } from 'react-router-dom';
import { Users, Heart, ArrowUpRight } from 'lucide-react';
import HeroSection from '../components/Aboutus/HeroSection';
import OwnerCard from '../components/Aboutus/OwnerCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Home/Footer';
import Seo from '../../components/Seo';
import { Tile, PhotoTile, SectionHead } from '../components/bento/tiles';

const commitments = [
  { title: 'Bring Pakistan closer to the world', text: 'Help travellers discover the landscapes, traditions and everyday hospitality that make our country worth knowing. Our journey begins in Northern Pakistan.' },
  { title: 'Create opportunities for local people', text: 'Connect visitors with Pakistani guides, local stays and travel businesses, so tourism can support livelihoods in the communities that welcome us.' },
  { title: 'Care for the places we love', text: 'Encourage travellers to leave no litter, respect local customs and protect the natural beauty that belongs to future generations too.' },
];

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
    },
    {
      name: 'Obaidullah',
      role: 'Co-founder · Engineering',
      location: 'Abbottabad, Pakistan',
      image: '/obaid.jpeg',
      bio: 'Co-founder and developer. Obaidullah shapes the product with a focus on craft and detail, ensuring every journey through the north feels effortless.',
    },
  ];

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Seo title="About Misty Mounts | Promoting Pakistani Tourism" description="Built with love for Pakistan. Discover our mission to promote Pakistani tourism, connect travellers with local communities, and encourage responsible exploration." />
      <Navbar />
      <HeroSection />
      <main className="mx-auto max-w-[1400px] space-y-16 px-4 py-12 sm:px-6 lg:space-y-24 lg:py-20">
        <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2" aria-labelledby="our-mission">
          <PhotoTile image="/Hunza.jpg" title="Hunza, Pakistan" meta="Discover the north" to="/destinations" className="min-h-[300px] lg:min-h-full" />
          <div className="flex flex-col justify-center py-5 sm:px-4 lg:py-10">
            <h2 id="our-mission" className="text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">
              Promoting Pakistan,<br /><span className="text-lime-400">one journey at a time.</span>
            </h2>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-white/80">
              Pakistan is our home, and sharing its beauty is the reason we started.
              Through Misty Mounts, we want to give travellers a welcoming introduction
              to our country and help Pakistanis discover more of their own homeland.
            </p>
            <p className="mt-4 max-w-prose leading-relaxed text-white/70">
              Our mountains and valleys are part of that story. So are the people:
              the guide sharing a favourite trail, the family welcoming a guest,
              and the local business helping a visitor feel at home.
              We want their voices to be part of how the world discovers Pakistan.
            </p>
            <Link to="/destinations" className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-night-950 hover:bg-lime-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-400">
              Explore Pakistan <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section aria-labelledby="ai-travel">
          <h2 id="ai-travel" className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">Artificial intelligence, with Pakistan at heart.</h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/80">We bring artificial intelligence into travel planning to help you discover Pakistan with greater confidence, connect with local communities, and turn your curiosity into a journey.</p>
          <ul className="mt-7 space-y-4 leading-relaxed text-white/75">
            <li><strong className="text-lime-300">Ask Misty:</strong> Ask travel questions and discover suggestions grounded in our destination catalogue.</li>
            <li><strong className="text-lime-300">AI trip planning:</strong> Build an editable itinerary around your dates, interests, group size and estimated budget.</li>
            <li><strong className="text-lime-300">Smarter discovery:</strong> Search in English, Urdu or Roman Urdu and explore places that match your interests.</li>
            <li><strong className="text-lime-300">Language and review assistance:</strong> Read sentence-level Urdu translations and AI summaries of available reviews.</li>
            <li><strong className="text-lime-300">Tools for local hosts:</strong> Help guides and hotel owners prepare editable descriptions and guest replies.</li>
          </ul>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-white/60">AI features depend on service availability. Suggestions and estimated costs are planning aids; confirm availability, prices and local conditions before travelling.</p>
          <Link to="/plan" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-lime-300 underline underline-offset-4">Build my itinerary <ArrowUpRight className="h-4 w-4" /></Link>
        </section>

        <section aria-labelledby="commitments">
          <h2 id="commitments" className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">Our love for Pakistan shapes what we build.</h2>
          <div className="mt-8 divide-y divide-white/15 border-y border-white/15">
            {commitments.map((commitment, index) => (
              <article key={commitment.title} className="grid grid-cols-1 gap-3 py-7 md:grid-cols-[56px_1fr] md:gap-6">
                <span aria-hidden="true" className="text-sm font-semibold text-lime-400">0{index + 1}</span>
                <div>
                  <h3 className="text-xl font-bold sm:text-2xl">{commitment.title}</h3>
                  <p className="mt-3 max-w-3xl leading-relaxed text-white/75">{commitment.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-labelledby="invitation">
          <PhotoTile image="/Front.jpg" title="A journey through our homeland" meta="Northern Pakistan" to="/destinations" className="min-h-[280px] md:col-span-2 md:min-h-[360px]" />
          <Tile glow="green" pad="p-6 sm:p-8" className="flex flex-col justify-center">
            <h2 id="invitation" className="text-2xl font-extrabold leading-tight sm:text-3xl">From our home,<br /><span className="text-lime-400">an invitation to the world.</span></h2>
            <p className="mt-5 leading-relaxed text-white/80">Whether you are a Pakistani exploring a new valley or a visitor arriving for the first time, we want your journey to begin with curiosity and grow into a lasting connection with Pakistan.</p>
            <Link to="/guides" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-lime-300 underline underline-offset-4">Meet local guides <ArrowUpRight className="h-4 w-4" /></Link>
          </Tile>
        </section>

        <section aria-label="The team behind Misty Mounts">
          <SectionHead title="The people behind the purpose" icon={Users} />
          <p className="mb-7 max-w-2xl leading-relaxed text-white/75">A Pakistani team building a way to share the places we love. Our ambition is to help more people experience Pakistan and give local tourism a stronger voice.</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {founders.map((founder, index) => <OwnerCard key={founder.name} {...founder} delay={index * 0.06} />)}
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-white/75"><Heart className="h-4 w-4 shrink-0 text-lime-400" />Made in Pakistan. Dedicated to its discovery.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};
export default About;
