-- Migration 0001: Initial FlavorNest Schema
-- Target: Cloudflare D1 (SQLite engine)

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

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  introduction TEXT NOT NULL,
  ingredients_json TEXT NOT NULL,
  instructions_json TEXT NOT NULL,
  prep_time_minutes INTEGER NOT NULL,
  cook_time_minutes INTEGER NOT NULL,
  total_time_minutes INTEGER NOT NULL,
  servings INTEGER NOT NULL,
  servings_unit TEXT DEFAULT 'servings',
  difficulty TEXT NOT NULL,
  cuisine TEXT,
  meal_type TEXT NOT NULL,
  cooking_method TEXT NOT NULL,
  primary_category_slug TEXT NOT NULL,
  category_slugs_json TEXT NOT NULL,
  tags_json TEXT,
  hero_image_url TEXT NOT NULL,
  hero_image_r2_key TEXT NOT NULL,
  hero_image_alt TEXT NOT NULL,
  hero_image_width INTEGER DEFAULT 1200,
  hero_image_height INTEGER DEFAULT 900,
  recipe_card_data_json TEXT,
  nutrition_json TEXT,
  faq_json TEXT,
  editorial_style TEXT NOT NULL,
  source_url TEXT,
  source_metadata_json TEXT,
  seo_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME
);

CREATE TABLE IF NOT EXISTS recipe_tags (
  recipe_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (recipe_id, tag_id)
);

CREATE TABLE IF NOT EXISTS recipe_images (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  r2_key TEXT UNIQUE NOT NULL,
  cdn_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  format TEXT NOT NULL,
  role TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  prompt_used TEXT,
  provider TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pinterest_creatives (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  image_id TEXT,
  pin_title TEXT NOT NULL,
  pin_description TEXT NOT NULL,
  pin_keywords_json TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  creative_style TEXT NOT NULL,
  suggested_boards_json TEXT,
  status TEXT DEFAULT 'draft',
  published_pin_id TEXT,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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
