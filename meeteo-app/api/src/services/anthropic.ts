import Anthropic from '@anthropic-ai/sdk'

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

    // Parse the response text as JSON
    const locationData = JSON.parse(response.content[0].text)

    return {
      city: locationData.city,
      state: locationData.state,
    }
  } catch (error) {
    console.error('Anthropic API Error:', error)
    throw error
  }
}
