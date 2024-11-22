const express = require('express');
const router = express.Router();

const branchRoutes = require('./branchRoutes');
const therapistRoutes = require('./therapistRoutes');
const scheduleRoutes = require('./scheduleRoutes');

router.use('/branches', branchRoutes);
router.use('/therapists', therapistRoutes);
router.use('/schedules', scheduleRoutes);

module.exports = router;