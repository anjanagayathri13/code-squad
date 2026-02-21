// ================================
// KrishiSahay Backend - Single File
// Generative AI Powered Agriculture System
// ================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ================================
// OpenAI Configuration
// ================================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ================================
// Offline Knowledge Base
// ================================
const knowledgeBase = [
  {
    keywords: ["wheat", "rust"],
    answer:
      "Wheat rust is a fungal disease. Use resistant varieties and spray Propiconazole 25% EC."
  },
  {
    keywords: ["rice", "fertilizer"],
    answer:
      "For rice crops, apply NPK fertilizer in split doses during tillering and panicle initiation."
  },
  {
    keywords: ["pm kisan", "scheme"],
    answer:
      "PM-KISAN provides ₹6000 per year to eligible farmers in three installments."
  },
  {
    keywords: ["cotton", "pest"],
    answer:
      "Use Neem oil spray or Imidacloprid for cotton pest control."
  },
  {
    keywords: ["maize", "fertilizer"],
    answer:
      "Apply 120:60:40 NPK per hectare for maize in split application."
  }
];

// ================================
// Offline Search Function
// ================================
function searchOffline(query) {
  const lowerQuery = query.toLowerCase();

  for (let item of knowledgeBase) {
    for (let keyword of item.keywords) {
      if (lowerQuery.includes(keyword)) {
        return item.answer;
      }
    }
  }
  return null;
}

// ================================
// Routes
// ================================

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "🌾 KrishiSahay Backend Running Successfully" });
});

// Main Query Route
app.post("/api/query", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    // 1️⃣ Try Offline Knowledge First
    const offlineAnswer = searchOffline(question);

    if (offlineAnswer) {
      return res.json({
        source: "offline",
        answer: offlineAnswer
      });
    }

    // 2️⃣ Use AI if not found offline
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are KrishiSahay AI, an expert agricultural assistant helping farmers with crops, pests, fertilizers, irrigation, and government schemes. Give simple and practical answers."
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    res.json({
      source: "ai",
      answer: response.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ================================
// Start Server
// ================================
app.listen(PORT, () => {
  console.log(`🚜 KrishiSahay Server running on port ${PORT}`);
});