import { useNavigate } from 'react-router-dom'
import { ChatCircleDots, CaretRight, User } from '@phosphor-icons/react'
import { useChatStore } from '../../store/useChatStore'
import { useOrderStore } from '../../store/useOrderStore'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'

export default function ChatManage() {
  const navigate = useNavigate()
  const { chats } = useChatStore()
  const { getOrderById } = useOrderStore()

  const chatEntries = Object.entries(chats || {}).filter(([_, msgs]) => Array.isArray(msgs) && msgs.length > 0)

  return (
    <div className="pb-24">
      <PageHeader title="채팅 관리" subtitle={`총 ${chatEntries.length}건의 대화`} />

      <div className="mt-3 flex flex-col gap-3 px-5">
        {chatEntries.length === 0 && (
          <EmptyState
            icon="💬"
            title="진행 중인 채팅이 없어요"
            description="고객과 새로운 채팅이 시작되면 여기에 표시됩니다."
          />
        )}
        {chatEntries.map(([orderId, messages]) => {
          const order = getOrderById(orderId)
          const lastMsg = messages[messages.length - 1]
          const customerName = order?.customerName || '고객님'
          const cakeType = order?.cakeType || `주문번호 #${orderId.replace('order_', '')}`

          return (
            <Card
              key={orderId}
              onClick={() => navigate(`/orders/${orderId}/chat`)}
              className="cursor-pointer transition-all active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cake-pink-100 text-cake-pink-600">
                    <User size={22} weight="fill" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-cake-ink">{customerName}</span>
                      <span className="rounded-full bg-cake-pink-50 px-2 py-0.5 text-[10px] font-semibold text-cake-pink-600">
                        {cakeType}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-cake-ink-soft">
                      {lastMsg?.text || '대화 내역이 없습니다.'}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end justify-between gap-1">
                  <span className="text-[11px] font-medium text-cake-ink-soft">{lastMsg?.time || ''}</span>
                  <CaretRight size={18} className="text-cake-ink-soft" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
