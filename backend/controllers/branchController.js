const { Branch } = require('../models');

const branchController = {
  async create(req, res) {
    try {
      const branch = await Branch.create(req.body);
      res.status(201).json(branch);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const branches = await Branch.findAll();
      res.json(branches);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getOne(req, res) {
    try {
      const branch = await Branch.findByPk(req.params.branchCode);
      if (!branch) return res.status(404).json({ message: 'Branch not found' });
      res.json(branch);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      const branch = await Branch.findByPk(req.params.branchCode);
      if (!branch) return res.status(404).json({ message: 'Branch not found' });
      await branch.update(req.body);
      res.json(branch);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  
  async delete(req, res) {
    try {
      const branchCode = req.params.branchCode
      const branch = await Branch.destroy({
        where: {
          branchCode: branchCode
        }
      });
      res.status(201).json(branch);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

module.exports = branchController;