const cloudConfig = require('./config/cloud')
const { loginWithWeChat } = require('./utils/auth')
const { seedDefaultHabits } = require('./utils/storage')

App({
  globalData: {
    userReady: null
  },

  onLaunch() {
    if (cloudConfig.enabled && wx.cloud) {
      wx.cloud.init({
        env: cloudConfig.env,
        traceUser: cloudConfig.traceUser
      })

      this.globalData.userReady = loginWithWeChat().catch(() => {
        seedDefaultHabits()
      })
      return
    }

    seedDefaultHabits()
    this.globalData.userReady = Promise.resolve()
  }
})
