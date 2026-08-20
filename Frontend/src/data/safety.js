/**
 * Safety reference data for travellers in Northern Pakistan. Emergency numbers
 * are the real nationwide services. Regional entries list key towns / hospitals
 * for orientation (call 1122 for the actual dispatch).
 */

// Nationwide emergency numbers (dialable via tel: links).
export const EMERGENCY_NUMBERS = [
  { label: "Rescue 1122", number: "1122", desc: "Ambulance, fire & rescue", tone: "rose" },
  { label: "Police", number: "15", desc: "Police emergency", tone: "sky" },
  { label: "Edhi Ambulance", number: "115", desc: "Ambulance & welfare", tone: "lime" },
  { label: "Motorway Police", number: "130", desc: "Highways & motorways", tone: "amber" },
  { label: "Fire Brigade", number: "16", desc: "Fire emergency", tone: "rose" },
];

// Regional orientation — nearest major medical facilities per travel region.
export const REGION_SAFETY = {
  "Gilgit-Baltistan": {
    hospitals: ["DHQ Hospital Gilgit", "DHQ Hospital Skardu", "Aga Khan Medical Centre, Gilgit"],
    note: "Mobile signal drops on high passes (Khunjerab, Deosai). Carry cash and download offline maps before you leave Gilgit or Skardu.",
  },
  "Khyber Pakhtunkhwa": {
    hospitals: ["Saidu Group of Hospitals, Swat", "DHQ Hospital Mansehra", "Ayub Teaching Hospital, Abbottabad"],
    note: "Kaghan–Naran roads can close after rain or snow. Check conditions before travelling beyond Naran.",
  },
  "Azad Kashmir": {
    hospitals: ["CMH Muzaffarabad", "DHQ Hospital Muzaffarabad"],
    note: "Neelum Valley roads are narrow and prone to landslides after rain — travel in daylight.",
  },
};

// Which region a destination city belongs to (for showing local guidance).
export const CITY_REGION = {
  Hunza: "Gilgit-Baltistan", Nagar: "Gilgit-Baltistan", Gilgit: "Gilgit-Baltistan",
  Ghizer: "Gilgit-Baltistan", Skardu: "Gilgit-Baltistan", Astore: "Gilgit-Baltistan",
  "Fairy Meadows": "Gilgit-Baltistan",
  Naran: "Khyber Pakhtunkhwa", Kaghan: "Khyber Pakhtunkhwa", Mansehra: "Khyber Pakhtunkhwa",
  Balakot: "Khyber Pakhtunkhwa", Abbottabad: "Khyber Pakhtunkhwa", Swat: "Khyber Pakhtunkhwa",
  Kalam: "Khyber Pakhtunkhwa", Malam: "Khyber Pakhtunkhwa", Chitral: "Khyber Pakhtunkhwa",
  Murree: "Punjab",
  Muzaffarabad: "Azad Kashmir", Neelum: "Azad Kashmir",
};

export const SAFETY_TIPS = [
  { title: "Acclimatise to altitude", body: "Ascend gradually above 2,500 m. Rest, hydrate, and descend if you feel severe headaches or nausea." },
  { title: "Travel in daylight", body: "Mountain roads are narrow with blind bends and rockfall. Avoid night driving on unfamiliar routes." },
  { title: "Download offline maps", body: "Signal is patchy in the valleys. Save maps offline and share your route with someone before you go." },
  { title: "Check the weather & road status", body: "Snow and rain close high passes quickly. Confirm Khunjerab, Babusar and Lowari are open before setting out." },
  { title: "Carry cash & a power bank", body: "ATMs are scarce past Gilgit and Skardu. Keep cash, a power bank, and warm layers even in summer." },
  { title: "Respect local customs", body: "Dress modestly, ask before photographing people, and follow your local guide's advice." },
];
