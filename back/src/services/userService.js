const argon2 = require('argon2');
const userDao = require('../dao/userDAO');

class UserService {
    async login(login, password, session) {
        const user = await userDao.findByLogin(login);
        if (!user) {
            throw new Error('Неверный логин или пароль');
        }
        
        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid) {
            throw new Error('Неверный логин или пароль');
        }

        session.user = {
            id: user.id,
            role: user.role
        };

        return {
            sessionId: session.id
        };
    }

    async register(userData, session) {
        if (await userDao.loginExists(userData.login)) {
            throw new Error('Пользователь с таким логином уже существует');
        }
        if (userData.email && await userDao.emailExists(userData.email)) {
            throw new Error('Пользователь с таким email уже существует');
        }
        
        const hashedPassword = await argon2.hash(userData.password);
        
        const userId = await userDao.create({
            ...userData,
            password: hashedPassword
        });

        const user = await userDao.findById(userId);

        session.user = {
            id: user.id,
            role: user.role
        };


        return {
            sessionId: session.id
        };
    }

    async getCurrentUser(userId) {
        const user = await userDao.findById(userId);
        const { id: _, ...userModified } = user;

        if (!user) {
            throw new Error('Пользователь не найден');
        }
        return userModified;
    }

    logout(session) {
        return new Promise((resolve, reject) => {
            session.destroy((err) => {
                if (err) {
                    reject(new Error('Ошибка при выходе из системы'));
                } else {
                    resolve();
                }
            });
        });
    }

    async updateProfile(userId, profileData) {
        return await userDao.updateProfile(userId, profileData);
    }

    async updateContact(userId, contactData) {
        if (contactData.email) {
            const existingUser = await userDao.findByEmail(contactData.email);
            if (existingUser && existingUser.id !== userId) {
                throw new Error('Пользователь с таким email уже существует');
            }
        }

        return await userDao.updateContact(userId, contactData);
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await userDao.findByIdWithPassword(userId);
        if (!user) {
            throw new Error('Пользователь не найден');
        }

        const isCurrentPasswordValid = await argon2.verify(user.password, currentPassword);
        if (!isCurrentPasswordValid) {
            throw new Error('Неверный текущий пароль');
        }

        const hashedNewPassword = await argon2.hash(newPassword);

        await userDao.updatePassword(userId, hashedNewPassword);
    }
}

module.exports = new UserService();