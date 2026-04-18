<<<<<<< HEAD
# 🚀 TheOnePercent Trading Dashboard

A premium React-based trading analytics platform with MetaTrader 5 integration, built for serious traders who demand the best.

![TheOnePercent](https://img.shields.io/badge/TheOnePercent-Trading%20Platform-7c3aed?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-19.2.4-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.0.4-646cff?style=flat-square&logo=vite)
![Python](https://img.shields.io/badge/Python-3.8+-3776ab?style=flat-square&logo=python)

## ✨ Features

- 📊 **Advanced Analytics** - Comprehensive trading performance metrics
- 🤖 **Backtesting Engine** - Test strategies against historical data
- 📚 **Trading University** - Educational content for all skill levels
- 📡 **Real-time Signals** - AI-powered trade signals
- 💬 **Community Chat** - Connect with fellow traders
- 🔐 **Secure Authentication** - Protected routes and data
- 📱 **Responsive Design** - Works on all devices
- 🌙 **Dark Theme** - Premium UI with gold accents

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework:** React 19 with Vite
- **Routing:** React Router v6
- **Styling:** Custom CSS with premium animations
- **Icons:** Lucide React
- **Charts:** Recharts

### Backend (Python + FastAPI)
- **Framework:** FastAPI with async support
- **Trading API:** MetaTrader 5 integration
- **Database:** JSON-based (easily replaceable with PostgreSQL/MySQL)
- **CORS:** Configurable cross-origin support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MetaTrader 5 terminal (optional, for live trading)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/trading-dashboard.git
   cd trading-dashboard
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Setup backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your MT5 credentials
   ```

4. **Start development servers:**
   ```bash
   # Frontend (terminal 1)
   npm run dev

   # Backend (terminal 2)
   cd backend
   python main.py
   ```

5. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 📦 Build for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guides.

### Quick Deploy Options:

**Vercel (Frontend):**
```bash
npm install -g vercel
vercel --prod
```

**Railway (Backend):**
```bash
cd backend
npm install -g @railway/cli
railway init
railway up
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=TheOnePercent
```

**Backend (.env):**
```bash
MT5_LOGIN=your_login
MT5_PASSWORD=your_password
MT5_SERVER=your_server
CORS_ORIGINS=http://localhost:5173
```

## 📁 Project Structure

```
trading-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── Analytics.jsx    # Trading analytics
│   │   ├── Backtesting.jsx  # Strategy backtesting
│   │   ├── Community.jsx    # Chat interface
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   └── ...
│   ├── services/
│   │   └── api.js          # API client
│   └── App.jsx             # Main app component
├── backend/
│   ├── main.py             # FastAPI server
│   ├── mt5_client.py       # MT5 integration
│   └── requirements.txt    # Python dependencies
├── public/                 # Static assets
├── dist/                   # Production build output
└── DEPLOYMENT.md           # Deployment guide
```

## 🎯 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run deploy:vercel    # Deploy to Vercel
npm run deploy:netlify   # Deploy to Netlify
```

## 🔐 Security Notes

- Never commit MT5 credentials to version control
- Use environment variables for sensitive data
- Enable HTTPS in production
- Regularly update dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- 📧 Email: support@theonepercent.com
- 📖 Docs: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/trading-dashboard/issues)

---

**Built with ❤️ for serious traders by TheOnePercent**
- 🔐 **Secure Authentication** - Protected routes and data
- 📱 **Responsive Design** - Works on all devices
- 🌙 **Dark Theme** - Premium UI with gold accents

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework:** React 19 with Vite
- **Routing:** React Router v6
- **Styling:** Custom CSS with premium animations
- **Icons:** Lucide React
- **Charts:** Recharts

### Backend (Python + FastAPI)
- **Framework:** FastAPI with async support
- **Trading API:** MetaTrader 5 integration
- **Database:** JSON-based (easily replaceable with PostgreSQL/MySQL)
- **CORS:** Configurable cross-origin support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MetaTrader 5 terminal (optional, for live trading)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/trading-dashboard.git
   cd trading-dashboard
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Setup backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your MT5 credentials
   ```

4. **Start development servers:**
   ```bash
   # Frontend (terminal 1)
   npm run dev

   # Backend (terminal 2)
   cd backend
   python main.py
   ```

5. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 📦 Build for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guides.

### Quick Deploy Options:

**Vercel (Frontend):**
```bash
npm install -g vercel
vercel --prod
```

**Railway (Backend):**
```bash
cd backend
npm install -g @railway/cli
railway init
railway up
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=TheOnePercent
```

**Backend (.env):**
```bash
MT5_LOGIN=your_login
MT5_PASSWORD=your_password
MT5_SERVER=your_server
CORS_ORIGINS=http://localhost:5173
```

## 📁 Project Structure

```
trading-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── Analytics.jsx    # Trading analytics
│   │   ├── Backtesting.jsx  # Strategy backtesting
│   │   ├── Community.jsx    # Chat interface
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   └── ...
│   ├── services/
│   │   └── api.js          # API client
│   └── App.jsx             # Main app component
├── backend/
│   ├── main.py             # FastAPI server
│   ├── mt5_client.py       # MT5 integration
│   └── requirements.txt    # Python dependencies
├── public/                 # Static assets
├── dist/                   # Production build output
└── DEPLOYMENT.md           # Deployment guide
```

## 🎯 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run deploy:vercel    # Deploy to Vercel
npm run deploy:netlify   # Deploy to Netlify
```

## 🔐 Security Notes

- Never commit MT5 credentials to version control
- Use environment variables for sensitive data
- Enable HTTPS in production
- Regularly update dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- 📧 Email: support@theonepercent.com
- 📖 Docs: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/trading-dashboard/issues)

---

**Built with ❤️ for serious traders by TheOnePercent**
=======
# TheOnePercent
trading_dasboard
>>>>>>> e3b4df163a47216aa0091096d241549f5077fd7a
