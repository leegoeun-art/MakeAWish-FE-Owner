import { useState } from 'react'
import { Star, Sparkle, TrendUp, IdentificationCard, PencilSimple } from '@phosphor-icons/react'
import { useShopStore } from '../../store/useShopStore'
import { useAuthStore } from '../../store/useAuthStore'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

export default function StoreManage() {
  const { businessLicense } = useAuthStore()
  const {
    profile,
    reviews,
    suggestions,
    priceAnalysis,
    updateProfile,
    generateIntro,
    replyToReview,
    getReviewSummary,
    requestProfileSuggestions,
    fetchPriceAnalysis,
  } = useShopStore()

  const summary = getReviewSummary()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(profile)
  const [savingProfile, setSavingProfile] = useState(false)
  const [introLoading, setIntroLoading] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [priceLoading, setPriceLoading] = useState(false)
  const [replyOpenFor, setReplyOpenFor] = useState(null)
  const [replyText, setReplyText] = useState('')

  const saveProfile = async () => {
    setSavingProfile(true)
    await updateProfile(form)
    setSavingProfile(false)
    setEditing(false)
  }

  return (
    <div className="pb-6">
      <PageHeader title="매장관리" />

      <div className="flex flex-col gap-4 px-5">
        <Card>
          <div className="flex items-center gap-3">
            <img src={profile.profileImage} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            <div className="flex-1">
              {editing ? (
                <input
                  value={form.storeName}
                  onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))}
                  className="w-full rounded-lg border border-cake-pink-200 px-2 py-1 text-sm font-bold outline-none"
                />
              ) : (
                <p className="font-display text-lg text-cake-ink">{profile.storeName}</p>
              )}
              <p className="text-xs text-cake-ink-soft">{profile.category} · {profile.ownerName}</p>
            </div>
            <button
              onClick={() => (editing ? saveProfile() : setEditing(true))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-cake-pink-50 text-cake-pink-500 active:scale-95"
            >
              <PencilSimple size={15} />
            </button>
          </div>
          {editing && (
            <div className="mt-3 flex flex-col gap-2">
              <input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="주소"
                className="rounded-xl border border-cake-pink-200 px-3 py-2 text-sm outline-none"
              />
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="연락처"
                className="rounded-xl border border-cake-pink-200 px-3 py-2 text-sm outline-none"
              />
              <Button loading={savingProfile} onClick={saveProfile} className="mt-1 w-full">저장하기</Button>
            </div>
          )}
          {!editing && (
            <p className="mt-2 text-xs text-cake-ink-soft">{profile.address} · {profile.phone}</p>
          )}
        </Card>

        <Card>
          <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><Sparkle size={16} className="text-cake-pink-500" /> 소개글</p>
          {introLoading ? (
            <Spinner label="소개글을 작성하고 있어요…" />
          ) : (
            <p className="mt-2 whitespace-pre-line rounded-2xl bg-cake-pink-50 p-3 text-sm leading-relaxed text-cake-ink">
              {profile.intro || '아직 소개글이 없어요. AI로 자동 생성해보세요!'}
            </p>
          )}
          {!introLoading && (
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={async () => {
                setIntroLoading(true)
                await generateIntro()
                setIntroLoading(false)
              }}
            >
              {profile.intro ? '다시 생성하기' : '소개글 자동 생성'}
            </Button>
          )}
        </Card>

        <Card>
          <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><IdentificationCard size={16} className="text-cake-pink-500" /> 사업자등록증</p>
          {businessLicense ? (
            <dl className="mt-2 grid grid-cols-3 gap-y-1 text-xs">
              <dt className="text-cake-ink-soft">사업자번호</dt>
              <dd className="col-span-2 text-cake-ink">{businessLicense.businessNumber}</dd>
              <dt className="text-cake-ink-soft">대표자</dt>
              <dd className="col-span-2 text-cake-ink">{businessLicense.ownerName}</dd>
              <dt className="text-cake-ink-soft">개업일</dt>
              <dd className="col-span-2 text-cake-ink">{businessLicense.openDate}</dd>
            </dl>
          ) : (
            <p className="mt-2 text-xs text-cake-ink-soft">등록된 사업자등록증이 없어요</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><Star size={16} weight="fill" className="text-cake-yellow-400" /> 리뷰 요약</p>
            <span className="text-xs font-bold text-cake-pink-500">{summary.averageRating}점 · {summary.totalCount}건</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {summary.keywords.map((k) => (
              <span key={k} className="rounded-full bg-cake-mint-100 px-2.5 py-1 text-xs font-medium text-cake-mint-600">{k}</span>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 divide-y divide-cake-pink-50">
            {reviews.map((r) => (
              <div key={r.id} className="pt-2 first:pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-cake-ink">{r.customerName}</p>
                  <span className="text-xs text-cake-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p className="mt-0.5 text-xs text-cake-ink-soft">{r.content}</p>
                {r.reply && <p className="mt-1 rounded-xl bg-cake-pink-50 p-2 text-xs text-cake-ink">사장님 답글: {r.reply}</p>}
                {!r.reply && replyOpenFor !== r.id && (
                  <button onClick={() => setReplyOpenFor(r.id)} className="mt-1 text-xs font-semibold text-cake-pink-500">답글 남기기</button>
                )}
                {replyOpenFor === r.id && (
                  <div className="mt-1 flex gap-1.5">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="답글을 입력하세요"
                      className="flex-1 rounded-full border border-cake-pink-200 px-3 py-1.5 text-xs outline-none"
                    />
                    <Button
                      className="px-3 py-1.5 text-xs"
                      onClick={async () => {
                        await replyToReview(r.id, replyText)
                        setReplyText('')
                        setReplyOpenFor(null)
                      }}
                    >
                      등록
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-bold text-cake-ink">프로필 개선 제안</p>
          {suggestLoading && <Spinner label="분석하고 있어요…" />}
          {!suggestLoading && suggestions.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1.5">
              {suggestions.map((s, i) => (
                <li key={i} className="rounded-xl bg-cake-yellow-100 px-3 py-2 text-xs text-cake-ink">💡 {s}</li>
              ))}
            </ul>
          )}
          {!suggestLoading && (
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={async () => {
                setSuggestLoading(true)
                await requestProfileSuggestions()
                setSuggestLoading(false)
              }}
            >
              {suggestions.length > 0 ? '다시 분석하기' : '개선 제안 받기'}
            </Button>
          )}
        </Card>

        <Card>
          <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><TrendUp size={16} className="text-cake-pink-500" /> 시장 가격 분석</p>
          {priceLoading && <Spinner label="주변 시세를 분석하고 있어요…" />}
          {!priceLoading && priceAnalysis && (
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-xs text-cake-ink-soft">
                내 평균가 <span className="font-bold text-cake-pink-600">{priceAnalysis.myAvgPrice.toLocaleString()}원</span> · 시장 평균가{' '}
                {priceAnalysis.marketAvgPrice.toLocaleString()}원
              </p>
              {priceAnalysis.comparisonByCategory.map((c) => (
                <div key={c.category} className="flex items-center justify-between text-xs">
                  <span className="text-cake-ink-soft">{c.category}</span>
                  <span className="text-cake-ink">
                    <span className="font-bold text-cake-pink-600">{c.my.toLocaleString()}</span> / {c.market.toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          )}
          {!priceLoading && (
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={async () => {
                setPriceLoading(true)
                await fetchPriceAnalysis()
                setPriceLoading(false)
              }}
            >
              {priceAnalysis ? '다시 조회하기' : '시장 가격 조회'}
            </Button>
          )}
        </Card>
      </div>
    </div>
  )
}