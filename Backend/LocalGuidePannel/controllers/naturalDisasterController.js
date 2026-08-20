const NaturalDisaster = require("../models/NaturalDisaster");

// Create a new natural disaster
const createNaturalDisaster = async (req, res) => {
  try {
    const { name, location, description, date, severity, affectedAreas } = req.body;
    const newDisaster = new NaturalDisaster({ name, location, description, date, severity, affectedAreas, createdBy: req.user?.id || "" });
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

    const existing = await NaturalDisaster.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Natural disaster not found" });
    // Ownership: a guide may only edit an alert they created (admins bypass).
    if (req.user?.type !== "admin" && String(existing.createdBy || "") !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "You can only edit alerts you created." });
    }

    const updatedDisaster = await NaturalDisaster.findByIdAndUpdate(
      id,
      { name, location, description, date, severity, affectedAreas, isResolved },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Natural disaster updated successfully", data: updatedDisaster });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating natural disaster", error: error.message });
  }
};

// Delete a natural disaster
const deleteNaturalDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await NaturalDisaster.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Natural disaster not found" });
    // Ownership: a guide may only delete an alert they created (admins bypass).
    if (req.user?.type !== "admin" && String(existing.createdBy || "") !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "You can only delete alerts you created." });
    }
    await NaturalDisaster.findByIdAndDelete(id);
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
