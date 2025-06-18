const airlineService = require('../services/airlineService');

class AirlineController {
    async getAirlineDetails(req, res) {
        try {
            const airlineId = parseInt(req.params.id);
            
            if (!airlineId || airlineId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Некорректный ID авиакомпании'
                });
            }

            const airlineData = await airlineService.getAirlineDetails(airlineId);

            res.json({
                success: true,
                message: 'Информация об авиакомпании получена',
                data: airlineData
            });
        } catch (error) {
            const statusCode = error.message === 'Авиакомпания не найдена' ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AirlineController();