import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const sendMessage = async ({ message }: { message: string }) => {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }],
    })

    return response.content[0].text
  } catch (error) {
    console.error('Anthropic API Error:', error)
    throw error
  }
}
