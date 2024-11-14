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

  type AnalysisInitiationResponse {
    analysisId: String
    status: String!
    error: String
  }

  type AnalysisStatusResponse {
    status: String!
    feedback: String
  }

  type Mutation {
    initiateAnalysis(input: AnalyzeOutfitInput!): AnalysisInitiationResponse!
      @requireAuth
    getAnalysisStatus(analysisId: String!): AnalysisStatusResponse! @requireAuth
  }
`
