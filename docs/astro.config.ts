import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'Nostialgist.js',
      social: {
        github: 'https://github.com/withastro/starlight',
      },
      sidebar: [
        {
          label: 'Guides',
          items: [
            { label: 'Overview', link: '/guides#overview' },
            { label: 'Getting Started', link: '/guides@getting-started' },
            { label: 'Playground', link: '/guides@getting-started' },
            { label: 'Related Projects', link: '/guides@getting-started' },
          ],
        },
        {
          label: 'APIs',
          items: [
            {
              label: 'Static Methods',
              items: [
                { label: 'launch', link: '/apis#launch' },
                { label: 'nes', link: '/apis#nes' },
                { label: 'snes', link: '/apis#snes' },
                { label: 'megadrive', link: '/apis#megadrive' },
                { label: 'gb', link: '/apis#gb' },
                { label: 'gbc', link: '/apis#gbc' },
                { label: 'gba', link: '/apis#gba' },
                { label: 'configure', link: '/apis#configure' },
              ],
            },
            {
              label: 'Instance Methods',
              items: [
                { label: 'saveState', link: '/apis1#' },
                { label: 'loadState', link: '/apis1#' },
                { label: 'resume', link: '/apis1#' },
                { label: 'pause', link: '/apis1#' },
                { label: 'restart', link: '/apis1#' },
                { label: 'exit', link: '/apis1#' },
                { label: 'resize', link: '/apis1#' },
                { label: 'getOptions', link: '/apis1#', badge: { variant: 'note', text: 'advanced' } },
                { label: 'getEmulator', link: '/apis1#', badge: { variant: 'note', text: 'advanced' } },
                { label: 'getEmulatorOptions', link: '/apis1#', badge: { variant: 'note', text: 'advanced' } },
                { label: 'getCanvas', link: '/apis1#', badge: { variant: 'note', text: 'advanced' } },
                { label: 'launchEmulator', link: '/apis1#', badge: { variant: 'note', text: 'advanced' } },
                { label: 'getEmscriptenModule', link: '/apis1#', badge: { variant: 'note', text: 'advanced' } },
                { label: 'getEmscriptenFS', link: '/apis1#', badge: { variant: 'note', text: 'advanced' } },
              ],
            },
          ],
        },
      ],
    }),
  ],
})
