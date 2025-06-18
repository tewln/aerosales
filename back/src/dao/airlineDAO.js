const pool = require('../config/database');

class AirlineDAO {
    async getAirlineWithReviews(airlineId) {
        const airlineQuery = `
            SELECT 
                a.id,
                a.name,
                a.logo_url,
                COUNT(r.id) as total_reviews,
                ROUND(AVG(r.rating), 2) as average_rating,
                COUNT(DISTINCT t.id) as total_trips
            FROM aerosales.airline a
            LEFT JOIN aerosales.trip t ON t.airline = a.id
            LEFT JOIN aerosales.review r ON r.trip_id = t.id
            WHERE a.id = $1
            GROUP BY a.id, a.name, a.logo_url
        `;

        const reviewsQuery = `
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                CONCAT(u.surname, ' ', LEFT(u.firstname, 1), '.') as user_name,
                dep_city.name as departure_city,
                arr_city.name as arrival_city,
                t.departure_date as trip_date
            FROM aerosales.review r
            JOIN aerosales."user" u ON r.user_id = u.id
            JOIN aerosales.trip t ON r.trip_id = t.id
            JOIN aerosales.airport dep_airport ON t.departure_airport = dep_airport.id
            JOIN aerosales.city dep_city ON dep_airport.city = dep_city.id
            JOIN aerosales.airport arr_airport ON t.arrival_airport = arr_airport.id
            JOIN aerosales.city arr_city ON arr_airport.city = arr_city.id
            WHERE t.airline = $1
            ORDER BY r.created_at DESC
            LIMIT 20
        `;

        const [airlineResult, reviewsResult] = await Promise.all([
            pool.query(airlineQuery, [airlineId]),
            pool.query(reviewsQuery, [airlineId])
        ]);

        if (!airlineResult.rows[0]) {
            throw new Error('Авиакомпания не найдена');
        }

        return {
            airline: airlineResult.rows[0],
            reviews: reviewsResult.rows
        };
    }

    async getAirlineRatingStats(airlineId) {
        const query = `
            SELECT 
                r.rating,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
            FROM aerosales.review r
            JOIN aerosales.trip t ON r.trip_id = t.id
            WHERE t.airline = $1
            GROUP BY r.rating
            ORDER BY r.rating DESC
        `;

        const result = await pool.query(query, [airlineId]);
        return result.rows;
    }
}

module.exports = new AirlineDAO();