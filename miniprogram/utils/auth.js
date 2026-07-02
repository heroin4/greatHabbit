const { getActiveUserId, seedDefaultHabits, setActiveUserId } = require('./storage')

function maskUserId(userId) {
  if (!userId || userId === 'local_guest') {
    return '未登录'
  }

  if (userId.length <= 10) {
    return userId
  }

  return `${userId.slice(0, 6)}...${userId.slice(-4)}`
}

function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: resolve,
      fail: reject
    })
  })
}

function loginWithWeChat() {
  if (!wx.cloud) {
    return Promise.resolve({ skipped: true, userId: getActiveUserId(), message: '当前环境未启用云开发' })
  }

  return wxLogin()
    .then(() => wx.cloud.callFunction({ name: 'getOpenId' }))
    .then((response) => {
      const openid = response.result && response.result.openid

      if (!openid) {
        throw new Error('未获取到 openid')
      }

      const userId = setActiveUserId(openid)
      seedDefaultHabits()

      return {
        appid: response.result.appid,
        unionid: response.result.unionid,
        userId
      }
    })
}

module.exports = {
  loginWithWeChat,
  maskUserId
}
