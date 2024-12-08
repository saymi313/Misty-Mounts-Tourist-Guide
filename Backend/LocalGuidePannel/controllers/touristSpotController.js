const TouristSpot = require("../../AdminBackend/models/TouristSport");

// Add a tourist spot
exports.addTouristSpot = async (req, res) => {
  const { city, nearbyPlaces, isApproved } = req.body;

  if (!city || !Array.isArray(nearbyPlaces) || nearbyPlaces.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'City and at least one nearby place are required' 
    });
  }

  try {
    const newSpot = new TouristSpot({
      city,
      nearbyPlaces,
      isApproved: isApproved || false,
    });
    await newSpot.save();

    res.status(201).json({ 
      success: true, 
      message: 'Tourist spot added successfully', 
      data: newSpot 
    });
  } catch (error) {
    console.error('Error adding tourist spot:', error);
    res.status(500).json({ success: false, message: 'Failed to add tourist spot' });
  }
};


// Update a tourist spot
exports.updateTouristSpot = async (req, res) => {
  const { id } = req.params;
  const { city, nearbyPlaces, isApproved } = req.body;

  try {
    const spot = await TouristSpot.findByIdAndUpdate(
      id,
      { city, nearbyPlaces, isApproved },
      { new: true, runValidators: true }
    );

    if (!spot) {
      return res.status(404).json({ success: false, message: "Tourist spot not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Tourist spot updated successfully', 
      data: spot 
    });
  } catch (error) {
    console.error('Error updating tourist spot:', error);
    res.status(500).json({ success: false, message: 'Failed to update tourist spot' });
  }
};


// Delete a tourist spot
exports.deleteTouristSpot = async (req, res) => {
  const { id } = req.params;

  try {
    const spot = await TouristSpot.findByIdAndDelete(id);

    if (!spot) {
      return res.status(404).json({ success: false, message: "Tourist spot not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Tourist spot deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting tourist spot:', error);
    res.status(500).json({ success: false, message: 'Failed to delete tourist spot' });
  }
};


// Get all tourist spots
exports.getAllSpots = async (req, res) => {
  try {
    const spots = await TouristSpot.find();
    res.status(200).json({ success: true, data: spots });
  } catch (error) {
    console.error('Error fetching all spots:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch spots' });
  }
};

// Get a single tourist spot by ID
exports.getSpotById = async (req, res) => {
  const { id } = req.params;

  try {
    const spot = await TouristSpot.findById(id);

    if (!spot) return res.status(404).json({ success: false, message: "Tourist spot not found" });

    res.status(200).json({ success: true, data: spot });
  } catch (error) {
    console.error('Error fetching spot by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch spot' });
  }
};

// Add a nearby place
exports.addNearbyPlace = async (req, res) => {
  const { spotId } = req.params;
  const { name, location, description, picture } = req.body;

  if (!name || !location || !description || !picture) {
    return res.status(400).json({ success: false, message: 'All fields for nearby place are required' });
  }

  try {
    const spot = await TouristSpot.findById(spotId);

    if (!spot) {
      return res.status(404).json({ success: false, message: "Tourist spot not found" });
    }

    const newNearbyPlace = { name, location, description, picture };
    spot.nearbyPlaces.push(newNearbyPlace);

    await spot.save();
    res.status(201).json({ 
      success: true, 
      message: 'Nearby place added successfully', 
      data: spot 
    });
  } catch (error) {
    console.error('Error adding nearby place:', error);
    res.status(500).json({ success: false, message: 'Failed to add nearby place' });
  }
};


// Update a nearby place
exports.updateNearbyPlace = async (req, res) => {
  const { spotId, nearbyPlaceId } = req.params;
  const { name, location, description, picture } = req.body;

  try {
    const spot = await TouristSpot.findById(spotId);

    if (!spot) {
      return res.status(404).json({ success: false, message: "Tourist spot not found" });
    }

    const nearbyPlace = spot.nearbyPlaces.id(nearbyPlaceId);

    if (!nearbyPlace) {
      return res.status(404).json({ success: false, message: "Nearby place not found" });
    }

    nearbyPlace.name = name;
    nearbyPlace.location = location;
    nearbyPlace.description = description;
    nearbyPlace.picture = picture;

    await spot.save();
    res.status(200).json({ 
      success: true, 
      message: 'Nearby place updated successfully', 
      data: spot 
    });
  } catch (error) {
    console.error('Error updating nearby place:', error);
    res.status(500).json({ success: false, message: 'Failed to update nearby place' });
  }
};


// Delete a nearby place
exports.deleteNearbyPlace = async (req, res) => {
  const { spotId, nearbyPlaceId } = req.params;

  try {
    const spot = await TouristSpot.findById(spotId);

    if (!spot) {
      return res.status(404).json({ success: false, message: "Tourist spot not found" });
    }

    const nearbyPlace = spot.nearbyPlaces.id(nearbyPlaceId);

    if (!nearbyPlace) {
      return res.status(404).json({ success: false, message: "Nearby place not found" });
    }

    nearbyPlace.remove();

    await spot.save();
    res.status(200).json({ 
      success: true, 
      message: 'Nearby place deleted successfully', 
      data: spot 
    });
  } catch (error) {
    console.error('Error deleting nearby place:', error);
    res.status(500).json({ success: false, message: 'Failed to delete nearby place' });
  }
};

