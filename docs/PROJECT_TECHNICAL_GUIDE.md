# 项目技术指南

## 架构

项目采用静态多页面架构。`index.html` 进入 `注册and登陆/login.html`；账户验证后到 `menu.html`，角色入口进入 `主线` 下对应 HTML。各剧情页装配章节 JS 数据、对应路线的 `op1.js`、`op2.js` 和 jQuery；结局页运行独立结局脚本。菜单也链接成就、玩法和团队介绍。页面导航使用普通链接和 JavaScript 跳转，没有路由框架。

## 剧情与数据

章节 JS 的 `op` 包含 `type`、`steps`、`name`、`texts`、`small`，以及部分页面的下一页；`op1.js` 维护当前点击索引，按场景类型自动跳转或显示选项。三份引擎保留原路径，修改时须保持一致。章节选项的目标由 HTML 的 `goto(...)` 指定，剧情文本不由样式层计算。

账户数组保存在 `localStorage.userArr`，当前账户以 `userid` 索引；角色成就嵌套在用户对象内。章节存档使用 `saveData_<userid>_<role>`，记录 URL、时间、背景和首句，不保存对话索引。菜单校验存档路径并兼容旧本地文件地址。不要将此结构描述为安全认证或云存储。

林晚星的 `achi1` 至 `achi3` 表示剧情结局、`achi4` 表示金币成就、`achi5` 表示汇总。修复发生以前的旧数据可能已经存在字段含义混淆，无法仅凭旧标记可靠推断其来源。

## 小游戏

`minigame/接金币.html` 使用定时生成和下落、动画帧移动平台，管理生命、分数与胜败跳转；监听器只注册一次，重开及离页清理相关资源。`minigame/解谜/解谜.html` 保存 6×8 格子，检测直线、一拐点和两拐点路径的阻挡；开局无相邻配对时交换符号，确保可开始，但不保证整个棋盘必然可解。

## 工程与验证

`scripts/serve.mjs` 提供本地 HTTP，`scripts/check.mjs` 检查脚本语法和静态引用，`scripts/build.mjs` 复制运行目录到 `dist/`。`tests/` 使用 Node 内置测试与模拟 DOM 覆盖状态、存档、路径和游戏规则；`tests/fixtures/original-ui.json` 守护原版样式。自动测试不能替代浏览器完整游玩。

修复细节与验证范围见 [BUGFIX_REPORT.md](BUGFIX_REPORT.md)；依赖、媒体来源及未确认事项见 [THIRD_PARTY_ASSETS.md](THIRD_PARTY_ASSETS.md)。本次未迁移架构或改变原版视觉设计。
