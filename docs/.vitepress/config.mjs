// .vitepress/config.js
// Change to .vitepress/config.mjs or use the format below to ensure ESM compatibility

import { defineConfig } from 'vitepress'

export default defineConfig({
  outDir: './dist',
  appearance: true,
  title: 'Martyrs',
  description: 'Documentation for Martyrs by OZ DAO',
  
  themeConfig: {
    // Nav bar config
    logo: './src/assets/logo.svg',
    siteTitle: 'Martyrs',   
    search: {
      provider: 'local'
    },
    // Links
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Builder', link: '/builder/' },
      { text: 'Modules', link: '/modules/' },
      { text: 'Components', link: '/components/' },
      { text: 'Styles', link: '/styles/' },
    ],
    socialLinks: [ // Добавляем ссылку на GitHub с иконкой
      { icon: 'github', link: 'https://github.com/your-repo' }
    ],
    // Sidebar
    sidebar: {  
      '/guide/': [
        {
          text: 'Introduction',
          collapsible: true,
          items: [
            { text: 'What is Martyrs?', link: '/guide/' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Project Structure', link: '/guide/project-structure' },
          ]
        },
        {
          text: 'Core Concepts',
          collapsible: true,
          items: [
            { text: 'Monorepo Architecture', link: '/guide/architecture' },
            { text: 'Application Modes', link: '/guide/app-modes' },
            { text: 'Module System', link: '/guide/module-system' },
            { text: 'Mobile First Approach', link: '/guide/mobile-first' },
          ]
        },
        {
          text: 'Framework Essentials',
          collapsible: true,
          items: [
            { text: 'Application Setup', link: '/guide/app-setup' },
            { text: 'Routing', link: '/guide/routing' },
            { text: 'State Management', link: '/guide/state-management' },
            { text: 'Module Integration', link: '/guide/module-integration' },
            { text: 'Security & Authentication', link: '/guide/security' },
          ]
        },
        {
          text: 'Development Guide',
          collapsible: true,
          items: [
            { text: 'Creating Modules', link: '/guide/creating-modules' },
            { text: 'Component Usage', link: '/guide/component-usage' },
            { text: 'Server Controllers', link: '/guide/controllers' },
            { text: 'Data Models', link: '/guide/models' },
            { text: 'API Integration', link: '/guide/api-integration' },
            { text: 'Middleware', link: '/guide/middleware' },
          ]
        },
        {
          text: 'Best Practices',
          collapsible: true,
          items: [
            { text: 'Code Organization', link: '/guide/code-organization' },
            { text: 'Performance Optimization', link: '/guide/performance' },
            { text: 'Error Handling', link: '/guide/error-handling' },
            { text: 'Testing', link: '/guide/testing' },
            { text: 'Deployment', link: '/guide/deployment' },
          ]
        }
      ],
      '/styles/': [
        {
          text: 'Style System',
          collapsible: true,
          items: [
            { text: 'Overview', link: '/styles/' },
            { text: 'Design Principles', link: '/styles/principles' },
          ]
        },
        {
          text: 'Foundations',
          collapsible: true,
          items: [
            { text: 'Reset & Normalization', link: '/styles/reset' },
            { text: 'Typography', link: '/styles/typography' },
            { text: 'Color System', link: '/styles/colors' },
            { text: 'Spacing', link: '/styles/spacing' },
            { text: 'Layout', link: '/styles/layout' },
            { text: 'Grid System', link: '/styles/grid' },
            { text: 'Borders & Shadows', link: '/styles/borders' },
            { text: 'Transitions & Animations', link: '/styles/transitions' },
          ]
        },
        {
          text: 'Responsive Design',
          collapsible: true,
          items: [
            { text: 'Breakpoints', link: '/styles/breakpoints' },
            { text: 'Media Queries', link: '/styles/media-queries' },
            { text: 'Mobile-First Approach', link: '/styles/mobile-first' },
          ]
        },
        {
          text: 'Theming',
          collapsible: true,
          items: [
            { text: 'Theme Configuration', link: '/styles/theme-config' },
            { text: 'Dark Mode', link: '/styles/dark-mode' },
            { text: 'Custom Themes', link: '/styles/custom-themes' },
          ]
        },
        {
          text: 'Usage',
          collapsible: true,
          items: [
            { text: 'SCSS Variables', link: '/styles/scss-variables' },
            { text: 'Utility Classes', link: '/styles/utility-classes' },
            { text: 'Using with Components', link: '/styles/with-components' },
          ]
        }
      ],
      '/components/': [
        {
          text: 'Component System',
          collapsible: true,
          items: [
            { text: 'Overview', link: '/components/' },
            { text: 'Component Architecture', link: '/components/architecture' },
            { text: 'Using Components', link: '/components/usage' },
          ]
        },
        {
          text: 'Layout Components',
          collapsible: true,
          items: [
            { text: 'Block', link: '/components/block' },
            { text: 'Card', link: '/components/card' },
            { text: 'Grid', link: '/components/grid' },
            { text: 'Container', link: '/components/container' },
          ]
        },
        {
          text: 'Form Components',
          collapsible: true,
          items: [
            { text: 'Field', link: '/components/field' },
            { text: 'FieldBig', link: '/components/field-big' },
            { text: 'FieldPhone', link: '/components/field-phone' },
            { text: 'FieldTags', link: '/components/field-tags' },
            { text: 'Select', link: '/components/select' },
            { text: 'SelectMulti', link: '/components/select-multi' },
            { text: 'Checkbox', link: '/components/checkbox' },
            { text: 'Radio', link: '/components/radio' },
            { text: 'Button', link: '/components/button' },
            { text: 'ButtonSegmented', link: '/components/button-segmented' },
            { text: 'Search', link: '/components/search' },
            { text: 'DatePicker', link: '/components/date-picker' },
            { text: 'Upload', link: '/components/upload' },
            { text: 'UploadImage', link: '/components/upload-image' },
            { text: 'UploadImageMultiple', link: '/components/upload-image-multiple' },
          ]
        },
        {
          text: 'Display Components',
          collapsible: true,
          items: [
            { text: 'Text', link: '/components/text' },
            { text: 'Loader', link: '/components/loader' },
            { text: 'Status', link: '/components/status' },
            { text: 'StatusBadge', link: '/components/status-badge' },
            { text: 'Completion', link: '/components/completion' },
            { text: 'EmptyState', link: '/components/empty-state' },
            { text: 'Error', link: '/components/error' },
            { text: 'Skeleton', link: '/components/skeleton' },
            { text: 'Spoiler', link: '/components/spoiler' },
            { text: 'Chips', link: '/components/chips' },
            { text: 'Countdown', link: '/components/countdown' },
            { text: 'Marquee', link: '/components/marquee' },
          ]
        },
        {
          text: 'Navigation Components',
          collapsible: true,
          items: [
            { text: 'Menu', link: '/components/menu' },
            { text: 'Breadcrumbs', link: '/components/breadcrumbs' },
            { text: 'Tab', link: '/components/tab' },
            { text: 'Dropdown', link: '/components/dropdown' },
          ]
        },
        {
          text: 'Interactive Components',
          collapsible: true,
          items: [
            { text: 'Popup', link: '/components/popup' },
            { text: 'BottomSheet', link: '/components/bottom-sheet' },
            { text: 'Tooltip', link: '/components/tooltip' },
            { text: 'Draggable', link: '/components/draggable' },
            { text: 'Slider', link: '/components/slider' },
            { text: 'PhotoViewer', link: '/components/photo-viewer' },
            { text: 'EditImages', link: '/components/edit-images' },
          ]
        },
        {
          text: 'Map Components',
          collapsible: true,
          items: [
            { text: 'Map', link: '/components/map' },
            { text: 'LocationMarker', link: '/components/location-marker' },
            { text: 'Address', link: '/components/address' },
          ]
        },
        {
          text: 'Data Display',
          collapsible: true,
          items: [
            { text: 'Table', link: '/components/table' },
            { text: 'Feed', link: '/components/feed' },
            { text: 'Masonry', link: '/components/masonry' },
          ]
        },
        {
          text: 'Media Components',
          collapsible: true,
          items: [
            { text: 'Media', link: '/components/media' },
            { text: 'Shader', link: '/components/shader' },
          ]
        },
      ],
      '/modules/': [
        {
          text: 'Module System',
          collapsible: true,
          items: [
            { text: 'Overview', link: '/modules/' },
            { text: 'Module Architecture', link: '/modules/architecture' },
            { text: 'Creating Custom Modules', link: '/modules/creating-modules' },
            { text: 'Module Integration', link: '/modules/integration' },
          ]
        },
        {
          text: 'Core Modules',
          collapsible: true,
          items: [
            { text: 'Globals', link: '/modules/globals' },
            { text: 'Auth', link: '/modules/auth' },
            { text: 'Files', link: '/modules/files' },
            { text: 'Icons', link: '/modules/icons' },
          ]
        },
        {
          text: 'User & Organization',
          collapsible: true,
          items: [
            { text: 'Organizations', link: '/modules/organizations' },
            { text: 'Memberships', link: '/modules/memberships' },
            { text: 'Invites', link: '/modules/invites' },
            { text: 'Departments', link: '/modules/departments' },
          ]
        },
        {
          text: 'Content Management',
          collapsible: true,
          items: [
            { text: 'Pages', link: '/modules/pages' },
            { text: 'Gallery', link: '/modules/gallery' },
            { text: 'Community', link: '/modules/community' },
            { text: 'Constructor', link: '/modules/constructor' },
            { text: 'Landing', link: '/modules/landing' },
          ]
        },
        {
          text: 'E-commerce',
          collapsible: true,
          items: [
            { text: 'Products', link: '/modules/products' },
            { text: 'Categories', link: '/modules/categories' },
            { text: 'Orders', link: '/modules/orders' },
            { text: 'Marketplace', link: '/modules/marketplace' },
            { text: 'Wallet', link: '/modules/wallet' },
          ]
        },
        {
          text: 'Communication',
          collapsible: true,
          items: [
            { text: 'Chats', link: '/modules/chats' },
            { text: 'Notifications', link: '/modules/notifications' },
          ]
        },
        {
          text: 'Events & Scheduling',
          collapsible: true,
          items: [
            { text: 'Events', link: '/modules/events' },
            { text: 'Rents', link: '/modules/rents' },
          ]
        },
        {
          text: 'Management',
          collapsible: true,
          items: [
            { text: 'Governance', link: '/modules/governance' },
            { text: 'Reports', link: '/modules/reports' },
            { text: 'Spots', link: '/modules/spots' },
            { text: 'Backoffice', link: '/modules/backoffice' },
          ]
        },
        {
          text: 'Integrations',
          collapsible: true,
          items: [
            { text: 'Integrations Overview', link: '/modules/integrations' },
            { text: 'Payment Gateways', link: '/modules/payment-gateways' },
            { text: 'OpenAI', link: '/modules/openai' },
          ]
        },
      ],
      '/builder/': [
        {
          text: 'Builder',
          collapsible: true,
          items: [
            { text: 'Overview', link: '/builder/' },
            { text: 'Configuration', link: '/builder/configuration' },
          ]
        },
        {
          text: 'Build Options',
          collapsible: true,
          items: [
            { text: 'Development Mode', link: '/builder/dev-mode' },
            { text: 'Production Mode', link: '/builder/prod-mode' },
            { text: 'Build Types', link: '/builder/build-types' },
          ]
        },
        {
          text: 'Build Tools',
          collapsible: true,
          items: [
            { text: 'Webpack', link: '/builder/webpack' },
            { text: 'Vite', link: '/builder/vite' },
            { text: 'Rspack', link: '/builder/rspack' },
          ]
        },
        {
          text: 'Development Tools',
          collapsible: true,
          items: [
            { text: 'Hot Reload', link: '/builder/hot-reload' },
            { text: 'Debugging', link: '/builder/debugging' },
          ]
        }
      ],
    },
    footer: {
      message: 'Released under the <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">MIT License</a>.',
      copyright: 'Copyright © 2016-present <a href="https://oz.digital">OZ DAO</a>'
    }
  },
})