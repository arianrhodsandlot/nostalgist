import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'
// @ts-expect-error virtual module
import { defineCollection } from 'astro:content'

export const collections = {
  docs: defineCollection({ schema: docsSchema() }),
  i18n: defineCollection({ schema: i18nSchema(), type: 'data' }),
}
