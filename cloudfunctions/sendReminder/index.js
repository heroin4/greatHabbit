const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { openid, templateId, page = 'pages/today/today', data } = event

  if (!openid || !templateId || !data) {
    return {
      ok: false,
      message: 'openid、templateId 和 data 均为必填项'
    }
  }

  const result = await cloud.openapi.subscribeMessage.send({
    touser: openid,
    templateId,
    page,
    data
  })

  return {
    ok: true,
    result
  }
}
