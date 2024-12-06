const Accommodation = require("../models/Accommodation");

// Add an accommodation
exports.addAccommodation = async (req, res) => {
  try {
    const { name, description,picture, price, isAvailable, specialOffer } = req.body;
    const accommodation = new Accommodation({ name, description, picture, price, isAvailable, specialOffer });
    await accommodation.save();
    res.status(201).json({ message: "Accommodation added successfully", accommodation });
  } catch (error) {
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

// Fetch all accommodations
exports.getAllAccommodations = async (req, res) => {
  try {
    const accommodations = await Accommodation.find();
    res.json(accommodations);
  } catch (error) {
    res.status(500).json({ error: "Error fetching accommodations" });
  }
};
