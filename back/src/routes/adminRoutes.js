const express = require('express');
const adminController = require('../controllers/adminController');
const { sessionAuthMiddleware, sessionRoleMiddleware } = require('../middleware/sessionMiddleware');

const router = express.Router();

router.use(sessionAuthMiddleware);
router.use(sessionRoleMiddleware(['admin']));

router.get('/trips', adminController.getAllTrips);
router.post('/trips', adminController.createTrip);
router.put('/trips/:id', adminController.updateTrip);
router.delete('/trips/:id', adminController.cancelTrip);

router.get('/discounts', adminController.getDiscounts);
router.post('/discounts', adminController.createDiscount);
router.delete('/discounts/:id', adminController.deleteDiscount);

router.get('/statistics', adminController.getStatistics);

module.exports = router;