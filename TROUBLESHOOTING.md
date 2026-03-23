# Cloudflare Pages 部署排查指南

## 问题诊断

你遇到的部署或访问问题通常由以下原因引起：

1. ✅ **构建输出目录配置**
2. ⚠️ **Pages Root Directory 设置错误**
3. ⚠️ **Node.js 版本不一致**
4. ⚠️ **自定义域名 DNS 未切换完成**

## 🔧 解决方案

### 方案 1: 直接重新部署（推荐）

如果你是通过 Wrangler 或 Cloudflare Dashboard 部署的：

```bash
cd D:\projects\TIWIB_Niche\tiwib-site
npm run cf:deploy
```

### 方案 2: 检查项目根目录

如果你是从 Git 仓库连接到 Cloudflare Pages，确保：

- Root directory 不是空的整仓库时，要显式填 `tiwib-site`
- Build command 为 `npm run build`
- Build output directory 为 `dist`

Cloudflare Pages 需要看到项目根目录下有：
- `package.json`
- `index.html`
- `src/`
- `wrangler.jsonc`

### 方案 3: 使用 Wrangler（最可靠）

```bash
# 1. 在项目目录
cd D:\projects\TIWIB_Niche\tiwib-site

# 2. 确认已登录
npx wrangler whoami

# 3. 首次创建项目（只需一次）
npx wrangler pages project create tiwib-site

# 4. 生产部署
npm run cf:deploy
```

### 方案 4: GitHub 集成（最佳实践）

```bash
# 1. 创建 GitHub 仓库
# 访问 https://github.com/new

# 2. 推送代码
cd d:\projects\TIWIB_Niche\tiwib-site
git remote add origin https://github.com/YOUR_USERNAME/tiwib-site.git
git branch -M main
git push -u origin main

# 3. 在 Cloudflare 连接 GitHub
# - 访问 dash.cloudflare.com
# - Import Project
# - 选择你的 GitHub 仓库
# - Root directory 填 tiwib-site
# - Build command 填 npm run build
# - Output directory 填 dist
```

## ✅ 验证清单

部署前确认：

- [ ] `dist` 文件夹存在且包含构建文件
- [ ] `wrangler.jsonc` 配置正确
- [ ] `package.json` 包含 build 脚本
- [ ] Git 已提交所有更改

## 🐛 调试步骤

如果还是 404：

1. **检查 Cloudflare 构建日志**
   - Dashboard → Workers & Pages → 点击失败的部署
   - 查看 "Build Logs"

2. **本地测试构建**
   ```bash
   npm run build
   npm run preview
   ```
   访问 http://localhost:4173 确认本地可用

3. **检查 dist 目录**
   ```bash
   cd dist
   ls
   ```
   应该看到 `index.html` 和 `assets/` 文件夹

## 📞 需要帮助？

把 Cloudflare 的构建日志发给我，我帮你诊断具体问题！
