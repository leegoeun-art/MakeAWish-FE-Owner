import { client } from './client'

export async function fetchStoreReviews(storeId = 1) {
  const res = await client.get(`/api/stores/${storeId}/reviews`)
  return res.content
}

export async function replyToReview(reviewId, replyContent) {
  return client.post(`/api/reviews/${reviewId}/reply`, { replyContent })
}

export async function deleteReviewReply(reviewId) {
  return client.delete(`/api/reviews/${reviewId}/reply`)
}
