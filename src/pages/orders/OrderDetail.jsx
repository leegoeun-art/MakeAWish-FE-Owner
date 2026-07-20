import { useState, Fragment } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChatCircleDots,
  CreditCard,
  Sparkle,
  PaintBrush,
  Plus,
  Phone,
} from '@phosphor-icons/react'
import { useOrderStore } from '../../store/useOrderStore'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

const FIELD_LABEL = { size: '사이즈', pickupDate: '픽업일', lettering: '레터링 문구', request: '요청사항' }

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const {
    getOrderById,
    getExtraChargesByOrder,
    getPaymentByOrder,
    updateOrderStatus,
    createExtraCharge,
    createPayment,
    createMessageDraft,
    createStyleAnalysis,
    messageDrafts,
    styleAnalyses,
  } = useOrderStore()

  const order = getOrderById(orderId)
  const extraCharges = getExtraChargesByOrder(orderId)
  const payment = getPaymentByOrder(orderId)
  const draft = messageDrafts[orderId]
  const styleResult = styleAnalyses[orderId]

  const [statusLoading, setStatusLoading] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showExtraForm, setShowExtraForm] = useState(false)
  const [extraReason, setExtraReason] = useState('')
  const [extraAmount, setExtraAmount] = useState('')
  const [paying, setPaying] = useState(false)
  const [draftLoading, setDraftLoading] = useState(false)
  const [styleLoading, setStyleLoading] = useState(false)

  if (!order) {
    return (
      <div className="p-5">
        <PageHeader title="주문을 찾을 수 없어요" back />
      </div>
    )
  }

  const changeStatus = async (status, reason) => {
    setStatusLoading(true)
    await updateOrderStatus(orderId, status, reason)
    setStatusLoading(false)
    setRejecting(false)
  }

  const totalPrice = order.price + extraCharges.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="pb-6">
      <PageHeader title={order.customerName} subtitle={order.cakeType} back />

      <div className="flex flex-col gap-4 px-5">
        <Card>
          <div className="flex items-center justify-between">
            <StatusBadge status={order.status} />
            <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 text-xs font-semibold text-cake-ink-soft">
              <Phone size={14} /> {order.customerPhone}
            </a>
          </div>

          {order.status === 'REJECTED' && order.rejectReason && (
            <p className="mt-2 rounded-xl bg-gray-50 p-2 text-xs text-gray-500">거절 사유: {order.rejectReason}</p>
          )}

          <dl className="mt-3 grid grid-cols-3 gap-y-2 text-sm">
            {Object.entries(FIELD_LABEL).map(([key, label]) =>
              order.schemaAnswers?.[key] ? (
                <Fragment key={key}>
                  <dt className="text-cake-ink-soft">{label}</dt>
                  <dd className="col-span-2 text-cake-ink">{order.schemaAnswers[key]}</dd>
                </Fragment>
              ) : null,
            )}
            <dt className="text-cake-ink-soft">픽업 일시</dt>
            <dd className="col-span-2 text-cake-ink">{order.requestedDate} {order.pickupTime}</dd>
          </dl>

          {order.schemaAnswers?.refImage && (
            <img src={order.schemaAnswers.refImage} alt="참고 이미지" className="mt-3 h-32 w-32 rounded-2xl object-cover" />
          )}

          {!rejecting && order.status === 'PENDING' && (
            <div className="mt-4 flex gap-2">
              <Button variant="danger" className="flex-1" onClick={() => setRejecting(true)}>거절</Button>
              <Button className="flex-1" loading={statusLoading} onClick={() => changeStatus('ACCEPTED')}>수락하기</Button>
            </div>
          )}
          {rejecting && (
            <div className="mt-4 flex flex-col gap-2">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="거절 사유를 입력해주세요"
                className="w-full rounded-2xl border border-cake-pink-200 p-3 text-sm outline-none focus:border-cake-pink-400"
                rows={2}
              />
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setRejecting(false)}>취소</Button>
                <Button variant="danger" className="flex-1" loading={statusLoading} onClick={() => changeStatus('REJECTED', rejectReason)}>
                  거절 확정
                </Button>
              </div>
            </div>
          )}
          {order.status === 'ACCEPTED' && (
            <Button className="mt-4 w-full" loading={statusLoading} onClick={() => changeStatus('IN_PROGRESS')}>
              제작 시작하기
            </Button>
          )}
          {order.status === 'IN_PROGRESS' && (
            <Button variant="mint" className="mt-4 w-full" loading={statusLoading} onClick={() => changeStatus('COMPLETED')}>
              제작 완료 처리
            </Button>
          )}
        </Card>

        <button
          onClick={() => navigate(`/orders/${orderId}/chat`)}
          className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-cake-sm ring-1 ring-cake-pink-100 active:scale-[0.98]"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-cake-ink">
            <ChatCircleDots size={20} className="text-cake-pink-500" /> 고객과 채팅하기
          </span>
          <span className="text-xs text-cake-ink-soft">이동 →</span>
        </button>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-cake-ink">추가금</p>
            <button onClick={() => setShowExtraForm((v) => !v)} className="flex items-center gap-1 text-xs font-semibold text-cake-pink-500">
              <Plus size={14} /> 추가
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {extraCharges.length === 0 && <p className="text-xs text-cake-ink-soft">등록된 추가금이 없어요</p>}
            {extraCharges.map((c) => (
              <div key={c.id} className="flex justify-between text-sm">
                <span className="text-cake-ink-soft">{c.reason}</span>
                <span className="font-medium text-cake-ink">+{c.amount.toLocaleString()}원</span>
              </div>
            ))}
          </div>
          {showExtraForm && (
            <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-cake-pink-50 p-3">
              <input
                value={extraReason}
                onChange={(e) => setExtraReason(e.target.value)}
                placeholder="사유 (예: 토핑 추가)"
                className="rounded-xl border border-cake-pink-200 px-3 py-2 text-sm outline-none"
              />
              <input
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value)}
                type="number"
                placeholder="금액"
                className="rounded-xl border border-cake-pink-200 px-3 py-2 text-sm outline-none"
              />
              <Button
                className="w-full"
                disabled={!extraReason || !extraAmount}
                onClick={async () => {
                  await createExtraCharge(orderId, { reason: extraReason, amount: extraAmount })
                  setExtraReason('')
                  setExtraAmount('')
                  setShowExtraForm(false)
                }}
              >
                추가금 등록
              </Button>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-dashed border-cake-pink-100 pt-2 text-sm font-bold text-cake-ink">
            <span>총 금액</span>
            <span>{totalPrice.toLocaleString()}원</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><CreditCard size={18} className="text-cake-pink-500" /> 결제</p>
            {payment ? (
              <span className="text-xs font-bold text-cake-mint-600">결제 완료</span>
            ) : (
              <span className="text-xs font-bold text-cake-yellow-600">미결제</span>
            )}
          </div>
          {payment ? (
            <p className="mt-1 text-xs text-cake-ink-soft">{payment.paidAt} · {payment.amount.toLocaleString()}원 · {payment.method === 'CARD' ? '카드' : '계좌이체'}</p>
          ) : (
            <Button
              className="mt-3 w-full"
              variant="secondary"
              loading={paying}
              onClick={async () => {
                setPaying(true)
                await createPayment(orderId, { amount: totalPrice, method: 'CARD' })
                setPaying(false)
              }}
            >
              결제 처리하기
            </Button>
          )}
        </Card>

        <Card>
          <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><Sparkle size={18} className="text-cake-pink-500" /> AI 메시지 초안</p>
          {draftLoading && <Spinner label="AI가 메시지를 작성하고 있어요…" />}
          {!draftLoading && draft && <p className="mt-2 rounded-2xl bg-cake-pink-50 p-3 text-sm leading-relaxed text-cake-ink">{draft}</p>}
          {!draftLoading && (
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={async () => {
                setDraftLoading(true)
                await createMessageDraft(orderId)
                setDraftLoading(false)
              }}
            >
              {draft ? '다시 생성하기' : 'AI 메시지 초안 생성'}
            </Button>
          )}
        </Card>

        <Card>
          <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><PaintBrush size={18} className="text-cake-pink-500" /> 스타일 매칭 분석</p>
          {styleLoading && <Spinner label="참고 이미지 스타일을 분석하고 있어요…" />}
          {!styleLoading && styleResult && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1.5">
                {styleResult.tags.map((t) => (
                  <span key={t} className="rounded-full bg-cake-lavender-100 px-2.5 py-1 text-xs font-medium text-cake-lavender-600">{t}</span>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-cake-pink-50">
                  <div className="h-full rounded-full bg-cake-pink-400" style={{ width: `${styleResult.similarity}%` }} />
                </div>
                <span className="text-xs font-bold text-cake-pink-500">{styleResult.similarity}%</span>
              </div>
            </div>
          )}
          {!styleLoading && (
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={async () => {
                setStyleLoading(true)
                await createStyleAnalysis(orderId)
                setStyleLoading(false)
              }}
            >
              {styleResult ? '다시 분석하기' : '스타일 분석 실행'}
            </Button>
          )}
        </Card>
      </div>
    </div>
  )
}