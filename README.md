#  Project Raseed: Smart Receipt Management with Google Wallet

Welcome to **Project Raseed** — a web app that transforms paper receipts into smart, categorized digital passes in your **Google Wallet**!  
Upload a photo of your bill, extract key details using Google Cloud Vision, get it **AI-categorized** by Gemini, and **store it neatly** as a Wallet Pass.  
It's like turning every bill into a mini-financial assistant — with personality.

---

## Features

- Upload a receipt image
- Extract text using **Google Cloud Vision API**
- Categorize using **Gemini Pro (Generative AI)**
- Generate and save the receipt as a **Google Wallet Pass**
- Ask questions about your receipts in multiple languages (English, Hindi, Kannada, Tamil, Telugu)

---

## Tech Stack

**Frontend:**
- HTML, CSS (with custom styles)
- JavaScript (Vanilla)
  
**Backend:**
- Node.js + Express
- `@google-cloud/vision` for OCR
- `@google/generative-ai` for Gemini categorization
- `google-auth-library`, `axios`, and `jsonwebtoken` for Wallet Pass creation

**Google Technologies Used:**
- **Google Cloud Vision API** – Extracts text from receipts
- **Gemini Pro** – Categorizes and chats about receipts
- **Google Wallet API** – Generates wallet passes
- **Firebase/Firestore** *(optional for extension)* – Store user passes and insights

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/project-raseed.git
cd project-raseed

2. Install Dependencies
cd server
npm install

3. Set Up Google Cloud Credentials
Enable the following APIs on your Google Cloud Project:

Vision API
Google Wallet API
Gemini API
Download the service account key JSON file.
Place it in your server/ folder.

4. Create a .env file in server/

GOOGLE_APPLICATION_CREDENTIALS=your-service-account.json
GEMINI_API_KEY=your-gemini-api-key
PORT=3000

5. Run the backend
node server.js

6. Open the Frontend
Navigate to http://localhost:3000 and start uploading receipts!

**Folder Structure**

├── public/              # Frontend
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── Images/
├── server/              # Backend
│   ├── server.js
│   ├── .env
│   └── service-account.json
|   ├── uploads/
```

**Future Add-ons**

Weekly/monthly spend filters
Charts & graphs (D3.js or Chart.js)
Firebase login + receipt history
Budgeting insights and reminders
