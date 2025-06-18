const express = require('express');
const userController = require('../controllers/userController');
const { sessionAuthMiddleware } = require('../middleware/sessionMiddleware');

const router = express.Router();

router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);
router.post('/auth/logout', sessionAuthMiddleware, userController.logout);

router.get('/me', sessionAuthMiddleware, userController.getCurrentUser);
router.put('/profile', sessionAuthMiddleware, userController.updateProfile);
router.put('/contact', sessionAuthMiddleware, userController.updateContact);
router.put('/password', sessionAuthMiddleware, userController.changePassword);

module.exports = router;