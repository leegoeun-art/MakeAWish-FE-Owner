import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { randomDelay } from '../lib/time'
import {
  INITIAL_STORE_PROFILE,
  INITIAL_REVIEWS,
  PROFILE_SUGGESTIONS,
  PRICE_ANALYSIS,
  REVIEW_SUMMARY,
  STORE_INTRO_DRAFT,
} from '../mocks/seed'

export const useShopStore = create(
  persist(
    (set, get) => ({
      profile: INITIAL_STORE_PROFILE,
      reviews: INITIAL_REVIEWS,
      suggestions: [],
      priceAnalysis: null,

      updateProfile: async (data) => {
        await randomDelay()
        set((state) => ({ profile: { ...state.profile, ...data } }))
      },

      generateIntro: async () => {
        await randomDelay(1000, 1700)
        set((state) => ({ profile: { ...state.profile, intro: STORE_INTRO_DRAFT } }))
        return STORE_INTRO_DRAFT
      },

      replyToReview: async (reviewId, text) => {
        await randomDelay()
        set((state) => ({
          reviews: state.reviews.map((r) => (r.id === reviewId ? { ...r, reply: text } : r)),
        }))
      },

      getReviewSummary: () => REVIEW_SUMMARY,

      requestProfileSuggestions: async () => {
        await randomDelay(900, 1500)
        set({ suggestions: PROFILE_SUGGESTIONS })
        return PROFILE_SUGGESTIONS
      },

      fetchPriceAnalysis: async () => {
        await randomDelay(900, 1500)
        set({ priceAnalysis: PRICE_ANALYSIS })
        return PRICE_ANALYSIS
      },
    }),
    {
      name: 'cake-shop',
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        profile: { ...currentState.profile, ...persistedState?.profile },
      }),
    },
  ),
)