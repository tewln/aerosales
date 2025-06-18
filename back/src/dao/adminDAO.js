const pool = require('../config/database');

class AdminDAO {
    async getAllTrips() {
        const query = `
            SELECT 
                t.id,
                t.departure_date,
                t.arrival_date,
                t.price,
                t.available_seats,
                dep_city.name as departure_city,
                dep_airport.name as departure_airport,
                arr_city.name as arrival_city,
                arr_airport.name as arrival_airport,
                airline.name as airline_name
            FROM aerosales.trip t
            JOIN aerosales.airport dep_airport ON t.departure_airport = dep_airport.id
            JOIN aerosales.city dep_city ON dep_airport.city = dep_city.id
            JOIN aerosales.airport arr_airport ON t.arrival_airport = arr_airport.id
            JOIN aerosales.city arr_city ON arr_airport.city = arr_city.id
            JOIN aerosales.airline airline ON t.airline = airline.id
            ORDER BY t.departure_date DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async createTrip(tripData) {
        const query = `
            INSERT INTO aerosales.trip (
                departure_airport, arrival_airport, departure_date, 
                arrival_date, price, available_seats, airline
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;
        
        const values = [
            tripData.departure_airport,
            tripData.arrival_airport,
            tripData.departure_date,
            tripData.arrival_date,
            tripData.price,
            tripData.available_seats,
            tripData.airline
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0].id;
    }

    async updateTrip(tripId, tripData) {
        const updates = [];
        const values = [];
        let paramCount = 1;

        Object.keys(tripData).forEach(key => {
            if (tripData[key] !== undefined) {
                updates.push(`${key} = $${paramCount}`);
                values.push(tripData[key]);
                paramCount++;
            }
        });

        if (updates.length === 0) {
            throw new Error('Нет данных для обновления');
        }

        values.push(tripId);

        const query = `
            UPDATE aerosales.trip 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id
        `;

        const result = await pool.query(query, values);
        return result.rows.length > 0;
    }

    async deleteTrip(tripId) {
        const purchaseCheck = `
            SELECT COUNT(*) as count 
            FROM aerosales.purchase 
            WHERE trip_id = $1 AND status = 'paid'
        `;
        const purchaseResult = await pool.query(purchaseCheck, [tripId]);
        
        if (parseInt(purchaseResult.rows[0].count) > 0) {
            throw new Error('Нельзя удалить рейс с активными билетами');
        }

        const query = 'DELETE FROM aerosales.trip WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [tripId]);
        return result.rows.length > 0;
    }

    async getAllDiscounts() {
        const query = `
            SELECT 
                d.id,
                d.percentage,
                d.expires_at,
                t.id as trip_id,
                dep_city.name as departure_city,
                arr_city.name as arrival_city,
                t.departure_date,
                t.price
            FROM aerosales.discount d
            JOIN aerosales.trip t ON d.trip_id = t.id
            JOIN aerosales.airport dep_airport ON t.departure_airport = dep_airport.id
            JOIN aerosales.city dep_city ON dep_airport.city = dep_city.id
            JOIN aerosales.airport arr_airport ON t.arrival_airport = arr_airport.id
            JOIN aerosales.city arr_city ON arr_airport.city = arr_city.id
            ORDER BY d.expires_at DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async createDiscount(discountData) {
        const query = `
            INSERT INTO aerosales.discount (trip_id, percentage, expires_at)
            VALUES ($1, $2, $3)
            RETURNING id
        `;
        
        const result = await pool.query(query, [
            discountData.trip_id,
            discountData.percentage,
            discountData.expires_at
        ]);
        
        return result.rows[0].id;
    }

    async deleteDiscount(discountId) {
        const query = 'DELETE FROM aerosales.discount WHERE id = $1';
        const result = await pool.query(query, [discountId]);
        return result.rowCount > 0;
    }

    async getAllCities() {
        const query = 'SELECT * FROM aerosales.city ORDER BY name';
        const result = await pool.query(query);
        return result.rows;
    }

    async createCity(cityData) {
        const query = `
            INSERT INTO aerosales.city (name, timezone)
            VALUES ($1, $2)
            RETURNING id
        `;
        
        const result = await pool.query(query, [cityData.name, cityData.timezone]);
        return result.rows[0].id;
    }

    async getAllAirlines() {
        const query = 'SELECT id, name, logo_url FROM aerosales.airline ORDER BY name';
        const result = await pool.query(query);
        return result.rows;
    }

    async createAirline(airlineData) {
        const query = `
            INSERT INTO aerosales.airline (name, logo_url)
            VALUES ($1, $2)
            RETURNING id
        `;
        
        const result = await pool.query(query, [airlineData.name, airlineData.logo_url]);
        return result.rows[0].id;
    }
    
    async getMonthlyStatistics() {
        const query = `
            SELECT 
                TO_CHAR(p.purchase_date, 'YYYY-MM') as month,
                SUM(t.price * p.number_of_seats) as revenue,
                COUNT(p.id) as purchases_count
            FROM aerosales.purchase p
            JOIN aerosales.trip t ON p.trip_id = t.id
            WHERE p.status = 'paid' 
                AND p.purchase_date >= NOW() - INTERVAL '12 months'
            GROUP BY TO_CHAR(p.purchase_date, 'YYYY-MM')
            ORDER BY month
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    async getFavoritesCount() {
        const query = 'SELECT COUNT(*) as count FROM aerosales.favorite';
        const result = await pool.query(query);
        return parseInt(result.rows[0].count)
    }

    async createAirport(airportData) {
        const query = `
            INSERT INTO aerosales.airport (city, name)
            VALUES ($1, $2)
            RETURNING id
        `;
        
        const result = await pool.query(query, [airportData.city, airportData.name]);
        return result.rows[0].id;
    }

    async getStatistics() {
        const queries = {
            totalTrips: 'SELECT COUNT(*) as count FROM aerosales.trip',
            activeTrips: 'SELECT COUNT(*) as count FROM aerosales.trip WHERE departure_date > CURRENT_TIMESTAMP',
            totalUsers: 'SELECT COUNT(*) as count FROM aerosales."user"',
            totalPurchases: 'SELECT COUNT(*) as count FROM aerosales.purchase',
            totalRevenue: 'SELECT SUM(t.price * p.number_of_seats) as total FROM aerosales.purchase p JOIN aerosales.trip t ON p.trip_id = t.id WHERE p.status = \'paid\'',
            activeDiscounts: 'SELECT COUNT(*) as count FROM aerosales.discount WHERE expires_at > CURRENT_TIMESTAMP'
        };

        const results = {};
        
        for (const [key, query] of Object.entries(queries)) {
            const result = await pool.query(query);
            results[key] = key === 'totalRevenue' ? 
                parseFloat(result.rows[0].total || 0) : 
                parseInt(result.rows[0].count);
        }

        return results;
    }

    async getAllUsers() {
        const query = `
            SELECT 
                u.id,
                u.surname,
                u.firstname,
                u.lastname,
                u.birth_date,
                u.role,
                u.created_at,
                ad.login,
                cd.email,
                cd.phone
            FROM aerosales."user" u
            JOIN aerosales.auth_data ad ON u.id = ad.user_id
            LEFT JOIN aerosales.contact_detail cd ON u.id = cd.user_id
            ORDER BY u.created_at DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async getAirlinesStatistics() {
        const query = `
            SELECT 
                a.id as airline_id,
                a.name as airline_name,
                COUNT(t.id) as trips_count,
                COALESCE(SUM(p.number_of_seats), 0) as tickets_sold,
                COALESCE(SUM(t.price * p.number_of_seats), 0) as revenue,
                CASE 
                    WHEN COUNT(p.id) > 0 THEN AVG(t.price)
                    ELSE 0 
                END as average_price
            FROM aerosales.airline a
            LEFT JOIN aerosales.trip t ON a.id = t.airline
            LEFT JOIN aerosales.purchase p ON t.id = p.trip_id AND p.status = 'paid'
            GROUP BY a.id, a.name
            ORDER BY revenue DESC
        `;
        const result = await pool.query(query);
        return result;
    }

    async updateUserRole(userId, role) {
        const query = `
            UPDATE aerosales."user" 
            SET role = $1
            WHERE id = $2
            RETURNING id, role
        `;
        
        const result = await pool.query(query, [role, userId]);
        return result.rows[0];
    }

    async deleteUser(userId) {
        const purchaseCheck = `
            SELECT COUNT(*) as count 
            FROM aerosales.purchase 
            WHERE user_id = $1 AND status = 'paid'
        `;
        const purchaseResult = await pool.query(purchaseCheck, [userId]);
        
        if (parseInt(purchaseResult.rows[0].count) > 0) {
            throw new Error('Нельзя удалить пользователя с активными билетами');
        }

        const query = 'DELETE FROM aerosales."user" WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [userId]);
        return result.rows.length > 0;
    }

    async cancelTrip(tripId) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            const cancelPurchasesQuery = `
                UPDATE aerosales.purchase 
                SET status = 'refunded'
                WHERE trip_id = $1 AND status = 'paid'
            `;
            await client.query(cancelPurchasesQuery, [tripId]);
            
            const deleteTripQuery = 'DELETE FROM aerosales.trip WHERE id = $1';
            const result = await client.query(deleteTripQuery, [tripId]);
            
            await client.query('COMMIT');
            return result.rowCount > 0;
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getSalesStats() {
        const query = `
            SELECT 
                COUNT(*) as total_purchases,
                SUM(p.number_of_seats) as total_seats_sold,
                SUM(t.price * p.number_of_seats) as total_revenue,
                COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as active_purchases,
                COUNT(CASE WHEN p.status = 'canceled' THEN 1 END) as canceled_purchases,
                COUNT(CASE WHEN p.status = 'refunded' THEN 1 END) as refunded_purchases
            FROM aerosales.purchase p
            JOIN aerosales.trip t ON p.trip_id = t.id
        `;
        
        const result = await pool.query(query);
        return result.rows[0];
    }

    async getPopularDestinations() {
        const query = `
            SELECT 
                dep_city.name as departure_city,
                arr_city.name as arrival_city,
                COUNT(p.id) as bookings_count,
                SUM(p.number_of_seats) as total_seats
            FROM aerosales.purchase p
            JOIN aerosales.trip t ON p.trip_id = t.id
            JOIN aerosales.airport dep_airport ON t.departure_airport = dep_airport.id
            JOIN aerosales.city dep_city ON dep_airport.city = dep_city.id
            JOIN aerosales.airport arr_airport ON t.arrival_airport = arr_airport.id
            JOIN aerosales.city arr_city ON arr_airport.city = arr_city.id
            WHERE p.status IN ('paid', 'used')
            GROUP BY dep_city.name, arr_city.name
            ORDER BY bookings_count DESC
            LIMIT 10
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }
}

module.exports = new AdminDAO();