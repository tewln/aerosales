const airlineDAO = require('../dao/airlineDAO');

class AirlineService {
    async getAirlineDetails(airlineId) {
        if (!airlineId || airlineId <= 0) {
            throw new Error('Некорректный ID авиакомпании');
        }

        const airlineData = await airlineDAO.getAirlineWithReviews(airlineId);
        const ratingStats = await airlineDAO.getAirlineRatingStats(airlineId);

        return {
            ...airlineData,
            rating_stats: ratingStats
        };
    }
}

module.exports = new AirlineService();