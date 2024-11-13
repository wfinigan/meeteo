import { Anthropic } from '@anthropic-ai/sdk'
import sharp from 'sharp'
import type { MutationResolvers } from 'types/graphql'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const analyzeOutfit: MutationResolvers['analyzeOutfit'] = async ({
  input: { image, weather },
}) => {
  try {
    console.log('Debug: Starting image analysis')

    // Extract base64 data
    const base64Data = image.split(';base64,')[1]
    if (!base64Data) {
      throw new Error('Invalid image format')
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Process image with sharp
    const processedImage = await sharp(imageBuffer).jpeg().toBuffer()

    // Convert back to base64
    const processedBase64 = processedImage.toString('base64')

    // Create the prompt with weather information
    const prompt = `You are a helpful fashion assistant. I'll show you an image of an outfit and provide current weather details. Please analyze if the outfit is appropriate for the weather conditions. Be specific about why it is or isn't suitable, and provide suggestions if needed.

Current weather conditions:
Temperature: ${weather.temp}°F
Conditions: ${weather.description}
Feels like: ${weather.feelsLike}°F

Please analyze the outfit in the provided image and tell me if it's appropriate for these weather conditions.`

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: processedBase64,
              },
            },
          ],
        },
      ],
    })

    return {
      success: true,
      feedback: response.content[0].text,
    }
  } catch (error) {
    console.error('Analysis error details:', {
      message: error.message,
      stack: error.stack,
      data: error.error || error,
    })
    return {
      success: false,
      feedback:
        'An error occurred while analyzing your image. Please try again.',
    }
  }
}
