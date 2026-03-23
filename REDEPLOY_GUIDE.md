# 如何在 Cloudflare 触发重新部署

## 📋 步骤说明

### 方法 1: Git 自动触发（推荐）

一旦你 `git push` 成功，Cloudflare Pages 会**自动检测到 GitHub 的更新**并触发重新部署。

**等待时间**: 通常 30 秒 - 2 分钟

**查看进度**:
1. 访问 https://dash.cloudflare.com/
2. 找到你的 Pages 项目 `tiwib-site`
3. 你会看到新的部署正在进行中

### 方法 2: 手动触发

如果自动部署没有触发，手动操作：

#### 步骤：

1. **访问 Cloudflare Dashboard**
   - https://dash.cloudflare.com/
   - 打开 `Workers & Pages`
   - 找到项目 `tiwib-site`

2. **进入 Deployments 页面**
   - 点击项目名称
   - 打开部署列表

3. **触发重新部署**
   - 选择目标部署
   - 执行重新部署

### 方法 3: Wrangler 重新部署

```bash
cd D:\projects\TIWIB_Niche\tiwib-site
npm run cf:deploy
```

## 🔍 监控部署状态

### 实时查看构建日志

1. 在 Pages 部署页面
2. 点击正在进行的部署
3. 查看构建和上传日志

### 部署状态说明

- 🟡 **Building** - 正在构建
- 🟡 **Deploying** - 正在上传 / 发布
- 🟢 **Ready** - 部署成功
- 🔴 **Error** - 部署失败

## ✅ 验证部署成功

部署完成后：

1. **检查状态**
   - 状态应该显示 "Ready"
   - 有绿色的 ✓ 标记

2. **访问网站**
   - 点击 "Visit" 按钮
   - 或访问你的 `*.pages.dev` 地址

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
**解决**: 检查 Pages 输出目录是否为 `dist`

## 📞 需要帮助

如果遇到问题：
1. 截图 Cloudflare 的构建日志
2. 发给我诊断
3. 我会帮你快速解决

---

**预计时间**: 2-3 分钟完成整个部署流程
