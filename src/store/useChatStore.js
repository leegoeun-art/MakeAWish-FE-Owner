import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '../lib/time'
import { INITIAL_CHATS } from '../mocks/seed'

export const useChatStore = create(
  persist(
    (set, get) => ({
      chats: INITIAL_CHATS,

      getMessages: (orderId) => get().chats[orderId] || [],

      sendMessage: (orderId, text) => {
        const msg = { id: genId('m'), sender: 'store', text, time: '방금' }
        set((state) => ({
          chats: { ...state.chats, [orderId]: [...(state.chats[orderId] || []), msg] },
        }))
      },
    }),
    { name: 'cake-chats' },
  ),
)