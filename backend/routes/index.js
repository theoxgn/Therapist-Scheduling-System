const express = require('express');
const router = express.Router();

const branchRoutes = require('./branchRoutes');
const therapistRoutes = require('./therapistRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const shiftSettingsRoutes = require('./shiftSettingsRoutes');

router.use('/branches', branchRoutes);
router.use('/therapists', therapistRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/', shiftSettingsRoutes);

module.exports = router;