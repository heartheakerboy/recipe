-- =============================================================================
-- FlavorNest.xyz Cloudflare D1 Relational Database Schema
-- =============================================================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  hero_image_url TEXT,
  icon_name TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 2. Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- 3. Recipes Table
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  introduction TEXT NOT NULL,
  ingredients_json TEXT NOT NULL,       -- Array of RecipeIngredient
  instructions_json TEXT NOT NULL,      -- Array of RecipeInstruction
  prep_time_minutes INTEGER NOT NULL,
  cook_time_minutes INTEGER NOT NULL,
  total_time_minutes INTEGER NOT NULL,
  servings INTEGER NOT NULL,
  servings_unit TEXT DEFAULT 'servings',
  difficulty TEXT NOT NULL,             -- easy | medium | hard
  cuisine TEXT,
  meal_type TEXT NOT NULL,              -- dinner | lunch | breakfast | dessert | snack
  cooking_method TEXT NOT NULL,         -- stovetop | baking | air-fryer | slow-cooker | one-pot
  primary_category_slug TEXT NOT NULL,
  category_slugs_json TEXT NOT NULL,    -- Array of strings
  tags_json TEXT,                       -- Array of strings
  hero_image_url TEXT NOT NULL,
  hero_image_r2_key TEXT NOT NULL,
  hero_image_alt TEXT NOT NULL,
  hero_image_width INTEGER DEFAULT 1200,
  hero_image_height INTEGER DEFAULT 900,
  recipe_card_data_json TEXT,          -- Chef tips, storage, reheat, variations
  nutrition_json TEXT,                  -- Calories, macros
  faq_json TEXT,                        -- Array of FAQ items
  editorial_style TEXT NOT NULL,        -- quick-easy | comfort-food | budget-friendly etc.
  source_url TEXT,
  source_metadata_json TEXT,
  seo_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | in_review | published | archived
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_recipes_slug ON recipes(slug);
CREATE INDEX IF NOT EXISTS idx_recipes_status_published ON recipes(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_primary_category ON recipes(primary_category_slug);
CREATE INDEX IF NOT EXISTS idx_recipes_editorial_style ON recipes(editorial_style);

-- 4. Recipe to Tag Junction
CREATE TABLE IF NOT EXISTS recipe_tags (
  recipe_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (recipe_id, tag_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 5. Media & Images Table (R2 References)
CREATE TABLE IF NOT EXISTS recipe_images (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  r2_key TEXT UNIQUE NOT NULL,
  cdn_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  format TEXT NOT NULL,                 -- webp | avif | jpeg
  role TEXT NOT NULL,                   -- hero | secondary | step | pin_vertical | social_square
  aspect_ratio TEXT NOT NULL,
  prompt_used TEXT,
  provider TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recipe_images_recipe_role ON recipe_images(recipe_id, role);

-- 6. Pinterest Creatives & Metadata
CREATE TABLE IF NOT EXISTS pinterest_creatives (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  image_id TEXT,
  pin_title TEXT NOT NULL,
  pin_description TEXT NOT NULL,
  pin_keywords_json TEXT NOT NULL,      -- Array of high-intent search keywords
  destination_url TEXT NOT NULL,
  creative_style TEXT NOT NULL,
  suggested_boards_json TEXT,
  status TEXT DEFAULT 'draft',          -- draft | ready | scheduled | published
  published_pin_id TEXT,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id) REFERENCES recipe_images(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pinterest_recipe ON pinterest_creatives(recipe_id);
CREATE INDEX IF NOT EXISTS idx_pinterest_status ON pinterest_creatives(status);

-- 7. Content Pipeline Jobs (Audit Trail & Status)
CREATE TABLE IF NOT EXISTS content_jobs (
  id TEXT PRIMARY KEY,
  recipe_id TEXT,
  source_url TEXT,
  current_stage TEXT NOT NULL,
  status TEXT NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  error_message TEXT,
  stage_history_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_jobs_status ON content_jobs(status, created_at DESC);
