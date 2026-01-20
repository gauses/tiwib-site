# Vercel 404 错误修复指南

## 问题诊断

你遇到的 404 错误通常由以下原因引起：

1. ✅ **构建输出目录配置** - 已修复
2. ⚠️ **部署时的项目根目录** - 需要检查
3. ⚠️ **Git 提交问题** - 需要验证

## 🔧 解决方案

### 方案 1: 重新部署（推荐）

如果你是通过 Vercel Dashboard 上传的：

1. **删除当前部署**
   - 进入 Vercel Dashboard
   - 找到项目 → Settings → Delete Project

2. **重新部署**
   ```bash
   cd d:\projects\TIWIB_Niche\tiwib-site
   vercel --prod
   ```

### 方案 2: 检查项目根目录

如果你是拖拽文件夹上传的，确保：

- ❌ 不要拖拽 `TIWIB_Niche` 整个文件夹
- ✅ 只拖拽 `tiwib-site` 文件夹

Vercel 需要看到项目根目录下有：
- `package.json`
- `index.html`  
- `src/` 目录
- `vercel.json`

### 方案 3: 使用 Vercel CLI（最可靠）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 在项目目录部署
cd d:\projects\TIWIB_Niche\tiwib-site
vercel

# 4. 生产部署
vercel --prod
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

# 3. 在 Vercel 连接 GitHub
# - 访问 vercel.com
# - Import Project
# - 选择你的 GitHub 仓库
# - Vercel 会自动检测 Vite 配置
```

## ✅ 验证清单

部署前确认：

- [ ] `dist` 文件夹存在且包含构建文件
- [ ] `vercel.json` 配置正确
- [ ] `package.json` 包含 build 脚本
- [ ] Git 已提交所有更改

## 🐛 调试步骤

如果还是 404：

1. **检查 Vercel 构建日志**
   - Dashboard → Deployments → 点击失败的部署
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

把 Vercel 的构建日志发给我，我帮你诊断具体问题！
