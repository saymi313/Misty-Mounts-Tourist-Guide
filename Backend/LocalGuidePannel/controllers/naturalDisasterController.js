const NaturalDisaster = require("../models/NaturalDisaster");

// Create a new natural disaster
const createNaturalDisaster = async (req, res) => {
  try {
    const { name, location, description, date, severity, affectedAreas } = req.body;
    const newDisaster = new NaturalDisaster({ name, location, description, date, severity, affectedAreas });
    await newDisaster.save();
    res.status(201).json({ success: true, message: "Natural disaster created successfully", data: newDisaster });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating natural disaster", error: error.message });
  }
};

// Get all natural disasters
const getAllNaturalDisasters = async (req, res) => {
  try {
    const disasters = await NaturalDisaster.find();
    res.status(200).json({ success: true, data: disasters });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching natural disasters", error: error.message });
  }
};

// Get a single natural disaster by ID
const getNaturalDisasterById = async (req, res) => {
  try {
    const { id } = req.params;
    const disaster = await NaturalDisaster.findById(id);
    if (!disaster) return res.status(404).json({ success: false, message: "Natural disaster not found" });
    res.status(200).json({ success: true, data: disaster });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching natural disaster", error: error.message });
  }
};

// Update a natural disaster
const updateNaturalDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, description, date, severity, affectedAreas, isResolved } = req.body;

    const updatedDisaster = await NaturalDisaster.findByIdAndUpdate(
      id,
      { name, location, description, date, severity, affectedAreas, isResolved },
      { new: true }
    );
    if (!updatedDisaster) return res.status(404).json({ success: false, message: "Natural disaster not found" });
    res.status(200).json({ success: true, message: "Natural disaster updated successfully", data: updatedDisaster });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating natural disaster", error: error.message });
  }
};

// Delete a natural disaster
const deleteNaturalDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDisaster = await NaturalDisaster.findByIdAndDelete(id);
    if (!deletedDisaster) return res.status(404).json({ success: false, message: "Natural disaster not found" });
    res.status(200).json({ success: true, message: "Natural disaster deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting natural disaster", error: error.message });
  }
};

module.exports = {
  createNaturalDisaster,
  getAllNaturalDisasters,
  getNaturalDisasterById,
  updateNaturalDisaster,
  deleteNaturalDisaster,
};
