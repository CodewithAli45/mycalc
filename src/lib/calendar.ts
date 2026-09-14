export interface CalendarCell {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]

export const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
]

export const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function monthName(month: number): string {
  return MONTH_NAMES[month]
}

export function today(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function buildCalendarGrid(
  year: number,
  month: number,
  selected: Date | null
): CalendarCell[] {
  const sel = selected
    ? new Date(selected.getFullYear(), selected.getMonth(), selected.getDate())
    : null
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()
  const t = today()

  const cells: CalendarCell[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrev - i)
    cells.push({
      date: d,
      day: daysInPrev - i,
      isCurrentMonth: false,
      isToday: d.getTime() === t.getTime(),
      isSelected: sel ? d.getTime() === sel.getTime() : false
    })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push({
      date,
      day: d,
      isCurrentMonth: true,
      isToday: date.getTime() === t.getTime(),
      isSelected: sel ? date.getTime() === sel.getTime() : false
    })
  }

  while (cells.length % 7 !== 0) {
    const nextIdx = cells.length - firstDay + 1
    const date = new Date(year, month + 1, nextIdx)
    cells.push({
      date,
      day: nextIdx,
      isCurrentMonth: false,
      isToday: date.getTime() === t.getTime(),
      isSelected: sel ? date.getTime() === sel.getTime() : false
    })
  }

  return cells
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}