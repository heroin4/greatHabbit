function pad(value) {
  return value < 10 ? `0${value}` : `${value}`
}

function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function weekdayIndex(date = new Date()) {
  return date.getDay()
}

module.exports = {
  todayKey,
  weekdayIndex
}
