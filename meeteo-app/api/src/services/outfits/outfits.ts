import { Anthropic } from '@anthropic-ai/sdk'
import sharp from 'sharp'
import type { MutationResolvers } from 'types/graphql'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Add a simple in-memory cache (replace with Redis/DynamoDB for production)
const analysisCache = new Map()

export const initiateAnalysis: MutationResolvers['initiateAnalysis'] = async ({
  input: { image, weather },
}) => {
  try {
    // Generate a unique ID for this analysis
    const analysisId = Date.now().toString()

    // Process image immediately
    const base64Data = image.split(';base64,')[1]
    if (!base64Data) {
      throw new Error('Invalid image format')
    }
    const imageBuffer = Buffer.from(base64Data, 'base64')
    const processedImage = await sharp(imageBuffer).jpeg().toBuffer()
    const processedBase64 = processedImage.toString('base64')

    // Store the processed image and weather data
    analysisCache.set(analysisId, {
      processedBase64,
      weather,
      status: 'processing',
      result: null,
    })

    // Trigger the background analysis
    performAnalysisInBackground(analysisId)

    return {
      analysisId,
      status: 'processing',
    }
  } catch (error) {
    console.error('Analysis error:', error)
    return {
      success: false,
      error: 'Failed to initiate analysis',
    }
  }
}

export const getAnalysisStatus: MutationResolvers['getAnalysisStatus'] =
  async ({ analysisId }) => {
    const analysis = analysisCache.get(analysisId)
    if (!analysis) {
      return {
        status: 'not_found',
      }
    }

    return {
      status: analysis.status,
      feedback: analysis.result,
    }
  }

async function performAnalysisInBackground(analysisId: string) {
  const analysisData = analysisCache.get(analysisId)
  if (!analysisData) return

  try {
    // Create the prompt with weather information
    const prompt = `You are a helpful fashion assistant. I'll show you an image of an outfit and provide current weather details. Please analyze if the outfit is appropriate for the weather conditions. Be specific about why it is or isn't suitable, and provide suggestions if needed.

    Current weather conditions:
    Temperature: ${analysisData.weather.temp}°F
    Conditions: ${analysisData.weather.description}
    Feels like: ${analysisData.weather.feelsLike}°F

    Please analyze the outfit in the provided image and tell me if it's appropriate for these weather conditions.`

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: analysisData.processedBase64,
              },
            },
          ],
        },
      ],
    })

    analysisCache.set(analysisId, {
      ...analysisData,
      status: 'completed',
      result: response.content[0].text,
    })
  } catch (error) {
    analysisCache.set(analysisId, {
      ...analysisData,
      status: 'error',
      result: 'An error occurred while analyzing your image.',
    })
  }
}
