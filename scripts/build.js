import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function patchNextJsForCloudflare() {
  try {
    const fileLoggerPath = path.resolve('node_modules/next/dist/server/dev/browser-logs/file-logger.js');
    if (fs.existsSync(fileLoggerPath)) {
      const stub = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileLogger {
  initialize() {}
  logServer() {}
  logClient() {}
  destroy() {}
  formatTimestamp() { return ""; }
}
const logger = new FileLogger();
function getFileLogger() { return logger; }
function test__resetFileLogger() {}
exports.FileLogger = FileLogger;
exports.getFileLogger = getFileLogger;
exports.test__resetFileLogger = test__resetFileLogger;
`;
      fs.writeFileSync(fileLoggerPath, stub, 'utf8');
      console.log('✓ Patched Next.js file-logger for Cloudflare Workers');
    }

    const consoleFilePath = path.resolve('node_modules/next/dist/server/node-environment-extensions/console-file.js');
    if (fs.existsSync(consoleFilePath)) {
      const stub = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
`;
      fs.writeFileSync(consoleFilePath, stub, 'utf8');
      console.log('✓ Patched Next.js console-file for Cloudflare Workers');
    }
  } catch (err) {
    console.warn('Warning: Could not patch Next.js internals:', err.message);
  }
}

// Run patches before building
patchNextJsForCloudflare();

const env = {
  ...process.env,
  NODE_ENV: 'production',
};

if (process.env.OPEN_NEXT_BUILD) {
  // Inside OpenNext: build Next.js application in production mode
  execSync('npx next build', { stdio: 'inherit', env });
} else {
  // Triggered by CI/npm run build: build OpenNext Cloudflare bundle
  const openNextEnv = { ...env, OPEN_NEXT_BUILD: 'true' };
  execSync('npx @opennextjs/cloudflare build', { stdio: 'inherit', env: openNextEnv });
}
