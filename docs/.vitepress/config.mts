import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "CSHS: Bot Docs",
  description: "Various documentation for Discord bots",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Important Pages', link: '/table-of-bots' }
    ],

    sidebar: [
      {
        text: 'Important',
        items: [
          { text: 'Table of Bots', link: '/table-of-bots' },
          { text: 'Credits & Contributions', link: '/contributions' }
        ],
      },
      {
        text: 'Library',
        items: [
          { text: 'Overview', link: 'bots/overview' },
          {
            text: 'Jeremy',
            items: [
              { text: 'Index', link: 'bots/jeremy/main' },
              { text: 'API', link: 'bots/jeremy/api' }
            ],
          },
        ],
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/love-buggedd/discord' }
    ]
  }
})
