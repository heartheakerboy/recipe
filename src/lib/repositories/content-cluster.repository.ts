import {
  ContentCluster,
  ClusterRecipeMember,
  ContentOpportunity,
  RecipeBrief,
  RecipeGenerationJob,
} from '../types/content-cluster';

declare global {
  var __FLAVORNEST_CONTENT_CLUSTERS__: ContentCluster[] | undefined;
  var __FLAVORNEST_CLUSTER_MEMBERS__: ClusterRecipeMember[] | undefined;
  var __FLAVORNEST_CONTENT_OPPORTUNITIES__: ContentOpportunity[] | undefined;
  var __FLAVORNEST_RECIPE_BRIEFS__: RecipeBrief[] | undefined;
  var __FLAVORNEST_GENERATION_JOBS__: RecipeGenerationJob[] | undefined;
}

const SEED_CLUSTERS: ContentCluster[] = [
  {
    id: 'cluster_30min_skillet',
    name: '30-Minute Weeknight Skillet Dinners',
    slug: '30-minute-skillet-dinners',
    description: 'Quick, high-heat one-pan meals designed for busy families seeking big flavor with minimal cleanup.',
    primaryTopic: 'Skillet Dinners',
    status: 'active',
    priority: 'high',
    recipeCount: 3,
    targetCount: 5,
    coveragePct: 60,
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'cluster_creamy_pastas',
    name: 'Creamy Comfort Pastas',
    slug: 'creamy-comfort-pastas',
    description: 'Indulgent, velvety Italian-American pasta creations featuring rich garlic cream and sun-dried tomatoes.',
    primaryTopic: 'Comfort Pasta',
    status: 'active',
    priority: 'high',
    recipeCount: 2,
    targetCount: 4,
    coveragePct: 50,
    createdAt: '2026-08-22T10:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'cluster_air_fryer_crispy',
    name: 'Crispy Air Fryer Favorites',
    slug: 'crispy-air-fryer-favorites',
    description: 'Crispy, healthier alternatives to deep-fried comfort dishes using modern air-fry convection.',
    primaryTopic: 'Air Fryer',
    status: 'planned',
    priority: 'medium',
    recipeCount: 1,
    targetCount: 4,
    coveragePct: 25,
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
  },
];

const SEED_MEMBERS: ClusterRecipeMember[] = [
  {
    clusterId: 'cluster_30min_skillet',
    recipeId: 'rec_creamy_garlic_chicken_01',
    recipeTitle: 'Creamy Garlic Butter Tuscan Chicken',
    recipeSlug: 'creamy-garlic-butter-tuscan-chicken',
    role: 'primary',
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    clusterId: 'cluster_30min_skillet',
    recipeId: 'rec_garlic_shrimp_01',
    recipeTitle: 'Easy 20-Minute Garlic Butter Shrimp Skillet',
    recipeSlug: 'easy-20-minute-garlic-butter-shrimp-skillet',
    role: 'supporting',
    createdAt: '2026-08-22T10:00:00Z',
  },
  {
    clusterId: 'cluster_creamy_pastas',
    recipeId: 'rec_tomato_gnocchi_01',
    recipeTitle: 'One-Pan Creamy Sun-Dried Tomato Gnocchi',
    recipeSlug: 'one-pan-creamy-sun-dried-tomato-gnocchi',
    role: 'primary',
    createdAt: '2026-08-24T10:00:00Z',
  },
];

const SEED_OPPORTUNITIES: ContentOpportunity[] = [
  {
    id: 'opp_lemon_herb_chicken',
    topic: 'One-Pan Lemon Herb Chicken Thighs',
    type: 'cluster_expansion',
    clusterId: 'cluster_30min_skillet',
    clusterName: '30-Minute Weeknight Skillet Dinners',
    priority: 'high',
    scoreBreakdown: {
      search: 85,
      pinterest: 90,
      contentGap: 80,
      audience: 75,
      duplicationPenalty: 5,
      totalScore: 88,
    },
    reason: 'Strong Pinterest CTR for citrus marinades & gaps in bright, non-cream skillet proteins.',
    recommendation: 'Draft brief focusing on crispy skin and a bright lemon-thyme pan reduction.',
    status: 'open',
    createdAt: '2026-08-30T10:00:00Z',
  },
  {
    id: 'opp_cajun_sausage_pasta',
    topic: 'Creamy Cajun Sausage & Bell Pepper Penne',
    type: 'cluster_expansion',
    clusterId: 'cluster_creamy_pastas',
    clusterName: 'Creamy Comfort Pastas',
    priority: 'high',
    scoreBreakdown: {
      search: 80,
      pinterest: 85,
      contentGap: 75,
      audience: 80,
      duplicationPenalty: 10,
      totalScore: 82,
    },
    reason: 'Search demand for spicy cream sauces is high; Tuscan Chicken cluster needs a spicy counterpart.',
    recommendation: 'Position as a 25-minute weeknight comfort dinner with smoked sausage.',
    status: 'open',
    createdAt: '2026-08-31T14:00:00Z',
  },
  {
    id: 'opp_honey_garlic_salmon',
    topic: 'Crispy Honey Garlic Glazed Salmon Skillet',
    type: 'missing_recipe_type',
    clusterId: 'cluster_30min_skillet',
    clusterName: '30-Minute Weeknight Skillet Dinners',
    priority: 'medium',
    scoreBreakdown: {
      search: 75,
      pinterest: 70,
      contentGap: 90,
      audience: 70,
      duplicationPenalty: 5,
      totalScore: 78,
    },
    reason: 'Seafood category currently only features shrimp; salmon provides high commercial RPM.',
    recommendation: 'Create simple 15-minute sticky honey-soy pan glaze.',
    status: 'planned',
    createdAt: '2026-09-01T08:00:00Z',
  },
];

