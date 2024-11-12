export const schema = gql`
  type Weather {
    temp: Float!
    feels_like: Float!
    humidity: Int!
    description: String!
  }

  type ClothingSuggestions {
    footwear: String!
    top: String!
    bottom: String!
    accessories: String!
    wildcard1: String!
    wildcard2: String!
  }

  type LocationWithWeather {
    city: String!
    state: String!
    weather: Weather!
    clothing: ClothingSuggestions!
  }

  type Mutation {
    sendMessage(message: String!): LocationWithWeather! @skipAuth
  }
`
