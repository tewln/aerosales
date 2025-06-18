const pool = require('../config/database');

class TripDAO {
    async getAvailableDestinations() {
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
                airline.id as airline_id,
                airline.name as airline_name,
                airline.logo_url as airline_logo
            FROM aerosales.trip t
            JOIN aerosales.airport dep_airport ON t.departure_airport = dep_airport.id
            JOIN aerosales.city dep_city ON dep_airport.city = dep_city.id
            JOIN aerosales.airport arr_airport ON t.arrival_airport = arr_airport.id
            JOIN aerosales.city arr_city ON arr_airport.city = arr_city.id
            JOIN aerosales.airline airline ON t.airline = airline.id
            WHERE t.available_seats > 0 
            AND t.departure_date > CURRENT_TIMESTAMP
            ORDER BY t.departure_date ASC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async searchTrips(filters) {
        let whereConditions = ['t.available_seats > 0', 't.departure_date > CURRENT_TIMESTAMP'];
        let values = [];
        let paramCount = 1;

        if (filters.departure_city) {
            whereConditions.push(`dep_city.id = $${paramCount}`);
            values.push(filters.departure_city);
            paramCount++;
        }

        if (filters.arrival_city) {
            whereConditions.push(`arr_city.id = $${paramCount}`);
            values.push(filters.arrival_city);
            paramCount++;
        }
        if (filters.departure_date_from) {
            whereConditions.push(`DATE(t.departure_date) >= $${paramCount}`);
            values.push(filters.departure_date_from);
            paramCount++;
        }

        if (filters.departure_date_to) {
            whereConditions.push(`DATE(t.departure_date) <= $${paramCount}`);
            values.push(filters.departure_date_to);
            paramCount++;
        }

        if (filters.min_price) {
            whereConditions.push(`t.price >= $${paramCount}`);
            values.push(filters.min_price);
            paramCount++;
        }        if (filters.max_price) {
            whereConditions.push(`t.price <= $${paramCount}`);
            values.push(filters.max_price);
            paramCount++;
        }

        if (filters.airline_id) {
            whereConditions.push(`airline.id = $${paramCount}`);
            values.push(filters.airline_id);
            paramCount++;
        }
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
                airline.id as airline_id,
                airline.name as airline_name,
                airline.logo_url as airline_logo
            FROM aerosales.trip t
            JOIN aerosales.airport dep_airport ON t.departure_airport = dep_airport.id
            JOIN aerosales.city dep_city ON dep_airport.city = dep_city.id
            JOIN aerosales.airport arr_airport ON t.arrival_airport = arr_airport.id
            JOIN aerosales.city arr_city ON arr_airport.city = arr_city.id
            JOIN aerosales.airline airline ON t.airline = airline.id
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY t.departure_date ASC
        `;
        const result = await pool.query(query, values);
        return result.rows;
    }

    async getTripById(tripId) {
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
                airline.id as airline_id,
                airline.name as airline_name,
                airline.logo_url as airline_logo,
                dep_city.timezone as departure_timezone,
                arr_city.timezone as arrival_timezone
            FROM aerosales.trip t
            JOIN aerosales.airport dep_airport ON t.departure_airport = dep_airport.id
            JOIN aerosales.city dep_city ON dep_airport.city = dep_city.id
            JOIN aerosales.airport arr_airport ON t.arrival_airport = arr_airport.id
            JOIN aerosales.city arr_city ON arr_airport.city = arr_city.id
            JOIN aerosales.airline airline ON t.airline = airline.id
            WHERE t.id = $1
        `;
        
        const result = await pool.query(query, [tripId]);
        return result.rows[0] || null;
    }

    async getTripReviews(tripId) {
        const query = `
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                u.firstname,
                u.surname
            FROM aerosales.review r
            JOIN aerosales."user" u ON r.user_id = u.id
            WHERE r.trip_id = $1
            ORDER BY r.created_at DESC
        `;
        
        const result = await pool.query(query, [tripId]);
        return result.rows;
    }

    async getAirlineReviews(airlineId, limit = 20, offset = 0) {
        const query = `
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                u.firstname,
                u.surname,
                dep_city.name as departure_city,
                arr_city.name as arrival_city,
                t.departure_date,
                t.price,
                airline.name as airline_name
            FROM aerosales.review r
            JOIN aerosales."user" u ON r.user_id = u.id
            JOIN aerosales.trip t ON r.trip_id = t.id
            JOIN aerosales.airline airline ON t.airline = airline.id
            JOIN aerosales.airport dep_airport ON t.departure_airport = dep_airport.id
            JOIN aerosales.city dep_city ON dep_airport.city = dep_city.id
            JOIN aerosales.airport arr_airport ON t.arrival_airport = arr_airport.id
            JOIN aerosales.city arr_city ON arr_airport.city = arr_city.id
            WHERE airline.id = $1
            ORDER BY r.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await pool.query(query, [airlineId, limit, offset]);
        return result.rows;
    }

    async getAirlineReviewStats(airlineId) {
        const query = `
            SELECT 
                COUNT(r.id) as total_reviews,
                ROUND(AVG(r.rating), 2) as average_rating,
                COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star,
                COUNT(CASE WHEN r.rating = 4 THEN 1 END) as four_star,
                COUNT(CASE WHEN r.rating = 3 THEN 1 END) as three_star,
                COUNT(CASE WHEN r.rating = 2 THEN 1 END) as two_star,
                COUNT(CASE WHEN r.rating = 1 THEN 1 END) as one_star
            FROM aerosales.review r
            JOIN aerosales.trip t ON r.trip_id = t.id
            WHERE t.airline = $1
        `;
        
        const result = await pool.query(query, [airlineId]);
        return result.rows[0];
    }

    async checkAvailability(tripId, numberOfSeats) {
        const query = 'SELECT available_seats FROM aerosales.trip WHERE id = $1';
        const result = await pool.query(query, [tripId]);
        
        if (!result.rows[0]) return false;
        
        return result.rows[0].available_seats >= numberOfSeats;
    }
}

module.exports = new TripDAO();