const SEED_JOBS: RecipeGenerationJob[] = [
  {
    id: 'job_lemon_herb_chicken_01',
    concept: 'Crispy One-Pan Lemon Herb Chicken Thighs',
    briefId: 'brief_01',
    clusterId: 'cluster_30min_skillet',
    status: 'review',
    title: 'Crispy One-Pan Lemon Herb Chicken Thighs',
    slug: 'crispy-one-pan-lemon-herb-chicken-thighs',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    totalTimeMinutes: 30,
    ingredients: [
      '4 bone-in, skin-on chicken thighs',
      '2 tbsp olive oil',
      '1 fresh lemon, sliced into rounds',
      '4 cloves garlic, smashed',
      '1 tbsp fresh rosemary, minced',
      '1 tsp dried oregano',
      '1/2 cup low-sodium chicken broth',
      'Salt and freshly cracked black pepper',
    ],
    instructions: [
      'Pat chicken thighs thoroughly dry with paper towels; season generously on both sides with salt, pepper, and dried oregano.',
      'Heat olive oil in a large cast-iron skillet over medium-high heat until shimmering.',
      'Place chicken thighs skin-side down; sear undisturbed for 7-8 minutes until the skin is deeply golden and shatteringly crisp.',
      'Flip chicken, scatter smashed garlic, lemon slices, and rosemary into the skillet, and pour in chicken broth.',
      'Simmer for 10-12 minutes until chicken reaches an internal temperature of 165°F and pan juices are slightly reduced. Serve immediately.',
    ],
    consistencyCheck: {
      valid: true,
      warnings: [],
    },
    imageStatus: 'generated',
    seoStatus: 'audited',
    createdAt: '2026-09-01T11:00:00Z',
  },
];

export class ContentClusterRepository {
  async listClusters(): Promise<ContentCluster[]> {
    if (!global.__FLAVORNEST_CONTENT_CLUSTERS__) {
      global.__FLAVORNEST_CONTENT_CLUSTERS__ = [...SEED_CLUSTERS];
    }
    return global.__FLAVORNEST_CONTENT_CLUSTERS__;
  }

  async getClusterById(id: string): Promise<ContentCluster | null> {
    const list = await this.listClusters();
    return list.find((c) => c.id === id) || null;
  }

  async listClusterMembers(clusterId: string): Promise<ClusterRecipeMember[]> {
    if (!global.__FLAVORNEST_CLUSTER_MEMBERS__) {
      global.__FLAVORNEST_CLUSTER_MEMBERS__ = [...SEED_MEMBERS];
    }
    return global.__FLAVORNEST_CLUSTER_MEMBERS__.filter((m) => m.clusterId === clusterId);
  }

  async listOpportunities(): Promise<ContentOpportunity[]> {
    if (!global.__FLAVORNEST_CONTENT_OPPORTUNITIES__) {
      global.__FLAVORNEST_CONTENT_OPPORTUNITIES__ = [...SEED_OPPORTUNITIES];
    }
    return global.__FLAVORNEST_CONTENT_OPPORTUNITIES__;
  }

  async listJobs(): Promise<RecipeGenerationJob[]> {
    if (!global.__FLAVORNEST_GENERATION_JOBS__) {
      global.__FLAVORNEST_GENERATION_JOBS__ = [...SEED_JOBS];
    }
    return global.__FLAVORNEST_GENERATION_JOBS__;
  }

  async createCluster(data: Omit<ContentCluster, 'id' | 'recipeCount' | 'coveragePct' | 'createdAt' | 'updatedAt'>): Promise<ContentCluster> {
    const list = await this.listClusters();
    const now = new Date().toISOString();
    const newCluster: ContentCluster = {
      ...data,
      id: `cluster_${Date.now()}`,
      recipeCount: 0,
      coveragePct: 0,
      createdAt: now,
      updatedAt: now,
    };
    list.push(newCluster);
    return newCluster;
  }

  async updateJobStatus(jobId: string, status: RecipeGenerationJob['status']): Promise<boolean> {
    const jobs = await this.listJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return false;
    job.status = status;
    return true;
  }
}

export const contentClusterRepository = new ContentClusterRepository();
