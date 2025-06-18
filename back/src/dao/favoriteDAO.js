const pool = require('../config/database');

class FavoriteDAO {
    async getUserFavorites(userId) {
        const query = `
            SELECT 
                f.saved_at,
                t.id,
                t.departure_date,
                t.arrival_date,
                t.price,
                t.available_seats,
                dep_city.name as departure_city,
                dep_airport.name as departure_airport,
                arr_city.name as arrival_city,
                arr_airport.name as arrival_airport,
                airline.name as airline_name,
                airline.logo_url as airline_logo
            FROM aerosales.favorite f
            JOIN aerosales.trip t ON f.trip_id = t.id
            JOIN aerosales.airport dep_airport ON t.departure_airport = dep_airport.id
            JOIN aerosales.city dep_city ON dep_airport.city = dep_city.id
            JOIN aerosales.airport arr_airport ON t.arrival_airport = arr_airport.id
            JOIN aerosales.city arr_city ON arr_airport.city = arr_city.id
            JOIN aerosales.airline airline ON t.airline = airline.id
            WHERE f.user_id = $1
            ORDER BY f.saved_at DESC
        `;
        
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    async addToFavorites(userId, tripId) {
        const query = `
            INSERT INTO aerosales.favorite (user_id, trip_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, trip_id) DO NOTHING
            RETURNING saved_at
        `;
        
        const result = await pool.query(query, [userId, tripId]);
        return result.rows[0] || null;
    }

    async removeFromFavorites(userId, tripId) {
        const query = `
            DELETE FROM aerosales.favorite 
            WHERE user_id = $1 AND trip_id = $2
            RETURNING user_id
        `;
        
        const result = await pool.query(query, [userId, tripId]);
        return result.rows.length > 0;
    }

    async isFavorite(userId, tripId) {
        const query = `
            SELECT 1 FROM aerosales.favorite 
            WHERE user_id = $1 AND trip_id = $2
        `;
        
        const result = await pool.query(query, [userId, tripId]);
        return result.rows.length > 0;
    }

    async getFavoritesCount(userId) {
        const query = `
            SELECT COUNT(*) as count 
            FROM aerosales.favorite 
            WHERE user_id = $1
        `;
        
        const result = await pool.query(query, [userId]);
        return parseInt(result.rows[0].count);
    }
}

module.exports = new FavoriteDAO();