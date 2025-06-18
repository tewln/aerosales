const express = require('express');
const referenceController = require('../controllers/referenceController');
const { sessionAuthMiddleware, sessionRoleMiddleware } = require('../middleware/sessionMiddleware');

const router = express.Router();

router.get('/cities', referenceController.getCities);
router.get('/airlines', referenceController.getAirlines);
router.get('/airports', referenceController.getAirports);
router.get('/airports/city/:cityId', referenceController.getAirportsByCity);
router.get('/price-range', referenceController.getPriceRange);

router.get('/airports/all', sessionAuthMiddleware, sessionRoleMiddleware(['admin']), referenceController.getAllAirports);
router.get('/cities/all', sessionAuthMiddleware, sessionRoleMiddleware(['admin']), referenceController.getAllCities);
router.get('/airlines/all', sessionAuthMiddleware, sessionRoleMiddleware(['admin']), referenceController.getAllAirlines);
router.get('/roles', sessionAuthMiddleware, sessionRoleMiddleware(['admin']), referenceController.getUserRoles);
router.get('/purchase-statuses', sessionAuthMiddleware, sessionRoleMiddleware(['admin']), referenceController.getPurchaseStatuses);

module.exports = router;