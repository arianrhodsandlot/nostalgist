import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'
// @ts-expect-error virtual module
import { defineCollection } from 'astro:content' // eslint-disable-line import/no-unresolved

export const collections = {
  docs: defineCollection({ schema: docsSchema() }),
  i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
}
