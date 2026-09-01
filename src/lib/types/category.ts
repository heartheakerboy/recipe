export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  heroImage?: string;
  iconName?: string;
  sortOrder: number;
  recipeCount?: number;
  featured?: boolean;
}

export type PrimaryCategorySlug =
  | 'quick-and-easy'
  | 'chicken'
  | 'beef'
  | 'pasta'
  | 'breakfast'
  | 'desserts'
  | 'air-fryer'
  | 'slow-cooker'
  | 'one-pot-meals'
  | '30-minute-meals'
  | 'seasonal-recipes';
