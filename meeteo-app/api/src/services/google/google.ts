import { fetch } from 'cross-fetch'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID

const cleanProductTitle = (title: string) => {
  return (
    title
      // Remove truncation ellipsis and anything after
      .split('...')[0]
      // Remove common separators and anything after
      .split(' - ')[0]
      .split(' | ')[0]
      .split(',')[0]
      // Remove common product specs
      .replace(/\([^)]*\)/g, '')
      // Remove extra whitespace
      .trim()
  )
}

export const searchGoogleProduct = async (query: string) => {
  try {
    const url =
      `https://www.googleapis.com/customsearch/v1?` +
      `key=${GOOGLE_API_KEY}` +
      `&cx=${GOOGLE_SEARCH_ENGINE_ID}` +
      `&q=${encodeURIComponent(query)}` +
      `&num=1`

    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        `Google API error: ${data.error?.message || response.statusText}`
      )
    }

    const item = data.items?.[0]

    return {
      productTitle: item?.title
        ? cleanProductTitle(item.title)
        : 'Product unavailable',
      purchaseUrl: item?.link || '#',
    }
  } catch (error) {
    return {
      productTitle: 'Product unavailable',
      purchaseUrl: '#',
    }
  }
}
