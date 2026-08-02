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
import {
  updateOrderStatus as apiUpdateOrderStatus,
  registerExtraFee as apiRegisterExtraFee,
  isMockOrderId,
} from '../api/orderApi'

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: INITIAL_ORDERS,
      extraCharges: INITIAL_EXTRA_CHARGES,
      payments: INITIAL_PAYMENTS,
      messageDrafts: {}, // orderId -> string
      schemaFields: ORDER_SCHEMA_FIELDS,

      getTodayOrders: () => get().orders.filter((o) => o.requestedDate === todayIso()),
      getTodayBriefing: () => TODAY_BRIEFING,
      getOrderById: (orderId) => get().orders.find((o) => o.id === orderId),
      getExtraChargesByOrder: (orderId) => get().extraCharges.filter((c) => c.orderId === orderId),
      getPaymentByOrder: (orderId) => get().payments.find((p) => p.orderId === orderId),
      resetOrders: () => set({ orders: INITIAL_ORDERS }),

      updateOrderStatus: async (orderId, status, reason) => {
        if (!isMockOrderId(orderId)) {
          try {
            await apiUpdateOrderStatus(orderId, status)
          } catch (error) {
            console.error('[useOrderStore] 실서버 주문 상태 변경 실패:', error.message)
            throw error
          }
        } else {
          await randomDelay()
        }
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status, ...(reason ? { rejectReason: reason } : {}) } : o,
          ),
        }))
      },

      createExtraCharge: async (orderId, { reason, amount }) => {
        if (!isMockOrderId(orderId)) {
          try {
            await apiRegisterExtraFee(orderId, { amount, reason })
          } catch (error) {
            console.error('[useOrderStore] 실서버 추가금 책정/등록 실패:', error.message)
            throw error
          }
        } else {
          await randomDelay()
        }
        const charge = { id: genId('extra'), orderId, reason, amount: Number(amount), createdAt: todayIso() }
        set((state) => ({ extraCharges: [...state.extraCharges, charge] }))
        return charge
      },

      syncExtraChargeFromServer: (orderId, { extraFee, reason }) => {
        if (!extraFee || Number(extraFee) <= 0) return
        const existing = get().extraCharges.find((c) => c.orderId === orderId)
        if (existing) {
          set((state) => ({
            extraCharges: state.extraCharges.map((c) =>
              c.orderId === orderId ? { ...c, amount: Number(extraFee), reason: reason || c.reason } : c,
            ),
          }))
        } else {
          const charge = {
            id: genId('extra'),
            orderId,
            reason: reason || '추가 금액',
            amount: Number(extraFee),
            createdAt: todayIso(),
          }
          set((state) => ({ extraCharges: [...state.extraCharges, charge] }))
        }
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

      updateSchemaFields: async (fields) => {
        await randomDelay()
        set({ schemaFields: fields })
      },
    }),
    {
      name: 'cake-orders',
      version: 2,
    },
  ),
)