import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON payload limits to support base64 images for Google Lens
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// In-memory syncing database with fallback persistence to a local JSON file
const SYNC_FILE = path.join(process.cwd(), "dashboard_sync_store.json");
let syncStore: Record<string, { config: any; updatedAt: string }> = {};

// Load sync data on startup if it exists
try {
  if (fs.existsSync(SYNC_FILE)) {
    const raw = fs.readFileSync(SYNC_FILE, "utf-8");
    syncStore = JSON.parse(raw);
    console.log(`Loaded ${Object.keys(syncStore).length} active sync configurations.`);
  }
} catch (err) {
  console.error("Failed to load persistence sync file:", err);
}

// Function to save sync database
function persistSyncStore() {
  try {
    fs.writeFileSync(SYNC_FILE, JSON.stringify(syncStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist sync file:", err);
  }
}

// Lazy initializer for Google Gen AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the server's environment. Please add it via the Secrets panel.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

/* ==========================================================================
   API ENDPOINTS
   ========================================================================== */

// 1. Ask Google / Gemini AI Assistant Endpoint
app.post("/api/gemini/ask", async (req, res) => {
  try {
    const { prompt, history } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const ai = getAIClient();
    
    // Model configuration
    const model = "gemini-2.5-flash";

    // Format chat history for the modern SDK if provided
    let contents: any[] = [];
    if (history && Array.isArray(history)) {
      contents = history.map((item: any) => ({
        role: item.role === "model" ? "model" : "user",
        parts: [{ text: item.parts?.[0]?.text || item.text || "" }]
      }));
    }
    
    // Add the current prompt
    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    // Generate content using the modern SDK
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: "You are the smart companion built directly into the Chrome Dashboard New Tab page. Be conversational, direct, and concise in your answers. Format your output nicely in clean Markdown. Help the user optimize their daily workspace."
      }
    });

    const replyText = response.text || "No response received from the model.";
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: error.message || "An error occurred with Gemini Assistant",
      isConfigError: !process.env.GEMINI_API_KEY
    });
  }
});

// 2. Google Lens Multi-modal Endpoint (Analyze Uploaded Images)
app.post("/api/gemini/lens", async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: "Image base64 data is required" });
      return;
    }

    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const actualMimeType = mimeType || "image/jpeg";

    // Modern SDK structured multimodal call
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            mimeType: actualMimeType,
            data: cleanBase64
          }
        },
        {
          text: prompt || "Analyze this image. Identify what it is, describe key details, and provide search queries or context relevant to this object."
        }
      ],
      config: {
        systemInstruction: "You are Google Lens integrated directly into Chrome Dashboard. Analyze the image accurately, identify objects, translate text if visible, write clear bulleted context, and suggest 3 highly specific related search keywords at the bottom."
      }
    });

    const replyText = response.text || "Unable to analyze image.";
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Google Lens API Error:", error);
    res.status(500).json({ 
      error: error.message || "Google Lens failed to process the image",
      isConfigError: !process.env.GEMINI_API_KEY
    });
  }
});

// 3. Device Auto-sync: Create/Register Sync Code
app.post("/api/sync/register", (req, res) => {
  const code = "SYNC-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  syncStore[code] = {
    config: req.body.config || {},
    updatedAt: new Date().toISOString()
  };
  persistSyncStore();
  res.json({ success: true, syncCode: code });
});

// 4. Device Auto-sync: Pull Config
app.get("/api/sync/get/:syncCode", (req, res) => {
  const code = req.params.syncCode?.toUpperCase();
  if (!code || !syncStore[code]) {
    res.status(404).json({ error: "Sync Code not found or expired" });
    return;
  }
  res.json({ success: true, config: syncStore[code].config, updatedAt: syncStore[code].updatedAt });
});

// 5. Device Auto-sync: Push/Update Config
app.post("/api/sync/update", (req, res) => {
  const { syncCode, config } = req.body;
  if (!syncCode) {
    res.status(400).json({ error: "Sync Code is required" });
    return;
  }
  const code = syncCode.toUpperCase();
  syncStore[code] = {
    config: config || {},
    updatedAt: new Date().toISOString()
  };
  persistSyncStore();
  res.json({ success: true, syncCode: code, message: "Sync complete across device cloud" });
});


/* ==========================================================================
   VITE & STATIC ASSET HANDLERS
   ========================================================================== */

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Chrome Dashboard server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
