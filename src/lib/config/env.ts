import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_SITE_NAME: z.string().default('FlavorNest'),
  NEXT_PUBLIC_SITE_DOMAIN: z.string().default('flavornest.xyz'),
  
  // Cloudflare D1 Database
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_D1_DATABASE_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),

  // Cloudflare R2 Storage
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default('flavornest-media'),
  NEXT_PUBLIC_R2_PUBLIC_URL: z.string().default('https://images.flavornest.xyz'),

  // AI Content Pipeline
  AI_PROVIDER: z.enum(['openai', 'anthropic', 'google', 'mock']).default('mock'),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),

  // FLUX Image Generation Provider
  IMAGE_GEN_PROVIDER: z.enum(['bfl', 'replicate', 'fal', 'mock']).default('mock'),
  FLUX_API_KEY: z.string().optional(),
  FLUX_API_ENDPOINT: z.string().default('https://api.bfl.ml/v1/flux-pro-1.1'),

  // Future Pinterest API
  PINTEREST_APP_ID: z.string().optional(),
  PINTEREST_APP_SECRET: z.string().optional(),
  PINTEREST_REFRESH_TOKEN: z.string().optional(),

  // Admin Security Secret
  ADMIN_API_SECRET_KEY: z.string().default('dev_placeholder_secret_flavor_nest'),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = (() => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.warn('⚠️ Environment schema warning (using defaults for development):', parsed.error.format());
    return envSchema.parse({});
  }
  return parsed.data;
})();
