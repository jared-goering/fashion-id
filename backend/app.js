const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const multer = require('multer');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Set up middleware for logging, parsing JSON and URL-encoded data, and handling cookies
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for handling file uploads, storing files in the 'uploads' directory
const upload = multer({ dest: 'uploads/' });

// Route for processing image uploads
app.post('/process-image', upload.single('image'), (req, res) => {
  const imagePath = req.file.path; // Path to the uploaded file
  const scriptPath = path.join(__dirname, 'scripts', 'process_image.py'); // Path to the Python script
  const pythonPath = path.join(__dirname, 'venv', 'bin', 'python3'); // Path to the Python interpreter in the virtual environment

  // Log the received file path for debugging
  console.log('Received file path:', imagePath);

  // Command to run the Python script with the uploaded image
  const command = `${pythonPath} "${scriptPath}" "${imagePath}"`;

  console.log(`Executing command: ${command}`);

  // Execute the Python script
  exec(command, (error, stdout, stderr) => {
    if (error) {
      // Log and send error if the execution fails
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }

    if (stderr) {
      // Log and send stderr output if there is any
      console.error(`Stderr: ${stderr}`);
      return res.status(500).json({ error: stderr });
    }

    console.log(`Stdout: ${stdout}`);
    try {
      // Parse the JSON output from the Python script and send it as the response
      const result = JSON.parse(stdout);
      res.status(200).json(result);
    } catch (parseError) {
      // Handle JSON parsing errors
      console.error(`Error parsing JSON: ${parseError.message}`);
      res.status(500).json({ error: 'Error parsing JSON output from Python script' });
    }
  });
});

// Handle 404 errors
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler middleware
app.use((err, req, res, next) => {
  // Set locals, only providing error details in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Send error response as JSON
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// Export the app module
module.exports = app;
