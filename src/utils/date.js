export function startOfWeekMonday(d){
  const date = new Date(d)
  const day = date.getDay() // 0 dom .. 6 sab
  const diff = (day === 0 ? -6 : 1 - day)
  date.setDate(date.getDate() + diff)
  date.setHours(0,0,0,0)
  return date
}
export function addDays(d, n){ const x = new Date(d); x.setDate(x.getDate()+n); return x }
export function endOfMonth(d){
  const x = new Date(d.getFullYear(), d.getMonth()+1, 0)
  x.setHours(23,59,59,999)
  return x
}
export function startOfMonth(d){
  const x = new Date(d.getFullYear(), d.getMonth(), 1)
  x.setHours(0,0,0,0)
  return x
}
export function eachDay(start, end){
  const days=[]; let cur = new Date(start)
  while(cur <= end){
    days.push(new Date(cur))
    cur.setDate(cur.getDate()+1)
  }
  return days
}
export function isSameDay(a,b){
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
}
export function ptBRDayLabel(d){
  const labels = ['DOM','SEG','TER','QUA','QUI','SEX','SAB']
  return labels[d.getDay()]
}
export function two(n){ return n<10?`0${n}`:`${n}` }
export function fmtDM(d){ return `${two(d.getDate())}/${two(d.getMonth()+1)}/${String(d.getFullYear()).slice(-2)}` }
