const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { validateScheduleRequest } = require('../middlewares/validation');

// GET schedules with query parameters
router.get('/', scheduleController.getSchedules);

// Create new schedule
router.post('/', scheduleController.createSchedule);

// Update schedule
router.put('/:id', scheduleController.updateSchedule);

// Delete schedule
router.delete('/:id', scheduleController.deleteSchedule);

// Clear day schedules
router.post('/clear-day', scheduleController.clearDay);

// Copy previous week
router.post('/copy-previous-week', scheduleController.copyPreviousWeek);

// Validate schedule
router.post('/validate', scheduleController.validateSchedule);

//export to pdf
router.post('/export-pdf', scheduleController.exportPDF);

module.exports = router;