# 微信开发者工具预览指南

## 1. 现在能不能导入预览？

可以。当前项目已经具备微信开发者工具可识别的 `project.config.json`、`miniprogram/` 小程序目录、页面路由和本地存储数据。即使你还没有正式 AppID，也可以先用测试号 / 游客模式打开本地预览，查看首页、创建习惯、记录完成和统计汇总。

## 2. 导入步骤

1. 打开微信开发者工具。
2. 选择「导入项目」。
3. 项目目录选择仓库根目录 `greatHabbit`。
4. 如果你还没有 AppID，先使用测试号或保持当前 `touristappid`。
5. 导入后点击「编译」。
6. 进入「今日」页，默认会看到念诵经文、静坐冥想、深蹲、喝水、拉伸、学习英语、阅读、写日记、早睡等习惯。

## 3. 当前可以预览的功能

- 今日习惯列表。
- 默认习惯模板。
- 新建习惯。
- 输入实际完成数值并记录。
- 统计总时长、总次数和单习惯累计值。
- 我的页查看提醒模板和订阅入口。

## 4. AppID 申请后要替换哪里？

申请到正式 AppID 后，把 `project.config.json` 中的 `appid` 从 `touristappid` 改成你的真实 AppID。

```json
{
  "appid": "你的正式 AppID"
}
```

## 5. 云开发环境创建后要替换哪里？

创建云开发环境后，把 `miniprogram/config/cloud.js` 中的 `env` 从 `REPLACE_WITH_CLOUD_ENV_ID` 改成真实云环境 ID。

当前为了方便你立即预览，代码会检测占位环境 ID：如果还没替换，就不会执行 `wx.cloud.init`，避免因为云环境不存在影响本地预览。

## 6. 订阅消息模板 ID 要替换哪里？

在微信公众平台申请订阅消息模板后，把 `miniprogram/config/reminder-templates.js` 中的两个占位模板 ID 替换成真实模板 ID：

- `REPLACE_WITH_HABIT_DUE_TEMPLATE_ID`
- `REPLACE_WITH_DAILY_REVIEW_TEMPLATE_ID`

未配置模板 ID 时，点击「订阅习惯提醒」会提示先配置模板 ID，这是正常行为。

## 7. 目前预览版的限制

- 数据先存在本地缓存，卸载工具或清缓存会丢失。
- 云数据库 CRUD 还没有接入，下一步可以把本地存储迁移到云数据库。
- 订阅消息需要正式 AppID、已配置模板 ID，并且用户主动授权后才可发送。
- 云函数 `sendReminder` 已有骨架，但需要部署到云开发环境后才能真正发送提醒。
