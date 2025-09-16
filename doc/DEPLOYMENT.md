# 🚀 Vercel Deployment Guide

This guide will help you deploy ElevateHealth to Vercel for production use.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Environment Variables**: Prepare your API keys

## 🔧 Environment Variables Setup

### Required Variables

Set these in your Vercel project dashboard:

```bash
# OpenAI API Key (Required for food analysis)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Supabase (Optional - for database features)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### How to Add Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with the appropriate value
4. Make sure to set them for **Production**, **Preview**, and **Development**

## 🚀 Deployment Methods

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set up environment variables
   - Deploy

### Method 2: GitHub Integration

1. **Connect GitHub Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **"New Project"**
   - Import your GitHub repository

2. **Configure Project**:
   - Framework: **Next.js** (auto-detected)
   - Root Directory: `/` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Add Environment Variables**:
   - Add all required environment variables
   - Deploy

## ⚙️ Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/analyze-food/route.ts": {
      "maxDuration": 30
    },
    "app/api/analyze-barcode/route.ts": {
      "maxDuration": 10
    }
  }
}
```

## 🔍 Post-Deployment Checklist

### ✅ Verify Deployment
- [ ] Site loads without errors
- [ ] Food analytics page works
- [ ] Camera functionality works
- [ ] API endpoints respond correctly
- [ ] Environment variables are set

### ✅ Test Features
- [ ] Upload food image
- [ ] Take photo with camera
- [ ] Scan barcode
- [ ] View analysis results
- [ ] Check error handling

### ✅ Performance Check
- [ ] Page load times are acceptable
- [ ] API responses are fast
- [ ] Images load properly
- [ ] Mobile responsiveness works

## 🛠️ Troubleshooting

### Common Issues

**Build Failures**:
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check for TypeScript errors

**API Errors**:
- Verify environment variables are set correctly
- Check API key validity
- Review function timeout settings

**Camera Issues**:
- Ensure HTTPS is enabled (required for camera access)
- Check browser permissions
- Test on different devices

**Environment Variables**:
- Double-check variable names and values
- Ensure they're set for all environments
- Redeploy after adding new variables

### Debug Steps

1. **Check Vercel Function Logs**:
   - Go to your project dashboard
   - Navigate to **Functions** tab
   - Check logs for errors

2. **Test API Endpoints**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/analyze-food \
     -H "Content-Type: application/json" \
     -d '{"image": "data:image/jpeg;base64,..."}'
   ```

3. **Browser Console**:
   - Open browser dev tools
   - Check for JavaScript errors
   - Monitor network requests

## 🔄 Continuous Deployment

Once set up, Vercel will automatically deploy:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches
- **Development**: Local development with `vercel dev`

## 📊 Monitoring

- **Analytics**: Built-in Vercel Analytics
- **Performance**: Core Web Vitals monitoring
- **Errors**: Real-time error tracking
- **Functions**: Serverless function monitoring

## 🎯 Production Tips

1. **Enable HTTPS**: Vercel provides this automatically
2. **Set up Custom Domain**: Add your own domain
3. **Configure CDN**: Vercel Edge Network
4. **Monitor Performance**: Use Vercel Analytics
5. **Set up Alerts**: Monitor for errors and downtime

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Status**: [vercel-status.com](https://vercel-status.com)

---

**Ready to deploy?** Run `vercel` in your project directory to get started! 🚀
