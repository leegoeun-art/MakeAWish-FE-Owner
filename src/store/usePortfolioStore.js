import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '../lib/time'
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
        // 백엔드가 성공(201) 시에도 빈 바디를 줄 때가 있어 res가 null일 수 있다.
        // 그럴 땐 화면에서 입력한 값 + 임시 로컬 id로 채워 넣는다.
        const item = { ...data, ...res, id: res?.portfolioId ?? genId('p') }
        set((state) => ({ portfolios: [item, ...state.portfolios] }))
        return item
      },

      updatePortfolio: async (id, data) => {
        const res = await portfolioApi.updatePortfolio(id, data)
        const item = { ...data, ...res, id: res?.portfolioId ?? id }
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
