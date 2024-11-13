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

// Move this function to the top, before searchGoogleProduct
const getFallbackProduct = (query: string) => {
  const encodedQuery = encodeURIComponent(query)
  return {
    productTitle: `Shop for ${query}`,
    purchaseUrl: `https://www.amazon.com/s?k=${encodedQuery}+clothing`,
  }
}

export const searchGoogleProduct = async (query: string) => {
  try {
    if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
      console.error('Missing Google API credentials')
      return getFallbackProduct(query)
    }

    const url =
      `https://www.googleapis.com/customsearch/v1?` +
      `key=${GOOGLE_API_KEY}` +
      `&cx=${GOOGLE_SEARCH_ENGINE_ID}` +
      `&q=${encodeURIComponent(query + ' clothing buy')}` +
      `&num=1`

    console.log('Searching Google for:', query)
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      if (data.error?.message?.includes('Quota exceeded')) {
        console.log('Google API quota exceeded, using fallback')
        return getFallbackProduct(query)
      }

      console.error('Google API error response:', data)
      throw new Error(
        `Google API error: ${data.error?.message || response.statusText}`
      )
    }

    if (!data.items?.length) {
      console.log('No results found for query:', query)
      return {
        productTitle: 'No products found',
        purchaseUrl: '#',
      }
    }

    const item = data.items[0]
    console.log('Found product:', {
      title: item.title,
      link: item.link,
    })

    return {
      productTitle: item?.title
        ? cleanProductTitle(item.title)
        : 'Product unavailable',
      purchaseUrl: item?.link || '#',
    }
  } catch (error) {
    console.error('Google Shopping search error:', error)
    return getFallbackProduct(query)
  }
}

export const searchGoogleImage = async (query: string) => {
  try {
    const response = await fetch(
      `https://customsearch.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        query
      )}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&key=${
        process.env.GOOGLE_API_KEY
      }&searchType=image&num=1`
    )

    if (!response.ok) {
      throw new Error('Google Image Search API error')
    }

    const data = await response.json()
    return data.items?.[0]
  } catch (error) {
    console.error('Google Image Search error:', error)
    return null
  }
}
