// Import necessary modules
const express = require("express"); // Express framework for building the server
const app = express(); // Create an instance of an Express application
const { resolve } = require("path"); // Path module for resolving file paths
const env = require("dotenv").config({ path: "./.env" }); // Load environment variables from a .env file
const multer = require('multer'); // Middleware for handling file uploads
const { errorHandler } = require('./middleware/errorMiddleware.js'); // Custom error handling middleware

const PORT = process.env.PORT || 8080; // Define the port to listen on, default to 5252 if not specified

const cors = require('cors'); // Middleware for handling CORS (Cross-Origin Resource Sharing)

/**
 * Configure CORS middleware.
 * 
 * @function
 * @param {Object} corsOptions - Options for CORS configuration.
 */
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true, // Allow credentials (cookies, authorization headers) to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] // Allowed HTTP methods
}));

/**
 * Middleware to set custom CORS headers for all responses.
 * 
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization"); // Allow specific headers
    next(); // Pass control to the next middleware function
});

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded payloads (without nested objects)


// Configure multer for handling file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage }); // Create multer instance with the specified storage

// Set up routes for handling PDF generation
app.use('/pdf', require('./routes/generatePDFRoutes')(upload)); // Use routes from generatePDFRoutes and pass the upload middleware

// Use the custom error handling middleware
app.use(errorHandler); // Apply the custom error handler middleware

// Start the server and listen on the specified port
app.listen(PORT, () => console.log(`server started on port ${PORT}`)); // Log a message when the server starts
