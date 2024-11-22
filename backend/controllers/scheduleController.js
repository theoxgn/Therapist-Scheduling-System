const { Schedule, Therapist } = require('../models');
const { validateSchedule } = require('../utils/scheduleValidation');

const scheduleController = {
  async create(req, res) {
    try {
      const validationResult = await validateSchedule(req.body);
      if (!validationResult.isValid) {
        return res.status(400).json({ message: validationResult.message });
      }

      const schedule = await Schedule.create(req.body);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getSchedules(req, res) {
    try {
      const { branchCode, startDate, endDate } = req.query;
      const schedules = await Schedule.findAll({
        include: [{
          model: Therapist,
          where: branchCode ? { branchCode } : {},
          attributes: ['name', 'gender']
        }],
        where: {
          date: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async requestLeave(req, res) {
    try {
      const { therapistId, date } = req.body;
      const validationResult = await validateLeaveRequest(therapistId, date);
      if (!validationResult.isValid) {
        return res.status(400).json({ message: validationResult.message });
      }

      const schedule = await Schedule.create({
        therapistId,
        date,
        shift: 'X',
        isLeaveRequest: true
      });
      res.status(201).json(schedule);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = scheduleController;