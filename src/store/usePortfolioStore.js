import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { randomDelay } from '../lib/time'
import { INITIAL_PORTFOLIOS, PORTFOLIO_TAG_POOL } from '../mocks/seed'
import * as portfolioApi from '../api/portfolioApi'

export const usePortfolioStore = create(
  persist(
    (set, get) => ({
      portfolios: INITIAL_PORTFOLIOS,

      recommendTags: async (keyword) => {
        await randomDelay(500, 1000)
        const shuffled = [...PORTFOLIO_TAG_POOL].sort(() => Math.random() - 0.5)
        const picked = shuffled.slice(0, 4)
        if (keyword && !picked.includes(keyword)) picked.unshift(keyword)
        return [...new Set(picked)].slice(0, 5)
      },

      createPortfolio: async (data) => {
        const res = await portfolioApi.createPortfolio(data)
        const item = { ...res, id: res.portfolioId }
        set((state) => ({ portfolios: [item, ...state.portfolios] }))
        return item
      },

      updatePortfolio: async (id, data) => {
        const res = await portfolioApi.updatePortfolio(id, data)
        const item = { ...res, id: res.portfolioId }
        set((state) => ({
          portfolios: state.portfolios.map((p) => (p.id === id ? { ...p, ...item } : p)),
        }))
        return item
      },

      getById: (id) => get().portfolios.find((p) => p.id === id),
    }),
    { name: 'cake-portfolios' },
  ),
)
