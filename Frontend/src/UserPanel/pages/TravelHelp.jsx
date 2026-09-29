import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Home/Footer';
import { travelHelp } from '../../data/travelHelp';
export default function TravelHelp() {
  return <div className="min-h-screen bg-night-950 text-white"><Navbar />
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link to="/" className="inline-flex min-h-11 items-center text-lime-300 underline">Misty Mounts</Link>
      <h1 className="mt-4 text-4xl font-bold">Planning and booking your Pakistan trip</h1>
      <p className="mt-4 text-lg leading-relaxed text-white/80">Understand itineraries, supplier quotes, payment records and travel information before you confirm your plans.</p>
      <div className="mt-10 space-y-8">{travelHelp.map(({ question, answer, href, link }) => <section key={question} className="border-t border-white/15 pt-6">
        <h2 className="text-xl font-semibold">{question}</h2><p className="mt-3 leading-relaxed text-white/80">{answer}</p>
        <Link to={href} className="mt-2 inline-flex min-h-11 items-center text-lime-300 underline">{link}</Link>
      </section>)}</div>
    </main><Footer /></div>;
}
