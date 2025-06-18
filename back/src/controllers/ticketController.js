const ticketService = require('../services/ticketService');
const {
    searchTripsSchema,
    purchaseTicketSchema,
    tripIdSchema,
    purchaseIdSchema,
    createReviewSchema,
    calculatePriceSchema
} = require('../validation/ticketValidation');

class TicketController {
    async getAvailableDestinations(req, res) {
        try {
            const destinations = await ticketService.getAvailableDestinations();

            res.json({
                success: true,
                message: 'Доступные направления получены',
                data: destinations
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async searchTrips(req, res) {
        try {
            const { error } = searchTripsSchema.validate(req.query);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const trips = await ticketService.searchTrips(req.query);

            res.json({
                success: true,
                message: 'Поиск рейсов выполнен',
                data: trips,
                count: trips.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getTripDetails(req, res) {
        try {
            const tripId = parseInt(req.params.id);
            
            if (!tripId || tripId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Некорректный ID рейса'
                });
            }

            const trip = await ticketService.getTripDetails(tripId);

            res.json({
                success: true,
                message: 'Детали рейса получены',
                data: trip
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getUserTickets(req, res) {
        try {
            const userId = req.user.id;
            const tickets = await ticketService.getUserTickets(userId);

            res.json({
                success: true,
                message: 'Билеты пользователя получены',
                data: tickets
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getUserPurchaseHistory(req, res) {
        try {
            const userId = req.user.id;
            const history = await ticketService.getUserPurchaseHistory(userId);

            res.json({
                success: true,
                message: 'История покупок получена',
                data: history
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async purchaseTicket(req, res) {
        try {
            const { error } = purchaseTicketSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.id;
            const { trip_id, number_of_seats } = req.body;

            const purchase = await ticketService.purchaseTicket(userId, trip_id, number_of_seats);

            res.status(201).json({
                success: true,
                message: 'Билет успешно приобретен',
                data: purchase
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async cancelTicket(req, res) {
        try {
            const purchaseId = parseInt(req.params.purchaseId);
            
            if (!purchaseId || purchaseId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Некорректный ID покупки'
                });
            }

            const userId = req.user.id;
            await ticketService.cancelTicket(userId, purchaseId);

            res.json({
                success: true,
                message: 'Билет успешно отменен'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getUserFavorites(req, res) {
        try {
            const userId = req.user.id;
            const favorites = await ticketService.getUserFavorites(userId);

            res.json({
                success: true,
                message: 'Избранные рейсы получены',
                data: favorites
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async addToFavorites(req, res) {
        try {
            const { error } = tripIdSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.id;
            const { trip_id } = req.body;

            const added = await ticketService.addToFavorites(userId, trip_id);

            res.json({
                success: true,
                message: added ? 'Рейс добавлен в избранное' : 'Рейс уже в избранном'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async cancelTicketByUser(req, res) {
        try {
            const purchaseId = parseInt(req.params.purchaseId);
            
            if (!purchaseId || purchaseId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Некорректный ID покупки'
                });
            }

            const userId = req.user.id;
            const result = await ticketService.cancelTicketByUser(userId, purchaseId);

            res.json({
                success: true,
                message: 'Билет успешно отменен',
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async createReview(req, res) {
        try {
            const { error } = createReviewSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.id;
            const { trip_id, rating, comment } = req.body;

            const review = await ticketService.createReview(userId, trip_id, rating, comment);

            res.status(201).json({
                success: true,
                message: 'Отзыв успешно создан',
                data: review
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async calculatePrice(req, res) {
        try {
            const { error } = calculatePriceSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const { trip_id, number_of_seats } = req.body;
            const calculation = await ticketService.calculatePrice(trip_id, number_of_seats);

            res.json({
                success: true,
                message: 'Стоимость рассчитана',
                data: calculation
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAirlineReviews(req, res) {
        try {
            const airlineId = parseInt(req.params.airlineId);
            const limit = parseInt(req.query.limit) || 20;
            const offset = parseInt(req.query.offset) || 0;

            if (!airlineId || airlineId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Некорректный ID авиакомпании'
                });
            }

            const result = await ticketService.getAirlineReviews(airlineId, limit, offset);

            res.json({
                success: true,
                message: 'Отзывы об авиакомпании получены',
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async removeFromFavorites(req, res) {
        try {
            const tripId = parseInt(req.params.tripId);
            
            if (!tripId || tripId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Некорректный ID рейса'
                });
            }

            const userId = req.user.id;
            const removed = await ticketService.removeFromFavorites(userId, tripId);

            res.json({
                success: true,
                message: removed ? 'Рейс удален из избранного' : 'Рейс не найден в избранном'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new TicketController();