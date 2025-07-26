// const express = require('express');
// const multer = require('multer');
// const fetch = require('node-fetch');
// const fs = require('fs');
// const vision = require('@google-cloud/vision');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// require('dotenv').config();

// const app = express();
// const upload = multer({ dest: 'uploads/' });

// app.use(express.static(__dirname + '/../public'));

// const visionClient = new vision.ImageAnnotatorClient({
//   keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
// });

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });

// app.post('/process', upload.single('image'), async (req, res) => {
//   console.log('Received image upload');
//   const imagePath = req.file.path;

//   // 1. OCR with Vision API
//   const [result] = await visionClient.textDetection(imagePath);
//   const text = result.textAnnotations[0]?.description || "No text found";

//   // 2. Prompt Gemini
//   const prompt = `Categorize the following receipt based on content (like Grocery, Restaurant, Electronics, etc):\n\n${text}`;
//   const resultGemini = await model.generateContent(prompt);
//   const response = await resultGemini.response;
//   const category = response.text().trim();    

//   fs.unlinkSync(imagePath); // Clean up uploaded image

//   res.json({ text, category });
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const vision = require('@google-cloud/vision');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static(__dirname + '/../public'));

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

app.post('/process', upload.single('image'), async (req, res) => {
  console.log('Received image upload');
  const imagePath = req.file.path;

  try {
    const [result] = await visionClient.textDetection(imagePath);
    const text = result.textAnnotations[0]?.description || "No text found";

    const prompt = `Categorize the following receipt based on content (like Grocery, Restaurant, Electronics, etc):\n\n${text}`;
    const resultGemini = await model.generateContent([prompt]);
    const response = await resultGemini.response;
    const category = response.text().trim();

    fs.unlinkSync(imagePath);
    res.json({ text, category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

