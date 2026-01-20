# TIWIB Site - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Deploy
cd d:\projects\TIWIB_Niche\tiwib-site
vercel

# Production deploy
vercel --prod
```

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Drag and drop the `tiwib-site` folder
4. Click "Deploy"

### Option 3: GitHub + Vercel (Recommended)

```bash
# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/tiwib-site.git
git branch -M main
git push -u origin main

# Then connect on Vercel dashboard
```

## 📊 Site Stats

- **Products**: 24 scraped from ThisIsWhyImBroke.com
- **Build Size**: 205KB JS + 11KB CSS
- **Framework**: Vite + React
- **Ready**: ✅ Production build complete

## 🎯 Featured Products

- Crypto Castle Airbnb ($18,598)
- Red Bull RB17 Hypercar ($6.7M)
- 1945 P-51 Mustang ($2.1M)
- Cobalt Valkyrie Aircraft ($700K)
- Xbox Crocs ($80)
- ...and 19 more!

## 🔧 Post-Deployment

1. **Get URL**: `https://tiwib-site.vercel.app`
2. **Apply for Amazon Associates**
3. **Update affiliate tags** in `src/utils/affiliateLink.js`
4. **Add more products** using the scraper tool

## 💡 Next Steps

- [ ] Deploy site
- [ ] Apply for Amazon Associates
- [ ] Run AI rewriter on remaining products
- [ ] Add Google Analytics
- [ ] Share on social media
