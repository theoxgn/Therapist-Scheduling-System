const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const { validateBranch } = require('../middlewares/validation');

router.post('/', validateBranch, branchController.create);
router.get('/', branchController.getAll);
router.get('/:branchCode', branchController.getOne);
router.put('/:branchCode', validateBranch, branchController.update);

module.exports = router;
