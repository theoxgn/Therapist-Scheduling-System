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
  
      // Validate input
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
  
      // Get unique therapists
      const therapistMap = new Map();
      schedules.forEach(schedule => {
        if (!therapistMap.has(schedule.Therapist.id)) {
          therapistMap.set(schedule.Therapist.id, schedule.Therapist);
        }
      });
      
      const uniqueTherapists = Array.from(therapistMap.values());
      uniqueTherapists.sort((a, b) => a.name.localeCompare(b.name));
  
      // Get dates for the week
      const dates = [];
      let currentDate = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      while (currentDate <= endDateObj) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      // Create PDF
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 30
      });
  
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition', 
        `attachment; filename=schedule-${branchCode}-${startDate}.pdf`
      );
      
      // Pipe the PDF document to the response
      doc.pipe(res);
  
      // Colors
      const colors = {
        headerBg: '#f8fafc', // bg-slate-50
        headerText: '#1e293b', // text-slate-800
        border: '#cbd5e1', // border-slate-300
        nameBg: '#fef9c3', // bg-yellow-100
        nameText: '#713f12', // text-yellow-900
        weekendBg: '#e0f2fe', // bg-sky-100
        alternateRowBg: '#f1f5f9', // bg-slate-100
        footerText: '#64748b' // text-slate-500
      };
  
      // Add header
      doc.fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(`SCHEDULE - ${branchCode}`, { align: 'center' });
      
      doc.fontSize(12)
        .font('Helvetica')
        .text(`Period: ${format(new Date(startDate), 'MMMM d, yyyy')} - ${format(new Date(endDate), 'MMMM d, yyyy')}`, { align: 'center' });
      
      // Add some space after header
      doc.moveDown(2);
  
      // Table settings
      const pageWidth = doc.page.width - 60;
      const startX = 30;
      let startY = doc.y;
      
      // Dynamic layout calculations
      const nameColWidth = 100;
      const dateColWidth = (pageWidth - nameColWidth) / dates.length;
      const rowHeight = 40;
      
      // Draw table header
      // Name column
      doc.rect(startX, startY, nameColWidth, rowHeight)
        .fillAndStroke(colors.headerBg, colors.border);
      doc.fillColor(colors.headerText)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('THERAPIST', startX + 5, startY + 15, { width: nameColWidth - 10 });
  
      // Date columns
      dates.forEach((date, i) => {
        const x = startX + nameColWidth + (dateColWidth * i);
        
        // Cell background
        doc.rect(x, startY, dateColWidth, rowHeight)
          .fillAndStroke(colors.headerBg, colors.border);
        
        // Day name
        doc.fillColor(colors.headerText)
          .font('Helvetica-Bold')
          .fontSize(10)
          .text(format(date, 'EEE, MMM d'), x + 5, startY + 10, { width: dateColWidth - 10, align: 'center' });
        
        // Weekday/weekend
        doc.fillColor(colors.headerText)
          .font('Helvetica')
          .fontSize(8)
          .text([0, 6].includes(date.getDay()) ? 'Weekend' : 'Weekday', x + 5, startY + 24, { width: dateColWidth - 10, align: 'center' });
      });
      
      // Move to next row
      startY += rowHeight;
  
      // Draw table rows
      uniqueTherapists.forEach((therapist, rowIndex) => {
        // Check if we need a new page
        if (startY + rowHeight > doc.page.height - 50) {
          doc.addPage();
          startY = 50; // Reset Y position on new page
          
          // Redraw header on new page
          doc.fontSize(14)
            .font('Helvetica-Bold')
            .text(`SCHEDULE - ${branchCode} (continued)`, { align: 'center' });
          doc.moveDown();
          
          // Redraw column headers
          const headerY = doc.y;
          
          // Name column
          doc.rect(startX, headerY, nameColWidth, rowHeight)
            .fillAndStroke(colors.headerBg, colors.border);
          doc.fillColor(colors.headerText)
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('THERAPIST', startX + 5, headerY + 15, { width: nameColWidth - 10 });
          
          // Date columns
          dates.forEach((date, i) => {
            const x = startX + nameColWidth + (dateColWidth * i);
            
            doc.rect(x, headerY, dateColWidth, rowHeight)
              .fillAndStroke(colors.headerBg, colors.border);
            
            doc.fillColor(colors.headerText)
              .font('Helvetica-Bold')
              .fontSize(10)
              .text(format(date, 'EEE, MMM d'), x + 5, headerY + 10, { width: dateColWidth - 10, align: 'center' });
            
            doc.fillColor(colors.headerText)
              .font('Helvetica')
              .fontSize(8)
              .text([0, 6].includes(date.getDay()) ? 'Weekend' : 'Weekday', x + 5, headerY + 24, { width: dateColWidth - 10, align: 'center' });
          });
          
          startY = headerY + rowHeight;
        }
        
        // Draw name cell
        const isEvenRow = rowIndex % 2 === 0;
        const rowBgColor = isEvenRow ? '#ffffff' : colors.alternateRowBg;
        
        doc.rect(startX, startY, nameColWidth, rowHeight)
          .fillAndStroke(colors.nameBg, colors.border);
        
        doc.fillColor(colors.nameText)
          .font('Helvetica-Bold')
          .fontSize(9)
          .text(therapist.name, startX + 5, startY + 15, { width: nameColWidth - 10 });
        
        // Draw schedule cells
        dates.forEach((date, colIndex) => {
          const cellX = startX + nameColWidth + (dateColWidth * colIndex);
          const dateStr = format(date, 'yyyy-MM-dd');
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          
          // Find schedule for this therapist and date
          const schedule = schedules.find(s => 
            s.Therapist.id === therapist.id && 
            s.date === dateStr
          );
          
          // Cell background
          const cellBgColor = isWeekend ? colors.weekendBg : rowBgColor;
          
          doc.rect(cellX, startY, dateColWidth, rowHeight)
            .fillAndStroke(cellBgColor, colors.border);
          
          // If there's a schedule, draw shift badge
          if (schedule && schedule.shift) {
            const shift = SHIFTS[schedule.shift];
            if (shift) {
              // Draw badge
              const badgeWidth = 30;
              const badgeHeight = 20;
              const badgeX = cellX + (dateColWidth / 2) - (badgeWidth / 2);
              const badgeY = startY + (rowHeight / 2) - (badgeHeight / 2);
              
              // Simple rectangle instead of rounded
              doc.rect(badgeX, badgeY, badgeWidth, badgeHeight)
                .fillAndStroke(shift.color, colors.border);
              
              // Draw shift code
              doc.fillColor('#000000')
                .font('Helvetica-Bold')
                .fontSize(12)
                .text(schedule.shift, badgeX, badgeY + 4, { width: badgeWidth, align: 'center' });
            }
          }
        });
        
        // Move to next row
        startY += rowHeight;
      });
  
      // Add shift legend
      doc.moveDown(2);
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000000')
        .text('Shift Legend:', startX);
      
      doc.moveDown();
      
      // Draw legend items
      const legendX = startX;
      let legendY = doc.y;
      const legendItemWidth = 150;
      const legendItemHeight = 25;
      
      Object.entries(SHIFTS).forEach(([code, shift], index) => {
        // Create rows of 3 items each
        const col = index % 3;
        const row = Math.floor(index / 3);
        
        const x = legendX + (col * legendItemWidth);
        const y = legendY + (row * legendItemHeight);
        
        // Draw color box
        doc.rect(x, y, 20, 20)
          .fill(shift.color);
        
        // Draw description
        doc.fillColor('#000000')
          .font('Helvetica')
          .fontSize(10)
          .text(`${code}: ${shift.label} (${shift.time})`, x + 25, y + 5);
      });
  
      // Add footer
      const footerY = doc.page.height - 40;
      doc.fontSize(8)
        .fillColor(colors.footerText)
        .text(`Generated on: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, startX, footerY);
  
      // Finalize PDF
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
  async clearAllSchedules(req, res) {
    try {
      const { branchCode, startDate, endDate } = req.body;
      
      if (!branchCode) {
        return res.status(400).json({
          success: false,
          message: 'Branch code is required'
        });
      }
  
      // If date range is provided, only clear schedules within that range
      const whereClause = {
        include: [{
          model: Therapist,
          where: { branchCode },
          attributes: ['name']
        }]
      };
  
      // Add date range filter if provided
      if (startDate && endDate) {
        whereClause.where = {
          date: {
            [Op.between]: [startDate, endDate]
          }
        };
        console.log(`Attempting to clear schedules for branch ${branchCode} from ${startDate} to ${endDate}`);
      } else {
        console.log(`Attempting to clear all schedules for branch: ${branchCode}`);
      }
  
      const schedulesToDelete = await Schedule.findAll(whereClause);
  
      if (schedulesToDelete.length === 0) {
        return res.json({
          success: true,
          message: 'No schedules found for this criteria'
        });
      }
  
      // Delete schedules
      const deletedCount = await Schedule.destroy({
        where: {
          id: {
            [Op.in]: schedulesToDelete.map(s => s.id)
          }
        }
      });
  
      console.log(`Successfully deleted ${deletedCount} schedules`);
  
      return res.json({
        success: true,
        message: `Successfully cleared ${deletedCount} schedules`,
        count: deletedCount
      });
  
    } catch (error) {
      console.error('Clear schedules error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to clear schedules',
        error: error.message
      });
    }
  },
};

module.exports = scheduleController;