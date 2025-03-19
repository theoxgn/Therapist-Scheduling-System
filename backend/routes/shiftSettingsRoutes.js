// routes/shiftSettingsRoutes.js
const express = require('express');
const router = express.Router();
const shiftSettingsController = require('../controllers/shiftSettingsController');

router.get('/branches/:branchCode/shift-settings', shiftSettingsController.get);
router.post('/branches/:branchCode/shift-settings', shiftSettingsController.create);
router.put('/branches/:branchCode/shift-settings', shiftSettingsController.update);

module.exports = router;