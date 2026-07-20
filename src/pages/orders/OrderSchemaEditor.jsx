import { useState } from 'react'
import { Trash, Plus } from '@phosphor-icons/react'
import { useOrderStore } from '../../store/useOrderStore'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const TYPE_LABEL = { text: '텍스트', select: '선택형', date: '날짜', image: '이미지', textarea: '장문 텍스트' }

export default function OrderSchemaEditor() {
  const { schemaFields, updateSchemaFields } = useOrderStore()
  const [fields, setFields] = useState(schemaFields)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateField = (id, label) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, label } : f)))
  }

  const removeField = (id) => setFields((prev) => prev.filter((f) => f.id !== id))

  const addField = () => {
    setFields((prev) => [...prev, { id: `custom_${prev.length}_${Date.now()}`, label: '새 항목', type: 'text' }])
  }

  const handleSave = async () => {
    setSaving(true)
    await updateSchemaFields(fields)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="pb-6">
      <PageHeader title="주문서 양식 설정" subtitle="고객이 작성할 주문서 항목을 편집해요" back />

      <div className="flex flex-col gap-3 px-5">
        {fields.map((f) => (
          <Card key={f.id} className="flex items-center gap-3">
            <div className="flex-1">
              <input
                value={f.label}
                onChange={(e) => updateField(f.id, e.target.value)}
                className="w-full border-b border-transparent bg-transparent text-sm font-semibold text-cake-ink outline-none focus:border-cake-pink-300"
              />
              <span className="mt-1 inline-block rounded-full bg-cake-pink-50 px-2 py-0.5 text-[10px] font-medium text-cake-pink-500">
                {TYPE_LABEL[f.type] || f.type}
              </span>
            </div>
            <button onClick={() => removeField(f.id)} className="text-cake-ink-soft active:text-red-400" aria-label="삭제">
              <Trash size={18} />
            </button>
          </Card>
        ))}

        <button
          onClick={addField}
          className="flex items-center justify-center gap-1.5 rounded-3xl border-2 border-dashed border-cake-pink-200 py-3 text-sm font-semibold text-cake-pink-500 active:bg-cake-pink-50"
        >
          <Plus size={16} /> 항목 추가
        </button>

        <Button className="mt-2 w-full" loading={saving} onClick={handleSave}>
          {saved ? '저장됐어요 ✓' : '저장하기'}
        </Button>
      </div>
    </div>
  )
}