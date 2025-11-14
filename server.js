const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// In-Memory Build Store
const buildStore = {};

// POST /api/build/start
// Accepts: { projectName, prompt, screens }
// Returns: { buildId, status }
app.post("/api/build/start", (req, res) => {
  try {
    const { projectName, prompt, screens } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: "Invalid request", 
        message: "prompt is required and must be a string" 
      });
    }

    const buildId = crypto.randomUUID();

    buildStore[buildId] = {
      status: "building",
      progress: 0,
      prompt: prompt,
      projectName: projectName || "My App",
      screens: screens || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    console.log(`[BUILD STARTED] ID: ${buildId}, Project: ${projectName}`);

    // Simulate build progress
    let progress = 0;
    const interval = setInterval(() => {
      if (!buildStore[buildId]) {
        clearInterval(interval);
        return;
      }

      if (progress >= 100) {
        buildStore[buildId].status = "completed";
        buildStore[buildId].progress = 100;
        buildStore[buildId].updatedAt = Date.now();
        console.log(`[BUILD COMPLETED] ID: ${buildId}`);
        clearInterval(interval);
      } else {
        progress += 20;
        buildStore[buildId].progress = progress;
        buildStore[buildId].updatedAt = Date.now();
        console.log(`[BUILD PROGRESS] ID: ${buildId}, Progress: ${progress}%`);
      }
    }, 1000);

    return res.json({
      buildId,
      status: "started"
    });
  } catch (error) {
    console.error('[BUILD START ERROR]', error);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error.message 
    });
  }
});

// GET /api/build-status/:buildId
// Returns: { status, progress }
app.get("/api/build-status/:buildId", (req, res) => {
  try {
    const id = req.params.buildId;
    const build = buildStore[id];

    if (!build) {
      console.log(`[BUILD NOT FOUND] ID: ${id}`);
      return res.status(404).json({ 
        error: "build_not_found",
        message: "Build ID does not exist"
      });
    }

    return res.json({
      status: build.status,
      progress: build.progress,
      projectName: build.projectName,
      updatedAt: build.updatedAt
    });
  } catch (error) {
    console.error('[BUILD STATUS ERROR]', error);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error.message 
    });
  }
});

// POST /api/build-apk
// Placeholder for APK build functionality
app.post("/api/build-apk", (req, res) => {
  try {
    const { appHistoryId, platform } = req.body;
    
    console.log('[APK BUILD REQUEST]', { appHistoryId, platform });
    
    // Generate a mock build ID for APK
    const buildId = crypto.randomUUID();
    
    buildStore[buildId] = {
      status: "pending",
      progress: 0,
      platform: platform || "android",
      appHistoryId,
      createdAt: Date.now()
    };

    return res.json({
      buildId,
      status: "pending",
      message: "APK build started (placeholder implementation)"
    });
  } catch (error) {
    console.error('[APK BUILD ERROR]', error);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error.message 
    });
  }
});

// Optional: Serve static frontend if it exists
const frontendDir = path.join(__dirname, "mobiledev-frontend", "build");

if (fs.existsSync(frontendDir)) {
  console.log(`[STATIC] Serving frontend from ${frontendDir}`);
  app.use(express.static(frontendDir));
  
  // Catch-all route for SPA
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
  });
} else {
  console.log(`[STATIC] Frontend directory not found: ${frontendDir}`);
  
  // Fallback route
  app.get("*", (req, res) => {
    res.status(404).json({ 
      error: "Not found",
      message: "API endpoint or static file not found"
    });
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
