const authService = require('../services/userService');
const { registerSchema, loginSchema, updateProfileSchema, updateContactSchema, changePasswordSchema } = require('../validation/userValidation');

class UserController {
    async register(req, res) {
        try {
            const { error, value } = registerSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Ошибка валидации',
                    errors: error.details.map(detail => ({
                        field: detail.path[0],
                        message: detail.message
                    }))
                });
            }
            value.role = 'user';
            const result = await authService.register(value, req.session);

            res.status(201).json({
                success: true,
                message: 'Пользователь успешно зарегистрирован',
                data: result
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { error, value } = loginSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Ошибка валидации',
                    errors: error.details.map(detail => ({
                        field: detail.path[0],
                        message: detail.message
                    }))
                });
            }

            const result = await authService.login(value.login, value.password, req.session);

            res.json({
                success: true,
                message: 'Успешная авторизация',
                data: result
            });

        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    async getCurrentUser(req, res) {
        try {
            const user = await authService.getCurrentUser(req.session.user.id);
            
            res.json({
                success: true,
                data: { user }
            });

        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }    }

    async logout(req, res) {
        try {
            await authService.logout(req.session);
            
            res.json({
                success: true,
                message: 'Выход выполнен успешно'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateProfile(req, res) {
        try {
            const { error } = updateProfileSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.id;
            const result = await authService.updateProfile(userId, req.body);

            res.json({
                success: true,
                message: 'Профиль успешно обновлен',
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateContact(req, res) {
        try {
            const { error } = updateContactSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.id;
            const result = await authService.updateContact(userId, req.body);

            res.json({
                success: true,
                message: 'Контактные данные успешно обновлены',
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async changePassword(req, res) {
        try {
            const { error } = changePasswordSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.id;
            await authService.changePassword(userId, req.body.currentPassword, req.body.newPassword);

            res.json({
                success: true,
                message: 'Пароль успешно изменен'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new UserController();