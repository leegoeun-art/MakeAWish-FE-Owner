import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogo } from '@phosphor-icons/react'
import { useAuthStore } from '../../store/useAuthStore'
import Button from '../../components/ui/Button'

export default function SplashLogin() {
  const navigate = useNavigate()
  const { loginWithGoogle, onboarded } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    await loginWithGoogle()
    setLoading(false)
    navigate(onboarded ? '/home' : '/onboarding')
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-cake-pink-100 via-cake-pink-50 to-cake-cream px-6 pb-10 pt-16">
      <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-cake-yellow-100/70 blur-2xl" />
      <div className="pointer-events-none absolute -right-8 top-40 h-32 w-32 rounded-full bg-cake-lavender-100/70 blur-2xl" />

      <div className="z-10 flex flex-col items-center gap-3 text-center">
        <span className="rounded-full bg-white/70 px-4 py-1 text-xs font-semibold text-cake-pink-600">
          🅿 파트너 사장님
        </span>
        <h1 className="font-display text-4xl leading-snug text-cake-pink-700">
          달콤한 주문,
          <br />한눈에 관리해요
        </h1>
        <p className="text-sm text-cake-ink-soft">케이크 주문 접수부터 통계까지 사장님 전용 앱</p>
      </div>

      <div className="z-10 flex w-full flex-1 items-center justify-center">
        <div className="relative flex h-64 w-64 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-white shadow-cake" />
          <span className="relative text-[7rem] leading-none">🍰</span>
          <span className="absolute -right-2 top-6 text-3xl">✨</span>
          <span className="absolute -left-3 bottom-10 text-3xl">🧁</span>
        </div>
      </div>

      <div className="z-10 w-full max-w-xs">
        <Button
          onClick={handleLogin}
          loading={loading}
          className="w-full bg-white py-3.5 text-base text-cake-ink shadow-cake ring-1 ring-cake-pink-100 hover:bg-cake-pink-50"
        >
          {!loading && <GoogleLogo size={20} weight="bold" className="text-cake-pink-500" />}
          구글로 시작하기
        </Button>
        <p className="mt-3 text-center text-[11px] text-cake-ink-soft">
          로그인 시 파트너 이용약관에 동의하는 것으로 간주돼요
        </p>
      </div>
    </div>
  )
}