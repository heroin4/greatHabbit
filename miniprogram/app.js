const cloudConfig = require('./config/cloud')
const { seedDefaultHabits } = require('./utils/storage')

App({
  onLaunch() {
    if (cloudConfig.enabled && wx.cloud) {
      wx.cloud.init({
        env: cloudConfig.env,
        traceUser: cloudConfig.traceUser
      })
    }

    seedDefaultHabits()
  }
})
