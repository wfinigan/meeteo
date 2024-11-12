import Anthropic from '@anthropic-ai/sdk'
import { getWeather } from 'src/services/weather/weather'

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
          content: `Extract the intended US city and state from this description. Respond ONLY with a JSON object in the format {city: string, state: string}. If multiple valid interpretations exist, choose the most likely one.

Example input: "often world champs and home of the school that's better than yale"
Example output: {"city": "Cambridge", "state": "MA"}

Input: ${message}`,
        },
      ],
    })

    const locationData = JSON.parse(response.content[0].text)

    // Get weather data
    const weatherData = await getWeather(locationData)

    return {
      city: locationData.city,
      state: locationData.state,
      weather: {
        temp: weatherData.main.temp,
        feels_like: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        description: weatherData.weather[0].description,
      },
    }
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
