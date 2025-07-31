const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // You may need to install this: npm install uuid

// Set up upload directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Save image to upload directory
 * @param {Object} file - Express file upload object
 * @returns {Object} Object containing filename and path
 */
exports.saveImage = async (file) => {
  try {
    if (!file) return null;

    // Generate unique filename
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    // Write file to disk
    await fs.promises.writeFile(filepath, file.buffer);

    return {
      filename,
      path: `/uploads/${filename}` // URL path for client
    };
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('Failed to save image');
  }
};

/**
 * Delete image from upload directory
 * @param {String} filename - Name of file to delete
 * @returns {Boolean} Success status
 */
exports.deleteImage = async (filename) => {
  try {
    if (!filename) return false;

    const filepath = path.join(uploadDir, path.basename(filename));
    
    // Check if file exists before attempting to delete
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};
