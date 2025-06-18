const referenceDAO = require('../dao/referenceDAO');

class ReferenceService {
    async getCities() {
        return await referenceDAO.getAllCities();
    }

    async getAirlines() {
        return await referenceDAO.getAllAirlines();
    }

    async getAirports() {
        return await referenceDAO.getAllAirports();
    }

    async getAllAirports() {
        return await referenceDAO.getAllAirportsForAdmin();
    }

    async getAllCities() {
        return await referenceDAO.getAllCitiesForAdmin();
    }

    async getAllAirlines() {
        return await referenceDAO.getAllAirlinesForAdmin();
    }

    async getAirportsByCity(cityId) {
        if (!cityId || cityId <= 0) {
            throw new Error('Некорректный ID города');
        }
        
        return await referenceDAO.getAirportsByCity(cityId);
    }

    async getPriceRange() {
        const range = await referenceDAO.getPriceRange();
        
        if (!range.total_trips || range.total_trips === 0) {
            return {
                min_price: 0,
                max_price: 0,
                average_price: 0,
                total_trips: 0,
                message: 'Нет доступных рейсов'
            };
        }

        return range;
    }

    async getPurchaseStatuses() {
        return await referenceDAO.getPurchaseStatuses();
    }

    async getUserRoles() {
        return await referenceDAO.getUserRoles();
    }
}

module.exports = new ReferenceService();