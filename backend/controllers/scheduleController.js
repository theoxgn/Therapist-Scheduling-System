const { Schedule, Therapist } = require('../models');
const { validateSchedule } = require('../utils/scheduleValidation');
const { Op } = require('sequelize');

const scheduleController = {
  async getSchedules(req, res) {
    try {
      const { branchCode, startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          message: 'Start date and end date are required'
        });
      }

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
        },
        order: [
          ['date', 'ASC'],
          [Therapist, 'name', 'ASC']
        ]
      });

      return res.json(schedules);
    } catch (error) {
      console.error('Schedule fetch error:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch schedules',
        error: error.message 
      });
    }
  },

  async createSchedule(req, res) {
    try {
      const { branchCode, therapistId, date, shift } = req.body;

      // Check for existing schedule
      const existingSchedule = await Schedule.findOne({
        where: {
          therapistId,
          date
        }
      });

      let schedule;
      if (existingSchedule) {
        // Update existing schedule
        existingSchedule.shift = shift;
        schedule = await existingSchedule.save();
      } else {
        // Create new schedule
        schedule = await Schedule.create({
          branchCode,
          therapistId,
          date,
          shift
        });
      }

      // Fetch the created/updated schedule with therapist details
      const fullSchedule = await Schedule.findByPk(schedule.id, {
        include: [{
          model: Therapist,
          attributes: ['name', 'gender']
        }]
      });

      return res.status(201).json(fullSchedule);
    } catch (error) {
      console.error('Schedule creation error:', error);
      return res.status(500).json({ 
        message: 'Failed to create schedule',
        error: error.message 
      });
    }
  },

  async updateSchedule(req, res) {
    try {
      const { id } = req.params;
      const { shift } = req.body;

      const schedule = await Schedule.findByPk(id);
      if (!schedule) {
        return res.status(404).json({
          message: 'Schedule not found'
        });
      }

      // Update the shift
      schedule.shift = shift;
      await schedule.save();

      // Fetch updated schedule with therapist details
      const updatedSchedule = await Schedule.findByPk(id, {
        include: [{
          model: Therapist,
          attributes: ['name', 'gender']
        }]
      });

      return res.json(updatedSchedule);
    } catch (error) {
      console.error('Schedule update error:', error);
      return res.status(500).json({ 
        message: 'Failed to update schedule',
        error: error.message 
      });
    }
  },

  async deleteSchedule(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Schedule.destroy({
        where: { id }
      });

      if (deleted) {
        return res.status(204).send();
      }

      return res.status(404).json({
        message: 'Schedule not found'
      });
    } catch (error) {
      console.error('Schedule deletion error:', error);
      return res.status(500).json({ 
        message: 'Failed to delete schedule',
        error: error.message 
      });
    }
  },

  async clearDay(req, res) {
    try {
      const { branchCode, date } = req.body; // Changed from req.query to req.body
      
      console.log('Received clear request:', { branchCode, date });
  
      if (!branchCode || !date) {
        return res.status(400).json({
          success: false,
          message: 'Branch code and date are required'
        });
      }
  
      const schedulesToDelete = await Schedule.findAll({
        include: [{
          model: Therapist,
          where: { branchCode },
          attributes: ['name']
        }],
        where: {
          date
        }
      });
  
      if (schedulesToDelete.length === 0) {
        return res.json({
          success: true,
          message: 'No schedules found for the specified date'
        });
      }
  
      await Schedule.destroy({
        where: {
          id: {
            [Op.in]: schedulesToDelete.map(s => s.id)
          }
        }
      });
  
      return res.json({
        success: true,
        message: `Successfully cleared ${schedulesToDelete.length} schedules`,
        clearedSchedules: schedulesToDelete
      });
  
    } catch (error) {
      console.error('Clear day error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to clear schedules',
        error: error.message
      });
    }
  },

  async copyPreviousWeek(req, res) {
    try {
      const { branchCode, targetDate } = req.body;
      
      if (!branchCode || !targetDate) {
        return res.status(400).json({
          message: 'Branch code and target date are required'
        });
      }

      // Calculate previous week's date range
      const targetDateObj = new Date(targetDate);
      const previousWeekStart = new Date(targetDateObj);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);
      
      // Get previous week's schedules
      const previousSchedules = await Schedule.findAll({
        where: {
          branchCode,
          date: {
            [Op.between]: [previousWeekStart, targetDateObj]
          }
        },
        include: [{
          model: Therapist,
          attributes: ['name', 'gender']
        }]
      });

      // Copy schedules to new week
      const newSchedules = await Promise.all(
        previousSchedules.map(async (schedule) => {
          const newDate = new Date(schedule.date);
          newDate.setDate(newDate.getDate() + 7);
          
          // Check for existing schedule
          const existingSchedule = await Schedule.findOne({
            where: {
              branchCode,
              therapistId: schedule.therapistId,
              date: newDate
            }
          });

          if (!existingSchedule) {
            return Schedule.create({
              branchCode: schedule.branchCode,
              therapistId: schedule.therapistId,
              date: newDate,
              shift: schedule.shift
            });
          }
        })
      );

      return res.json(newSchedules.filter(Boolean));
    } catch (error) {
      console.error('Copy previous week error:', error);
      return res.status(500).json({ 
        message: 'Failed to copy schedules',
        error: error.message 
      });
    }
  },

  async validateSchedule(req, res) {
    try {
      const validationResult = await validateSchedule(req.body);
      return res.json(validationResult);
    } catch (error) {
      console.error('Schedule validation error:', error);
      return res.status(500).json({ 
        message: 'Failed to validate schedule',
        error: error.message 
      });
    }
  }
};

module.exports = scheduleController;