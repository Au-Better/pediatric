import {defineField, defineType} from 'sanity'

/**
 * Site settings: one document with the text that the whole site shares.
 * It is a singleton, so it is always edited at the same document ID.
 */

export default defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site name',
      type: 'string',
      initialValue: 'Au Better',
    }),
    defineField({
      name: 'splashHeadline',
      title: 'Splash headline',
      type: 'string',
      initialValue: 'Hey there!',
    }),
    defineField({
      name: 'splashIntro',
      title: 'Splash intro',
      description: 'Write "better" in lowercase to style it on the splash page.',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'medicalButtonLabel',
      title: 'Medical professional button',
      type: 'string',
      initialValue: 'Medical professional',
    }),
    defineField({
      name: 'familyButtonLabel',
      title: 'Family button',
      type: 'string',
      initialValue: 'Parent, family member, or patient',
    }),
    defineField({
      name: 'showInSearchEngines',
      title: 'Show the site in search engines',
      description:
        'Off: Google and other search engines are asked not to list any page. Turn this on and publish when the site is ready to launch. Changes reach the live site within a few minutes.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
