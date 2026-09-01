import { RecipeEditorialAngle } from './recipe';

export interface EditorialStyleConfig {
  id: RecipeEditorialAngle;
  title: string;
  tagline: string;
  description: string;
  targetAudience: string;
  toneKeywords: string[];
  badgeColorClass: string;
  accentBgClass: string;
}

export interface EditorialAngleAnalysis {
  recommendedAngle: RecipeEditorialAngle;
  confidenceScore: number;
  reasoning: string;
  secondaryAngles: RecipeEditorialAngle[];
}
