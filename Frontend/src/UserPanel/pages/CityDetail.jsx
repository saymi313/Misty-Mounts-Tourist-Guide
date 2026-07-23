import React, { useState, useEffect } from 'react';
import { getSpotsByCity, getAccommodations, getTransportation, getWeather } from '../../data/mockApi';
import { useParams, useNavigate } from 'react-router-dom';
import { Mountain, CalendarRange, MapPin, MessageCircle, BedDouble, ArrowUpRight } from 'lucide-react';
import Navbar from "../components/Navbar";
import HeroSection from '../components/Detail/HeroSection';
import Highlights from '../components/Detail/Highlights';
import Description from '../components/Detail/Description';
import Activity from '../components/Detail/Activity';
import Map from '../components/Detail/Map';
import HotelCard from '../components/Detail/HotelCard';
import TransportationSection from '../components/Detail/TransportationSection';
import WeatherCard from '../components/Detail/WeatherCard';
import Footer from '../components/Home/Footer';
import { Link } from 'react-router-dom';
import { Tile, Eyebrow, SectionHead } from '../components/bento/tiles';

const CityDetail = () => {
  const [spotData, setSpotData] = useState(null);
  const [hotelData, setHotelData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [transportationData, setTransportationData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { city, spotId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpotData = async () => {
      if (!city || !spotId) {
        setError('City or Spot ID is missing');
        setIsLoading(false);
        return;
      }
      try {
        const data = await getSpotsByCity(decodeURIComponent(city));
        if (data && data.nearbyPlaces) {
          const place = data.nearbyPlaces.find((p) => p._id === spotId);
          if (place) {
            setSpotData({ ...place, city: data.city, latitude: place.latitude || 0, longitude: place.longitude || 0 });
          } else setError('Spot not found');
        } else setError('Spot not found');
      } catch {
        setError('Failed to fetch spot data');
      }
    };

    const fetchHotelData = async () => {
      try {
        const data = await getAccommodations();
        if (Array.isArray(data)) setHotelData(data);
      } catch { /* ignore in prototype */ }
    };

    const fetchTransportationData = async () => {
      try {
        setTransportationData(await getTransportation(spotId));
      } catch { /* ignore in prototype */ }
    };

    const run = async () => {
      await Promise.all([fetchSpotData(), fetchHotelData(), fetchTransportationData()]);
      setIsLoading(false);
      setWeatherData(await getWeather(spotId));
    };
    run();
  }, [city, spotId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-950">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-lime-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-night-950 px-6 text-white">
        <div className="max-w-md rounded-[1.4rem] border border-white/[0.07] bg-night-800 p-8 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Something went wrong</h1>
          <p className="mt-3 text-white/60">{error}</p>
          <button
            onClick={() => navigate('/destinations')}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5 hover:bg-lime-300"
          >
            Back to destinations
          </button>
        </div>
      </div>
    );
  }

  // Only show approved listings to travellers (hotel-submitted ones await review).
  const approved = hotelData.filter((h) => h.isApproved !== false);
  const nearby = approved.filter((h) => h.city === spotData?.city);
  const shownHotels = (nearby.length ? nearby : approved).slice(0, 4);

  const facts = [
    { icon: Mountain, label: 'Elevation', value: spotData?.elevation || '—' },
    { icon: CalendarRange, label: 'Best time', value: spotData?.bestTime || '—' },
    { icon: MapPin, label: 'Region', value: spotData?.city },
  ];

  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <HeroSection spot={spotData} />

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <Highlights />

        {/* ── Bento of info tiles ─────────────────────────────────────── */}
        <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Story — tall feature tile */}
          <Description
            description={spotData?.description}
            location={spotData?.location}
            className="lg:col-span-2 lg:row-span-2"
          />

          {/* Weather */}
          <WeatherCard weather={weatherData} className="lg:col-span-1" />

          {/* Quick facts */}
          <Tile pad="p-6" className="lg:col-span-1">
            <Eyebrow>Quick facts</Eyebrow>
            <dl className="mt-4 space-y-3.5 text-sm">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <dt className="text-white/50">{label}</dt>
                  <dd className="ml-auto font-bold text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </Tile>

          {/* Activities */}
          <Activity activities={spotData?.activities} className="lg:col-span-2" />

          {/* Talk to a local guide */}
          <Tile glow="lime" pad="p-6" className="flex flex-col justify-between lg:col-span-1">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400">
              <MessageCircle className="h-6 w-6" />
            </span>
            <div className="mt-4">
              <h3 className="text-lg font-extrabold text-white">Talk to a local guide</h3>
              <p className="mt-1.5 text-sm text-white/60">
                Get real-time advice on routes, timing, and where to stay.
              </p>
            </div>
            <Link
              to="/feedback"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-5 py-2.5 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5 hover:bg-lime-300"
            >
              Start a chat <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Tile>

          {/* Transport — wide tile */}
          <TransportationSection transportationData={transportationData} className="lg:col-span-3" />

          {/* Map — wide tile */}
          <div className="lg:col-span-3">
            <Map name={spotData?.name} latitude={spotData?.latitude} longitude={spotData?.longitude} />
          </div>
        </section>

        {/* ── Nearby stays & food ─────────────────────────────────────── */}
        <section className="mt-16">
          <SectionHead eyebrow="Where to stay & eat" title="Nearby stays & food" icon={BedDouble} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shownHotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CityDetail;
