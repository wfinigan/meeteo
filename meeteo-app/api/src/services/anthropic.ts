import Anthropic from '@anthropic-ai/sdk'
import fetch from 'cross-fetch'

import { context } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'
import { searchGoogleProduct } from 'src/services/google/google'
import { createSubmission } from 'src/services/submissions/submissions'
import { getWeather } from 'src/services/weather/weather'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const UNSPLASH_API_ENDPOINT = 'https://api.unsplash.com/search/photos'
const DUMMY_IMAGE_URL =
  'https://images.quince.com/5MyyAmmPODiCEOcLBtUJto/1f712d93c1acf0e6b0476ed18277fed5/W-JKT-3-BRN_0582.jpg?w=1600&q=50&h=2000&fm=webp&reqOrigin=website-ssg'

const getUnsplashSearchTerm = async (description: string) => {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Write a search term for unsplash to find images inspired by the description. Be as specific as possible and try to get unsplash to give clothing results only. Respond with just the search term, no explanation or quotes.

Description: ${description}`,
        },
      ],
    })
    return response.content[0].text.trim()
  } catch (error) {
    console.error('Error getting Unsplash search term:', error)
    return description
  }
}

// Function to get Unsplash image
const getImageUrl = async (description: string) => {
  try {
    const searchTerm = await getUnsplashSearchTerm(description)
    console.log(`Original description: ${description}`)
    console.log(`Unsplash search term: ${searchTerm}`)

    const response = await fetch(
      `${UNSPLASH_API_ENDPOINT}?query=${encodeURIComponent(searchTerm)}&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Unsplash API error:', response.statusText)
      return {
        image: DUMMY_IMAGE_URL,
        photographer: 'Unknown',
        photographerUrl: '#',
        imageId: '',
      }
    }

    const data = await response.json()
    const photo = data.results?.[0]

    if (!photo) {
      return {
        image: DUMMY_IMAGE_URL,
        photographer: 'Unknown',
        photographerUrl: '#',
        imageId: '',
      }
    }

    return {
      image: photo.urls.regular,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      imageId: photo.id,
    }
  } catch (error) {
    console.error('Unsplash API error:', error)
    return {
      image: DUMMY_IMAGE_URL,
      photographer: 'Unknown',
      photographerUrl: '#',
      imageId: '',
    }
  }
}

export const sendMessage = async ({ message }: { message: string }) => {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Extract the intended location from this description. Respond ONLY with a JSON object in the format {place_name: string, lat: number, lon: number}. If multiple valid interpretations exist, choose the most likely one.

  Example input: "often world champs and home of the school that's better than yale"
  Example output: {"place_name": "Cambridge, MA", "lat": 42.3601, "lon": -71.0589}

  Input: ${message}`,
        },
      ],
    })

    const locationData = JSON.parse(response.content[0].text)
    const weatherData = await getWeather(locationData)
    const mappedWeatherData = {
      temp: weatherData.main.temp,
      feels_like: weatherData.main.feels_like,
      humidity: weatherData.main.humidity,
      description: weatherData.weather[0].description,
    }

    const clothingDescriptionsResponse = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Given the current weather conditions: ${mappedWeatherData.temp}°F, feels like ${mappedWeatherData.feels_like}°F, ${mappedWeatherData.description}, ${mappedWeatherData.humidity}% humidity.

  Suggest appropriate clothing items. Format response as a JSON object:
  {
    "footwear": "description of recommended footwear",
    "top": "description of recommended top",
    "bottom": "description of recommended bottom",
    "accessories": "description of recommended accessories",
    "wildcard1": "description of another weather-appropriate item",
    "wildcard2": "description of another weather-appropriate item"
  }

  Make suggestions practical and specific to the weather conditions.`,
        },
      ],
    })

    const clothingDescriptions = JSON.parse(
      clothingDescriptionsResponse.content[0].text
    )

    // Fetch both Google Shopping products and Unsplash images in parallel
    const [
      footwear,
      top,
      bottom,
      accessories,
      wildcard1,
      wildcard2,
      footwearImg,
      topImg,
      bottomImg,
      accessoriesImg,
      wildcard1Img,
      wildcard2Img,
    ] = await Promise.all([
      searchGoogleProduct(clothingDescriptions.footwear),
      searchGoogleProduct(clothingDescriptions.top),
      searchGoogleProduct(clothingDescriptions.bottom),
      searchGoogleProduct(clothingDescriptions.accessories),
      searchGoogleProduct(clothingDescriptions.wildcard1),
      searchGoogleProduct(clothingDescriptions.wildcard2),
      getImageUrl(clothingDescriptions.footwear),
      getImageUrl(clothingDescriptions.top),
      getImageUrl(clothingDescriptions.bottom),
      getImageUrl(clothingDescriptions.accessories),
      getImageUrl(clothingDescriptions.wildcard1),
      getImageUrl(clothingDescriptions.wildcard2),
    ])

    const result = {
      location: {
        place_name: locationData.place_name,
        lat: locationData.lat,
        lon: locationData.lon,
      },
      weather: {
        temp: weatherData.main.temp,
        feels_like: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        description: weatherData.weather[0].description,
      },
      clothing: {
        footwear: {
          recommendation: clothingDescriptions.footwear,
          ...footwear,
          image: footwearImg.image,
          photographer: footwearImg.photographer,
          photographerUrl: footwearImg.photographerUrl,
          imageId: footwearImg.imageId,
        },
        top: {
          recommendation: clothingDescriptions.top,
          ...top,
          image: topImg.image,
          photographer: topImg.photographer,
          photographerUrl: topImg.photographerUrl,
          imageId: topImg.imageId,
        },
        bottom: {
          recommendation: clothingDescriptions.bottom,
          ...bottom,
          image: bottomImg.image,
          photographer: bottomImg.photographer,
          photographerUrl: bottomImg.photographerUrl,
          imageId: bottomImg.imageId,
        },
        accessories: {
          recommendation: clothingDescriptions.accessories,
          ...accessories,
          image: accessoriesImg.image,
          photographer: accessoriesImg.photographer,
          photographerUrl: accessoriesImg.photographerUrl,
          imageId: accessoriesImg.imageId,
        },
        wildcard1: {
          recommendation: clothingDescriptions.wildcard1,
          ...wildcard1,
          image: wildcard1Img.image,
          photographer: wildcard1Img.photographer,
          photographerUrl: wildcard1Img.photographerUrl,
          imageId: wildcard1Img.imageId,
        },
        wildcard2: {
          recommendation: clothingDescriptions.wildcard2,
          ...wildcard2,
          image: wildcard2Img.image,
          photographer: wildcard2Img.photographer,
          photographerUrl: wildcard2Img.photographerUrl,
          imageId: wildcard2Img.imageId,
        },
      },
    }

    // Create submission if user is authenticated
    if (context.currentUser?.sub) {
      try {
        await createSubmission({
          location: locationData.place_name,
          weather: {
            temp: weatherData.main.temp,
            feels_like: weatherData.main.feels_like,
            humidity: weatherData.main.humidity,
            description: weatherData.weather[0].description,
          },
          clothing: result.clothing,
        })
      } catch (error) {
        console.error('Error creating submission:', error)
      }
    }

    return result
  } catch (error) {
    console.error('Error in sendMessage:', error)
    throw error
  }
}
