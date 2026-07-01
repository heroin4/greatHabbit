const { requestReminderSubscribe, reminderTemplates } = require('../../utils/reminder')

Page({
  data: {
    reminderTemplates: Object.values(reminderTemplates)
  },

  subscribeReminder() {
    requestReminderSubscribe().then((result) => {
      if (result.skipped) {
        return
      }

      wx.showToast({ title: '订阅设置已更新', icon: 'success' })
    })
  }
})
