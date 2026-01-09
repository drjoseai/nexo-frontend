# NEXO v2.0 - Deployment Guide

## 📋 Overview

This document describes the deployment process and environment configuration for NEXO v2.0.

## 🌍 Environments

### Production
- **Frontend**: https://app.trynexo.ai (Vercel)
- **Backend**: https://nexo-v2-core.onrender.com (Render)
- **Environment File**: `.env.production`

### Development
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Environment File**: `.env.local`

## 🔐 Environment Variables

### Frontend (Next.js)

Variables are managed through environment files:

#### `.env.local` (Development)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### `.env.production` (Production)
```bash
NEXT_PUBLIC_API_URL=https://nexo-v2-core.onrender.com
NEXT_PUBLIC_APP_URL=https://app.trynexo.ai
```

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Backend (FastAPI)

Backend environment variables are managed through Render Dashboard:
- `DATABASE_URL`
- `SECRET_KEY`
- `OPENAI_API_KEY`
- `REDIS_URL`
- `STRIPE_SECRET_KEY`
- `BACKEND_CORS_ORIGINS`

## 🚀 Deployment Process

### Automatic Deployment (Recommended)

Both frontend and backend deploy automatically on push to main branch:
```bash
# Make your changes
git add .
git commit -m "your changes"
git push origin main

# Vercel deploys frontend automatically
# Render deploys backend automatically
```

### Manual Deployment

#### Frontend (Vercel)
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy to production
vercel --prod
```

#### Backend (Render)
Deployments are triggered automatically via GitHub integration.

## 🔍 Verification

### After Deployment

1. **Check Frontend Build**
   - Go to: https://vercel.com/dashboard
   - Verify build succeeded
   - Check environment variables are loaded

2. **Check Backend Status**
   - Go to: https://dashboard.render.com
   - Verify service is live
   - Check logs for errors

3. **Test API Connection**
```bash
   # From browser console on app.trynexo.ai
   fetch('https://nexo-v2-core.onrender.com/health')
     .then(r => r.json())
     .then(console.log)
```

4. **Test Full Flow**
   - Login at https://app.trynexo.ai
   - Start a conversation
   - Verify messages are sent/received

## 🐛 Troubleshooting

### CORS Errors (401/403)

**Symptoms**: Cannot connect to backend from frontend

**Solution**:
1. Verify `.env.production` has correct API URL
2. Verify backend CORS settings in `app/main.py`:
```python
   CORS_ORIGINS_PROD = [
       "https://app.trynexo.ai",
       "https://trynexo.ai",
       # ...
   ]
```
3. Check Vercel build logs
4. Redeploy if needed

### Environment Variables Not Loading

**Symptoms**: `process.env.NEXT_PUBLIC_API_URL` is undefined

**Solution**:
1. Verify `.env.production` exists in root
2. Verify file is committed to Git
3. Trigger new deployment
4. Check Vercel build logs

### Backend Not Responding

**Symptoms**: 502/504 errors

**Solution**:
1. Check Render service status
2. Check Render logs for errors
3. Verify backend is running
4. Check database connection
5. Verify Redis connection

## 📝 Updating Environment Variables

### Frontend Variables

1. Edit `.env.production`
2. Commit and push to Git
3. Vercel will auto-deploy with new values
```bash
# Update variable
nano .env.production

# Commit
git add .env.production
git commit -m "chore: update environment variables"
git push origin main
```

### Backend Variables

1. Go to Render Dashboard
2. Navigate to Service → Settings → Environment
3. Update variables
4. Service will auto-restart

## 🧪 Testing Before Deployment

Always run tests before committing:
```bash
# Frontend tests
npm test

# Frontend linting
npm run lint

# Frontend build verification
npm run build
```

## 🔒 Security Notes

- **Never** commit `.env.local` to Git (it's in `.gitignore`)
- **Always** commit `.env.production` (needed for deployments)
- **Never** put sensitive secrets in `.env.production` (use Vercel Dashboard for secrets)
- **Always** use `NEXT_PUBLIC_` prefix for client-exposed variables
- Sensitive backend variables stay in Render Dashboard only

## 📊 Current Architecture
```
┌─────────────────────────────────────────┐
│  User Browser                           │
│  https://app.trynexo.ai                 │
└──────────────┬──────────────────────────┘
               │
               │ HTTPS (reads NEXT_PUBLIC_API_URL)
               │
┌──────────────▼──────────────────────────┐
│  Vercel (Frontend)                      │
│  - Next.js 14 App Router                │
│  - Reads .env.production on build       │
│  - Serves static/SSR pages              │
└──────────────┬──────────────────────────┘
               │
               │ API Calls (with httpOnly cookies)
               │
┌──────────────▼──────────────────────────┐
│  Render (Backend)                       │
│  https://nexo-v2-core.onrender.com      │
│  - FastAPI Python 3.11                  │
│  - PostgreSQL + Redis                   │
│  - OpenAI API integration               │
└─────────────────────────────────────────┘
```

## 📚 Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Render Deployment](https://render.com/docs/deploys)
- [NEXO Technical Decisions](./TECHNICAL_DECISIONS.md)

## 🆘 Support

If you encounter issues:
1. Check this documentation first
2. Check Vercel/Render logs
3. Review recent Git commits
4. Check NEXO_TRASPASO documents in project
5. Contact team lead

## 📈 Monitoring

### Production Health Checks

- **Frontend**: https://app.trynexo.ai (should load)
- **Backend Health**: https://nexo-v2-core.onrender.com/health
- **Backend Docs**: https://nexo-v2-core.onrender.com/docs

### Key Metrics to Monitor

- Response times < 200ms
- Zero 5xx errors
- Test coverage > 80%
- Build times < 2 minutes

---

**Last Updated**: 2026-01-09  
**Maintained By**: NEXO Development Team  
**Version**: 2.0 Sprint 4

