/**
 * Error handling middleware for Express.js applications.
 * This middleware captures any errors that occur during the request handling process.
 * It ensures that a proper error response is sent to the client.
 * 
 * @param {Object} error - The error object that was caught.
 * @param {Object} _ - The request object (not used in this middleware).
 * @param {Object} res - The response object used to send the HTTP response.
 * @param {Function} next - The next middleware function in the stack (not used here, but required for Express middleware).
 */

const errorHandler = (error, _, res, next) => {
    // If the response status code is less than 400, set it to 500 (Internal Server Error)
    // This ensures that successful status codes (2xx) are not mistakenly sent as error responses
    const statusCode = res.statusCode < 400 ? 500 : res.statusCode;

    // Log the error to the console for debugging purposes
    console.log('Error middleware', error);

    // Set the HTTP status code for the response
    res.status(statusCode);

    // Send a JSON response with the error message
    // If the application is running in a production environment, do not include the stack trace
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
}

// Export the errorHandler middleware function to be used in other parts of the application
module.exports = { errorHandler };
