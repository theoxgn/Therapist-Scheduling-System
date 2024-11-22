const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const { validateTherapist } = require('../middlewares/validation');

router.post('/', validateTherapist, therapistController.create);
router.get('/', therapistController.getAll);
router.put('/:id', validateTherapist, therapistController.update);

module.exports = router;