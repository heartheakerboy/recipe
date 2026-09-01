import { PinterestCreativeStyle } from '../types/pinterest';

export interface PinterestTemplateDefinition {
  id: PinterestCreativeStyle;
  name: string;
  description: string;
  badge: string;
  aspectRatio: '2:3';
  textPosition: 'top' | 'center' | 'bottom' | 'split';
  supportsCollage: boolean;
}

export const PINTEREST_TEMPLATES: Record<PinterestCreativeStyle, PinterestTemplateDefinition> = {
  'template-a-hero': {
    id: 'template-a-hero',
    name: 'Template A — Hero Food',
    description: 'Full-bleed food photography with a top floating title badge and subtle branding mark',
    badge: 'Hero Image Focus',
    aspectRatio: '2:3',
    textPosition: 'top',
    supportsCollage: false,
  },
  'template-b-editorial': {
    id: 'template-b-editorial',
    name: 'Template B — Editorial Magazine',
    description: 'Refined serif typography banner on a textured background with hero plate centerpiece',
    badge: 'Editorial Typography',
    aspectRatio: '2:3',
    textPosition: 'center',
    supportsCollage: false,
  },
  'template-c-recipe-focus': {
    id: 'template-c-recipe-focus',
    name: 'Template C — Recipe Focus Callout',
    description: 'Large food visual with high-visibility badge callouts (e.g. 30 Minutes, One-Pan)',
    badge: 'Badge Callouts',
    aspectRatio: '2:3',
    textPosition: 'top',
    supportsCollage: false,
  },
  'template-d-collage': {
    id: 'template-d-collage',
    name: 'Template D — Multi-Shot Collage',
    description: 'Three-panel layout featuring the plated hero dish and two detail process insets',
    badge: 'Multi-Image Insets',
    aspectRatio: '2:3',
    textPosition: 'split',
    supportsCollage: true,
  },
  'template-e-minimal': {
    id: 'template-e-minimal',
    name: 'Template E — Clean Minimal',
    description: 'Ultra-clean layout with restrained lower-third caption bar and maximum food prominence',
    badge: 'Minimal Lower-Third',
    aspectRatio: '2:3',
    textPosition: 'bottom',
    supportsCollage: false,
  },
};
