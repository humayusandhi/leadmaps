// LeadMap AI — Universal Production Server Entry for Hostinger Web Apps
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname);
const webDir = path.resolve(rootDir, 'apps/web');

// Add all possible node_modules paths in monorepo to Node module resolution
const possiblePaths = [
  path.join(rootDir, 'node_modules'),
  path.join(webDir, 'node_modules'),
  path.join(rootDir, '.next/standalone/node_modules'),
  path.join(rootDir, '.next/standalone/apps/web/node_modules'),
  path.join(webDir, '.next/standalone/node_modules'),
  path.join(webDir, '.next/standalone/apps/web/node_modules')
];

for (const p of possiblePaths) {
  if (fs.existsSync(p) && !module.paths.includes(p)) {
    module.paths.unshift(p);
  }
}

// Check if standalone server is present
const standaloneServer = path.join(rootDir, '.next/standalone/apps/web/server.js');
const fallbackStandalone = path.join(webDir, '.next/standalone/apps/web/server.js');

if (fs.existsSync(standaloneServer)) {
  console.log('> Starting Next.js via Standalone Server:', standaloneServer);
  require(standaloneServer);
} else if (fs.existsSync(fallbackStandalone)) {
  console.log('> Starting Next.js via Fallback Standalone Server:', fallbackStandalone);
  require(fallbackStandalone);
} else {
  console.log('> Starting Next.js via apps/web/server.js');
  require(path.join(webDir, 'server.js'));
}
