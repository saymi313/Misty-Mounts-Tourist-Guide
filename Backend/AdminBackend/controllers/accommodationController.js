const Accommodation = require("../models/Accommodation");
const { slugify } = require("../../utils/slug");

// Unique slug from the name → used as the _id so /accommodations/:id is readable.
const uniqueAccSlug = async (name) => {
  const base = slugify(name);
  const used = new Set((await Accommodation.find().select("_id")).map((a) => String(a._id)));
  let slug = base;
  let i = 2;
  while (used.has(slug)) slug = `${base}-${i++}`;
  return slug;
};
exports.uniqueAccSlug = uniqueAccSlug;
exports.getAccommodationById = async (req, res) => {
  const { id } = req.params;
  try {
    const hotel = await Accommodation.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.status(200).json(hotel);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
// Add an accommodation
exports.addAccommodation = async (req, res) => {
  try {
    if (!req.body.name || req.body.price == null) {
      return res.status(400).json({ error: "name and price are required" });
    }
    const { name, type, location, city, description, picture, price, rating, reviews, amenities, tags, isAvailable, specialOffer } = req.body;
    const accommodation = new Accommodation({
      _id: await uniqueAccSlug(name),
      name, type, location, city, description, picture, price, rating, reviews, amenities, tags, isAvailable, specialOffer,
    });
    await accommodation.save();
    res.status(201).json({ message: "Accommodation added successfully", accommodation });
  } catch (error) {
    console.error("addAccommodation error:", error.message);
    res.status(500).json({ error: "Error adding accommodation" });
  }
};

// Update an accommodation
exports.updateAccommodation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const accommodation = await Accommodation.findByIdAndUpdate(id, updates, { new: true });
    if (!accommodation) return res.status(404).json({ error: "Accommodation not found" });
    res.json({ message: "Accommodation updated successfully", accommodation });
  } catch (error) {
    res.status(500).json({ error: "Error updating accommodation" });
  }
};

// Delete an accommodation
exports.deleteAccommodation = async (req, res) => {
  try {
    const { id } = req.params;
    const accommodation = await Accommodation.findByIdAndDelete(id);
    if (!accommodation) return res.status(404).json({ error: "Accommodation not found" });
    res.json({ message: "Accommodation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting accommodation" });
  }
};

// PATCH /admin/accommodations/:id/approve — admin approves (or unapproves) a listing.
exports.approveAccommodation = async (req, res) => {
  try {
    const { id } = req.params;
    const isApproved = "isApproved" in req.body ? !!req.body.isApproved : true;
    const accommodation = await Accommodation.findByIdAndUpdate(id, { isApproved }, { new: true });
    if (!accommodation) return res.status(404).json({ error: "Accommodation not found" });
    res.json({ message: "Approval updated", accommodation });
  } catch (error) {
    res.status(500).json({ error: "Error updating approval" });
  }
};

// Fetch all accommodations
exports.getAllAccommodations = async (req, res) => {
  try {
    const accommodations = await Accommodation.find();
    res.json(accommodations);
  } catch (error) {
    res.status(500).json({ error: "Error fetching accommodations" });
  }
};
