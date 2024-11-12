export const schema = gql`
  type Mutation {
    sendMessage(message: String!): String! @skipAuth
  }
`
