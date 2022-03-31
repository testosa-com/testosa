// @ts-check
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const lightCodeTheme = require('prism-react-renderer/themes/github');

/** @type {import('@docusaurus/types').Config} */
const config = {
  baseUrl: '/',
  favicon: 'img/favicon.png',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  organizationName: 'testosa',
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js')
        },
        googleAnalytics: {
          anonymizeIP: true,
          trackingID: 'UA-223838638-1'
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],
  projectName: 'testosa', // Usually your repo name.
  tagline: 'Automated API contract testing',
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      footer: {
        copyright: `Copyright © ${new Date().getFullYear()} Testosa`,
        links: [
          {
            items: [
              {
                href: 'https://github.com/testosa-com/testosa/issues',
                label: 'Issue tracker'
              },
              {
                href: 'https://github.com/testosa-com/testosa/blob/master/CHANGELOG.md',
                label: 'Changelog'
              },
              {
                href: 'https://github.com/testosa-com/testosa/blob/master/CONTRIBUTING.md',
                label: 'Contributing'
              }
            ],
            title: 'Project'
          },
          {
            items: [
              {
                href: 'https://swagger.io/specification/',
                label: 'OpenAPI specification'
              },
              {
                href: '/docs/supported-open-api-features/open-api',
                label: 'Supported OpenAPI features'
              }
            ],
            title: 'Resources'
          },
          {
            items: [
              {
                href: 'https://github.com/testosa-com/testosa',
                label: 'GitHub'
              },
              {
                href: 'https://www.npmjs.com/package/testosa',
                label: 'NPM'
              }
            ],
            title: 'More'
          }
        ],
        logo: {
          alt: 'Testosa',
          src: 'img/logo-full-light.png'
        },
        style: 'dark'
      },
      navbar: {
        items: [
          {
            docId: 'introduction/getting-started',
            label: 'Docs',
            position: 'left',
            type: 'doc'
          },
          {
            type: 'docsVersionDropdown'
          },
          {
            href: 'https://github.com/testosa-com/testosa',
            label: 'GitHub',
            position: 'right'
          }
        ],
        logo: {
          alt: 'Testosa',
          src: 'img/logo-icon.png'
        },
        title: 'Testosa'
      },
      prism: {
        darkTheme: darkCodeTheme,
        theme: lightCodeTheme
      }
    }),
  title: 'Testosa',
  url: 'https://testosa.com'
};

module.exports = config;
