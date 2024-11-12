import { Form, TextField, Submit } from '@redwoodjs/forms'
import { useMutation } from '@redwoodjs/web'
import { useState } from 'react'

const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessageMutation($message: String!) {
    sendMessage(message: $message) {
      city
      state
      weather {
        temp
        feels_like
        humidity
        description
      }
    }
  }
`

const MyPagePage = () => {
  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION)
  const [result, setResult] = useState(null)

  const onSubmit = async (data) => {
    try {
      const response = await sendMessage({
        variables: { message: data.message },
      })
      setResult(response.data.sendMessage)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="p-4">
      <Form onSubmit={onSubmit}>
        <TextField
          name="message"
          placeholder="Describe a location..."
          className="px-4 py-2 border rounded-md"
          validation={{ required: true }}
        />
        <Submit className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-md">
          Find Location
        </Submit>
      </Form>

      {result && (
        <div className="mt-4 p-4 border rounded-md">
          <h2 className="text-xl font-bold">
            {result.city}, {result.state}
          </h2>
          <div className="mt-2">
            <p>Temperature: {result.weather.temp}&deg;F</p>
            <p>Feels like: {result.weather.feels_like}&deg;F</p>
            <p>Humidity: {result.weather.humidity}%</p>
            <p>Conditions: {result.weather.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyPagePage
