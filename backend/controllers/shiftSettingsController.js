// controllers/shiftSettingsController.js
const Branch = require('../models/Branch');
const ShiftSettings = require('../models/ShiftSettings');

const shiftSettingsController = {
  async get(req, res) {
    try {
      const { branchCode } = req.params;
      
      // Check if branch exists
      const branch = await Branch.findByPk(branchCode);
      if (!branch) return res.status(404).json({ message: 'Branch not found' });
      
      // Get shift settings or return default values if not found
      const settings = await ShiftSettings.findOne({
        where: { branchCode }
      });
      if (!settings) {

      console.log(settings)
        // Return default settings
        return res.json({
          settings:{
            type: 'default'
          },
          weekday: {
            shift1: { min: 2, max: 3 },
            shiftMiddle: { min: 2, max: 3 },
            shift2: { min: 2, max: 3 }
          },
          weekend: {
            shift1: { min: 4, max: 5 },
            shiftMiddle: { min: 4, max: 5 },
            shift2: { min: 4, max: 5 }
          },
          off: {
            maxPerDay: 2,
            maxConsecutive: 2,
            maxPerWeek: 1
          }
        });
      }
      
      res.json(settings.settings);
    } catch (error) {
      console.error('Error in get shift settings:', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  async create(req, res) {
    try {
      const { branchCode } = req.params;
      const settingsData = req.body;
      
      // Check if branch exists
      const branch = await Branch.findByPk(branchCode);
      if (!branch) return res.status(404).json({ message: 'Branch not found' });
      
      // Check if settings already exist for this branch
      const existingSettings = await ShiftSettings.findOne({
        where: { branchCode }
      });
      
      if (existingSettings) {
        return res.status(400).json({ 
          message: 'Shift settings already exist for this branch. Use PUT to update.'
        });
      }
      
      // Create new settings
      const settings = await ShiftSettings.create({
        branchCode,
        settings: settingsData
      });
      
      res.status(201).json(settings.settings);
    } catch (error) {
      console.error('Error in create shift settings:', error);
      res.status(400).json({ message: error.message });
    }
  },
  
  async update(req, res) {
    try {
      const { branchCode } = req.params;
      const settingsData = req.body;
      
      // Check if branch exists
      const branch = await Branch.findByPk(branchCode);
      if (!branch) return res.status(404).json({ message: 'Branch not found' });
      
      // Find settings
      let settings = await ShiftSettings.findOne({
        where: { branchCode }
      });
      
      if (!settings) {
        return res.status(404).json({ message: 'Shift settings not found. Use POST to create.' });
      }
      
      // Update settings
      settings.settings = settingsData;
      await settings.save();
      
      res.json(settings.settings);
    } catch (error) {
      console.error('Error in update shift settings:', error);
      res.status(400).json({ message: error.message });
    }
  },
  
  async delete(req, res) {
    try {
      const { branchCode } = req.params;
      
      // Check if branch exists
      const branch = await Branch.findByPk(branchCode);
      if (!branch) return res.status(404).json({ message: 'Branch not found' });
      
      // Delete settings
      const deleted = await ShiftSettings.destroy({
        where: { branchCode }
      });
      
      if (deleted === 0) {
        return res.status(404).json({ message: 'Shift settings not found' });
      }
      
      res.status(200).json({ message: 'Shift settings deleted successfully' });
    } catch (error) {
      console.error('Error in delete shift settings:', error);
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = shiftSettingsController;