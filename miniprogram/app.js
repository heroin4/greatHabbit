const { cloudConfig, hasConfiguredCloudEnv } = require('./config/cloud')
const { seedDefaultHabits } = require('./utils/storage')

App({
  onLaunch() {
    if (hasConfiguredCloudEnv() && wx.cloud) {
      wx.cloud.init({
        env: cloudConfig.env,
        traceUser: cloudConfig.traceUser
      })
    }

    seedDefaultHabits()
  }
})
