const { loginWithWeChat, maskUserId } = require('../../utils/auth')
const { requestReminderSubscribe, reminderTemplates } = require('../../utils/reminder')
const { getActiveUserId, resetDemoData } = require('../../utils/storage')
const appMeta = require('../../config/app-meta')
const cloudConfig = require('../../config/cloud')

Page({
  data: {
    reminderTemplates: Object.values(reminderTemplates),
    appMeta,
    cloudConfig,
    loginStatus: '未登录',
    userId: ''
  },

  onShow() {
    this.refreshUserState()
  },

  refreshUserState() {
    const userId = getActiveUserId()
    this.setData({
      loginStatus: userId === 'local_guest' ? '未登录' : '已微信登录',
      userId: maskUserId(userId)
    })
  },

  loginWithWeChat() {
    wx.showLoading({ title: '登录中' })
    loginWithWeChat()
      .then(() => {
        this.refreshUserState()
        wx.showToast({ title: '登录成功', icon: 'success' })
      })
      .catch(() => {
        wx.showToast({ title: '登录失败，请检查云函数', icon: 'none' })
      })
      .finally(() => {
        wx.hideLoading()
      })
  },

  resetDemo() {
    wx.showModal({
      title: '重置当前用户数据',
      content: '只会重置当前微信用户空间的数据：恢复 1 个示例习惯，并清空当前用户的打卡记录。',
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
