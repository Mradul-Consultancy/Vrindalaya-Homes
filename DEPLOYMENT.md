# 🚀 Production Deployment Guide: Real Estate Project

This guide provides end-to-end instructions to deploy your Django REST backend and React Vite frontend to production with SSL, automated builds, and database connectivity.

---

## 🏗️ Architecture Overview

- **Backend**: Django 5 + Django REST Framework + Gunicorn + WhiteNoise
- **Database**: Managed MySQL or PostgreSQL via `DATABASE_URL` / standard MySQL env vars
- **File Storage**: Cloudinary (for uploaded property listings and images)
- **Frontend**: Vite + React 19 SPA (served on Vercel or Netlify with automatic HTTPS and edge CDN)

---

## 🌟 Recommended Option: Render (Backend + Database) & Vercel (Frontend)

### Step 1: Deploy Backend & Database on Render

1. Push your project to GitHub / GitLab:
   ```bash
   git add .
   git commit -m "Configure production deployment"
   git push origin main
   ```
2. Log into [Render](https://render.com).
3. Click **"New +"** > **"Blueprint"**.
4. Connect your repository. Render will automatically detect [`render.yaml`](file:///e:/Sid/Real-Estate/render.yaml).
5. It will set up:
   - **Database**: `realestate-db` (Managed database with automatic connection string)
   - **Web Service**: `realestate-backend` (Django running Gunicorn via `uv`)
6. In the Render Dashboard under **Environment**, set your custom variables:
   - `ALLOWED_HOSTS`: `.onrender.com,your-custom-domain.com`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
   - `CSRF_TRUSTED_ORIGINS`: `https://your-frontend.vercel.app`
   - `CLOUD_NAME`: *(Your Cloudinary Cloud Name)*
   - `CLOUD_API_KEY`: *(Your Cloudinary API Key)*
   - `CLOUD_API_SECRET`: *(Your Cloudinary API Secret)*
   - `EMAIL_HOST_USER`: *(Your Gmail / SMTP user)*
   - `EMAIL_HOST_PASSWORD`: *(Your App Password)*
7. Copy your backend live URL (e.g., `https://realestate-backend.onrender.com`).

---

### Step 2: Deploy Frontend on Vercel

1. Log into [Vercel](https://vercel.com) and click **"Add New..."** > **"Project"**.
2. Select your repository.
3. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://realestate-backend.onrender.com/api`
5. Click **Deploy**. Vercel will build and deploy your app.
6. Copy the Vercel domain (e.g., `https://real-estate-example.vercel.app`) and ensure it is included in the backend's `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`.

---

## 🐳 Alternative Option: Docker Compose (VPS / Self-Hosted)

If deploying to an Ubuntu/Debian VPS (DigitalOcean, Hetzner, AWS EC2, Linode):

1. Clone repository to server.
2. In `backend/.env`, set:
   - `DEBUG=False`
   - `SECRET_KEY=your-secure-random-key`
   - `ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com`
   - `CORS_ALLOWED_ORIGINS=https://yourdomain.com`
   - Cloudinary and Email credentials.
3. Start all services in detached mode:
   ```bash
   docker compose up -d --build
   ```
4. Run migrations and collect static files:
   ```bash
   docker compose exec backend uv run python backend/manage.py migrate
   docker compose exec backend uv run python backend/manage.py collectstatic --noinput
   ```
5. Use Nginx + Certbot on the host to route traffic and issue free SSL certificates:
   - `https://yourdomain.com` -> `http://localhost:5173`
   - `https://api.yourdomain.com` -> `http://localhost:8000`

---

## ✅ Pre-flight Checklist

- [x] Frontend tests passing (`npm test` - 3/3 passed).
- [x] Frontend builds cleanly (`npm run build` - successful).
- [x] Backend test suite passing (`uv run pytest` - 17/17 passed).
- [x] Backend checks passing (`manage.py check` - 0 issues).
- [x] Production WSGI server (`gunicorn`) installed & configured.
- [x] Static files middleware (`whitenoise`) enabled.
- [x] `DATABASE_URL` parser added for cloud providers.
- [x] SPA routing rules created ([`vercel.json`](file:///e:/Sid/Real-Estate/frontend/vercel.json) and [`_redirects`](file:///e:/Sid/Real-Estate/frontend/public/_redirects)).
