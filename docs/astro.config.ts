import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

const badge = { text: 'advanced' } as const

export default defineConfig({
  integrations: [
    starlight({
      title: 'Nostialgist.js',
      favicon: '/favicon.png',
      logo: {
        src: './src/assets/logo.png',
        replacesTitle: true,
      },
      social: {
        github: 'https://github.com/arianrhodsandlot/nostalgist',
        twitter: 'https://twitter.com/arianrhodsand',
      },
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/arianrhodsandlot/nostalgist/edit/main/docs/',
      },
      tableOfContents: {
        maxHeadingLevel: 6,
      },
      sidebar: [
        {
          label: 'Guides',
          items: [
            { label: 'Home', link: '/' },
            { label: 'Getting Started', link: '/guides/getting-started' },
            { label: 'Under the Hood', link: '/guides/under-the-hood' },
            { label: 'Related', link: '/guides/related' },
          ],
        },
        {
          label: 'APIs',
          items: [
            {
              label: 'Static Methods',
              items: [
                { label: 'launch', link: '/apis/launch' },
                { label: 'configure', link: '/apis/configure' },
                { label: 'nes', link: '/apis/nes' },
                { label: 'snes', link: '/apis/snes' },
                { label: 'megadrive', link: '/apis/megadrive' },
                { label: 'gb', link: '/apis/gb' },
                { label: 'gbc', link: '/apis/gbc' },
                { label: 'gba', link: '/apis/gba' },
                { label: 'resetToDefault', link: '/apis/reset-to-default', badge },
              ],
            },
            {
              label: 'Instance Methods',
              items: [
                { label: 'saveState', link: '/apis/save-state' },
                { label: 'loadState', link: '/apis/load-state' },
                { label: 'restart', link: '/apis/restart' },
                { label: 'pause', link: '/apis/pause' },
                { label: 'resume', link: '/apis/resume' },
                { label: 'exit', link: '/apis/exit' },
                { label: 'resize', link: '/apis/resize' },
                { label: 'getCanvas', link: '/apis/get-canvas', badge },
                { label: 'launchEmulator', link: '/apis/launch-emulator', badge },
                { label: 'getEmscriptenModule', link: '/apis/get-emscripten-module', badge },
                { label: 'getEmscriptenFS', link: '/apis/get-emscripten-fs', badge },
                { label: 'press', link: '/apis/press', badge },
                { label: 'pressDown', link: '/apis/press-down', badge },
                { label: 'pressUp', link: '/apis/press-up', badge },
              ],
            },
          ],
        },
      ],
      components: {
        PageTitle: './src/components/page-title.astro',
      },
      head: [
        {
          tag: 'script',
          attrs: {
            src: 'https://unpkg.com/nostalgist@0.3.1/dist/nostalgist.umd.js',
            async: true,
          },
        },
        {
          tag: 'script',
          attrs: {
            src: 'https://www.googletagmanager.com/gtag/js?id=G-E6387HS8V0',
            async: true,
          },
        },
        {
          tag: 'script',
          content: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-E6387HS8V0');
          `.trim(),
        },
      ],
    }),
  ],
})
