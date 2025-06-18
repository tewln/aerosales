const pool = require('../config/database');

class UserDAO {
    async findByLogin(login) {
        const query = `
            SELECT 
                u.id,
                u.surname,
                u.firstname,
                u.lastname,
                u.birth_date,
                u.role,
                ad.login,
                ad.password,
                cd.email,
                cd.phone
            FROM aerosales."user" u
            JOIN aerosales.auth_data ad ON u.id = ad.user_id
            LEFT JOIN aerosales.contact_detail cd ON u.id = cd.user_id
            WHERE ad.login = $1
        `;
        
        const result = await pool.query(query, [login]);
        return result.rows[0] || null;
    }

    async findById(id) {
        const query = `
            SELECT 
                u.id,
                u.surname,
                u.firstname,
                u.lastname,
                u.birth_date,
                u.role,
                cd.email,
                cd.phone
            FROM aerosales."user" u
            JOIN aerosales.auth_data ad ON u.id = ad.user_id
            LEFT JOIN aerosales.contact_detail cd ON u.id = cd.user_id
            WHERE u.id = $1
        `;
        
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async create(userData) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            const userQuery = `
                INSERT INTO aerosales."user" (surname, firstname, lastname, birth_date, role)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            `;
            const userResult = await client.query(userQuery, [
                userData.surname,
                userData.firstname,
                userData.lastname,
                userData.birth_date,
                userData.role || 'user'
            ]);
            
            const userId = userResult.rows[0].id;

            const authQuery = `
                INSERT INTO aerosales.auth_data (user_id, login, password)
                VALUES ($1, $2, $3)
            `;
            await client.query(authQuery, [userId, userData.login, userData.password]);
            
            if (userData.email) {
                const contactQuery = `
                    INSERT INTO aerosales.contact_detail (user_id, email, phone)
                    VALUES ($1, $2, $3)
                `;
                await client.query(contactQuery, [userId, userData.email, userData.phone]);
            }
            
            await client.query('COMMIT');
            return userId;
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async loginExists(login) {
        const query = 'SELECT user_id FROM aerosales.auth_data WHERE login = $1';
        const result = await pool.query(query, [login]);
        return result.rows.length > 0;
    }

    async emailExists(email) {
        const query = 'SELECT user_id FROM aerosales.contact_detail WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows.length > 0;
    }

    async updateProfile(userId, profileData) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        Object.keys(profileData).forEach(key => {
            if (profileData[key] !== undefined) {
                updates.push(`${key} = $${paramCount}`);
                values.push(profileData[key]);
                paramCount++;
            }
        });
        if (updates.length === 0) {
            throw new Error('Нет данных для обновления');
        }
        values.push(userId);
        const query = `
            UPDATE aerosales."user" 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, surname, firstname, lastname, birth_date, role, created_at
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async updateContact(userId, contactData) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        Object.keys(contactData).forEach(key => {
            if (contactData[key] !== undefined) {
                updates.push(`${key} = $${paramCount}`);
                values.push(contactData[key]);
                paramCount++;
            }
        });
        if (updates.length === 0) {
            throw new Error('Нет данных для обновления');
        }
        values.push(userId);

        const query = `
            UPDATE aerosales.contact_detail 
            SET ${updates.join(', ')}
            WHERE user_id = $${paramCount}
            RETURNING user_id, email, phone
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findByEmail(email) {
        const query = `
            SELECT u.id, u.surname, u.firstname, u.lastname, u.birth_date, u.role
            FROM aerosales."user" u
            JOIN aerosales.contact_detail cd ON u.id = cd.user_id
            WHERE cd.email = $1
        `;
        
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    }

    async findByIdWithPassword(id) {
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
                ad.password,
                cd.email,
                cd.phone
            FROM aerosales."user" u
            JOIN aerosales.auth_data ad ON u.id = ad.user_id
            LEFT JOIN aerosales.contact_detail cd ON u.id = cd.user_id
            WHERE u.id = $1
        `;
        
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async updatePassword(userId, hashedPassword) {
        const query = `
            UPDATE aerosales.auth_data 
            SET password = $1
            WHERE user_id = $2
        `;
        
        await pool.query(query, [hashedPassword, userId]);
    }
}

module.exports = new UserDAO();