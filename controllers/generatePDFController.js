// Import necessary modules
const asyncHandler = require('express-async-handler'); // Middleware to handle asynchronous errors in Express routes
const FormData = require('form-data'); // Module to handle form data formatting
const axios = require('axios'); // HTTP client to make requests

/**
 * Generates a PDF from an image file uploaded via an HTTP request.
 * 
 * @param {Object} req - The request object, expected to contain a file under `req.file`.
 * @param {Object} res - The response object used to send back the result or errors.
 * 
 * @returns {void} - This function does not return a value but sends a response directly.
 */
const generatePdfFromImage = asyncHandler(async (req, res) => {
    // Check if a file was provided in the request
    if (!req.file) {
        // Respond with a 400 Bad Request error if no file is present
        return res.status(400).json({ error: 'Image file is required.' });
    }

    // Destructure the file information from the request
    const { buffer, originalname, mimetype } = req.file;
    // Validate that the file type is either PNG
    if (!['image/png'].includes(mimetype)) {
        console.log('this')
        // Respond with a 400 Bad Request error if the file type is invalid
        return res.status(400).json({ error: 'Only PNG images are valid.' });
    }

    // Create a new FormData instance to prepare the file for upload
    const formData = new FormData();
    formData.append('image', buffer, { filename: originalname, contentType: mimetype });

    try {
        // Make a POST request to the PHP service to generate the PDF
        const response = await axios.post('https://product-php-production.up.railway.app/index.php', formData, {
            headers: formData.getHeaders(), // Set the headers for the form data
            responseType: 'arraybuffer', // Expect the response to be an array buffer (binary data)
        });

        // Check if the response status is OK
        if (response.status === 200) {
            // Set the response Content-Type to PDF and send the PDF data
            res.set('Content-Type', 'application/pdf');
            res.send(response.data);
        } else {
            // Respond with a 500 Internal Server Error if the status is not OK
            return res.status(500).json({ error: 'Failed to generate PDF' });
        }

    } catch (error) {
        // Log detailed error information for debugging
        console.error('Error calling PHP service:', {
            message: error.message,
            stack: error.stack,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data
            } : undefined,
            request: error.request ? {
                data: error.request.data,
                headers: error.request.headers
            } : undefined
        });

        // Respond based on the type of error encountered
        if (error.response) {
            // Respond with the status and data from the PHP service if available
            res.status(error.response.status).json({ error: error.response.data });
        } else if (error.request) {
            // Respond with a 500 Internal Server Error if no response was received
            res.status(500).json({ error: 'No response received from the PHP service.' });
        } else {
            // Respond with a 500 Internal Server Error for any other type of error
            res.status(500).json({ error: 'An error occurred: ' + error.message });
        }
    }
});

// Export the function for use in other parts of the application
module.exports = {
    generatePdfFromImage,
};
