export const schema = gql`
  type Location {
    place_name: String!
    lat: Float!
    lon: Float!
  }

  type Weather {
    temp: Float!
    feels_like: Float!
    humidity: Float!
    description: String!
  }

  type Clothing {
    footwear: String!
    top: String!
    bottom: String!
    accessories: String!
    wildcard1: String!
    wildcard2: String!
  }

  type LocationWithWeather {
    location: Location!
    weather: Weather!
    clothing: Clothing!
  }

  type Mutation {
    sendMessage(message: String!): LocationWithWeather! @skipAuth
  }

  type Query {
    _empty: String @skipAuth
  }
`
