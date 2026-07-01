const { requestReminderSubscribe, reminderTemplates } = require('../../utils/reminder')
const { resetDemoData } = require('../../utils/storage')
const appMeta = require('../../config/app-meta')

Page({
  data: {
    reminderTemplates: Object.values(reminderTemplates),
    appMeta
  },

  resetDemo() {
    wx.showModal({
      title: '重置预览数据',
      content: '会恢复默认习惯模板，并清空本地打卡记录。',
      success: (result) => {
        if (!result.confirm) {
          return
        }

        resetDemoData()
        wx.showToast({ title: '已重置', icon: 'success' })
      }
    })
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
