export const schema = gql`
  type Location {
    city: String!
    state: String!
  }

  type Mutation {
    sendMessage(message: String!): Location! @skipAuth
  }
`
