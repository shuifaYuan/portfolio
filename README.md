# 袁水发 · 数字产品作品集

一个无需构建的静态作品集，展示三个项目的真实界面与交互实现：

线上地址：`https://shuifaYuan.github.io/portfolio/`

- 优选商城：Vue 3 + Express 全栈电商平台
- 校园闲置：uni-app + Django 跨端校园交易平台
- 深潜档案：Unity 2022.3 第一人称密室逃脱游戏

## 本地预览

在项目目录启动任意静态服务器：

```powershell
python -m http.server 4173
```

打开 `http://127.0.0.1:4173/`。

## GitHub Pages

仓库推送到 GitHub 后，在 **Settings → Pages** 中选择：

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

页面不依赖打包工具，根目录的 `index.html` 会被直接发布。

## 更新内容

- 项目截图位于 `assets/projects/`
- 页面文案与项目结构位于 `index.html`
- 视觉样式位于 `styles.css`
- 截图抓取脚本位于 `tools/capture-project-shots.cjs`
