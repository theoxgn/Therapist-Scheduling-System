const validateBranch = (req, res, next) => {
    const { branchCode, name } = req.body;
    if (!branchCode || !name) {
      return res.status(400).json({ message: 'Branch code and name are required' });
    }
    next();
  };
  
  const validateTherapist = (req, res, next) => {
    const { name, gender, branchCode } = req.body;
    if (!name || !gender || !branchCode) {
      return res.status(400).json({ 
        message: 'Name, gender, and branch code are required' 
      });
    }
    if (!['male', 'female'].includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender value' });
    }
    next();
  };
  
  const validateScheduleRequest = (req, res, next) => {
    const { therapistId, date, shift } = req.body;
    if (!therapistId || !date) {
      return res.status(400).json({ 
        message: 'Therapist ID and date are required' 
      });
    }
    if (shift && !['1', 'M', '2', 'X'].includes(shift)) {
      return res.status(400).json({ message: 'Invalid shift value' });
    }
    next();
  };
  
  module.exports = {
    validateBranch,
    validateTherapist,
    validateScheduleRequest
  };