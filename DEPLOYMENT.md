# 🚀 Deployment Guide for TheOnePercent Trading Dashboard

This guide will help you deploy the React frontend and Python backend to make your trading dashboard accessible from any device.

## 📋 Prerequisites

- Node.js 18+ installed
- Python 3.8+ installed
- Git account
- Vercel/Netlify account (for frontend)
- VPS or cloud hosting (for backend)

## 🏗️ Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel
   ```
   Follow the prompts and set:
   - Project name: `theonepercent-dashboard`
   - Directory: `./` (current directory)

3. **Configure Environment Variables:**
   In Vercel dashboard, go to Project Settings > Environment Variables:
   ```
   VITE_API_URL=https://your-backend-domain.com
   ```

4. **Deploy:**
   ```bash
   npm run deploy:vercel
   ```

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy to Netlify:**
   ```bash
   netlify init
   ```
   Or manually:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Configure Environment Variables:**
   In Netlify dashboard, go to Site Settings > Environment Variables:
   ```
   VITE_API_URL=https://your-backend-domain.com
   ```

## 🐍 Backend Deployment

### Option 1: Railway (Easy)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy:**
   ```bash
   cd backend
   railway init
   railway up
   ```

3. **Set Environment Variables:**
   ```bash
   railway variables set MT5_LOGIN=your_login
   railway variables set MT5_PASSWORD=your_password
   railway variables set MT5_SERVER=your_server
   railway variables set CORS_ORIGINS=https://your-frontend-domain.com
   ```

### Option 2: DigitalOcean App Platform

1. **Create app spec file** (`backend/.do/app.yaml`):
   ```yaml
   name: theonepercent-backend
   services:
   - name: api
     source_dir: /
     github:
       repo: yourusername/trading-dashboard
       branch: main
       deploy_on_push: true
     run_command: python main.py
     environment_slug: python
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: MT5_LOGIN
       value: "${mt5_login}"
     - key: MT5_PASSWORD
       value: "${mt5_password}"
       type: SECRET
     - key: MT5_SERVER
       value: "${mt5_server}"
     - key: CORS_ORIGINS
       value: "${cors_origins}"
   ```

2. **Deploy via DigitalOcean dashboard**

### Option 3: VPS/Cloud Server

1. **Server Setup:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Python
   sudo apt install python3 python3-pip python3-venv -y

   # Install Node.js (for building frontend)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Deploy Backend:**
   ```bash
   cd /var/www/trading-dashboard/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your credentials
   nano .env
   ```

3. **Create Systemd Service:**
   ```bash
   sudo nano /etc/systemd/system/trading-backend.service
   ```

   Add:
   ```
   [Unit]
   Description=TheOnePercent Trading Backend
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/trading-dashboard/backend
   ExecStart=/var/www/trading-dashboard/backend/venv/bin/python main.py
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

4. **Start Service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable trading-backend
   sudo systemctl start trading-backend
   ```

5. **Configure Nginx (Optional):**
   ```bash
   sudo apt install nginx -y
   sudo nano /etc/nginx/sites-available/trading-backend
   ```

   Add:
   ```
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 🔧 Environment Configuration

### Frontend (.env)

```bash
# For local development
VITE_API_URL=http://localhost:8000

# For production
VITE_API_URL=https://your-backend-domain.com
```

### Backend (.env)

```bash
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production
CORS_ORIGINS=https://your-frontend-domain.com
MT5_LOGIN=your_mt5_login
MT5_PASSWORD=your_mt5_password
MT5_SERVER=your_mt5_server
```

## 🚀 Quick Start Commands

### Development
```bash
# Frontend
npm install
npm run dev

# Backend (separate terminal)
cd backend
pip install -r requirements.txt
python main.py
```

### Production Build
```bash
# Build frontend
npm run build
npm run preview  # Test production build locally

# Deploy
npm run deploy:vercel  # or deploy:netlify
```

## 🔍 Testing Deployment

1. **Frontend:** Visit your deployed URL
2. **API:** Check `https://your-domain.com/health`
3. **MT5 Connection:** Test login endpoint
4. **Mobile:** Test on different devices

## 🛠️ Troubleshooting

### Common Issues:

1. **404 on refresh:** Check routing configuration (vercel.json/netlify.toml)
2. **CORS errors:** Update CORS_ORIGINS in backend
3. **API connection:** Verify VITE_API_URL environment variable
4. **MT5 connection:** Check credentials and server settings

### Logs:

```bash
# Vercel logs
vercel logs

# Netlify logs
netlify logs

# Backend logs (if using systemd)
sudo journalctl -u trading-backend -f
```

## 📞 Support

For deployment issues, check:
- Vercel/Netlify documentation
- Railway/DigitalOcean docs
- Project README.md

Happy deploying! 🎉