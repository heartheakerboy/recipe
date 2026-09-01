import { execSync } from 'child_process';

if (process.env.OPEN_NEXT_BUILD) {
  // Inside OpenNext: build Next.js application
  execSync('npx next build', { stdio: 'inherit', env: process.env });
} else {
  // Triggered by CI/npm run build: build OpenNext Cloudflare bundle
  const env = { ...process.env, OPEN_NEXT_BUILD: 'true' };
  execSync('npx @opennextjs/cloudflare build', { stdio: 'inherit', env });
}
