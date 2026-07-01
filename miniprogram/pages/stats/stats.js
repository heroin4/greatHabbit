const { buildOverview } = require('../../utils/stats')

Page({
  data: {
    overview: {
      totalDuration: 0,
      totalCount: 0,
      stats: []
    }
  },

  onShow() {
    this.setData({ overview: buildOverview() })
  }
})
