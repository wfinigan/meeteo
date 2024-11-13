export const schema = gql`
  input WeatherInput {
    temp: Float!
    feelsLike: Float!
    description: String!
  }

  input AnalyzeOutfitInput {
    image: String!
    weather: WeatherInput!
  }

  type OutfitAnalysis {
    success: Boolean!
    feedback: String
    error: String
  }

  type Mutation {
    analyzeOutfit(input: AnalyzeOutfitInput!): OutfitAnalysis! @requireAuth
  }
`
