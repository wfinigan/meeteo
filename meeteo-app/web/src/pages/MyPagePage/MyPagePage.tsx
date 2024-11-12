import { Form, TextField, Submit } from '@redwoodjs/forms'

const MyPagePage = () => {
  const onSubmit = (data) => {
    console.log(data)
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
