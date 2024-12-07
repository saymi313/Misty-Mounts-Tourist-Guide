const TouristSpot = require("../../AdminBackend/models/TouristSport");


// Create a new tourist spot
const createTouristSpot = async (req, res) => {
  try {
    const { name, location, description, picture, nearbyPlaces } = req.body;

    // Ensure all required fields are provided
    if (!name || !location || !description || !picture) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, location, description, picture).",
      });
    }

    const newSpot = new TouristSpot({
      name,
      location,
      description,
      picture,
      nearbyPlaces, // Optional, if provided
    });

    await newSpot.save();
    res.status(201).json({
      success: true,
      message: "Tourist spot created successfully",
      data: newSpot,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating tourist spot",
      error: error.message,
    });
  }
};


// Get all tourist spots
const getAllTouristSpots = async (req, res) => {
  try {
    const spots = await TouristSpot.find(); // No need to populate createdBy
    res.status(200).json({ success: true, data: spots });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching tourist spots", error: error.message });
  }
};

// Get a single tourist spot by ID
const getTouristSpotById = async (req, res) => {
  try {
    const { id } = req.params;
    const spot = await TouristSpot.findById(id);
    if (!spot) return res.status(404).json({ success: false, message: "Tourist spot not found" });
    res.status(200).json({ success: true, data: spot });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching tourist spot", error: error.message });
  }
};

// Update a tourist spot
const updateTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, picture, nearbyPlaces, isApproved } = req.body; // Updated to match schema
    const updatedSpot = await TouristSpot.findByIdAndUpdate(
      id,
      { name, description, picture, nearbyPlaces, isApproved },
      { new: true }
    );
    if (!updatedSpot) return res.status(404).json({ success: false, message: "Tourist spot not found" });
    res.status(200).json({ success: true, message: "Tourist spot updated successfully", data: updatedSpot });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating tourist spot", error: error.message });
  }
};

// Delete a tourist spot
const deleteTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSpot = await TouristSpot.findByIdAndDelete(id);
    if (!deletedSpot) return res.status(404).json({ success: false, message: "Tourist spot not found" });
    res.status(200).json({ success: true, message: "Tourist spot deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting tourist spot", error: error.message });
  }
};

module.exports = {
  createTouristSpot,
  getAllTouristSpots,
  getTouristSpotById,
  updateTouristSpot,
  deleteTouristSpot,
};
