const Transportation = require('../models/Transportation');

// Fetch transportation options by spot ID
exports.getTransportationBySpotId = async (req, res) => {
  try {
    const transportation = await Transportation.find({ spotId: req.params.spotId });
    res.status(200).json(transportation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transportation options' });
  }
};

// Add transportation
exports.addTransportation = async (req, res) => {
  const { spotId, transportType, Number, availability } = req.body;
  try {
    const newTransportation = new Transportation({ spotId, transportType, Number, availability });
    await newTransportation.save();
    res.status(201).json({ message: 'Transportation added successfully' });
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
