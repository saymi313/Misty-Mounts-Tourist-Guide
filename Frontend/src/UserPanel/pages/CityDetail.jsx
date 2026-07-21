import React, { useState, useEffect } from 'react';
import { getSpotsByCity, getAccommodations, getTransportation, getWeather } from '../../data/mockApi';
import { useParams, useNavigate } from 'react-router-dom';
import { Mountain, CalendarRange, MapPin, MessageCircle } from 'lucide-react';
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
      <div className="flex min-h-screen items-center justify-center bg-frost-50 dark:bg-abyss-950">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-abyss-900/15 border-t-glacier-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-frost-50 dark:bg-abyss-950 px-6">
        <div className="card-surface max-w-md p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-abyss-900 dark:text-frost-50">Something went wrong</h1>
          <p className="mt-3 text-frost-600 dark:text-frost-300">{error}</p>
          <button onClick={() => navigate('/destinations')} className="btn-primary mt-6">
            Back to destinations
          </button>
        </div>
      </div>
    );
  }

  const nearby = hotelData.filter((h) => h.city === spotData?.city);
  const shownHotels = (nearby.length ? nearby : hotelData).slice(0, 4);

  return (
    <div className="min-h-screen bg-frost-50 dark:bg-abyss-950">
      <Navbar />
      <HeroSection spot={spotData} />

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <Highlights />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.7fr_1fr]">
          {/* Main column */}
          <div>
            <Description description={spotData?.description} location={spotData?.location} />
            <Activity activities={spotData?.activities} />
            <TransportationSection transportationData={transportationData} />
            <Map name={spotData?.name} latitude={spotData?.latitude} longitude={spotData?.longitude} />
          </div>

          {/* Sticky sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <WeatherCard weather={weatherData} />

            <div className="card-surface p-5">
              <h3 className="font-display text-lg font-semibold text-abyss-900 dark:text-frost-50">Quick facts</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mountain className="h-4 w-4 text-glacier-700 dark:text-glacier-300" />
                  <dt className="text-frost-500 dark:text-frost-400">Elevation</dt>
                  <dd className="ml-auto font-medium text-abyss-900 dark:text-frost-50">{spotData?.elevation || '—'}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarRange className="h-4 w-4 text-glacier-700 dark:text-glacier-300" />
                  <dt className="text-frost-500 dark:text-frost-400">Best time</dt>
                  <dd className="ml-auto font-medium text-abyss-900 dark:text-frost-50">{spotData?.bestTime || '—'}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-glacier-700 dark:text-glacier-300" />
                  <dt className="text-frost-500 dark:text-frost-400">Region</dt>
                  <dd className="ml-auto font-medium text-abyss-900 dark:text-frost-50">{spotData?.city}</dd>
                </div>
              </dl>
            </div>

            <div className="overflow-hidden rounded-3xl bg-abyss-800 p-5 text-frost-100">
              <MessageCircle className="h-6 w-6 text-glacier-300" />
              <h3 className="mt-3 font-display text-lg font-semibold text-frost-50">
                Talk to a local guide
              </h3>
              <p className="mt-1.5 text-sm text-frost-300">
                Get real-time advice on routes, timing, and where to stay.
              </p>
              <Link to="/feedback" className="btn-sun mt-4 w-full">
                Start a chat
              </Link>
            </div>
          </aside>
        </div>

        {/* Nearby hotels */}
        <section className="mt-16">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Where to stay & eat</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-abyss-900 dark:text-frost-50 sm:text-3xl">
                Nearby stays & food
              </h2>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
