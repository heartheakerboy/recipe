import { z } from 'zod';

export const TagFormSchema = z.object({
  name: z.string().min(2, 'Tag name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
});

export type TagFormValues = z.infer<typeof TagFormSchema>;
