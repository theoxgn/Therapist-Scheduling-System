const { Therapist, Branch } = require('../models');

const therapistController = {
  async create(req, res) {
    try {
      const therapist = await Therapist.create(req.body);
      res.status(201).json(therapist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const therapists = await Therapist.findAll({
        include: [Branch],
        where: req.query.branchCode ? { branchCode: req.query.branchCode } : {}
      });
      res.json(therapists);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      const therapist = await Therapist.findByPk(req.params.id);
      if (!therapist) return res.status(404).json({ message: 'Therapist not found' });
      await therapist.update(req.body);
      res.json(therapist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = therapistController;
