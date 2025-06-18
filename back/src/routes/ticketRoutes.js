const express = require('express');
const ticketController = require('../controllers/ticketController');
const { sessionAuthMiddleware } = require('../middleware/sessionMiddleware');

const router = express.Router();

router.get('/destinations', ticketController.getAvailableDestinations);
router.get('/search', ticketController.searchTrips);
router.get('/trip/:id', ticketController.getTripDetails);

router.get('/reviews/airline/:airlineId', ticketController.getAirlineReviews);

router.use(sessionAuthMiddleware);

router.get('/my-tickets', ticketController.getUserTickets);
router.get('/my-history', ticketController.getUserPurchaseHistory);

router.post('/purchase', ticketController.purchaseTicket);
router.delete('/cancel/:purchaseId', ticketController.cancelTicketByUser);

router.post('/calculate-price', ticketController.calculatePrice);

router.post('/review', ticketController.createReview);

router.get('/favorites', ticketController.getUserFavorites);
router.post('/favorites', ticketController.addToFavorites);
router.delete('/favorites/:tripId', ticketController.removeFromFavorites);

module.exports = router;