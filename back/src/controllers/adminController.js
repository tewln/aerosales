const adminService = require('../services/adminService');
const {
    createTripSchema,
    updateTripSchema,
    createDiscountSchema
} = require('../validation/adminValidation');

class AdminController {
    async getAllTrips(req, res) {
        try {
            const trips = await adminService.getAllTrips();

            res.json({
                success: true,
                message: 'Рейсы получены',
                data: trips
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async createTrip(req, res) {
        try {
            const { error } = createTripSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const tripId = await adminService.createTrip(req.body);

            res.status(201).json({
                success: true,
                message: 'Рейс успешно создан',
                data: { trip_id: tripId }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateTrip(req, res) {
        try {
            const { error } = updateTripSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const tripId = parseInt(req.params.id);
            if (!tripId || tripId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Некорректный ID рейса'
                });
            }

            const updated = await adminService.updateTrip(tripId, req.body);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Рейс не найден'
                });
            }

            res.json({
                success: true,
                message: 'Рейс успешно обновлен'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async cancelTrip(req, res) {
        try {
            const tripId = parseInt(req.params.id);
            if (!tripId || tripId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Некорректный ID рейса'
                });
            }

            const cancelled = await adminService.cancelTrip(tripId);

            if (!cancelled) {
                return res.status(404).json({
                    success: false,
                    message: 'Рейс не найден'
                });
            }

            res.json({
                success: true,
                message: 'Рейс отменен, средства возвращены пользователям'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async createDiscount(req, res) {
        try {
            const { error } = createDiscountSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const discountId = await adminService.createDiscount(req.body);

            res.status(201).json({
                success: true,
                message: 'Скидка успешно создана',
                data: { discount_id: discountId }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getDiscounts(req, res) {
        try {
            const discounts = await adminService.getAllDiscounts();

            res.json({
                success: true,
                message: 'Список скидок получен',
                data: discounts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteDiscount(req, res) {
        try {
            const discountId = parseInt(req.params.id);
            if (!discountId || discountId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Некорректный ID скидки'
                });
            }

            const deleted = await adminService.deleteDiscount(discountId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Скидка не найдена'
                });
            }

            res.json({
                success: true,
                message: 'Скидка удалена'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getStatistics(req, res) {
        try {
            const stats = await adminService.getStatistics();

            res.json({
                success: true,
                message: 'Статистика получена',
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AdminController();