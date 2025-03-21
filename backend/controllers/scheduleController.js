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

      console.log('Processing PDF export request:', { branchCode, startDate, endDate });

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

      // Get dates for the date range
      const dates = [];
      let currentDate = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      while (currentDate <= endDateObj) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Check if this is a 2-week schedule
      const isTwoWeeks = dates.length > 7;

      // Create PDF
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 20,
        autoFirstPage: true,
        info: {
          Title: `Schedule - ${branchCode}`,
          Author: 'Therapist Scheduler App',
          Subject: `Schedule for ${branchCode} from ${startDate} to ${endDate}`
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

      // Colors based on your example
      const colors = {
        headerBg: '#FFFFFF',
        headerTextColor: '#000000',
        border: '#CCCCCC',
        weekendBg: '#E6F2FF',
        weekSeparator: '#0066CC',
        nameBg: '#FFFCE6',
        nameText: '#000000',
        shiftBadges: {
          '1': { bg: '#DAEBFF', text: '#FFFFFF', outline: '#0066CC' }, // Blue
          '2': { bg: '#DAEBFF', text: '#FFFFFF', outline: '#0066CC' }, // Blue
          'M': { bg: '#DAEBFF', text: '#FFFFFF', outline: '#0066CC' }, // Blue
          'X': { bg: '#DAEBFF', text: '#FFFFFF', outline: '#0066CC' }  // Blue
        },
        weekLabel: '#0066CC'
      };

      // Add header
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(`SCHEDULE - ${branchCode}`, { align: 'center' });
      
      doc.fontSize(11)
        .font('Helvetica')
        .text(`Period: ${format(new Date(startDate), 'MMMM d, yyyy')} - ${format(new Date(endDate), 'MMMM d, yyyy')}`, { align: 'center' });
      
      // Add week indicators above the table
      if (isTwoWeeks) {
        const weekLabelY = doc.y + 15;
        
        // Week 1 label
        doc.fontSize(10)
          .fillColor(colors.weekLabel)
          // .text('Week 1', doc.page.width * 0.25, weekLabelY, { align: 'center' });
          
        // Week 2 label  
        // doc.text('Week 2', doc.page.width * 0.75, weekLabelY, { align: 'center' });
      }
      
      // Add some space after header
      doc.moveDown(1);

      // Table settings
      const pageWidth = doc.page.width - 40;
      const startX = 20;
      let startY = doc.y + 10;
      
      // Calculate column widths
      const nameColWidth = 110;
      const dateColWidth = (pageWidth - nameColWidth) / dates.length;
      const rowHeight = 30; // Set a consistent row height
      
      // Draw table header
      // Name column
      doc.rect(startX, startY, nameColWidth, rowHeight)
        .lineWidth(1)
        .stroke(colors.border);
      
      doc.fillColor(colors.headerTextColor)
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('THERAPIST', startX + 5, startY + 10, { width: nameColWidth - 10 });

      // Draw date columns
      let prevDay = null;
      dates.forEach((date, i) => {
        const x = startX + nameColWidth + (dateColWidth * i);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isSecondWeekStart = isTwoWeeks && i === 7;
        
        // Apply weekend background or normal background
        if (isWeekend) {
          doc.rect(x, startY, dateColWidth, rowHeight)
            .fillColor(colors.weekendBg)
            .fill();
        }
        
        // Cell border with special handling for week separator
        if (isSecondWeekStart) {
          // Draw a thicker blue line for week separation
          doc.rect(x, startY, 1, rowHeight * (uniqueTherapists.length + 1))
            .fillColor(colors.weekSeparator)
            .fill();
        }
        
        // Draw regular cell border
        doc.rect(x, startY, dateColWidth, rowHeight)
          .lineWidth(1)
          .stroke(colors.border);
        
        // Formats for date display
        const dayOfWeek = format(date, 'EEE');
        const monthDay = format(date, 'MMM d');
        
        // Day name (Mon, Tue, etc.)
        doc.fillColor(colors.headerTextColor)
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(`${dayOfWeek}, ${monthDay}`, x + 2, startY + 5, { width: dateColWidth - 4, align: 'center' });
        
        // Weekday/weekend indicator
        doc.fillColor(colors.headerTextColor)
          .font('Helvetica')
          .fontSize(7)
          .text(isWeekend ? 'Weekend' : 'Weekday', x + 2, startY + 18, { width: dateColWidth - 4, align: 'center' });
        
        prevDay = date.getDay();
      });
      
      // Move to the first data row
      startY += rowHeight;

      // Draw therapist rows
      uniqueTherapists.forEach((therapist, rowIndex) => {
        // Check if we need a new page
        if (startY + rowHeight > doc.page.height - 60) {
          doc.addPage({ layout: 'landscape', margin: 20 });
          
          // Reset Y position on new page
          startY = 50;
          
          // Redraw column headers on new page
          // Name column
          doc.rect(startX, startY, nameColWidth, rowHeight)
            .lineWidth(1)
            .stroke(colors.border);
          
          doc.fillColor(colors.headerTextColor)
            .font('Helvetica-Bold')
            .fontSize(9)
            .text('THERAPIST', startX + 5, startY + 10, { width: nameColWidth - 10 });
          
          // Date columns
          dates.forEach((date, i) => {
            const x = startX + nameColWidth + (dateColWidth * i);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isSecondWeekStart = isTwoWeeks && i === 7;
            
            // Apply weekend background
            if (isWeekend) {
              doc.rect(x, startY, dateColWidth, rowHeight)
                .fillColor(colors.weekendBg)
                .fill();
            }
            
            // Cell border with special handling for week separator
            if (isSecondWeekStart) {
              doc.rect(x, startY, 1, rowHeight * (uniqueTherapists.length + 1))
                .fillColor(colors.weekSeparator)
                .fill();
            }
            
            // Regular cell border
            doc.rect(x, startY, dateColWidth, rowHeight)
              .lineWidth(1)
              .stroke(colors.border);
            
            // Day name
            const dayOfWeek = format(date, 'EEE');
            const monthDay = format(date, 'MMM d');
            
            doc.fillColor(colors.headerTextColor)
              .font('Helvetica-Bold')
              .fontSize(8)
              .text(`${dayOfWeek}, ${monthDay}`, x + 2, startY + 5, { width: dateColWidth - 4, align: 'center' });
            
            // Weekday/weekend indicator
            doc.fillColor(colors.headerTextColor)
              .font('Helvetica')
              .fontSize(7)
              .text(isWeekend ? 'Weekend' : 'Weekday', x + 2, startY + 18, { width: dateColWidth - 4, align: 'center' });
          });
          
          // Move to first data row on new page
          startY += rowHeight;
        }
        
        // Draw name cell with yellow background
        doc.rect(startX, startY, nameColWidth, rowHeight)
          .fillColor(colors.nameBg)
          .fill()
          .lineWidth(1)
          .stroke(colors.border);
        
        doc.fillColor(colors.nameText)
          .font('Helvetica')
          .fontSize(9)
          .text(therapist.name, startX + 5, startY + 10, { width: nameColWidth - 10 });
        
        // Draw schedule cells for this therapist
        dates.forEach((date, colIndex) => {
          const cellX = startX + nameColWidth + (dateColWidth * colIndex);
          const dateStr = format(date, 'yyyy-MM-dd');
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const isSecondWeekStart = isTwoWeeks && colIndex === 7;
          
          // Find schedule for this therapist and date
          const schedule = schedules.find(s => 
            s.Therapist.id === therapist.id && 
            s.date === dateStr
          );
          
          // Apply weekend background
          if (isWeekend) {
            doc.rect(cellX, startY, dateColWidth, rowHeight)
              .fillColor(colors.weekendBg)
              .fill();
          }
          
          // Add week separator
          if (isSecondWeekStart) {
            doc.rect(cellX, startY, 1, rowHeight)
              .fillColor(colors.weekSeparator)
              .fill();
          }
          
          // Draw cell border
          doc.rect(cellX, startY, dateColWidth, rowHeight)
            .lineWidth(1)
            .stroke(colors.border);
          
          // If there's a schedule, draw shift badge
          if (schedule && schedule.shift) {
            const shift = schedule.shift;
            const badgeSize = 24;
            const badgeX = cellX + (dateColWidth / 2) - (badgeSize / 2);
            const badgeY = startY + (rowHeight / 2) - (badgeSize / 2);
            
            // Badge styling colors - use custom styling from your example
            const isBlueBadge = true; // Your example shows blue badges
            
            // Background
            doc.rect(badgeX, badgeY, badgeSize, badgeSize)
              .fillColor(colors.shiftBadges[shift].bg)
              .fill();
            
            // We'll use a blue badge for all shifts (based on your example)
            if (shift === '1' || shift === '2' || shift === 'X') {
              // Blue badge with white text
              doc.rect(badgeX, badgeY, badgeSize, badgeSize)
                .fillColor('#4169E1') // Royal blue
                .fill();
                
              // Text
              doc.fillColor('#FFFFFF') // White text
                .font('Helvetica-Bold')
                .fontSize(12)
                .text(shift, badgeX, badgeY + 6, { width: badgeSize, align: 'center' });
            } else if (shift === 'M') {
              // Dark gray badge for M
              doc.rect(badgeX, badgeY, badgeSize, badgeSize)
                .fillColor('#666666') // Dark gray
                .fill();
                
              // Text  
              doc.fillColor('#FFFFFF') // White text
                .font('Helvetica-Bold')
                .fontSize(12)
                .text(shift, badgeX, badgeY + 6, { width: badgeSize, align: 'center' });
            }
          }
        });
        
        // Move to next row
        startY += rowHeight;
      });

      // Add shift legend
      doc.moveDown(2);
      
      // Draw the legend with proper formatting
      doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#000000')
        .text('Shift Legend:', startX);
      
      doc.moveDown(0.5);
      
      // Create more professional looking legend boxes
      const shiftCodes = [
        { code: '1', label: 'Morning (09:00 - 18:00)' },
        { code: '2', label: 'Evening (13:00 - 22:00)' },
        { code: 'M', label: 'Middle (11:30 - 20:30)' },
        { code: 'X', label: 'Leave Request' }
      ];
      
      const legendY = doc.y;
      const boxSize = 15;
      const legendSpacing = 25;
      
      shiftCodes.forEach((item, index) => {
        const x = startX + (index * 150);
        
        // Draw appropriate colored box
        if (item.code === 'M') {
          // Dark gray for M
          doc.rect(x, legendY, boxSize, boxSize)
            .fillColor('#666666')
            .fill();
        } else {
          // Blue for others
          doc.rect(x, legendY, boxSize, boxSize)
            .fillColor('#4169E1')
            .fill();
        }
        
        // Add white text in the box
        doc.fillColor('#FFFFFF')
          .font('Helvetica-Bold')
          .fontSize(9)
          .text(item.code, x + 4, legendY + 3);
        
        // Add the label
        doc.fillColor('#000000')
          .font('Helvetica')
          .fontSize(9)
          .text(item.label, x + boxSize + 5, legendY + 3, { width: 140 });
      });

      // Add footer with generation timestamp
      const footerY = doc.page.height - 30;
      doc.fontSize(8)
        .fillColor('#777777')
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