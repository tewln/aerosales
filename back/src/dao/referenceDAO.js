const pool = require('../config/database');

class ReferenceDAO {
    async getAllCities() {
        const query = `
            SELECT 
                c.id,
                c.name,
                c.timezone,
                COUNT(DISTINCT CASE WHEN dep_airport.city = c.id THEN t.id END) as departure_routes,
                COUNT(DISTINCT CASE WHEN arr_airport.city = c.id THEN t.id END) as arrival_routes,
                (COUNT(DISTINCT CASE WHEN dep_airport.city = c.id THEN t.id END) + 
                 COUNT(DISTINCT CASE WHEN arr_airport.city = c.id THEN t.id END)) as total_routes
            FROM aerosales.city c
            LEFT JOIN aerosales.airport dep_airport ON dep_airport.city = c.id
            LEFT JOIN aerosales.airport arr_airport ON arr_airport.city = c.id
            LEFT JOIN aerosales.trip t ON (
                (t.departure_airport = dep_airport.id OR t.arrival_airport = arr_airport.id)
                AND t.departure_date > CURRENT_TIMESTAMP
                AND t.available_seats > 0
            )
            GROUP BY c.id, c.name, c.timezone
            HAVING (COUNT(DISTINCT CASE WHEN dep_airport.city = c.id THEN t.id END) + 
                    COUNT(DISTINCT CASE WHEN arr_airport.city = c.id THEN t.id END)) > 0
            ORDER BY total_routes DESC, c.name
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async getAllAirlines() {
        const query = `
            SELECT 
                a.id,
                a.name,
                a.logo_url,
                COUNT(t.id) as active_trips
            FROM aerosales.airline a
            LEFT JOIN aerosales.trip t ON t.airline = a.id
                AND t.departure_date > CURRENT_TIMESTAMP
                AND t.available_seats > 0
            GROUP BY a.id, a.name, a.logo_url
            HAVING COUNT(t.id) > 0
            ORDER BY active_trips DESC, a.name
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async getAllAirports() {
        const query = `
            SELECT 
                a.id,
                a.name as airport_name,
                a.city as city_id,
                c.name as city_name,
                c.timezone,
                COUNT(DISTINCT CASE WHEN t.departure_airport = a.id THEN t.id END) as departure_trips,
                COUNT(DISTINCT CASE WHEN t.arrival_airport = a.id THEN t.id END) as arrival_trips,
                (COUNT(DISTINCT CASE WHEN t.departure_airport = a.id THEN t.id END) + 
                 COUNT(DISTINCT CASE WHEN t.arrival_airport = a.id THEN t.id END)) as total_trips
            FROM aerosales.airport a
            JOIN aerosales.city c ON a.city = c.id
            LEFT JOIN aerosales.trip t ON (
                (t.departure_airport = a.id OR t.arrival_airport = a.id)
                AND t.departure_date > CURRENT_TIMESTAMP
                AND t.available_seats > 0
            )
            GROUP BY a.id, a.name, a.city, c.name, c.timezone
            HAVING (COUNT(DISTINCT CASE WHEN t.departure_airport = a.id THEN t.id END) + 
                    COUNT(DISTINCT CASE WHEN t.arrival_airport = a.id THEN t.id END)) > 0
            ORDER BY total_trips DESC, c.name, a.name
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async getAirportsByCity(cityId) {
        const query = `
            SELECT 
                a.id,
                a.name as airport_name,
                c.name as city_name,
                COUNT(DISTINCT CASE WHEN t.departure_airport = a.id THEN t.id END) as departure_trips,
                COUNT(DISTINCT CASE WHEN t.arrival_airport = a.id THEN t.id END) as arrival_trips,
                (COUNT(DISTINCT CASE WHEN t.departure_airport = a.id THEN t.id END) + 
                 COUNT(DISTINCT CASE WHEN t.arrival_airport = a.id THEN t.id END)) as total_trips
            FROM aerosales.airport a
            JOIN aerosales.city c ON a.city = c.id
            LEFT JOIN aerosales.trip t ON (
                (t.departure_airport = a.id OR t.arrival_airport = a.id)
                AND t.departure_date > CURRENT_TIMESTAMP
                AND t.available_seats > 0
            )
            WHERE a.city = $1
            GROUP BY a.id, a.name, c.name
            ORDER BY total_trips DESC, a.name
        `;
        
        const result = await pool.query(query, [cityId]);
        return result.rows;
    }

    async getPriceRange() {
        const query = `
            SELECT 
                MIN(t.price) as min_price,
                MAX(t.price) as max_price,
                ROUND(AVG(t.price), 2) as average_price,
                COUNT(t.id) as total_trips
            FROM aerosales.trip t
            WHERE t.departure_date > CURRENT_TIMESTAMP
                AND t.available_seats > 0
        `;
        
        const result = await pool.query(query);
        return result.rows[0];
    }

    async getPurchaseStatuses() {
        const query = `
            SELECT unnest(enum_range(NULL::aerosales.purchase_status)) as status
        `;
        
        const result = await pool.query(query);
        return result.rows.map(row => row.status);
    }

    async getUserRoles() {
        const query = `
            SELECT unnest(enum_range(NULL::aerosales.user_role)) as role
        `;
        
        const result = await pool.query(query);
        return result.rows.map(row => row.role);
    }

    async getAllAirportsForAdmin() {
        const query = `
            SELECT 
                a.id,
                a.name,
                a.city as city_id,
                c.name as city_name
            FROM aerosales.airport a
            JOIN aerosales.city c ON a.city = c.id
            ORDER BY c.name, a.name
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async getAllCitiesForAdmin() {
        const query = `
            SELECT 
                c.id,
                c.name,
                c.timezone
            FROM aerosales.city c
            ORDER BY c.name
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async getAllAirlinesForAdmin() {
        const query = `
            SELECT 
                a.id,
                a.name,
                a.logo_url
            FROM aerosales.airline a
            ORDER BY a.name
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }
}

module.exports = new ReferenceDAO();