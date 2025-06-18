const express = require('express');
const airlineController = require('../controllers/airlineController');

const router = express.Router();

router.get('/:id', airlineController.getAirlineDetails);

module.exports = router;