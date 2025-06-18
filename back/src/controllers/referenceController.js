const referenceService = require('../services/referenceService');

class ReferenceController {
    async getCities(req, res) {
        try {
            const cities = await referenceService.getCities();

            res.json({
                success: true,
                message: 'Список городов с маршрутами получен',
                data: cities
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAirlines(req, res) {
        try {
            const airlines = await referenceService.getAirlines();

            res.json({
                success: true,
                message: 'Список авиакомпаний с рейсами получен',
                data: airlines
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAirports(req, res) {
        try {
            const airports = await referenceService.getAirports();

            res.json({
                success: true,
                message: 'Список аэропортов с рейсами получен',
                data: airports
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAirportsByCity(req, res) {
        try {
            const cityId = parseInt(req.params.cityId);
            if (!cityId || cityId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Некорректный ID города'
                });
            }

            const airports = await referenceService.getAirportsByCity(cityId);

            res.json({
                success: true,
                message: 'Аэропорты города с рейсами получены',
                data: airports
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getPriceRange(req, res) {
        try {
            const priceRange = await referenceService.getPriceRange();

            res.json({
                success: true,
                message: 'Диапазон цен получен',
                data: priceRange
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getPurchaseStatuses(req, res) {
        try {
            const statuses = await referenceService.getPurchaseStatuses();

            res.json({
                success: true,
                message: 'Статусы покупок получены',
                data: statuses
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllAirports(req, res) {
        try {
            const airports = await referenceService.getAllAirports();

            res.json({
                success: true,
                message: 'Все аэропорты получены',
                data: airports
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getUserRoles(req, res) {
        try {
            const roles = await referenceService.getUserRoles();

            res.json({
                success: true,
                message: 'Роли пользователей получены',
                data: roles
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllCities(req, res) {
        try {
            const cities = await referenceService.getAllCities();

            res.json({
                success: true,
                message: 'Все города получены',
                data: cities
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllAirlines(req, res) {
        try {
            const airlines = await referenceService.getAllAirlines();

            res.json({
                success: true,
                message: 'Все авиакомпании получены',
                data: airlines
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ReferenceController();