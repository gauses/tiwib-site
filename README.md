# 毛孩子破产记 - Pet Niche Site 🐾

一个基于 TIWIB 模式的宠物产品联盟营销网站

## 项目概述

这是一个专注于宠物产品的娱乐驱动型联盟营销网站，采用 Amazon Cookie 套利策略实现被动收入。

### 核心特性

- ✅ **娱乐优先**: 有趣的产品 + 幽默的文案
- ✅ **视觉冲击**: 大图展示 + 现代化设计
- ✅ **无限滚动**: 类似抖音的产品流
- ✅ **Amazon 联盟**: 自动生成带追踪的联盟链接
- ✅ **移动优先**: 完全响应式设计
- ✅ **轻资产模式**: 无需囤货、客服、售后

## 技术栈

- **前端框架**: Vite + React
- **样式方案**: Vanilla CSS
- **字体**: Outfit (标题) + Inter (正文)
- **内容管理**: JSON-based
- **部署**: Vercel / Netlify (推荐)

## 项目结构

```
pet-niche-site/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # 导航栏
│   │   ├── Hero.jsx            # 首屏展示
│   │   ├── ProductCard.jsx     # 产品卡片
│   │   ├── ProductGrid.jsx     # 产品网格 (无限滚动)
│   │   └── Footer.jsx          # 页脚
│   ├── data/
│   │   └── products.json       # 产品数据库 (12个示例产品)
│   ├── utils/
│   │   └── affiliateLink.js    # Amazon 联盟链接生成器
│   ├── styles/                 # 组件样式
│   ├── index.css               # 全局设计系统
│   ├── App.jsx                 # 主应用
│   └── main.jsx
└── package.json
```

## 快速开始

### 前置要求

⚠️ **重要**: 本项目需要 Node.js 20.19+ 或 22.12+

当前系统 Node.js 版本: 18.17.0 (不兼容)

### 安装依赖

```bash
cd pet-niche-site
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 配置 Amazon Associates

1. 打开 `src/utils/affiliateLink.js`
2. 替换 `AFFILIATE_TAG` 为你的 Amazon Associates Tag:

```javascript
const AFFILIATE_TAG = 'youraffid-20'; // 替换为你的 tag
```

## 添加产品

编辑 `src/data/products.json`:

```json
{
  "id": "013",
  "title": "产品标题",
  "tagline": "幽默的一句话文案 🎉",
  "image": "图片URL",
  "amazonAsin": "B08XXXXX",
  "category": "cat",
  "wowFactor": 8.5,
  "featured": true,
  "price": "$XX.XX"
}
```

### 产品字段说明

- `id`: 唯一标识符
- `title`: 产品名称
- `tagline`: 吸引人的文案 (最多2行)
- `image`: 产品图片 URL (推荐 800x600px)
- `amazonAsin`: Amazon ASIN 码
- `category`: 分类 (cat/dog/bird/small-pet/tech/general)
- `wowFactor`: 惊奇指数 (1-10)
- `featured`: 是否显示"热门"标签
- `price`: 价格显示

## 内容策展建议

### 产品发现渠道

1. **Reddit**: r/shutupandtakemymoney, r/INEEEEDIT
2. **Amazon**: 新品榜、Best Sellers
3. **Kickstarter/Indiegogo**: 创意众筹产品
4. **社交媒体**: TikTok、Instagram 爆款

### 选品标准

- ✅ Wow Factor > 7/10
- ✅ 有趣、新奇、有话题性
- ✅ 适合分享传播
- ✅ 价格合理 ($20-$150)

## 设计系统

### 色彩方案

```css
--primary: #FF6B35        /* 主色调 - 活力橙 */
--bg-dark: #0F0F0F        /* 背景 - 深黑 */
--bg-card: #1A1A1A        /* 卡片背景 */
--text-primary: #FFFFFF   /* 主文字 */
--accent-yellow: #FFD700  /* 强调色 - 金黄 */
```

### 排版

- **标题**: Outfit (Google Fonts)
- **正文**: Inter (Google Fonts)
- **基础字号**: 16px
- **行高**: 1.6

## 部署指南

### Vercel (推荐)

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 自动检测 Vite 配置
4. 一键部署

### Netlify

1. 构建命令: `npm run build`
2. 发布目录: `dist`
3. 自动部署

## SEO 优化

- ✅ 语义化 HTML
- ✅ Meta 标签完整
- ✅ 图片懒加载
- ✅ 移动端优化
- ✅ 快速加载 (< 2s)

## 下一步计划

- [ ] 升级 Node.js 到 20.19+
- [ ] 申请 Amazon Associates 账号
- [ ] 添加更多产品 (目标 30+)
- [ ] 集成 Google Analytics
- [ ] 添加分类筛选功能
- [ ] 实现产品搜索
- [ ] 添加社交分享按钮

## 商业模式

### Cookie 套利机制

1. 用户点击产品链接 → 跳转 Amazon
2. Amazon 设置 24小时 Cookie
3. 用户购买**任何商品** → 你获得佣金
4. 不限于推荐的产品！

### 收入预期

参考 TIWIB:
- 月访问量: 280万
- 月收入: $20,000+
- 转化率: 2-5%

你的目标 (保守估计):
- 月访问量: 10万
- 点击率: 10%
- Amazon 转化率: 3%
- 平均佣金: $2
- **月收入**: $600

## 许可证

MIT License

## 联系方式

有问题或建议? 欢迎反馈！

---

**记住**: 内容为王！专注于提供娱乐价值，收入自然会来 🚀
