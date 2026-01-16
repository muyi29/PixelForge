import { query } from '../db/database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

class User {
  // Create new user
  static async create(email, password) {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate API key
    const apiKey = crypto.randomBytes(32).toString('hex');

    const text = `
      INSERT INTO users (email, password_hash, api_key)
      VALUES ($1, $2, $3)
      RETURNING id, email, api_key, quota_limit, quota_used, is_active, created_at
    `;

    const values = [email, passwordHash, apiKey];
    const result = await query(text, values);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const text = 'SELECT * FROM users WHERE email = $1';
    const result = await query(text, [email]);
    return result.rows[0];
  }

  // Find user by API key
  static async findByApiKey(apiKey) {
    const text = 'SELECT * FROM users WHERE api_key = $1 AND is_active = true';
    const result = await query(text, [apiKey]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const text = 'SELECT id, email, api_key, quota_limit, quota_used, is_active, created_at FROM users WHERE id = $1';
    const result = await query(text, [id]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
  }

  // Update quota usage
  static async incrementQuota(userId) {
    const text = `
      UPDATE users 
      SET quota_used = quota_used + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING quota_used, quota_limit
    `;
    const result = await query(text, [userId]);
    return result.rows[0];
  }

  // Check if user has quota available
  static async hasQuota(userId) {
    const text = 'SELECT quota_used, quota_limit FROM users WHERE id = $1';
    const result = await query(text, [userId]);
    const user = result.rows[0];
    return user.quota_used < user.quota_limit;
  }

  // Reset quota
  static async resetQuota(userId) {
    const text = `
      UPDATE users 
      SET quota_used = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(text, [userId]);
    return result.rows[0];
  }

  // Regenerate API key
  static async regenerateApiKey(userId) {
    const newApiKey = crypto.randomBytes(32).toString('hex');
    const text = `
      UPDATE users 
      SET api_key = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, api_key
    `;
    const result = await query(text, [newApiKey, userId]);
    return result.rows[0];
  }

  // Deactivate user
  static async deactivate(userId) {
    const text = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(text, [userId]);
    return result.rows[0];
  }

  // Get user stats
  static async getStats(userId) {
    const text = `
      SELECT 
        u.email,
        u.quota_used,
        u.quota_limit,
        u.created_at,
        COUNT(i.id) as total_images,
        COALESCE(SUM(i.file_size), 0) as total_storage
      FROM users u
      LEFT JOIN images i ON i.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id
    `;
    const result = await query(text, [userId]);
    return result.rows[0];
  }
}

export default User;