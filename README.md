# FlavorNest.xyz — Production Recipe Content Platform

> **Simple Recipes. Big Flavor.**  
> A high-performance, Pinterest-first and Bing-SEO optimized food editorial publication designed for sustainable organic traffic, affiliate monetization, and scale from 50 to 500+ recipes.

---

## 🍳 Project Overview

**FlavorNest.xyz** is built with Next.js App Router, TypeScript, and Tailwind CSS, tailored for Cloudflare Pages/Workers, Cloudflare D1 (relational data), and Cloudflare R2 (optimized WebP media storage).

### Key Architectural Pillars
- **Zero SaaS / Heavy Bloat**: High-speed, server-rendered static pages with minimal client JS overhead.
- **Pinterest-First**: Integrated 2:3 vertical aspect ratios, automated rich pin schema, native Pinterest hover save buttons, and high-intent keyword strategies.
- **Bing & Google Technical SEO**: Comprehensive `schema.org/Recipe` (with ISO-8601 durations and nutrition), `BreadcrumbList`, `WebSite`, OpenGraph, Twitter Cards, semantic HTML5, dynamic XML sitemaps, and robots.txt.
- **Modular 7-Angle Editorial Taxonomy**: Content and taxonomy engineered for distinct user intents:
  1. *Quick & Easy*
  2. *Comfort Food*
  3. *Budget Friendly*
  4. *Family Favorite*
  5. *Beginner Friendly*
  6. *Meal Prep*
  7. *Seasonal / Occasion*
- **Decoupled AI & FLUX Image Pipelines**: Abstracted behind clean TypeScript provider interfaces (`src/lib/ai/` and `src/lib/images/`), allowing swapping between Black Forest Labs FLUX, Replicate, Fal, OpenAI, Anthropic, or Gemini without modifying UI components or database schemas.

---

## 🗂️ Project Structure

```
├── src/
│   ├── app/                               # Next.js App Router
│   │   ├── (site pages)/
│   │   │   ├── page.tsx                   # Editorial Home Showcase
│   │   │   ├── recipes/page.tsx           # Recipe Index Catalog
│   │   │   ├── recipes/[slug]/page.tsx    # Recipe Detail Page (Schema.org Recipe JSON-LD)
│   │   │   ├── category/[slug]/page.tsx   # Category Landing Page
│   │   │   ├── about/page.tsx             # Editorial Policy & Pillars
│   │   │   ├── contact/page.tsx           # Contact & Business Inquiries
│   │   │   ├── privacy/page.tsx           # Privacy Policy
│   │   │   ├── terms/page.tsx             # Terms of Service
│   │   │   └── disclaimer/page.tsx        # Recipe & Nutritional Disclaimer
│   │   ├── layout.tsx                     # Root Layout (Google Fonts + WebSite JSON-LD)
│   │   ├── not-found.tsx                  # 404 Recovery Screen
│   │   ├── error.tsx                      # Client Error Boundary
│   │   ├── loading.tsx                    # Skeleton Loader
│   │   ├── global-error.tsx               # Root Fatal Error Boundary
│   │   ├── robots.ts                      # Dynamic Robots.txt
│   │   ├── sitemap.ts                     # Dynamic XML Sitemap
│   │   └── globals.css                    # FlavorNest Editorial Design System
│   ├── components/
│   │   ├── ui/                            # Badges, Buttons, Cards, Inputs
│   │   ├── layout/                        # Header, Footer, Container, Breadcrumbs, MobileNav
│   │   ├── recipe/                        # RecipeCard, RecipeBadges, RecipeMetaBar
│   │   └── common/                        # OptimizedImage, PinterestSaveButton
│   └── lib/
│       ├── config/                        # site.config, categories.config, env.ts
│       ├── types/                         # Recipe, Category, Editorial, Image, Pinterest, Job
│       ├── db/                            # D1 Client, Schema SQL, Migrations
│       ├── r2/                            # R2 Client, Key Naming Conventions
│       ├── ai/                            # AI Pipeline Interfaces & Mock Services
│       ├── images/                        # FLUX API Provider & Mock Provider
│       ├── pinterest/                     # Pinterest Metadata & Creative Services
│       ├── seo/                           # Metadata Builder, JSON-LD Schema Generators
│       └── utils/                         # Classnames, Slugifiers, Time & Date Formatters
├── .env.example                           # Documented Environment Variables Template
├── tailwind.config.ts                     # FlavorNest Warm Editorial Color Palette & Tokens
├── next.config.ts                         # Next.js Config & Security Headers
└── tsconfig.json                          # Strict TypeScript Configuration
```

---

## 🎨 Design System Tokens

- **Brand Primary (Spiced Terracotta)**: `#C85A32` (hover `#96381E`)
- **Editorial Surface (Linen / Buttermilk)**: `#FAF7F2` (card `#FFFFFF`, border `#EAE1D5`)
- **Editorial Typography**:
  - Headings & Editorial Titles: `Playfair Display`, `Georgia`, `serif`
  - Body & Recipe Cards: `Inter`, `-apple-system`, `sans-serif`
- **Accents**:
  - Sage Herb: `#4A6B53` (Quick & Easy / Dietary)
  - Amber Honey: `#D9822B` (Comfort Food / Cooking Times)
  - Berry Jam: `#8A2846` (Seasonal / Desserts)
  - Pinterest Red: `#E60023`

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` for development:

```bash
# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=FlavorNest
NEXT_PUBLIC_SITE_DOMAIN=flavornest.xyz

# Cloudflare D1 Database
CLOUDFLARE_ACCOUNT_ID=placeholder
CLOUDFLARE_D1_DATABASE_ID=placeholder
CLOUDFLARE_API_TOKEN=placeholder

# Cloudflare R2 Storage (Media)
R2_BUCKET_NAME=flavornest-media
NEXT_PUBLIC_R2_PUBLIC_URL=https://images.flavornest.xyz

# AI Recipe Content Pipeline
AI_PROVIDER=mock # Options: openai, anthropic, google, mock
OPENAI_API_KEY=placeholder

# FLUX Image Generation
IMAGE_GEN_PROVIDER=mock # Options: bfl, replicate, fal, mock
FLUX_API_KEY=placeholder
FLUX_API_ENDPOINT=https://api.bfl.ml/v1/flux-pro-1.1

# Pinterest
PINTEREST_APP_ID=placeholder
PINTEREST_APP_SECRET=placeholder
```

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Build for production
npm run build
```

---

## 📋 Roadmap & Future Phases

- **Phase 0 (Completed)**: Project foundation, design tokens, layout shell, type contracts, D1 database schema, R2 conventions, AI/FLUX provider abstractions, Pinterest interfaces, and SEO structured data.
- **Phase 1**: Recipe ingestion & HTML/JSON-LD extraction engine from external URLs.
- **Phase 2**: AI Recipe DNA analyzer & editorial writer (7 angles) + FLUX image generation & R2 WebP pipeline.
- **Phase 3**: Pinterest automated creative generator & Pin publishing workflow.
- **Phase 4**: Production Cloudflare D1 binding, full-text search, and admin review dashboard.
