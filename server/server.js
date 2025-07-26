const express = require('express');
const multer = require('multer');
const fs = require('fs');
const vision = require('@google-cloud/vision');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

require('dotenv').config();

const auth = new GoogleAuth({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
});

const app = express();
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

// Serve frontend files
app.use(express.static(__dirname + '/../public'));

let latestPass = null;

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

app.post('/ask', async (req, res) => {
  const userQuestion = req.body.question;

  if (!latestPass) {
    return res.status(400).json({ error: "No receipt available to query. Please upload a bill first." });
  }

  const prompt = `
You are an AI assistant helping a user understand their receipt.

Receipt details:
Vendor: ${latestPass.vendor}
Date: ${latestPass.date}
Total: ₹${latestPass.total}
Category: ${latestPass.category}
Items: 
${latestPass.items.map(i => `- ${i.name}: ₹${i.price}`).join('\n')}

User question: "${userQuestion}"

Answer in a helpful and clear way.
`;

  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const answer = await response.text();
    res.json({ answer });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Failed to get response from Gemini." });
  }
});

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
    const rawCategory = response.text().trim();

    // Try to extract just the category using a RegEx
    let categoryOnly = rawCategory.match(/\b(Grocery|Restaurant|Electronics|Clothing|Pharmacy|Transport|Fuel|Hotel|Entertainment|Books|Utilities|Cafe|Bakery|Other)\b/i);
    categoryOnly = categoryOnly ? categoryOnly[0] : 'Other';
             

    // Now sanitize the category for use in the classId
    const normalizedCategory = categoryOnly.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    // 3. Extract structured data
    const structuredData = extractBillFields(text, categoryOnly);
    let rawDate = structuredData.date; 
    // If date is missing, use today's date as fallback
    if (!rawDate) {
    const today = new Date();
    rawDate = today.toLocaleDateString('en-GB').replace(/[^0-9]/g, ''); // e.g., 27072025
    }
    const formattedDate = rawDate?.replace(/[^0-9]/g, ''); 

    const issuerId = '3388000000022973999'; 
    // const normalizedCategory = structuredData.category.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const classId = `${issuerId}.receipt_${normalizedCategory}_${formattedDate}`;
    const objectId = `${issuerId}.receipt-${Date.now()}`;

    // Step 1: Ensure class exists
    // await createGenericClass(classId);
    await ensureGenericClassExists(classId, issuerId);

    // Step 2: Create Wallet pass for this receipt
    const walletObject = await createGenericObject(structuredData, objectId, classId);

    // Step 3: Create save link
    const saveUrl = generateSaveUrl(walletObject);

    // Clean up
    fs.unlinkSync(imagePath);

    latestPass = structuredData;

    res.json({ ...structuredData, saveUrl });
  } catch (err) {
    console.error("Error in /process:", err);
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
});

/**
 * Checks if a class exists. If not, it creates it.
 * @param {string} classId - The ID of the class to create.
 * @param {string} issuerId - Your Google Wallet Issuer ID.
 */


async function ensureGenericClassExists(classId, issuerId) {
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const url = `https://walletobjects.googleapis.com/walletobjects/v1/genericClass/${classId}`;

  try {
    // Try to GET the class first.
    console.log(`Checking for class: ${classId}`);
    await axios.get(url, {
      headers: { Authorization: `Bearer ${token.token}` }
    });
    console.log("Class already exists.");

  } catch (err) {
    // If we get a 404 Not Found, we need to create the class.
    if (err.response?.status === 404) {
      console.log("Class not found, creating it...");
      const createUrl = 'https://walletobjects.googleapis.com/walletobjects/v1/genericClass';
      const payload = {
        id: classId
        // classTemplateInfo: {
        //     cardTemplateOverride: {
        //         cardRowTemplateInfos: [{
        //             twoItems: {
        //                 startItem: {
        //                     firstValue: {
        //                         fields: [{
        //                             fieldPath: "object.textModulesData['details'].header"
        //                         }]
        //                     }
        //                 },
        //                 endItem: {
        //                     firstValue: {
        //                         fields: [{
        //                             fieldPath: "object.textModulesData['details'].body"
        //                         }]
        //                     }
        //                 }
        //             }
        //         }]
        //     }
        // }
      };
      
      try {
        await axios.post(createUrl, payload, {
          headers: { Authorization: `Bearer ${token.token}` }
        });
        console.log("Class created successfully:", classId);
      } catch (createErr) {
        console.error("Error creating class:", createErr.response?.data || createErr.message);
        throw new Error("Failed to create the necessary Wallet class.");
      }
    } else {
      // For any other error (like 403 Forbidden), re-throw it to stop the process.
      console.error("Error checking for class:", err.response?.data || err.message);
      throw new Error("Could not verify the Wallet class.");
    }
  }
}

/**
 * Creates a generic object (a single receipt pass).
 * @param {object} structuredData - The parsed data from the receipt.
 * @param {string} objectId - The unique ID for this object.
 * @param {string} classId - The class ID this object belongs to.
 * @returns {object} The created wallet object from the API.
 */
async function createGenericObject(structuredData, objectId, classId) {
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  console.log("Creating generic object...");

  // The body is a single string with newlines for formatting.
  const receiptDetails = [
    `Vendor: ${structuredData.vendor}`,
    `Date: ${structuredData.date}`,
    `Total: ₹${structuredData.total}`,
    '', // Blank line for spacing
    '--- Items ---',
    ...structuredData.items.map(i => `${i.name}: ₹${i.price}`)
  ].join('\n');

  const payload = {
    id: objectId,
    classId: classId,
    genericType: 'GENERIC_TYPE_UNSPECIFIED',
    reviewStatus: 'underReview',
    hexBackgroundColor: '#4285f4',
    logo: {
        sourceUri: {
            uri: 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg'
        }
    },
    cardTitle: {
        defaultValue: {
            language: 'en',
            value: `Receipt from ${structuredData.vendor}`
        }
    },
    header: {
        defaultValue: {
            language: 'en',
            value: structuredData.category
        }
    },
    "barcode": {
    "type": "QR_CODE",
    "value": objectId
    },
    textModulesData: [{
      id: 'details',
      header: 'RECEIPT DETAILS',
      body: receiptDetails
    }]
  };

  const url = 'https://walletobjects.googleapis.com/walletobjects/v1/genericObject';

  try {
        const response = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token.token}` },
    timeout: 15000 // wait up to 15 seconds
    });
    console.log("Generic object created successfully.");
    return response.data;
  } catch (err) {
    console.error("Error creating generic object:", err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    throw new Error("Failed to create the Google Wallet pass.");
  }
}

/**
 * Generates the "Save to Google Wallet" URL.
 * @param {object} object - The wallet object that was created.
 * @returns {string} The save URL.
 */
const jwt = require('jsonwebtoken');

function generateSaveUrl(object) {
  const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  const payload = {
    iss: serviceAccount.client_email,
    aud: 'google',
    typ: 'savetowallet',
    payload: {
      genericObjects: [object],
    },
  };

  const token = jwt.sign(payload, serviceAccount.private_key, {
    algorithm: 'RS256',
    header: {
      kid: serviceAccount.private_key_id,
      typ: 'JWT',
      alg: 'RS256',
    },
  });

  return `https://pay.google.com/gp/v/save/${token}`;
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
