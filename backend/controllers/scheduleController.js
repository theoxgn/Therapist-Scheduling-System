const { Schedule, Therapist } = require('../models');
const { validateSchedule } = require('../utils/scheduleValidation');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const { format } = require('date-fns');

const SHIFTS = {
  '1': { 
    label: 'Morning',
    time: '09:00 - 18:00',
    color: 'rgb(219, 234, 254)' // bg-blue-100
  },
  'M': { 
    label: 'Middle',
    time: '11:30 - 20:30',
    color: 'rgb(220, 252, 231)' // bg-green-100
  },
  '2': { 
    label: 'Evening',
    time: '13:00 - 22:00',
    color: 'rgb(243, 232, 255)' // bg-purple-100
  },
  'X': { 
    label: 'Leave Request',
    time: 'Leave Request',
    color: 'rgb(254, 249, 195)' // bg-yellow-100
  }
};

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
  },
  async exportPDF(req, res) {
    try {
      const { branchCode, startDate, endDate } = req.body;

      // Validasi input
      if (!branchCode || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Branch code, start date, and end date are required'
        });
      }

      console.log('Processing PDF export request:', { branchCode, startDate, endDate }); // Debug log

      // Fetch schedules with therapist details
      const schedules = await Schedule.findAll({
        include: [{
          model: Therapist,
          where: { branchCode },
          attributes: ['id', 'name', 'gender']
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

      // Group therapists
      const therapists = [...new Set(schedules.map(s => s.Therapist))];

      // Create PDF
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: {
          top: 30,
          bottom: 30,
          left: 40,
          right: 40
        }
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition', 
        `attachment; filename=schedule-${branchCode}-${startDate}.pdf`
      );
      
      // Pipe the PDF document to the response
      doc.pipe(res);

      // Header
      doc.fontSize(16).font('Helvetica-Bold')
        .text(`Schedule - ${branchCode}`, { align: 'center' });
      
      doc.fontSize(12)
        .text(`Period: ${format(new Date(startDate), 'MMM d, yyyy')} - ${format(new Date(endDate), 'MMM d, yyyy')}`, {
          align: 'center'
        });

      // Add margin after header
      doc.moveDown(2);

      // Table settings
      const startX = 40;
      const startY = 120;
      const colWidth = 90;
      const rowHeight = 30;
      
      // Get dates for the week
      const dates = [];
      let currentDate = new Date(startDate);
      while (currentDate <= new Date(endDate)) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Draw table header
      doc.font('Helvetica-Bold');
      // Name column
      doc.rect(startX, startY, colWidth, rowHeight)
         .fillAndStroke('#f3f4f6', '#000'); // bg-gray-100
      doc.fillColor('#000')
         .text('NAMA', startX + 5, startY + 10, { width: colWidth - 10 });

      // Date columns
      dates.forEach((date, i) => {
        const x = startX + colWidth * (i + 1);
        doc.rect(x, startY, colWidth, rowHeight)
           .fillAndStroke('#f3f4f6', '#000');
        doc.fillColor('#000')
           .text(format(date, 'EEE, MMM d'), x + 5, startY + 5, { 
             width: colWidth - 10,
             align: 'center'
           });
        doc.fontSize(8)
           .text(
             [0, 6].includes(date.getDay()) ? 'Weekend' : 'Weekday',
             x + 5,
             startY + 18,
             { width: colWidth - 10, align: 'center' }
           );
      });

      // Draw table rows
      doc.fontSize(10).font('Helvetica');
      therapists.forEach((therapist, rowIndex) => {
        const y = startY + rowHeight * (rowIndex + 1);
        
        // Draw name cell
        doc.rect(startX, y, colWidth, rowHeight)
           .fillAndStroke('#fef3c7', '#000'); // bg-amber-100
        doc.fillColor('#000')
           .text(therapist.name, startX + 5, y + 10, { 
             width: colWidth - 10 
           });

        // Draw schedule cells
        dates.forEach((date, colIndex) => {
          const x = startX + colWidth * (colIndex + 1);
          const dateStr = format(date, 'yyyy-MM-dd');
          
          const schedule = schedules.find(s => 
            s.Therapist.id === therapist.id && 
            s.date === dateStr
          );

          // Draw cell background
          doc.rect(x, y, colWidth, rowHeight)
             .fillAndStroke('#ffffff', '#000');

          // If there's a schedule, draw shift code with color
          if (schedule) {
            const shift = SHIFTS[schedule.shift];
            doc.rect(x + 5, y + 5, colWidth - 10, rowHeight - 10)
               .fill(shift.color);
            doc.fillColor('#000')
               .text(schedule.shift, x + 5, y + 10, {
                 width: colWidth - 10,
                 align: 'center'
               });
          }
        });
      });

      // Add legend
      const legendY = startY + rowHeight * (therapists.length + 2);
      doc.font('Helvetica-Bold').fontSize(12)
         .text('Legend:', startX, legendY);
      
      doc.font('Helvetica').fontSize(10);
      Object.entries(SHIFTS).forEach(([code, shift], index) => {
        const y = legendY + 20 + (index * 20);
        
        // Draw color box
        doc.rect(startX, y, 15, 15)
           .fill(shift.color);
        
        // Draw text
        doc.fillColor('#000')
           .text(`${code}: ${shift.label} (${shift.time})`, 
                 startX + 25, y + 3);
      });

      // Add footer with timestamp
      const bottomY = doc.page.height - 50;
      doc.fontSize(8)
         .text(
           `Generated on: ${format(new Date(), 'MMM d, yyyy HH:mm')}`,
           startX,
           bottomY,
           { align: 'left' }
         );

      // Finalize the PDF
      doc.end();

    } catch (error) {
      console.error('PDF Export error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to export PDF',
        error: error.message 
      });
    }
  },
};

module.exports = scheduleController;