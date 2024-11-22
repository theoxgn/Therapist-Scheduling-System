const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { validateScheduleRequest } = require('../middlewares/validation');

router.post('/', validateScheduleRequest, scheduleController.create);
router.get('/', scheduleController.getSchedules);
router.post('/leave', validateScheduleRequest, scheduleController.requestLeave);

module.exports = router;