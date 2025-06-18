const tripDAO = require('../dao/tripDAO');
const purchaseDAO = require('../dao/purchaseDAO');
const favoriteDAO = require('../dao/favoriteDAO');

class TicketService {
    async getAvailableDestinations() {
        return await tripDAO.getAvailableDestinations();
    }

    async searchTrips(filters) {
        return await tripDAO.searchTrips(filters);
    }

    async getTripDetails(tripId) {
        const trip = await tripDAO.getTripById(tripId);
        if (!trip) {
            throw new Error('Рейс не найден');
        }

        const airlineReviews = await tripDAO.getAirlineReviews(trip.airline_id, 10, 0);
        const airlineStats = await tripDAO.getAirlineReviewStats(trip.airline_id);
        
        return {
            ...trip,
            airline_reviews: airlineReviews,
            airline_rating: airlineStats
        };
    }

    async getAirlineReviews(airlineId, limit = 20, offset = 0) {
        const reviews = await tripDAO.getAirlineReviews(airlineId, limit, offset);
        const stats = await tripDAO.getAirlineReviewStats(airlineId);
        
        return {
            reviews,
            stats,
            pagination: {
                limit,
                offset,
                total: parseInt(stats.total_reviews)
            }
        };
    }

    async getUserTickets(userId) {
        return await purchaseDAO.getUserTickets(userId);
    }

    async getUserPurchaseHistory(userId) {
        return await purchaseDAO.getUserPurchaseHistory(userId);
    }

    async purchaseTicket(userId, tripId, numberOfSeats = 1) {
        const trip = await tripDAO.getTripById(tripId);
        if (!trip) {
            throw new Error('Рейс не найден');
        }

        if (new Date(trip.departure_date) <= new Date()) {
            throw new Error('Нельзя купить билет на прошедший рейс');
        }

        if (!await tripDAO.checkAvailability(tripId, numberOfSeats)) {
            throw new Error('Недостаточно свободных мест');
        }

        return await purchaseDAO.createPurchase(userId, tripId, numberOfSeats);
    }

    async cancelTicket(userId, purchaseId) {
        return await purchaseDAO.cancelPurchase(userId, purchaseId);
    }

    async getUserFavorites(userId) {
        return await favoriteDAO.getUserFavorites(userId);
    }

    async addToFavorites(userId, tripId) {
        const trip = await tripDAO.getTripById(tripId);
        if (!trip) {
            throw new Error('Рейс не найден');
        }

        const result = await favoriteDAO.addToFavorites(userId, tripId);
        return result !== null;
    }

    async removeFromFavorites(userId, tripId) {
        return await favoriteDAO.removeFromFavorites(userId, tripId);
    }

    async cancelTicketByUser(userId, purchaseId) {
        return await purchaseDAO.cancelPurchaseByUser(userId, purchaseId);
    }

    async createReview(userId, tripId, rating, comment) {
        const trip = await tripDAO.getTripById(tripId);
        if (!trip) {
            throw new Error('Рейс не найден');
        }

        return await purchaseDAO.createReview(userId, tripId, rating, comment);
    }

    async calculatePrice(tripId, numberOfSeats) {
        return await purchaseDAO.calculatePrice(tripId, numberOfSeats);
    }

    async checkFavoriteStatus(userId, tripId) {
        return await favoriteDAO.isFavorite(userId, tripId);
    }
}

module.exports = new TicketService();