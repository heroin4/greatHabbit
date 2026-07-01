const { deleteHabit, getTodayHabits, upsertHabitLog } = require('../../utils/storage')
const { todayKey } = require('../../utils/date')
const appMeta = require('../../config/app-meta')

Page({
  data: {
    today: '',
    habits: [],
    completedCount: 0,
    progressPercent: 0,
    encouragementText: '先完成一个最小动作，今天就已经开始变好了。',
    swipedHabitId: '',
    touchStartX: 0,
    appMeta
  },

  onShow() {
    this.loadHabits()
  },

  loadHabits() {
    const habits = this.withSwipeState(getTodayHabits(), this.data.swipedHabitId)
    const completedCount = habits.filter((habit) => habit.log).length
    const progressPercent = habits.length ? Math.round((completedCount / habits.length) * 100) : 0
    this.setData({
      today: todayKey(),
      habits,
      completedCount,
      progressPercent,
      encouragementText: this.buildEncouragement(progressPercent, completedCount, habits.length)
    })
  },

  withSwipeState(habits, swipedHabitId) {
    return habits.map((habit) => ({
      ...habit,
      swipeState: habit.id === swipedHabitId ? 'is-open' : '',
      swipeX: habit.id === swipedHabitId ? '-184rpx' : '0'
    }))
  },

  setSwipedHabit(swipedHabitId) {
    this.setData({
      swipedHabitId,
      habits: this.withSwipeState(this.data.habits, swipedHabitId)
    })
  },

  buildEncouragement(progressPercent, completedCount, totalCount) {
    if (totalCount === 0) {
      return '先添加一个今天想完成的小习惯，让生活开始有节奏。'
    }

    if (progressPercent === 100) {
      return '今天的节奏已经完成，给自己一个认真生活的肯定。'
    }

    if (completedCount > 0) {
      return `已经完成 ${completedCount} 个习惯，继续保持这个稳定的节奏。`
    }

    return '先完成一个最小动作，今天就已经开始变好了。'
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/habit-edit/habit-edit' })
  },

  onHabitTouchStart(event) {
    this.setData({ touchStartX: event.touches[0].clientX })
  },

  onHabitTouchEnd(event) {
    const endX = event.changedTouches[0].clientX
    const deltaX = endX - this.data.touchStartX
    const habitId = event.currentTarget.dataset.id

    if (deltaX < -50) {
      this.setSwipedHabit(habitId)
      return
    }

    if (deltaX > 35 && this.data.swipedHabitId === habitId) {
      this.closeSwipe()
    }
  },

  editHabit(event) {
    const habitId = event.currentTarget.dataset.id
    if (this.data.swipedHabitId === habitId) {
      this.closeSwipe()
      return
    }

    wx.navigateTo({ url: `/pages/habit-edit/habit-edit?id=${habitId}` })
  },

  closeSwipe() {
    this.setSwipedHabit('')
  },

  deleteHabit(event) {
    const habit = this.data.habits.find((item) => item.id === event.currentTarget.dataset.id)
    if (!habit) {
      return
    }

    wx.showModal({
      title: `删除${habit.name}`,
      content: '删除后会同时清除这个习惯的本地记录，确定继续吗？',
      confirmColor: '#D94A4A',
      success: (result) => {
        if (!result.confirm) {
          this.closeSwipe()
          return
        }

        deleteHabit(habit.id)
        this.setSwipedHabit('')
        this.loadHabits()
        wx.showToast({ title: '已删除', icon: 'success' })
      }
    })
  },

  recordHabit(event) {
    const habit = this.data.habits.find((item) => item.id === event.currentTarget.dataset.id)
    if (!habit) {
      return
    }

    wx.showModal({
      title: `记录${habit.name}`,
      editable: true,
      placeholderText: `默认 ${habit.targetValue}${habit.unit}，可输入实际数值`,
      success: (result) => {
        if (!result.confirm) {
          return
        }

        const value = Number(result.content) || habit.targetValue
        upsertHabitLog({ habit, value })
        this.closeSwipe()
        this.loadHabits()
        wx.showToast({ title: '已记录', icon: 'success' })
      }
    })
  }
})
