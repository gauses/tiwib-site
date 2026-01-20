# 如何在 Vercel 触发重新部署

## 📋 步骤说明

### 方法 1: 自动触发（推荐）

一旦你 `git push` 成功，Vercel 会**自动检测到 GitHub 的更新**并触发重新部署。

**等待时间**: 通常 30 秒 - 2 分钟

**查看进度**:
1. 访问 https://vercel.com/dashboard
2. 找到你的项目 `gauses_tiwib_niche`
3. 你会看到新的部署正在进行中

### 方法 2: 手动触发

如果自动部署没有触发，手动操作：

#### 步骤：

1. **访问 Vercel Dashboard**
   - https://vercel.com/dashboard
   - 找到项目 `gauses_tiwib_niche`

2. **进入 Deployments 页面**
   - 点击项目名称
   - 点击顶部的 "Deployments" 标签

3. **触发重新部署**
   - 找到最新的部署记录
   - 点击右侧的 "..." 三个点
   - 选择 "Redeploy"
   - 确认 "Redeploy"

### 方法 3: 从 Git 标签触发

在 Deployments 页面：
1. 点击 "Create Deployment"
2. 选择分支: `main` 或 `master`
3. 点击 "Deploy"

## 🔍 监控部署状态

### 实时查看构建日志

1. 在 Deployments 页面
2. 点击正在进行的部署
3. 查看 "Building" 状态
4. 点击 "View Build Logs" 查看详细日志

### 部署状态说明

- 🟡 **Building** - 正在构建
- 🟡 **Deploying** - 正在部署
- 🟢 **Ready** - 部署成功
- 🔴 **Error** - 部署失败

## ✅ 验证部署成功

部署完成后：

1. **检查状态**
   - 状态应该显示 "Ready"
   - 有绿色的 ✓ 标记

2. **访问网站**
   - 点击 "Visit" 按钮
   - 或访问: https://gausestiwibniche.vercel.app

3. **测试功能**
   - 检查产品是否正常显示
   - 测试页面加载速度
   - 验证链接是否正常工作

## 🐛 如果部署失败

### 查看错误日志

1. 点击失败的部署
2. 查看 "Build Logs"
3. 找到红色的错误信息
4. 截图发给我诊断

### 常见错误

**错误**: `npm install failed`
**解决**: Node.js 版本问题，已在 package.json 添加 engines 字段

**错误**: `Build command failed`
**解决**: 检查依赖是否完整

**错误**: `Output directory not found`
**解决**: 检查 vercel.json 配置

## 📞 需要帮助

如果遇到问题：
1. 截图 Vercel 的构建日志
2. 发给我诊断
3. 我会帮你快速解决

---

**预计时间**: 2-3 分钟完成整个部署流程
