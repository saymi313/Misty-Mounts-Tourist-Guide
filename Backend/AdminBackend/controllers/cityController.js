const City = require("../models/City");

const shape = (c) => ({ _id: c._id, name: c.name, photo: c.photo || "", tagline: c.tagline || "" });

// GET /api/cities — public list (dropdowns + traveller panel).
exports.listCities = async (req, res) => {
  try {
    const cities = await City.find().sort({ name: 1 });
    res.json({ cities: cities.map(shape) });
  } catch (err) {
    console.error("listCities error:", err.message);
    res.status(500).json({ error: "Failed to load cities" });
  }
};

// POST /api/cities — admin adds a city.
exports.createCity = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ error: "City name is required" });
    const exists = await City.findOne({ name });
    if (exists) return res.status(409).json({ error: "That city already exists" });
    const city = await City.create({ name, photo: req.body.photo || "", tagline: req.body.tagline || "" });
    res.status(201).json({ city: shape(city) });
  } catch (err) {
    console.error("createCity error:", err.message);
    res.status(500).json({ error: "Failed to create city" });
  }
};

// PUT /api/cities/:id — admin updates a city.
exports.updateCity = async (req, res) => {
  try {
    const updates = {};
    for (const k of ["name", "photo", "tagline"]) if (k in req.body) updates[k] = req.body[k];
    if (updates.name) updates.name = updates.name.trim();
    const city = await City.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!city) return res.status(404).json({ error: "City not found" });
    res.json({ city: shape(city) });
  } catch (err) {
    console.error("updateCity error:", err.message);
    res.status(500).json({ error: "Failed to update city" });
  }
};

// DELETE /api/cities/:id — admin removes a city.
exports.deleteCity = async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) return res.status(404).json({ error: "City not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteCity error:", err.message);
    res.status(500).json({ error: "Failed to delete city" });
  }
};
