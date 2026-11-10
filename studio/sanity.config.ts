import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {codeInput} from '@sanity/code-input'
import {presentationTool} from 'sanity/presentation'
import {schemaTypes} from './src/schemaTypes'

// Written in directly (not read from a .env file) so the deployed Studio always opens this project.
const projectId = 'w0vz3r6z'
const dataset = 'production'

// Presentation Preview URL
const previewUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:4321'

export default defineConfig({
  name: 'sanity-template-astro-clean',
  title: 'Au Better',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Site settings is a single document, so it opens directly instead of as a list.
            S.listItem()
              .title('Site settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.documentTypeListItem('page').title('Pages'),
          ]),
    }),
    presentationTool({previewUrl}),
    visionTool(),
    codeInput(),
  ],
  schema: {types: schemaTypes},
})
