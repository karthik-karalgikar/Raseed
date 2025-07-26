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

// Serve frontend files
app.use(express.static(__dirname + '/../public'));

// Initialize Google Vision client
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

// Bill parsing logic
function extractBillFields(text, category) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  const vendor = lines[0];
  const dateLine = lines.find(l => l.toLowerCase().includes('date'));
  const date = dateLine?.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] || null;

  const totalLine = [...lines].reverse().find(l => /\d+\.\d{2}/.test(l));
  const total = totalLine?.match(/\d+\.\d{2}/)?.[0] || null;

  const items = [];
  for (let i = 0; i < lines.length; i++) {
    const name = lines[i];
    const priceMatch = lines[i + 1]?.match(/(\d+\.\d{2})/);
    if (priceMatch && !name.toLowerCase().includes('qty') && !name.toLowerCase().includes('total')) {
      items.push({
        name,
        price: priceMatch[1]
      });
      i++; // skip next line
    }
  }

  return {
    category,
    vendor,
    date,
    items,
    total
  };
}

app.post('/process', upload.single('image'), async (req, res) => {
  console.log('Received image upload');
  const imagePath = req.file.path;

  try {
    // 1. OCR
    const [result] = await visionClient.textDetection(imagePath);
    // console.log("Vision API result:", JSON.stringify(result.textAnnotations, null, 2));

    let text = "No text found";
    if (result.fullTextAnnotation && result.fullTextAnnotation.text) {
    text = result.fullTextAnnotation.text;
    }
    // console.log("Full text:", text);

    // 2. Gemini classification
    const prompt = `Categorize the following receipt based on content (like Grocery, Restaurant, Electronics, etc):\n\n${text}`;
    const resultGemini = await model.generateContent([prompt]);
    const response = await resultGemini.response;
    const category = response.text().trim();

    // 3. Extract structured data
    const structuredData = extractBillFields(text, category);

    // Clean up
    fs.unlinkSync(imagePath);

    res.json(structuredData);
  } catch (err) {
    console.error("Error in /process:", err);
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
