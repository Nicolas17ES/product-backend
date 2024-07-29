// Import testing and mocking libraries
import * as chai from 'chai'; // Chai assertion library
import sinon from 'sinon'; // Sinon for creating spies, stubs, and mocks
import chaiHttp from 'chai-http'; // Chai HTTP plugin for making HTTP requests
import axios from 'axios'; // HTTP client for making requests
import MockAdapter from 'axios-mock-adapter'; // Mock adapter for axios to mock HTTP requests
import { generatePdfFromImage } from '../controllers/generatePDFController.js'; // Controller function to be tested
import fs from 'fs'; // File system module for reading files
import path from 'path'; // Path module for handling file paths

// Define the path to the test image file
const imagePath = path.join('test', 'test.png');

// Read the image file as a buffer for use in tests
const imageBuffer = fs.readFileSync(imagePath);

// Configure Chai to use the HTTP plugin
chai.use(chaiHttp);
const { expect } = chai; // Extract the 'expect' function from Chai for assertions

/**
 * Test suite for the `generatePdfFromImage` controller function.
 */
describe('generatePdfFromImage Controller', () => {
    let req, res, axiosInstance;

    /**
     * Setup before each test case.
     * Initializes mock request and response objects, and sets up axios mock adapter.
     */
    beforeEach(() => {
        // Initialize mock request object with a sample image file
        req = {
            file: {
                buffer: imageBuffer,
                originalname: 'test.png',
                mimetype: 'image/png'
            }
        };

        // Initialize mock response object with sinon spies
        res = {
            status: sinon.stub().returnsThis(), // Stub to chain methods
            json: sinon.spy(), // Spy to track calls
            set: sinon.spy(), // Spy to track calls
            send: sinon.spy() // Spy to track calls
        };

        // Initialize axios mock adapter to intercept HTTP requests
        axiosInstance = new MockAdapter(axios);
    });

    /**
     * Cleanup after each test case.
     * Restores the original axios instance to remove mocks.
     */
    afterEach(() => {
        axiosInstance.restore();
    });

    /**
     * Test case to check handling of missing file in the request.
     * Should return a 400 Bad Request with an appropriate error message.
     */
    it('should return 400 if no file is provided', async () => {
        req.file = null; // Set file to null to simulate missing file

        await generatePdfFromImage(req, res); // Call the function under test

        // Assert that the status code 400 was set
        expect(res.status.calledWith(400)).to.be.true;
        // Assert that the appropriate error message was sent
        expect(res.json.calledWith({ error: 'Image file is required.' })).to.be.true;
    });

    /**
     * Test case to check handling of invalid file type.
     * Should return a 400 Bad Request with an appropriate error message.
     */
    it('should return 400 if file is not a valid image type', async () => {
        req.file.mimetype = 'image/gif'; // Set an invalid mimetype

        await generatePdfFromImage(req, res); // Call the function under test

        // Assert that the status code 400 was set
        expect(res.status.calledWith(400)).to.be.true;
        // Assert that the appropriate error message was sent
        expect(res.json.calledWith({ error: 'Only PNG images are valid.' })).to.be.true;
    });

    /**
     * Test case to check successful PDF generation.
     * Should send the generated PDF file when the PHP service responds with 200.
     */
    it('should send PDF file if PHP service responds with 200', async () => {
        // Mock PDF buffer to simulate PHP service response
        const pdfBuffer = Buffer.from('test pdf buffer'); // Adjust this to match the actual expected PDF content

        // Mock the axios POST request to the PHP service
        axiosInstance.onPost('http://localhost:8000/php-service.php').reply(200, pdfBuffer, {
            'Content-Type': 'application/pdf'
        });

        await generatePdfFromImage(req, res); // Call the function under test

        // Assert that the response Content-Type header was set to PDF
        expect(res.set.calledWith('Content-Type', 'application/pdf')).to.be.true;

        // Assert that the response body is a buffer
        const actualBuffer = res.send.firstCall.args[0];
        expect(Buffer.isBuffer(actualBuffer)).to.be.true;
        // Optionally, check the size of the buffer
        expect(actualBuffer.length).to.be.greaterThan(0);
    });

    /**
     * Test case to check handling of PHP service error response.
     * Should return a 500 Internal Server Error when the PHP service responds with an error.
     */
    it('should handle PHP service error response correctly', async () => {
        req.file.buffer = Buffer.from('test image buffer'); // Provide a sample image buffer
        // Mock the axios POST request to the PHP service with a 500 error response
        axiosInstance.onPost('http://localhost:8000/php-service.php').reply(500, { error: 'Failed to generate PDF' });

        await generatePdfFromImage(req, res); // Call the function under test

        // Assert that the status code 500 was set
        expect(res.status.calledWith(500)).to.be.true;
    });

});

