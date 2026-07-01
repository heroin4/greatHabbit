const reminderTemplates = require('../config/reminder-templates')

function getReminderTemplateIds() {
  return Object.values(reminderTemplates)
    .map((template) => template.templateId)
    .filter((templateId) => templateId && !templateId.startsWith('REPLACE_WITH'))
}

function requestReminderSubscribe() {
  const tmplIds = getReminderTemplateIds()

  if (tmplIds.length === 0) {
    wx.showToast({ title: '请先配置订阅消息模板 ID', icon: 'none' })
    return Promise.resolve({ skipped: true })
  }

  return wx.requestSubscribeMessage({ tmplIds })
}

function formatHabitReminderData(habit) {
  return {
    thing1: { value: habit.name },
    time2: { value: habit.reminderTime || '今日' },
    thing3: { value: `${habit.targetValue}${habit.unit}` },
    thing4: { value: habit.encouragement || '愿你今天也稳稳完成' }
  }
}

module.exports = {
  formatHabitReminderData,
  getReminderTemplateIds,
  requestReminderSubscribe,
  reminderTemplates
}
