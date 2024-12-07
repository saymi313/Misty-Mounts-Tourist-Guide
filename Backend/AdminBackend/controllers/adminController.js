const TouristSpot = require("../models/TouristSport");
// Get approved tourist spots by city, excluding 'nearbyPlaces'
exports.getApprovedSpotsByCity = async (req, res) => {
  const { city } = req.query; // Retrieve city from query parameters

  if (!city) {
    return res.status(400).json({ success: false, message: 'City is required' });
  }

  try {
    // Find all spots with the given city and 'isApproved' set to true
    const approvedSpots = await TouristSpot.find({ city, isApproved: true }).select('-nearbyPlaces');
    res.status(200).json({ success: true, data: approvedSpots });
  } catch (error) {
    console.error('Error fetching approved spots:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch approved tourist spots' });
  }
};
// Add a tourist spot
exports.addTouristSpot = async (req, res) => {
  try {
    const { city, nearbyPlaces } = req.body;

    const spot = new TouristSpot({
      city,
      nearbyPlaces: nearbyPlaces || [], // Set default to empty array if not provided
    });

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
    const updates = req.body; // Including city and nearbyPlaces in updates

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

// Approve or reject a nearby place in a tourist spot
// Approve or reject a tourist spot
exports.approveOrRejectSpot = async (req, res) => {
  try {
    const { id } = req.params;  // This is the spot's ID
    const { isApproved } = req.body; // Approval status

    const spot = await TouristSpot.findById(id);
    if (!spot) return res.status(404).json({ error: "Tourist spot not found" });

    spot.isApproved = isApproved;  // Add 'isApproved' field to the spot model if it doesn't exist
    await spot.save();

    res.json({
      message: `Spot ${isApproved ? "approved" : "rejected"}`,
      spot,
    });
  } catch (error) {
    res.status(500).json({ error: "Error approving/rejecting tourist spot" });
  }
};
