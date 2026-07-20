import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PaperPlaneTilt } from '@phosphor-icons/react'
import { useOrderStore } from '../../store/useOrderStore'
import { useChatStore } from '../../store/useChatStore'
import PageHeader from '../../components/ui/PageHeader'

export default function OrderChat() {
  const { orderId } = useParams()
  const { getOrderById } = useOrderStore()
  const { getMessages, sendMessage } = useChatStore()
  const order = getOrderById(orderId)
  const messages = getMessages(orderId)
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim()) return
    sendMessage(orderId, text.trim())
    setText('')
  }

  return (
    <div className="flex h-dvh flex-col">
      <PageHeader title={`${order?.customerName} 님과의 채팅`} subtitle={order?.cakeType} back />

      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
        {messages.length === 0 && <p className="mt-10 text-center text-sm text-cake-ink-soft">아직 대화가 없어요</p>}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'store' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed ${
                m.sender === 'store' ? 'bg-cake-pink-500 text-white' : 'bg-white text-cake-ink ring-1 ring-cake-pink-100'
              }`}
            >
              {m.text}
              <div className={`mt-1 text-[10px] ${m.sender === 'store' ? 'text-white/70' : 'text-cake-ink-soft'}`}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 flex items-center gap-2 border-t border-cake-pink-100 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="메시지를 입력하세요"
          className="flex-1 rounded-full bg-cake-pink-50 px-4 py-2.5 text-sm outline-none placeholder:text-cake-ink-soft"
        />
        <button
          onClick={handleSend}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cake-pink-500 text-white active:scale-95"
          aria-label="전송"
        >
          <PaperPlaneTilt size={18} weight="fill" />
        </button>
      </div>
    </div>
  )
}