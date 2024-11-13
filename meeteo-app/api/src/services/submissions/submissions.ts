import type { QueryResolvers, MutationResolvers } from 'types/graphql'

import { db } from 'src/lib/db'

export const submissions: QueryResolvers['submissions'] = () => {
  console.log('Fetching submissions for user:', context.currentUser?.sub)
  return db.submission.findMany({
    where: { userId: context.currentUser?.sub },
    orderBy: { createdAt: 'desc' },
  })
}

export const createSubmission: MutationResolvers['createSubmission'] = ({
  location,
  lat,
  lon,
  weather,
  clothing,
}) => {
  console.log('Creating submission for user:', context.currentUser?.sub)
  return db.submission.create({
    data: {
      userId: context.currentUser?.sub,
      location,
      lat,
      lon,
      weather,
      clothing,
    },
  })
}
