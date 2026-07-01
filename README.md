# greatHabbit

一个对标 Habitify 使用体验的每日习惯记录产品方案，优先落地为微信小程序，也可扩展到 Web / App。

## 核心目标

帮助用户把「念诵经文、深蹲、学习英语」等重复性事项变成可提醒、可记录、可复盘的日常规律。

## 文档导航

- [产品方案 / PRD](docs/habitify-style-prd.md)
- [微信小程序技术方案](docs/wechat-miniprogram-architecture.md)
- [MVP 迭代路线图](docs/mvp-roadmap.md)
- [Habitify 功能对照与差距分析](docs/habitify-feature-gap.md)
- [微信云开发与订阅消息提醒方案](docs/wechat-cloud-reminders.md)
- [微信开发者工具预览排查](docs/preview-troubleshooting.md)
- [习惯奖励系统初步方案](docs/reward-system-proposal.md)

## MVP 范围

1. 创建习惯：名称、图标、颜色、分组、目标类型、频率、提醒时间。
2. 今日打卡：完成 / 跳过 / 失败，支持计数、时长、备注。
3. 统计数据：连续天数、完成率、总时长 / 总次数、日历热力图、单习惯趋势。
4. 微信提醒：订阅消息 + 小程序内待办提醒。
5. 本地优先体验：先用云开发快速上线，后续再抽象 API 支持多端。
