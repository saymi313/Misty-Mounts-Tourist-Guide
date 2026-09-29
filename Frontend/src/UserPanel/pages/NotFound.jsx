import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
export default function NotFound() {
  return <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-night-950 px-6 text-white">
    <Seo title="Page Not Found" description="This page is unavailable. Explore Pakistan destinations or return to Misty Mounts." noindex />
    <p>404</p><h1 className="text-3xl font-bold">Page not found</h1>
    <p>The address may have changed, or this page is no longer available.</p>
    <Link to="/destinations" className="min-h-11 text-lime-300 underline">Explore destinations</Link>
    <Link to="/" className="min-h-11 text-lime-300 underline">Return home</Link>
  </main>;
}
