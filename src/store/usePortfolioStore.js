import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { INITIAL_PORTFOLIOS } from '../mocks/seed'
import * as portfolioApi from '../api/portfolioApi'

export const usePortfolioStore = create(
  persist(
    (set, get) => ({
      portfolios: INITIAL_PORTFOLIOS,

      recommendTags: async ({ imageUrl, description }) => {
        return portfolioApi.recommendPortfolioTags({ imageUrl, description })
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
