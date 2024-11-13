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

  type ClothingItem {
    recommendation: String!
    productTitle: String!
    purchaseUrl: String!
  }

  type Clothing {
    footwear: ClothingItem!
    top: ClothingItem!
    bottom: ClothingItem!
    accessories: ClothingItem!
    wildcard1: ClothingItem!
    wildcard2: ClothingItem!
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
