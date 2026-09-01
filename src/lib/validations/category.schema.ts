import { z } from 'zod';

export const CategoryFormSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  heroImage: z.string().url().optional().or(z.literal('')),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  status: z.enum(['active', 'archived']).default('active'),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;
