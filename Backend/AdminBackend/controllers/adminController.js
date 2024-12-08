const TouristSpot = require("../models/TouristSport");

exports.getAllCities = async (req, res) => {
  try {
    const cities = await TouristSpot.distinct('city');
    console.log('Fetched cities:', cities); // Log the cities
    res.status(200).json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
};

exports.getSpotByCityAndId = async (req, res) => {
  try {
    const { city, id } = req.params;
    const spot = await TouristSpot.findOne({ 'city': city, 'nearbyPlaces._id': id }).select('nearbyPlaces');
    if (!spot) {
      return res.status(404).json({ error: 'Spot not found' });
    }
    const nearbyPlace = spot.nearbyPlaces.id(id);
    res.json(nearbyPlace);
  } catch (error) {
    console.error('Error fetching spot:', error);
    res.status(500).json({ error: 'Error fetching spot' });
  }
};

exports.getSpotsByCity = async (req, res) => {
  const { city } = req.params;

  try {
    const spot = await TouristSpot.findOne({ city });
    if (!spot) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }
    console.log('Fetched spot:', spot); // Log the spot
    res.status(200).json(spot);
  } catch (error) {
    console.error('Error fetching spots:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch spots' });
  }
};

// ... (keep other existing controller methods)




// Fetch all approved tourist spots
exports.getAllApprovedSpots = async (req, res) => {
  try {
    const spots = await TouristSpot.find({ isApproved: true });
    res.status(200).json({ success: true, data: spots });
  } catch (error) {
    console.error('Error fetching tourist spots:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tourist spots' });
  }
};

// Fetch approved tourist spots by city
exports.getApprovedSpotsByCity = async (req, res) => {
  const { city } = req.query; // Retrieve city from query parameters

  if (!city) {
    return res.status(400).json({ success: false, message: 'City is required' });
  }

  try {
    const approvedSpots = await TouristSpot.find({ city, isApproved: true });
    res.status(200).json({ success: true, data: approvedSpots });
  } catch (error) {
    console.error('Error fetching approved spots:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tourist spots' });
  }
};
// Fetch nearby places for a specific spot
exports.getNearbyPlacesBySpot = async (req, res) => {
  const { id } = req.params; // Get the tourist spot ID from route parameters

  try {
    const spot = await TouristSpot.findById(id).select('nearbyPlaces');
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Tourist spot not found' });
    }

    res.status(200).json({ success: true, data: spot.nearbyPlaces });
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch nearby places' });
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
const getTouristSpotById = async (req, res) => {
  try {
    const spotId = req.params.id; // Get the spot ID from the request parameters

    // Find the tourist spot by ID in the database
    const spot = await TouristSpot.findById(spotId);

    // If the spot is not found, send a 404 error
    if (!spot) {
      return res.status(404).json({ message: 'Tourist spot not found' });
    }

    // Return the spot data in the response
    res.status(200).json(spot);
  } catch (error) {
    console.error('Error fetching tourist spot:', error);
    res.status(500).json({ message: 'Server error' });
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
