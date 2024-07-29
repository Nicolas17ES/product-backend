// Import the necessary modules
const express = require('express'); // Express framework for routing and handling HTTP requests
const { generatePdfFromImage } = require('../controllers/generatePDFController.js'); // Import the controller function

/**
 * Creates and configures a router for handling PDF generation requests.
 * 
 * @param {Object} upload - Middleware for handling file uploads. Expected to be configured with `multer` or similar library.
 * 
 * @returns {Object} - The configured Express router instance with defined routes.
 */
module.exports = (upload) => {
    // Create a new Express router instance
    const router = express.Router();

    /**
     * Define the POST route for generating PDFs.
     * 
     * @route POST /generate
     * @param {Object} upload.single('image') - Middleware to handle single file upload with the field name 'image'.
     * @param {Function} generatePdfFromImage - Controller function to handle the image-to-PDF conversion.
     * 
     * @returns {void} - The router does not return a value but handles HTTP POST requests to the specified route.
     */
    router.post('/generate', upload.single('image'), generatePdfFromImage);

    // Return the configured router instance
    return router;
};
