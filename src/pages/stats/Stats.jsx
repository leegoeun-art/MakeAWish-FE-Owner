import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { useStatsStore } from '../../store/useStatsStore'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'

const TABS = [
  { key: 'revenue', label: '매출' },
  { key: 'product', label: '상품별' },
  { key: 'production-time', label: '제작시간' },
]

const PINK = '#ff6aa3'
const MINT = '#3fb87e'

export default function Stats() {
  const { getStats } = useStatsStore()
  const [tab, setTab] = useState('revenue')
  const [data, setData] = useState(null)

  useEffect(() => {
    setData(null)
    getStats(tab).then(setData)
  }, [tab])

  return (
    <div className="pb-6">
      <PageHeader title="통계" subtitle="매장 운영 데이터를 확인해요" />

      <div className="flex gap-2 px-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
              tab === t.key ? 'bg-cake-pink-500 text-white' : 'bg-white text-cake-ink-soft ring-1 ring-cake-pink-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 px-5">
        <Card>
          {!data && <Spinner label="통계를 불러오고 있어요…" />}

          {data && tab === 'revenue' && (
            <>
              <p className="text-sm font-bold text-cake-ink">월별 매출 추이</p>
              <div className="mt-3 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffe6ee" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a7a7e' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(v) => `${v.toLocaleString()}원`} contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                    <Bar dataKey="revenue" fill={PINK} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {data && tab === 'product' && (
            <>
              <p className="text-sm font-bold text-cake-ink">상품별 매출</p>
              <div className="mt-3 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#8a7a7e' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip formatter={(v) => `${v.toLocaleString()}원`} contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                    <Bar dataKey="revenue" fill={PINK} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {data.map((p) => (
                  <div key={p.name} className="flex justify-between text-xs text-cake-ink-soft">
                    <span>{p.name}</span>
                    <span>{p.count}건</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {data && tab === 'production-time' && (
            <>
              <p className="text-sm font-bold text-cake-ink">평균 제작 소요 시간</p>
              <div className="mt-3 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dff7ec" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8a7a7e' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(v) => `${v}분`} contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                    <Bar dataKey="avgMinutes" fill={MINT} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}