import Anthropic from '@anthropic-ai/sdk'
import { getWeather } from 'src/services/weather/weather'
import { db } from 'src/lib/db'
import { searchGoogleProduct } from 'src/services/google/google'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

    // Get weather data
    const weatherData = await getWeather(locationData)

    // Get clothing suggestions
    const clothingResponse = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Given the current weather conditions: ${weatherData.main.temp}°F, feels like ${weatherData.main.feels_like}°F, ${weatherData.weather[0].description}, ${weatherData.main.humidity}% humidity.

  Please suggest appropriate clothing items in the following JSON format:
  {
    "footwear": "string",
    "top": "string",
    "bottom": "string",
    "accessories": "string",
    "wildcard1": "string",
    "wildcard2": "string"
  }

  Make suggestions practical and specific to the weather conditions.`,
        },
      ],
    })

    const clothingDescriptions = JSON.parse(clothingResponse.content[0].text)

    // Fetch Google Shopping products for each clothing item in parallel
    const [
      footwear,
      top,
      bottom,
      accessories,
      wildcard1,
      wildcard2
    ] = await Promise.all([
      searchGoogleProduct(clothingDescriptions.footwear),
      searchGoogleProduct(clothingDescriptions.top),
      searchGoogleProduct(clothingDescriptions.bottom),
      searchGoogleProduct(clothingDescriptions.accessories),
      searchGoogleProduct(clothingDescriptions.wildcard1),
      searchGoogleProduct(clothingDescriptions.wildcard2),
    ])

    const clothingSuggestions = {
      footwear: {
        recommendation: clothingDescriptions.footwear,
        ...footwear,
      },
      top: {
        recommendation: clothingDescriptions.top,
        ...top,
      },
      bottom: {
        recommendation: clothingDescriptions.bottom,
        ...bottom,
      },
      accessories: {
        recommendation: clothingDescriptions.accessories,
        ...accessories,
      },
      wildcard1: {
        recommendation: clothingDescriptions.wildcard1,
        ...wildcard1,
      },
      wildcard2: {
        recommendation: clothingDescriptions.wildcard2,
        ...wildcard2,
      },
    }

    // Store the search in the database
    await db.query.create({
      data: {
        message,
        location: locationData.place_name,
        temperature: weatherData.main.temp,
        conditions: weatherData.weather[0].description,
        clothing: clothingSuggestions,
      },
    })

    return {
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
      clothing: clothingSuggestions,
    }
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
