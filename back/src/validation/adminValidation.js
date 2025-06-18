const Joi = require('joi');

const createTripSchema = Joi.object({
    departure_airport: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.integer': 'ID аэропорта отправления должен быть целым числом',
            'number.positive': 'ID аэропорта отправления должен быть положительным',
            'any.required': 'Аэропорт отправления обязателен'
        }),

    arrival_airport: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.integer': 'ID аэропорта прибытия должен быть целым числом',
            'number.positive': 'ID аэропорта прибытия должен быть положительным',
            'any.required': 'Аэропорт прибытия обязателен'
        }),

    departure_date: Joi.date()
        .min('now')
        .required()
        .messages({
            'date.min': 'Дата отправления должна быть в будущем',
            'any.required': 'Дата отправления обязательна'
        }),

    arrival_date: Joi.date()
        .greater(Joi.ref('departure_date'))
        .required()
        .messages({
            'date.greater': 'Дата прибытия должна быть больше даты отправления',
            'any.required': 'Дата прибытия обязательна'
        }),

    price: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
            'number.positive': 'Цена должна быть положительным числом',
            'any.required': 'Цена обязательна'
        }),

    available_seats: Joi.number()
        .integer()
        .min(1)
        .max(500)
        .required()
        .messages({
            'number.integer': 'Количество мест должно быть целым числом',
            'number.min': 'Минимальное количество мест: 1',
            'number.max': 'Максимальное количество мест: 500',
            'any.required': 'Количество мест обязательно'
        }),

    airline: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.integer': 'ID авиакомпании должен быть целым числом',
            'number.positive': 'ID авиакомпании должен быть положительным',
            'any.required': 'Авиакомпания обязательна'
        })
});

const updateTripSchema = Joi.object({
    departure_airport: Joi.number()
        .integer()
        .positive()
        .optional(),

    arrival_airport: Joi.number()
        .integer()
        .positive()
        .optional(),

    departure_date: Joi.date()
        .min('now')
        .optional(),

    arrival_date: Joi.date()
        .optional(),

    price: Joi.number()
        .positive()
        .precision(2)
        .optional(),

    available_seats: Joi.number()
        .integer()
        .min(0)
        .max(500)
        .optional(),

    airline: Joi.number()
        .integer()
        .positive()
        .optional()
});

const createDiscountSchema = Joi.object({
    trip_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.integer': 'ID рейса должен быть целым числом',
            'number.positive': 'ID рейса должен быть положительным',
            'any.required': 'ID рейса обязателен'
        }),

    percentage: Joi.number()
        .integer()
        .min(1)
        .max(90)
        .required()
        .messages({
            'number.integer': 'Процент скидки должен быть целым числом',
            'number.min': 'Минимальная скидка: 1%',
            'number.max': 'Максимальная скидка: 90%',
            'any.required': 'Процент скидки обязателен'
        }),

    expires_at: Joi.date()
        .min('now')
        .required()
        .messages({
            'date.min': 'Дата истечения скидки должна быть в будущем',
            'any.required': 'Дата истечения скидки обязательна'
        })
});

const createCitySchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Название города должно содержать минимум 2 символа',
            'string.max': 'Название города должно содержать максимум 100 символов',
            'any.required': 'Название города обязательно'
        }),

    timezone: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.min': 'Часовой пояс должен содержать минимум 3 символа',
            'string.max': 'Часовой пояс должен содержать максимум 50 символов',
            'any.required': 'Часовой пояс обязателен'
        })
});

const createAirlineSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Название авиакомпании должно содержать минимум 2 символа',
            'string.max': 'Название авиакомпании должно содержать максимум 100 символов',
            'any.required': 'Название авиакомпании обязательно'
        }),

    logo_url: Joi.string()
        .uri()
        .max(2048)
        .optional()
        .allow('')
        .messages({
            'string.uri': 'Некорректный URL логотипа',
            'string.max': 'URL логотипа должен содержать максимум 2048 символов'
        })
});

const createAirportSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Название аэропорта должно содержать минимум 2 символа',
            'string.max': 'Название аэропорта должно содержать максимум 100 символов',
            'any.required': 'Название аэропорта обязательно'
        }),

    city: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.integer': 'ID города должен быть целым числом',
            'number.positive': 'ID города должен быть положительным',
            'any.required': 'Город обязателен'
        })
});

const updateUserRoleSchema = Joi.object({
    role: Joi.string()
        .valid('admin', 'user')
        .required()
        .messages({
            'any.only': 'Роль должна быть admin или user',
            'any.required': 'Роль обязательна'
        })
});

module.exports = {
    createTripSchema,
    updateTripSchema,
    createDiscountSchema,
    createCitySchema,
    createAirlineSchema,
    createAirportSchema,
    updateUserRoleSchema
};