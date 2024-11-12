import { Form, TextField, Submit } from '@redwoodjs/forms'
import { useMutation } from '@redwoodjs/web'

const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessageMutation($message: String!) {
    sendMessage(message: $message)
  }
`

const MyPagePage = () => {
  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION)

  const onSubmit = async (data) => {
    try {
      const response = await sendMessage({
        variables: { message: data.message },
      })
      console.log('Anthropic Response:', response.data.sendMessage)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <Form onSubmit={onSubmit}>
        <TextField
          name="message"
          className="px-4 py-2 border rounded-md"
          validation={{ required: true }}
        />
        <Submit className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-md">
          Send
        </Submit>
      </Form>
    </div>
  )
}

export default MyPagePage
