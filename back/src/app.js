require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');
const referenceRoutes = require('./routes/referenceRoutes');
const airlineRoutes = require('./routes/airlineRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use('/api/user', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reference', referenceRoutes);
app.use('/api/airlines', airlineRoutes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Aerosales API запущен'
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
    });
});
app.use((error, req, res, next) => {
    console.error('Ошибка сервера:', error);
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Внутренняя ошибка сервера'
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Доступен по адресу: http://localhost:${PORT}`);
});

module.exports = app;