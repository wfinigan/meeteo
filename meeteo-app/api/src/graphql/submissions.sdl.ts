export const schema = gql`
  type Submission {
    id: Int!
    userId: String!
    location: String!
    lat: Float!
    lon: Float!
    weather: JSON!
    clothing: JSON!
    createdAt: DateTime!
  }

  type Query {
    submissions: [Submission!]! @requireAuth
  }

  type Mutation {
    createSubmission(
      location: String!
      lat: Float!
      lon: Float!
      weather: JSON!
      clothing: JSON!
    ): Submission! @requireAuth
  }
`
