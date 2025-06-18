const Joi = require('joi');

const registerSchema = Joi.object({
    surname: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Фамилия должна содержать минимум 2 символа',
            'string.max': 'Фамилия должна содержать максимум 50 символов',
            'any.required': 'Фамилия обязательна'
        }),
    
    firstname: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Имя должно содержать минимум 2 символа',
            'string.max': 'Имя должно содержать максимум 50 символов',
            'any.required': 'Имя обязательно'
        }),
    
    lastname: Joi.string()
        .min(2)
        .max(50)
        .allow('')
        .optional()
        .messages({
            'string.min': 'Отчество должно содержать минимум 2 символа',
            'string.max': 'Отчество должно содержать максимум 50 символов'
        }),
    
    birth_date: Joi.date()
        .max('now')
        .required()
        .messages({
            'date.max': 'Дата рождения не может быть в будущем',
            'any.required': 'Дата рождения обязательна'
        }),
    
    login: Joi.string()
        .min(3)
        .max(64)
        .alphanum()
        .required()
        .messages({
            'string.min': 'Логин должен содержать минимум 3 символа',
            'string.max': 'Логин должен содержать максимум 64 символа',
            'string.alphanum': 'Логин может содержать только буквы и цифры',
            'any.required': 'Логин обязателен'
        }),
    
    password: Joi.string()
        .min(6)
        .max(128)
        .required()
        .messages({
            'string.min': 'Пароль должен содержать минимум 6 символов',
            'string.max': 'Пароль должен содержать максимум 32 символа',
            'any.required': 'Пароль обязателен'
        }),
    
    email: Joi.string()
        .email()
        .max(128)
        .required()
        .messages({
            'string.email': 'Некорректный формат email',
            'string.max': 'Email должен содержать максимум 128 символов',
            'any.required': 'Email обязателен'
        }),
    
    phone: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .max(32)
        .optional()
        .messages({
            'string.pattern.base': 'Некорректный формат телефона',
            'string.max': 'Телефон должен содержать максимум 32 символа'
        })
});

const loginSchema = Joi.object({
    login: Joi.string()
        .required()
        .messages({
            'any.required': 'Логин обязателен'
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Пароль обязателен'
        })
});

const updateProfileSchema = Joi.object({
    surname: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
            'string.min': 'Фамилия должна содержать минимум 2 символа',
            'string.max': 'Фамилия должна содержать максимум 50 символов'
        }),
    
    firstname: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
            'string.min': 'Имя должно содержать минимум 2 символа',
            'string.max': 'Имя должно содержать максимум 50 символов'
        }),
    
    lastname: Joi.string()
        .min(2)
        .max(50)
        .allow('')
        .optional()
        .messages({
            'string.min': 'Отчество должно содержать минимум 2 символа',
            'string.max': 'Отчество должно содержать максимум 50 символов'
        }),
    
    birth_date: Joi.date()
        .max('now')
        .optional()
        .messages({
            'date.max': 'Дата рождения не может быть в будущем'
        })
});

const updateContactSchema = Joi.object({
    email: Joi.string()
        .email()
        .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        .max(128)
        .optional()
        .messages({
            'string.email': 'Некорректный формат email',
            'string.pattern.base': 'Email должен содержать только допустимые символы',
            'string.max': 'Email должен содержать максимум 128 символов'
        }),
    
    phone: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .max(32)
        .allow('')
        .optional()
        .messages({
            'string.pattern.base': 'Некорректный формат телефона',
            'string.max': 'Телефон должен содержать максимум 32 символа'
        })
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'any.required': 'Текущий пароль обязателен'
        }),
    
    newPassword: Joi.string()
        .min(6)
        .max(128)
        .required()
        .messages({
            'string.min': 'Новый пароль должен содержать минимум 6 символов',
            'string.max': 'Новый пароль должен содержать максимум 128 символов',
            'any.required': 'Новый пароль обязателен'
        }),
    
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Пароли не совпадают',
            'any.required': 'Подтверждение пароля обязательно'
        })
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    updateContactSchema,
    changePasswordSchema
};