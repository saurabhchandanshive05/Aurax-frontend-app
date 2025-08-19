# AURAX - AI-Powered Influencer Marketing Platform

![AURAX Platform](https://img.shields.io/badge/AURAX-Frontend-blue) ![React](https://img.shields.io/badge/React-18.2.0-61DAFB) ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

## 🚀 Overview

AURAX is a next-generation influencer marketing platform that revolutionizes how brands connect with creators through AI-powered matching, real-time optimization, and transparent analytics.

## ✨ Features

### 🎯 Core Features

- **AI-Powered Creator Matching**: Advanced algorithms to find perfect brand-creator fits
- **Real-Time Campaign Optimization**: Dynamic performance tracking and adjustment
- **Comprehensive Analytics Dashboard**: Deep insights into campaign performance
- **Interactive 3D UI**: Modern, engaging user interface with Three.js integration
- **Mobile-First Design**: Responsive across all devices

### 🔧 Technical Features

- **React 18** with modern hooks and functional components
- **Framer Motion** for smooth animations and transitions
- **Three.js & React-Three-Fiber** for 3D graphics and interactions
- **Chart.js** for data visualization
- **React Router DOM** for seamless navigation
- **Progressive Web App (PWA)** capabilities

## 🛠️ Tech Stack

- **Frontend Framework**: React.js 18.2.0
- **Build Tool**: Create React App
- **Styling**: CSS Modules, Modern CSS Grid/Flexbox
- **Animation**: Framer Motion, GSAP
- **3D Graphics**: Three.js, React-Three-Fiber
- **Charts**: Chart.js, React-ChartJS-2
- **Routing**: React Router DOM 6.18.0
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom wrapper

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/[username]/Aurax-frontend-app.git
   cd Aurax-frontend-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ai/             # AI-related components
│   ├── analytics/      # Dashboard analytics
│   ├── layout/         # Layout components (Navbar, Footer)
│   └── ui/             # Generic UI components
├── pages/              # Page components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── styles/             # Global styles and CSS modules
└── data/               # Static data and configurations
```

## 🌟 Key Pages

- **Home**: Landing page with hero section and key features
- **About**: Company information and mission
- **Creator Directory**: Browse and discover content creators
- **Brand Dashboard**: Campaign management for brands
- **Analytics**: Performance tracking and insights
- **Creator CRM**: Creator relationship management

## 🎨 Design System

The application follows a modern design system with:

- **Color Scheme**: Dark theme with neon accents (#00ffff, #ff00cc)
- **Typography**: Inter font family for optimal readability
- **Spacing**: Consistent 8px grid system
- **Animations**: Smooth micro-interactions and page transitions

## 🔧 Build & Deployment

### Production Build

```bash
npm run build
```

### Deployment Configuration

- **Build Output**: `build/` directory
- **Build Command**: `npm run build`
- **Node Version**: 18.x or higher
- **Environment**: Production-optimized bundle

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=https://your-api-url.com/api
REACT_APP_ENVIRONMENT=production
```

## 📱 PWA Features

- Offline functionality
- Install prompt for mobile users
- Service worker for caching
- Responsive design across all devices

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**AURAX Team**

- Website: [AURAX Platform](https://aurax-frontend.netlify.app)
- Email: contact@aurax.com
- LinkedIn: [AURAX](https://linkedin.com/company/aurax)

---

Built with ❤️ by the AURAX team | Revolutionizing Influencer Marketing with AI
