export const schema = gql`
  type Weather {
    temp: Float!
    feels_like: Float!
    humidity: Int!
    description: String!
  }

  type LocationWithWeather {
    city: String!
    state: String!
    weather: Weather!
  }

  type Mutation {
    sendMessage(message: String!): LocationWithWeather! @skipAuth
  }
`
