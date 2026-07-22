import { useState, useEffect } from "react";
import { LIVE, listCities } from "../data/adminApi";

/** Load the admin-managed cities (for the spot "city" dropdown + traveller panel). */
export default function useCities() {
  const [cities, setCities] = useState([]);
  useEffect(() => {
    if (LIVE) listCities().then(setCities).catch(() => {});
  }, []);
  return cities;
}
