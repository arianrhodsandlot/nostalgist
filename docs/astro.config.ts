import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

const badge = { text: 'advanced' } as const

export default defineConfig({
  integrations: [
    starlight({
      components: {
        PageTitle: './src/components/page-title.astro',
      },
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/arianrhodsandlot/nostalgist/edit/main/docs/',
      },
      favicon: '/favicon.png',
      head: [
        { attrs: { content: 'website', property: 'og:type' }, tag: 'meta' },
        { attrs: { content: 'https://nostalgist.js.org/', property: 'og:url' }, tag: 'meta' },
        { attrs: { content: 'Nostalgist.js', property: 'og:title' }, tag: 'meta' },
        {
          attrs: {
            content:
              'Nostalgist.js is a JavaScript library that allows you to run emulators of retro consoles within web browsers.',
            property: 'og:description',
          },
          tag: 'meta',
        },
        { attrs: { content: 'https://nostalgist.js.org/thumbnail.png', property: 'og:image' }, tag: 'meta' },

        { attrs: { content: 'summary_large_image', name: 'twitter:card' }, tag: 'meta' },
        { attrs: { content: 'https://nostalgist.js.org/', name: 'twitter:url' }, tag: 'meta' },
        { attrs: { content: 'Nostalgist.js', name: 'twitter:title' }, tag: 'meta' },
        {
          attrs: {
            content:
              'Nostalgist.js is a JavaScript library that allows you to run emulators of retro consoles within web browsers.',
            name: 'twitter:description',
          },
          tag: 'meta',
        },
        { attrs: { content: 'https://nostalgist.js.org/thumbnail.png', name: 'twitter:image' }, tag: 'meta' },
        { attrs: { content: '@arianrhodsand', name: 'twitter:site' }, tag: 'meta' },
        { attrs: { content: '@arianrhodsand', name: 'twitter:creator' }, tag: 'meta' },
        { attrs: { async: true, src: 'https://unpkg.com/nostalgist/dist/nostalgist.umd.js' }, tag: 'script' },
        { attrs: { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-E6387HS8V0' }, tag: 'script' },
        {
          content: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-E6387HS8V0');
          `.trim(),
          tag: 'script',
        },
      ],
      logo: { replacesTitle: true, src: './src/assets/logo.png' },
      sidebar: [
        {
          items: [
            { label: 'Home', link: '/' },
            { label: 'Getting Started', link: '/guides/getting-started' },
            { label: 'Under the Hood', link: '/guides/under-the-hood' },
            { label: 'Related', link: '/guides/related' },
          ],
          label: 'Guides',
        },
        {
          items: [
            {
              items: [
                { label: 'launch', link: '/apis/launch' },
                { label: 'configure', link: '/apis/configure' },
                { label: 'prepare', link: '/apis/prepare' },
                { label: 'nes', link: '/apis/nes' },
                { label: 'snes', link: '/apis/snes' },
                { label: 'megadrive', link: '/apis/megadrive' },
                { label: 'gb', link: '/apis/gb' },
                { label: 'gbc', link: '/apis/gbc' },
                { label: 'gba', link: '/apis/gba' },
                { badge, label: 'resetToDefault', link: '/apis/reset-to-default' },
              ],
              label: 'Static Methods',
            },
            {
              items: [
                { label: 'saveState', link: '/apis/save-state' },
                { label: 'loadState', link: '/apis/load-state' },
                { label: 'saveSRAM', link: '/apis/save-sram' },
                { label: 'start', link: '/apis/start' },
                { label: 'restart', link: '/apis/restart' },
                { label: 'pause', link: '/apis/pause' },
                { label: 'resume', link: '/apis/resume' },
                { label: 'exit', link: '/apis/exit' },
                { label: 'resize', link: '/apis/resize' },
                { label: 'press', link: '/apis/press' },
                { label: 'screenshot', link: '/apis/screenshot' },

                { badge, label: 'getCanvas', link: '/apis/get-canvas' },
                { badge, label: 'getEmscripten', link: '/apis/get-emscripten' },
                { badge, label: 'getEmscriptenAL', link: '/apis/get-emscripten-al' },
                { badge, label: 'getEmscriptenFS', link: '/apis/get-emscripten-fs' },
                { badge, label: 'getEmscriptenModule', link: '/apis/get-emscripten-module' },
                { badge, label: 'launchEmulator', link: '/apis/launch-emulator' },
                { badge, label: 'pressDown', link: '/apis/press-down' },
                { badge, label: 'pressUp', link: '/apis/press-up' },
                { badge, label: 'sendCommand', link: '/apis/send-command' },
              ],
              label: 'Instance Methods',
            },
          ],
          label: 'APIs',
        },
      ],
      social: {
        github: 'https://github.com/arianrhodsandlot/nostalgist',
      },
      tableOfContents: {
        maxHeadingLevel: 6,
      },
      title: 'Nostialgist.js',
    }),
  ],
})
