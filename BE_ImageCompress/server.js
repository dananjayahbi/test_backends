// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'test_image.jpg');
  },
});

const upload = multer({ storage: storage });

// Load the pre-trained super-resolution model
let model;
async function loadModel() {
  model = await tf.loadGraphModel('path/to/model.json');
}
loadModel();

// Function to perform image super-resolution
const superResolveImage = async (inputPath, outputPath) => {
  try {
    // Load the input image
    const inputImage = tf.node.decodeImage(fs.readFileSync(inputPath));
    // Perform super-resolution
    const upscaledImage = model.predict(inputImage);
    // Convert tensor to buffer and save as image
    const buffer = await tf.node.encodeJpeg(upscaledImage);
    fs.writeFileSync(outputPath, buffer);
    console.log('Image super-resolution completed successfully');
    return outputPath;
  } catch (error) {
    throw error;
  }
};

// Route to perform image super-resolution
app.post('/super-resolution', upload.single('image'), async (req, res) => {
  const inputPath = './uploads/test_image.jpg';
  const outputPath = './output/super_resolved_image.jpg';

  try {
    await superResolveImage(inputPath, outputPath);
    res.json({ message: 'Image super-resolution completed successfully', superResolvedImagePath: outputPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error performing image super-resolution' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
