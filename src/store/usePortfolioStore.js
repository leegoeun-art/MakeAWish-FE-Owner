import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { randomDelay, genId } from '../lib/time'
import { INITIAL_PORTFOLIOS, PORTFOLIO_TAG_POOL } from '../mocks/seed'

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
        await randomDelay(600, 1100)
        const item = { id: genId('p'), imageUrl: 'https://picsum.photos/seed/' + genId('new') + '/600/600', ...data }
        set((state) => ({ portfolios: [item, ...state.portfolios] }))
        return item
      },

      updatePortfolio: async (id, data) => {
        await randomDelay()
        set((state) => ({
          portfolios: state.portfolios.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }))
      },

      getById: (id) => get().portfolios.find((p) => p.id === id),
    }),
    { name: 'cake-portfolios' },
  ),
)