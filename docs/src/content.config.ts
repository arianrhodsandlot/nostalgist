import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'
import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'

export const collections = {
  docs: defineCollection({
    loader: glob({ base: './src/content/docs', pattern: '**/*.md*' }),
    schema: docsSchema(),
  }),
  i18n: defineCollection({
    loader: glob({ base: './src/content/i18n', pattern: '**/*.json' }),
    schema: i18nSchema(),
  }),
}
