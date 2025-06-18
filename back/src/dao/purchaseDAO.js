const pool = require('../config/database');

class PurchaseDAO {   
    async getUserTickets(userId) {
        const query = `
            SELECT 
                p.id as purchase_id,
                p.number_of_seats,
                p.purchase_date,
                p.status,
                t.id as trip_id,
                t.departure_date,
                t.arrival_date,
                t.price,
                dep_city.name as departure_city,
                dep_airport.name as departure_airport,
                arr_city.name as arrival_city,
                arr_airport.name as arrival_airport,
                airline.name as airline_name,
                airline.logo_url as airline_logo
            FROM aerosales.purchase p
            JOIN aerosales.trip t ON p.trip_id = t.id
            JOIN aerosales.airport dep_airport ON t.departure_airport = dep_airport.id
            JOIN aerosales.city dep_city ON dep_airport.city = dep_city.id
            JOIN aerosales.airport arr_airport ON t.arrival_airport = arr_airport.id
            JOIN aerosales.city arr_city ON arr_airport.city = arr_city.id
            JOIN aerosales.airline airline ON t.airline = airline.id
                WHERE p.user_id = $1 
            AND t.departure_date > CURRENT_TIMESTAMP
            AND p.status IN ('paid', 'canceled')
            ORDER BY t.departure_date ASC
        `;
        
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    async getUserPurchaseHistory(userId) {
        const query = `
            SELECT 
                p.id as purchase_id,
                p.number_of_seats,
                p.purchase_date,
                p.status,
                t.id as trip_id,
                t.departure_date,
                t.arrival_date,
                t.price,
                dep_city.name as departure_city,
                dep_airport.name as departure_airport,
                arr_city.name as arrival_city,
                arr_airport.name as arrival_airport,
                airline.name as airline_name
            FROM aerosales.purchase p
            JOIN aerosales.trip t ON p.trip_id = t.id
            JOIN aerosales.airport dep_airport ON t.departure_airport = dep_airport.id
            JOIN aerosales.city dep_city ON dep_airport.city = dep_city.id
            JOIN aerosales.airport arr_airport ON t.arrival_airport = arr_airport.id
            JOIN aerosales.city arr_city ON arr_airport.city = arr_city.id
            JOIN aerosales.airline airline ON t.airline = airline.id
            WHERE p.user_id = $1 
            AND (t.departure_date <= CURRENT_TIMESTAMP OR p.status = 'refunded')
            ORDER BY p.purchase_date DESC
        `;
        
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    async createPurchase(userId, tripId, numberOfSeats) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const tripQuery = 'SELECT available_seats, price FROM aerosales.trip WHERE id = $1';
            const tripResult = await client.query(tripQuery, [tripId]);
            
            if (!tripResult.rows[0]) {
                throw new Error('Рейс не найден');
            }
            
            const { available_seats, price } = tripResult.rows[0];
            const totalPrice = price * numberOfSeats;
            
            if (available_seats < numberOfSeats) {
                throw new Error('Недостаточно свободных мест');
            }
            
            const purchaseQuery = `
                INSERT INTO aerosales.purchase (user_id, trip_id, number_of_seats, status)
                VALUES ($1, $2, $3, 'paid')
                RETURNING id, purchase_date
            `;
            const purchaseResult = await client.query(purchaseQuery, [userId, tripId, numberOfSeats]);
            
            const updateTripQuery = `
                UPDATE aerosales.trip 
                SET available_seats = available_seats - $1 
                WHERE id = $2
            `;
            await client.query(updateTripQuery, [numberOfSeats, tripId]);
            
            await client.query('COMMIT');
            
            return {
                id: purchaseResult.rows[0].id,
                purchase_date: purchaseResult.rows[0].purchase_date,
                total_price: totalPrice,
                price_per_seat: price,
                number_of_seats: numberOfSeats
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async cancelPurchase(userId, purchaseId) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const purchaseQuery = `
                SELECT p.trip_id, p.number_of_seats, p.status, t.departure_date, t.price
                FROM aerosales.purchase p
                JOIN aerosales.trip t ON p.trip_id = t.id
                WHERE p.id = $1 AND p.user_id = $2
            `;
            const purchaseResult = await client.query(purchaseQuery, [purchaseId, userId]);
            
            if (!purchaseResult.rows[0]) {
                throw new Error('Покупка не найдена');
            }
            
            const { trip_id, number_of_seats, status, departure_date, price } = purchaseResult.rows[0];
            
            if (status === 'canceled') {
                throw new Error('Покупка уже отменена');
            }
            
            if (status === 'refunded') {
                throw new Error('Покупка уже возвращена');
            }
            
            if (new Date(departure_date) <= new Date()) {
                throw new Error('Нельзя отменить билет после вылета');
            }
            
            const refundAmount = price * number_of_seats;
            
            const updateBalanceQuery = `
                UPDATE aerosales."user" 
                SET balance = balance + $1 
                WHERE id = $2
            `;
            await client.query(updateBalanceQuery, [refundAmount, userId]);
            
            const cancelQuery = `
                UPDATE aerosales.purchase 
                SET status = 'refunded' 
                WHERE id = $1
            `;
            await client.query(cancelQuery, [purchaseId]);
            
            const updateTripQuery = `
                UPDATE aerosales.trip 
                SET available_seats = available_seats + $1 
                WHERE id = $2
            `;
            await client.query(updateTripQuery, [number_of_seats, trip_id]);
            
            await client.query('COMMIT');
            
            return {
                refund_amount: refundAmount,
                seats_returned: number_of_seats
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }    }

    async cancelPurchaseByUser(userId, purchaseId) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const purchaseQuery = `
                SELECT p.trip_id, p.number_of_seats, p.status, t.departure_date
                FROM aerosales.purchase p
                JOIN aerosales.trip t ON p.trip_id = t.id
                WHERE p.id = $1 AND p.user_id = $2
            `;
            const purchaseResult = await client.query(purchaseQuery, [purchaseId, userId]);
            
            if (!purchaseResult.rows[0]) {
                throw new Error('Покупка не найдена');
            }
            const { trip_id, number_of_seats, status, departure_date } = purchaseResult.rows[0];
            
            if (status === 'refunded') {
                throw new Error('Покупка уже отменена');
            }
            
            if (status === 'canceled') {
                throw new Error('Рейс отменен авиакомпанией');
            }
            
            if (new Date(departure_date) <= new Date()) {
                throw new Error('Нельзя отменить билет после вылета');
            }
            
            const refundQuery = `
                UPDATE aerosales.purchase 
                SET status = 'refunded' 
                WHERE id = $1
            `;
            await client.query(refundQuery, [purchaseId]);
            
            const updateTripQuery = `
                UPDATE aerosales.trip 
                SET available_seats = available_seats + $1 
                WHERE id = $2
            `;
            await client.query(updateTripQuery, [number_of_seats, trip_id]);
            
            await client.query('COMMIT');
            
            return {
                canceled_seats: number_of_seats,
                trip_id: trip_id
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async createReview(userId, tripId, rating, comment) {
        const purchaseCheck = `
            SELECT 1 FROM aerosales.purchase 
            WHERE user_id = $1 AND trip_id = $2 AND status IN ('paid', 'used')
        `;
        const purchaseResult = await pool.query(purchaseCheck, [userId, tripId]);
        
        if (purchaseResult.rows.length === 0) {
            throw new Error('Можно оставлять отзывы только на купленные рейсы');
        }
        
        const existingReview = `
            SELECT 1 FROM aerosales.review 
            WHERE user_id = $1 AND trip_id = $2
        `;
        const existingResult = await pool.query(existingReview, [userId, tripId]);
        
        if (existingResult.rows.length > 0) {
            throw new Error('Отзыв уже оставлен для этого рейса');
        }
        
        const query = `
            INSERT INTO aerosales.review (user_id, trip_id, rating, comment)
            VALUES ($1, $2, $3, $4)
            RETURNING id, created_at
        `;
        
        const result = await pool.query(query, [userId, tripId, rating, comment]);
        return result.rows[0];
    }

    async calculatePrice(tripId, numberOfSeats) {
        const query = `
            SELECT 
                t.price,
                t.available_seats,
                d.percentage as discount_percentage
            FROM aerosales.trip t
            LEFT JOIN aerosales.discount d ON t.id = d.trip_id 
                AND d.expires_at > CURRENT_TIMESTAMP
            WHERE t.id = $1
        `;
        
        const result = await pool.query(query, [tripId]);
        
        if (!result.rows[0]) {
            throw new Error('Рейс не найден');
        }
        
        const { price, available_seats, discount_percentage } = result.rows[0];
        
        if (available_seats < numberOfSeats) {
            throw new Error('Недостаточно свободных мест');
        }
        
        const pricePerSeat = parseFloat(price);
        const totalPrice = pricePerSeat * numberOfSeats;
        const discount = discount_percentage ? (totalPrice * discount_percentage / 100) : 0;
        const finalPrice = totalPrice - discount;
        
        return {
            price_per_seat: pricePerSeat,
            total_price: totalPrice,
            discount_amount: discount,
            discount_percentage: discount_percentage || 0,
            final_price: finalPrice,
            available_seats: available_seats
        };
    }
}

module.exports = new PurchaseDAO();