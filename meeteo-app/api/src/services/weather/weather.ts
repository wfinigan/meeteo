import { fetch } from 'cross-fetch'

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

export const getWeather = async ({
  city,
  state,
}: {
  city: string
  state: string
}) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},${state},US&units=imperial&appid=${OPENWEATHER_API_KEY}`
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Weather API Error:', error)
    throw error
  }
}
