import { query } from '../db/database.js';

class Image {
  // Create new image record
  static async create(imageData) {
    const {
      userId,
      filename,
      originalName,
      filePath,
      fileSize,
      mimeType,
      width,
      height,
      format
    } = imageData;

    const text = `
      INSERT INTO images (
        user_id, filename, original_name, file_path, 
        file_size, mime_type, width, height, format
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      userId || null,
      filename,
      originalName,
      filePath,
      fileSize,
      mimeType,
      width,
      height,
      format
    ];

    const result = await query(text, values);
    return result.rows[0];
  }

  // Find image by ID
  static async findById(id) {
    const text = 'SELECT * FROM images WHERE id = $1';
    const result = await query(text, [id]);
    return result.rows[0];
  }

  // Find image by filename
  static async findByFilename(filename) {
    const text = 'SELECT * FROM images WHERE filename = $1';
    const result = await query(text, [filename]);
    return result.rows[0];
  }

  // Find all images by user
  static async findByUser(userId, limit = 50, offset = 0) {
    const text = `
      SELECT * FROM images 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await query(text, [userId, limit, offset]);
    return result.rows;
  }

  // Get total count for user
  static async countByUser(userId) {
    const text = 'SELECT COUNT(*) FROM images WHERE user_id = $1';
    const result = await query(text, [userId]);
    return parseInt(result.rows[0].count);
  }

  // Delete image
  static async delete(id) {
    const text = 'DELETE FROM images WHERE id = $1 RETURNING *';
    const result = await query(text, [id]);
    return result.rows[0];
  }

  // Delete by filename
  static async deleteByFilename(filename) {
    const text = 'DELETE FROM images WHERE filename = $1 RETURNING *';
    const result = await query(text, [filename]);
    return result.rows[0];
  }

  // Get storage stats for user
  static async getUserStats(userId) {
    const text = `
      SELECT 
        COUNT(*) as total_images,
        SUM(file_size) as total_size,
        AVG(width) as avg_width,
        AVG(height) as avg_height
      FROM images 
      WHERE user_id = $1
    `;
    const result = await query(text, [userId]);
    return result.rows[0];
  }

  // Get recent uploads (public images)
  static async getRecent(limit = 10) {
    const text = `
      SELECT * FROM images 
      ORDER BY created_at DESC 
      LIMIT $1
    `;
    const result = await query(text, [limit]);
    return result.rows;
  }
}

export default Image;