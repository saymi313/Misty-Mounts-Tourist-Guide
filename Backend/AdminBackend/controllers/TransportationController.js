const Transportation = require('../models/Transportation');

// Fetch all transportation options (admin list view)
exports.getAllTransportation = async (req, res) => {
  try {
    const transportation = await Transportation.find();
    res.status(200).json(transportation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transportation options' });
  }
};

// Fetch transportation options by spot ID
exports.getTransportationBySpotId = async (req, res) => {
  try {
    const { spotId } = req.params;
    let transportation = await Transportation.find({ spotId });
    // Fall back to general options (seeded with spotId "") when a spot has none.
    if (!transportation.length) {
      transportation = await Transportation.find({ spotId: { $in: ["", null] } });
    }
    res.status(200).json(transportation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transportation options' });
  }
};

// Add transportation
exports.addTransportation = async (req, res) => {
  try {
    const newTransportation = new Transportation(req.body);
    await newTransportation.save();
    res.status(201).json({ message: 'Transportation added successfully', transportation: newTransportation });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add transportation' });
  }
};

// Update transportation
exports.updateTransportation = async (req, res) => {
  try {
    const updatedTransport = await Transportation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json({ message: 'Transportation updated successfully', updatedTransport });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transportation' });
  }
};

// Delete transportation
exports.deleteTransportation = async (req, res) => {
  try {
    await Transportation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Transportation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transportation' });
  }
};
