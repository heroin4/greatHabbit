# 微信小程序技术方案

## 1. 技术选型

MVP 推荐使用微信原生小程序 + 微信云开发：

- 前端：微信原生小程序、TypeScript、TDesign Mini Program 或 Vant Weapp。
- 后端：微信云开发 CloudBase。
- 数据库：云数据库集合。
- 定时任务：云函数定时触发，用于生成提醒候选、统计汇总。
- 消息：微信订阅消息。

这样可以减少账号系统、服务器部署和登录鉴权成本，优先验证产品。

## 2. 页面结构

```text
miniprogram/
├── pages/
│   ├── today/          # 今日习惯
│   ├── habit-edit/     # 新建 / 编辑习惯
│   ├── habit-detail/   # 习惯详情
│   ├── stats/          # 统计总览
│   └── profile/        # 我的 / 设置
├── components/
│   ├── habit-card/
│   ├── progress-ring/
│   ├── calendar-heatmap/
│   └── duration-picker/
└── utils/
    ├── date.ts
    ├── stats.ts
    └── reminder.ts

cloudfunctions/
├── createHabit/
├── logHabit/
├── getTodayHabits/
├── getHabitStats/
└── sendReminder/
```

## 3. 数据模型

### 3.1 habits

```json
{
  "_id": "habit_id",
  "userId": "openid",
  "name": "念诵经文",
  "icon": "book",
  "color": "#7C6FF6",
  "group": "修行",
  "goalType": "duration",
  "targetValue": 30,
  "unit": "minute",
  "frequency": {
    "type": "daily",
    "weekdays": []
  },
  "reminders": [
    { "time": "06:30", "enabled": true }
  ],
  "sortOrder": 10,
  "archived": false,
  "createdAt": "2026-06-30T00:00:00.000Z",
  "updatedAt": "2026-06-30T00:00:00.000Z"
}
```

### 3.2 habit_logs

```json
{
  "_id": "log_id",
  "habitId": "habit_id",
  "userId": "openid",
  "date": "2026-06-30",
  "status": "completed",
  "value": 35,
  "unit": "minute",
  "startedAt": "2026-06-30T06:30:00.000Z",
  "endedAt": "2026-06-30T07:05:00.000Z",
  "note": "念诵 2 遍",
  "createdAt": "2026-06-30T07:05:00.000Z"
}
```

### 3.3 habit_stats_daily

```json
{
  "_id": "stat_id",
  "habitId": "habit_id",
  "userId": "openid",
  "date": "2026-06-30",
  "required": true,
  "completed": true,
  "value": 35,
  "unit": "minute"
}
```

## 4. 核心统计算法

### 4.1 完成率

```text
完成率 = 已完成应做天数 / 应做天数
```

跳过是否计入分母建议做成配置：MVP 默认跳过不算失败，但仍在日历上标记。

### 4.2 连续天数

从今天或最近一个应做日向前遍历：

1. 如果当天不需要做，继续往前。
2. 如果当天完成，连续天数 +1。
3. 如果当天未完成，停止。

### 4.3 总投入

- 时长型：按 `value` 求和，单位分钟。
- 计数型：按 `value` 求和，单位为用户自定义单位。
- 完成型：统计完成次数。

## 5. 提醒实现

微信小程序提醒建议分两层：

1. 小程序内提醒：今日页置顶未完成事项。
2. 微信订阅消息：用户授权后，在指定时间发送模板消息。

注意事项：

- 订阅消息通常需要用户主动授权，不能默认无限发送。
- 每次创建或编辑提醒后，引导用户订阅。
- 已完成习惯不再发送当天提醒。

## 6. 隐私与数据安全

- 所有数据按 `openid` 隔离。
- 云函数校验 `userId`，前端不能任意传入他人用户 ID。
- 备注可能包含隐私内容，统计页默认只展示聚合数据。
- 支持删除账号数据和导出数据。

## 7. 可扩展方向

当小程序验证成功后，可以把云函数接口抽象成 REST / GraphQL API，再接入 Web、iOS 或 Android。数据模型中的 `habit` 和 `habit_log` 不绑定微信平台，迁移成本较低。
