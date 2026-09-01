-- Migration 0002: Cloudflare D1 Extensions & Indexes for FlavorNest.xyz
-- Version: 2.0.0
-- Target: Cloudflare D1 / SQLite

-- 1. Extend Categories with Hierarchical Parent Support
ALTER TABLE categories ADD COLUMN parent_id TEXT;
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- 2. Recipe Categories (Many-to-Many junction)
CREATE TABLE IF NOT EXISTS recipe_categories (
  recipe_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (recipe_id, category_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_recipe_categories_cat ON recipe_categories(category_id);

-- 3. Standalone Images Table (R2 Metadata Reference)
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  recipe_id TEXT,
  type TEXT NOT NULL DEFAULT 'hero',      -- hero | secondary | step | pinterest | thumbnail
  r2_key TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 1200,
  height INTEGER NOT NULL DEFAULT 800,
  format TEXT NOT NULL DEFAULT 'webp',    -- webp | avif | jpeg | png
  alt_text TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'uploaded', -- uploaded | generated | licensed
  source_url TEXT,
  generation_provider TEXT,               -- bfl | replicate | fal
  generation_model TEXT,
  generation_prompt TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_images_recipe_type ON images(recipe_id, type);

-- 4. SEO Metadata Table
CREATE TABLE IF NOT EXISTS seo_metadata (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,              -- recipe | category | page
  entity_id TEXT NOT NULL,
  seo_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_seo_entity ON seo_metadata(entity_type, entity_id);

-- 5. AI Jobs Table
CREATE TABLE IF NOT EXISTS ai_jobs (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,              -- recipe | category
  entity_id TEXT,
  job_type TEXT NOT NULL,                 -- extraction | normalization | dna_analysis | editorial_generation | seo_generation | image_generation
  status TEXT NOT NULL DEFAULT 'queued',  -- queued | processing | completed | failed | cancelled
  provider TEXT,
  model TEXT,
  input_reference TEXT,
  output_reference TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_jobs(status, created_at DESC);

-- 6. Subscribers Table (Audience Retention)
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',  -- active | unsubscribed
  source TEXT NOT NULL DEFAULT 'recipe_page',
  consent_status INTEGER NOT NULL DEFAULT 1,
  consent_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  preferences_json TEXT,
  unsubscribe_token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers(unsubscribe_token);

-- 7. Newsletter Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  preview_text TEXT,
  recipe_ids_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',   -- draft | scheduled | sending | sent
  scheduled_at DATETIME,
  sent_at DATETIME,
  recipient_count INTEGER DEFAULT 0,
  open_rate REAL DEFAULT 0.0,
  click_rate REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
