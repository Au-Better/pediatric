import blockContent from './objects/blockContent'
import page from './documents/page'
import seo from './objects/seo'
import siteSettings from './documents/siteSettings'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/schema-types

export const schemaTypes = [page, siteSettings, blockContent, seo]
