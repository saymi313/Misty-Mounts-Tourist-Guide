const TouristSpot = require("../models/TouristSport");

// Add a tourist spot
// Add a tourist spot
exports.addTouristSpot = async (req, res) => {
    try {
      const { name, location, picture, description } = req.body;
      const spot = new TouristSpot({ name, location, description, picture, isApproved: true });
      await spot.save();
      res.status(201).json({ message: "Tourist spot added successfully", spot });
    } catch (error) {
      res.status(500).json({ error: "Error adding tourist spot" });
    }
  };
  

// Update a tourist spot
exports.updateTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const spot = await TouristSpot.findByIdAndUpdate(id, updates, { new: true });
    if (!spot) return res.status(404).json({ error: "Spot not found" });
    res.json({ message: "Tourist spot updated successfully", spot });
  } catch (error) {
    res.status(500).json({ error: "Error updating tourist spot" });
  }
};

// Delete a tourist spot
exports.deleteTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const spot = await TouristSpot.findByIdAndDelete(id);
    if (!spot) return res.status(404).json({ error: "Spot not found" });
    res.json({ message: "Tourist spot deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting tourist spot" });
  }
};

// Fetch all spots (approved/unapproved)
exports.getAllSpots = async (req, res) => {
  try {
    const spots = await TouristSpot.find();
    res.json(spots);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tourist spots" });
  }
};

// Approve or reject a spot
exports.approveOrRejectSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const spot = await TouristSpot.findByIdAndUpdate(id, { isApproved }, { new: true });
    if (!spot) return res.status(404).json({ error: "Spot not found" });
    res.json({ message: `Spot ${isApproved ? "approved" : "rejected"}`, spot });
  } catch (error) {
    res.status(500).json({ error: "Error approving/rejecting spot" });
  }
};
