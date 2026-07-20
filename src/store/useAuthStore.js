import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { randomDelay } from '../lib/time'
import { INITIAL_BUSINESS_LICENSE } from '../mocks/seed'

export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      onboarded: false,
      user: null,
      businessLicenseStatus: 'NONE', // NONE | ANALYZING | DONE
      businessLicense: null,

      loginWithGoogle: async () => {
        await randomDelay(400, 900)
        set({
          isLoggedIn: true,
          user: { name: '허예진', email: 'partner@dalkomgongbang.com', avatar: 'https://picsum.photos/seed/owner-avatar/200/200' },
        })
      },

      logout: () => set({ isLoggedIn: false }),

      createBusinessLicenseAnalysis: async () => {
        set({ businessLicenseStatus: 'ANALYZING' })
        await randomDelay(1400, 2200)
        set({ businessLicenseStatus: 'DONE', businessLicense: INITIAL_BUSINESS_LICENSE })
        return INITIAL_BUSINESS_LICENSE
      },

      completeOnboarding: () => set({ onboarded: true }),
    }),
    { name: 'cake-auth' },
  ),
)