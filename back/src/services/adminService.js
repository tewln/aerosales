const adminDAO = require('../dao/adminDAO');

class AdminService {
    async getAllTrips() {
        return await adminDAO.getAllTrips();
    }
    async createTrip(tripData) {
        if (new Date(tripData.departure_date) <= new Date()) {
            throw new Error('Дата отправления должна быть в будущем');
        }

        if (new Date(tripData.arrival_date) <= new Date(tripData.departure_date)) {
            throw new Error('Дата прибытия должна быть больше даты отправления');
        }

        return await adminDAO.createTrip(tripData);
    }
    async updateTrip(tripId, tripData) {
        if (tripData.departure_date && new Date(tripData.departure_date) <= new Date()) {
            throw new Error('Дата отправления должна быть в будущем');
        }

        if (tripData.departure_date && tripData.arrival_date) {
            if (new Date(tripData.arrival_date) <= new Date(tripData.departure_date)) {
                throw new Error('Дата прибытия должна быть больше даты отправления');
            }
        }

        return await adminDAO.updateTrip(tripId, tripData);
    }

    async cancelTrip(tripId) {
        return await adminDAO.cancelTrip(tripId);
    }

    async createDiscount(discountData) {
        if (new Date(discountData.expires_at) <= new Date()) {
            throw new Error('Дата истечения скидки должна быть в будущем');
        }

        return await adminDAO.createDiscount(discountData);
    }

    async getAllDiscounts() {
        return await adminDAO.getAllDiscounts();
    }

    async deleteDiscount(discountId) {
        return await adminDAO.deleteDiscount(discountId);
    }

    async getStatistics() {
        const [basicStats, salesStats, popularDestinations] = await Promise.all([
            adminDAO.getStatistics(),
            adminDAO.getSalesStats(),
            adminDAO.getPopularDestinations()
        ]);

        const airlinesStats = await this.getAirlinesStatistics();

        const monthlyStats = await this.getMonthlyStatistics();

        const favoritesCount = await this.getFavoritesCount();

        return {
            total_users: basicStats.totalUsers,
            total_trips: basicStats.totalTrips,
            total_purchases: salesStats.total_purchases || 0,
            total_revenue: salesStats.total_revenue || 0,
            average_ticket_price: salesStats.total_purchases > 0 
                ? (salesStats.total_revenue / salesStats.total_purchases).toFixed(2)
                : 0,
            total_favorites: favoritesCount,
            airlines_stats: airlinesStats,
            popular_routes: popularDestinations.map(dest => ({
                departure_city: dest.departure_city,
                arrival_city: dest.arrival_city,
                tickets_sold: dest.total_seats,
                revenue: (dest.bookings_count * 10000).toFixed(2),
                average_price: (10000).toFixed(2)
            })),
            monthly_stats: monthlyStats
        };
    }

    async getAirlinesStatistics() {
        const result = await adminDAO.getAirlinesStatistics();
        return result.rows;
    }

    async getMonthlyStatistics() {
        const result = await adminDAO.getMonthlyStatistics();
        return result;
    }

    async getFavoritesCount() {
        const result = await adminDAO.getFavoritesCount();
        return result;
    }
}

module.exports = new AdminService();