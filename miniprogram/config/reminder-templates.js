const reminderTemplates = {
  habitDue: {
    templateId: 'REPLACE_WITH_HABIT_DUE_TEMPLATE_ID',
    title: '习惯待完成提醒',
    scene: '到点提醒用户完成一个习惯',
    fields: [
      { key: 'thing1', label: '习惯名称', example: '念诵经文' },
      { key: 'time2', label: '提醒时间', example: '06:30' },
      { key: 'thing3', label: '目标', example: '30 分钟' },
      { key: 'thing4', label: '温和提示', example: '愿你今天也稳稳完成' }
    ]
  },
  dailyReview: {
    templateId: 'REPLACE_WITH_DAILY_REVIEW_TEMPLATE_ID',
    title: '每日复盘提醒',
    scene: '晚上提醒用户查看今天的完成情况',
    fields: [
      { key: 'thing1', label: '复盘事项', example: '今日习惯复盘' },
      { key: 'time2', label: '复盘时间', example: '21:30' },
      { key: 'thing3', label: '提示', example: '看看今天坚持了哪些习惯' }
    ]
  }
}

module.exports = reminderTemplates
