import { client } from './client'

export async function replyToReview(reviewId, replyContent) {
  return client.post(`/api/reviews/${reviewId}/reply`, { replyContent })
}

export async function deleteReviewReply(reviewId) {
  return client.delete(`/api/reviews/${reviewId}/reply`)
}
