import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadSimple, CheckCircle, IdentificationCard } from '@phosphor-icons/react'
import { useAuthStore } from '../../store/useAuthStore'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'

export default function OnboardingOcr() {
  const navigate = useNavigate()
  const { businessLicenseStatus, businessLicense, createBusinessLicenseAnalysis, completeOnboarding } = useAuthStore()
  const [uploaded, setUploaded] = useState(!!businessLicense)

  const handleUpload = async () => {
    setUploaded(true)
    await createBusinessLicenseAnalysis()
  }

  const handleFinish = () => {
    completeOnboarding()
    navigate('/home')
  }

  return (
    <div className="flex min-h-dvh flex-col justify-between bg-cake-cream px-6 pb-10 pt-14">
      <div>
        <span className="rounded-full bg-cake-pink-100 px-3 py-1 text-xs font-semibold text-cake-pink-600">
          첫 시작이에요
        </span>
        <h1 className="mt-3 font-display text-2xl text-cake-ink">사업자등록증을 등록해주세요</h1>
        <p className="mt-1 text-sm text-cake-ink-soft">AI가 자동으로 정보를 읽어드려요</p>

        <Card className="mt-6">
          {!uploaded && (
            <button
              onClick={handleUpload}
              className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-cake-pink-200 py-10 text-cake-pink-500 active:bg-cake-pink-50"
            >
              <UploadSimple size={32} weight="bold" />
              <span className="text-sm font-semibold">사업자등록증 이미지 업로드</span>
              <span className="text-xs text-cake-ink-soft">탭하여 업로드 (프로토타입: 자동 첨부)</span>
            </button>
          )}

          {uploaded && businessLicenseStatus === 'ANALYZING' && (
            <Spinner label="AI가 사업자등록증을 분석하고 있어요…" />
          )}

          {uploaded && businessLicenseStatus === 'DONE' && businessLicense && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-cake-mint-600">
                <CheckCircle size={22} weight="fill" />
                <span className="text-sm font-bold">OCR 분석 완료</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-cake-pink-50 p-3">
                <IdentificationCard size={28} className="text-cake-pink-400" />
                <div className="text-sm">
                  <p className="font-semibold text-cake-ink">{businessLicense.businessName}</p>
                  <p className="text-cake-ink-soft">{businessLicense.businessNumber}</p>
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-y-1 text-xs">
                <dt className="text-cake-ink-soft">대표자</dt>
                <dd className="col-span-2 text-cake-ink">{businessLicense.ownerName}</dd>
                <dt className="text-cake-ink-soft">개업일</dt>
                <dd className="col-span-2 text-cake-ink">{businessLicense.openDate}</dd>
                <dt className="text-cake-ink-soft">주소</dt>
                <dd className="col-span-2 text-cake-ink">{businessLicense.address}</dd>
              </dl>
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={handleFinish}
          disabled={businessLicenseStatus !== 'DONE'}
          className="w-full py-3.5 text-base"
        >
          시작하기
        </Button>
        <button
          type="button"
          onClick={() => {
            useAuthStore.getState().logout()
            navigate('/login')
          }}
          className="py-1 text-center text-xs font-medium text-cake-ink-soft transition hover:text-cake-pink-600"
        >
          ← 로그인 화면으로 돌아가기 (로그아웃)
        </button>
      </div>
    </div>
  )
}