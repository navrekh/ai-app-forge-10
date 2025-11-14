#!/usr/bin/env node

/**
 * Generate Version Script
 * Automatically creates version.json with build metadata
 */

const fs = require('fs');
const path = require('path');

function generateVersion() {
  const now = new Date();
  
  const version = {
    version: process.env.npm_package_version || '1.0.0',
    buildTime: now.toISOString(),
    buildDate: now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    buildNumber: now.getTime(),
    gitCommit: process.env.GIT_COMMIT || 'local',
    gitBranch: process.env.GIT_BRANCH || 'main',
    environment: process.env.NODE_ENV || 'production',
  };

  const outputDir = path.join(process.cwd(), 'public');
  const outputFile = path.join(outputDir, 'version.json');

  // Ensure public directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write version.json
  fs.writeFileSync(outputFile, JSON.stringify(version, null, 2));

  console.log('✅ Version file generated:');
  console.log(JSON.stringify(version, null, 2));
  console.log(`📁 Output: ${outputFile}`);
}

// Run
try {
  generateVersion();
  process.exit(0);
} catch (error) {
  console.error('❌ Failed to generate version:', error);
  process.exit(1);
}
