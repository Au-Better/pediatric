/**
 * Sanity CLI Configuration
 * This file configures the Sanity CLI tool with project-specific settings
 * and customizes the Vite bundler configuration.
 * Learn more: https://www.sanity.io/docs/cli
 */

import {defineCliConfig} from 'sanity/cli'

// Written in directly (not read from a .env file) so every deploy uses the same project.
// These values are public: they already appear in the website's code.
const projectId = 'w0vz3r6z'
const dataset = 'production'

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  deployment: {
    autoUpdates: true,
  },
  // The Studio's web address: https://aubetter.sanity.studio
  studioHost: 'aubetter',
})
