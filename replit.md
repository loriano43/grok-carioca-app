# 🇧🇷 GROK CARIOCA — Replit Setup Guide

## 🚀 Overview

Grok Carioca is a smart local guide for Rio de Janeiro with:

- 🤖 AI Chat (carioca personality)
- 🗺️ Map (Leaflet / OpenStreetMap)
- 📍 Places list (Firebase)
- ➕ Add new places (form)

This version is simplified to run smoothly on Replit and mobile devices.

---

## ⚙️ Tech Stack

- Node.js (Express)
- Firebase (Firestore)
- Vanilla JS (frontend)
- OpenStreetMap (Leaflet)

---

## 📁 Project Structure

/app
  /server
    index.js
  /client
    index.html
    main.js
package.json
.env

---

## 🔑 Environment Variables

Create a .env file in the root:

PORT=3000

---

## 📦 Install Dependencies

Run:

npm install

---

## ▶️ Run the App

npm start

Server will run at:

http://localhost:3000

---

## 🔌 API Endpoints

GET /api/health  
Response:
{ "status": "ok" }

---

GET /api/places

---

POST /api/places  
Body:
{
  "name": "Nome do local",
  "category": "restaurante",
  "lat": -22.9,
  "lng": -43.2
}

---

## 🗺️ Map (Leaflet)

- Uses OpenStreetMap (free)
- No API key required
- Markers loaded dynamically

---

## 🤖 AI Chat

- Currently mocked (local response)
- Can be integrated later with:
  - OpenAI
  - Replit AI

---

## 🔥 Firebase (Optional)

To enable real database:

1. Go to Firebase Console
2. Create project
3. Enable Firestore
4. Add config in frontend

Example:

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id"
};

---

## ⚠️ Notes

- This version avoids pnpm, monorepo, and complex builds
- Designed to work on mobile + Replit without breaking
- No TypeScript required

---

## 🚀 Future Improvements

- Real AI chat integration
- Authentication (users/business)
- Ranking system
- Image upload for places
- Monetization for businesses

---

## 💡 Goal

Keep it simple, fast, and working.

Then scale.

---

## 🇧🇷 Made with vibe carioca

Grok Carioca is more than an app —  
it’s a digital guide with Brazilian soul.

🔥 Bora pra cima!