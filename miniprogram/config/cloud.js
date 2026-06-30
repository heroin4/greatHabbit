const cloudConfig = {
  enabled: true,
  env: 'REPLACE_WITH_CLOUD_ENV_ID',
  traceUser: true
}

function hasConfiguredCloudEnv() {
  return cloudConfig.enabled && cloudConfig.env && !cloudConfig.env.startsWith('REPLACE_WITH')
}

module.exports = {
  cloudConfig,
  hasConfiguredCloudEnv
}
