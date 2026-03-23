# TIWIB Site - Cloudflare Deployment Guide

## 🚀 推荐方案

这个项目现在默认按 **Cloudflare Pages** 部署来维护：

- 构建命令：`npm run build`
- 输出目录：`dist`
- Pages 配置文件：`wrangler.jsonc`
- Node 版本锁定：`.node-version`

## 方式 1：Cloudflare Dashboard + Git（推荐）

1. 把代码推到 GitHub。
2. 进入 Cloudflare Dashboard。
3. 打开 `Workers & Pages`。
4. 选择 `Create application` → `Pages` → `Connect to Git`。
5. 选择仓库后填写：
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `tiwib-site`（如果你的仓库根目录是 `TIWIB_Niche`）
6. 点击部署。

## 方式 2：Wrangler 直接部署

### 首次创建项目

```bash
cd D:\projects\TIWIB_Niche\tiwib-site
npx wrangler pages project create tiwib-site
```

### 生产部署

```bash
cd D:\projects\TIWIB_Niche\tiwib-site
npm run cf:deploy
```

### 查看部署日志

```bash
npm run cf:tail
```

## 自定义域名

如果你要把现有域名从 Vercel 切到 Cloudflare：

1. 在 Pages 项目里打开 `Custom domains`
2. 添加你的正式域名
3. 按 Cloudflare 提示改 DNS
4. 等 SSL 签发完成后再切主流量

## 当前项目状态

- 前端构建通过
- `catalog` 分块加载已启用
- 当前站点数据量约 `19,640` 条
- 适合直接部署到 Cloudflare Pages
