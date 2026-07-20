import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { randomDelay, genId, todayIso } from '../lib/time'
import {
  INITIAL_ORDERS,
  INITIAL_EXTRA_CHARGES,
  INITIAL_PAYMENTS,
  ORDER_SCHEMA_FIELDS,
  TODAY_BRIEFING,
} from '../mocks/seed'

const STYLE_TAGS_POOL = ['파스텔톤', '캐릭터 일러스트', '미니멀', '플라워 장식', '골드 포인트', '레터링 강조']

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: INITIAL_ORDERS,
      extraCharges: INITIAL_EXTRA_CHARGES,
      payments: INITIAL_PAYMENTS,
      messageDrafts: {}, // orderId -> string
      styleAnalyses: {}, // orderId -> { tags, similarity }
      schemaFields: ORDER_SCHEMA_FIELDS,

      getTodayOrders: () => get().orders.filter((o) => o.requestedDate === todayIso()),
      getTodayBriefing: () => TODAY_BRIEFING,
      getOrderById: (orderId) => get().orders.find((o) => o.id === orderId),
      getExtraChargesByOrder: (orderId) => get().extraCharges.filter((c) => c.orderId === orderId),
      getPaymentByOrder: (orderId) => get().payments.find((p) => p.orderId === orderId),

      updateOrderStatus: async (orderId, status, reason) => {
        await randomDelay()
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status, ...(reason ? { rejectReason: reason } : {}) } : o,
          ),
        }))
      },

      createExtraCharge: async (orderId, { reason, amount }) => {
        await randomDelay()
        const charge = { id: genId('extra'), orderId, reason, amount: Number(amount), createdAt: todayIso() }
        set((state) => ({ extraCharges: [...state.extraCharges, charge] }))
        return charge
      },

      createPayment: async (orderId, { amount, method }) => {
        await randomDelay(500, 1000)
        const payment = { orderId, amount: Number(amount), method, status: 'PAID', paidAt: todayIso() }
        set((state) => ({ payments: [...state.payments.filter((p) => p.orderId !== orderId), payment] }))
        return payment
      },

      createMessageDraft: async (orderId) => {
        await randomDelay(800, 1400)
        const order = get().getOrderById(orderId)
        const draft = `안녕하세요 ${order?.customerName}님! 😊 주문해주신 ${order?.cakeType} 정성껏 준비하고 있어요. 픽업 예정 시간은 ${order?.pickupTime}이며, 궁금하신 점 있으시면 편하게 말씀해주세요. 감사합니다!`
        set((state) => ({ messageDrafts: { ...state.messageDrafts, [orderId]: draft } }))
        return draft
      },

      createStyleAnalysis: async (orderId) => {
        await randomDelay(1000, 1800)
        const shuffled = [...STYLE_TAGS_POOL].sort(() => Math.random() - 0.5)
        const result = {
          tags: shuffled.slice(0, 3),
          similarity: Math.floor(70 + Math.random() * 25),
        }
        set((state) => ({ styleAnalyses: { ...state.styleAnalyses, [orderId]: result } }))
        return result
      },

      updateSchemaFields: async (fields) => {
        await randomDelay()
        set({ schemaFields: fields })
      },
    }),
    { name: 'cake-orders' },
  ),
)