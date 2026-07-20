export function toIsoDate(date) {
  return date.toISOString().slice(0, 10)
}

export function todayIso() {
  return toIsoDate(new Date())
}

export function addDaysIso(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return toIsoDate(d)
}

export function monthLabel(offsetMonths) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offsetMonths)
  return `${d.getMonth() + 1}월`
}

export function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function randomDelay(min = 300, max = 800) {
  return delay(min + Math.random() * (max - min))
}

export function genId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}