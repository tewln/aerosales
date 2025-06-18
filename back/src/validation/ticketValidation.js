const Joi = require('joi');

const searchTripsSchema = Joi.object({
    departure_city: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.integer': 'ID города отправления должен быть целым числом',
            'number.positive': 'ID города отправления должен быть положительным'
        }),

    arrival_city: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.integer': 'ID города прибытия должен быть целым числом',
            'number.positive': 'ID города прибытия должен быть положительным'
        }),
    departure_date: Joi.date()
        .min('now')
        .optional()
        .messages({
            'date.min': 'Дата отправления не может быть в прошлом'
        }),
    departure_date_from: Joi.date()
        .min('now')
        .optional()
        .messages({
            'date.min': 'Дата начала периода не может быть в прошлом'
        }),

    departure_date_to: Joi.date()
        .min(Joi.ref('departure_date_from'))
        .optional()
        .messages({
            'date.min': 'Дата окончания периода должна быть не раньше даты начала'
        }),

    min_price: Joi.number()
        .positive()
        .optional()
        .messages({
            'number.positive': 'Минимальная цена должна быть положительным числом'
        }),    max_price: Joi.number()
        .positive()
        .optional()
        .messages({
            'number.positive': 'Максимальная цена должна быть положительным числом'
        }),

    airline_id: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.integer': 'ID авиакомпании должен быть целым числом',
            'number.positive': 'ID авиакомпании должен быть положительным'
        })
});

const purchaseTicketSchema = Joi.object({
    trip_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.integer': 'ID рейса должен быть целым числом',
            'number.positive': 'ID рейса должен быть положительным числом',
            'any.required': 'ID рейса обязателен'
        }),

    number_of_seats: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .default(1)
        .messages({
            'number.integer': 'Количество мест должно быть целым числом',
            'number.min': 'Минимальное количество мест: 1',
            'number.max': 'Максимальное количество мест: 10'
        })
});

const tripIdSchema = Joi.object({
    trip_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.integer': 'ID рейса должен быть целым числом',
            'number.positive': 'ID рейса должен быть положительным числом',
            'any.required': 'ID рейса обязателен'
        })
});

const purchaseIdSchema = Joi.object({
    purchase_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.integer': 'ID покупки должен быть целым числом',
            'number.positive': 'ID покупки должен быть положительным числом',
            'any.required': 'ID покупки обязателен'
        })
});

const createReviewSchema = Joi.object({
    trip_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.integer': 'ID рейса должен быть целым числом',
            'number.positive': 'ID рейса должен быть положительным числом',
            'any.required': 'ID рейса обязателен'
        }),

    rating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            'number.integer': 'Рейтинг должен быть целым числом',
            'number.min': 'Минимальный рейтинг: 1',
            'number.max': 'Максимальный рейтинг: 5',
            'any.required': 'Рейтинг обязателен'
        }),

    comment: Joi.string()
        .max(1000)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Комментарий должен содержать максимум 1000 символов'
        })
});

const calculatePriceSchema = Joi.object({
    trip_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.integer': 'ID рейса должен быть целым числом',
            'number.positive': 'ID рейса должен быть положительным числом',
            'any.required': 'ID рейса обязателен'
        }),

    number_of_seats: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .required()
        .messages({
            'number.integer': 'Количество мест должно быть целым числом',
            'number.min': 'Минимальное количество мест: 1',
            'number.max': 'Максимальное количество мест: 10',
            'any.required': 'Количество мест обязательно'
        })
});

module.exports = {
    searchTripsSchema,
    purchaseTicketSchema,
    tripIdSchema,
    purchaseIdSchema,
    createReviewSchema,
    calculatePriceSchema
};