import { create } from 'zustand'
import { randomDelay } from '../lib/time'
import { REVENUE_STATS, PRODUCT_STATS, PRODUCTION_TIME_STATS } from '../mocks/seed'

export const useStatsStore = create(() => ({
  getStats: async (type) => {
    await randomDelay(500, 1000)
    if (type === 'revenue') return REVENUE_STATS
    if (type === 'product') return PRODUCT_STATS
    if (type === 'production-time') return PRODUCTION_TIME_STATS
    return []
  },
}))