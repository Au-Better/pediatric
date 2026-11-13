import {defineField, defineType} from 'sanity'

/**
 * Page schema. Pages form a tree: a page with a parent sits under it, and its
 * web address is built from the parents' slugs, such as /families/learn/vaccines.
 */

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'The last part of the web address, such as "vaccines".',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'parent',
      title: 'Parent page',
      description: 'Leave empty for a top-level page.',
      type: 'reference',
      to: [{type: 'page'}],
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'tool',
      title: 'Interactive tool',
      description:
        'Shows an interactive tool on this page, below the intro. Leave empty for a regular page.',
      type: 'string',
      options: {
        list: [{title: 'Medical careers roadmap', value: 'careersRoadmap'}],
      },
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'menuStyle',
      title: 'Menu button style',
      description:
        "How the buttons to this page's sub-pages look. Leave empty for the standard red buttons in one column.",
      type: 'string',
      options: {
        list: [
          {title: 'Red buttons in one column', value: 'list'},
          {title: 'Red-outlined cream buttons in a two-column grid', value: 'grid'},
        ],
      },
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      parent: 'parent.title',
    },
    prepare({title, parent}) {
      return {title, subtitle: parent ? `Under ${parent}` : 'Top level'}
    },
  },
})
