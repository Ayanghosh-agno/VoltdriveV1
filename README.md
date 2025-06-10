# 🚗 VoltRide - Smart Driving Analytics Platform

<div align="center">

![VoltRide Logo](https://img.shields.io/badge/VoltRide-Smart%20Analytics-blue?style=for-the-badge&logo=car&logoColor=white)

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/yourusername/voltride)
[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)](https://github.com/yourusername/voltride)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

**Transform your driving experience with real-time analytics, fuel efficiency insights, and personalized safety recommendations.**

[🚀 Live Demo](https://voltride.netlify.app) • [📖 Documentation](#documentation) • [🛠️ Setup Guide](#getting-started) • [🤝 Contributing](#contributing)

</div>

---

## ✨ Features

### 🎯 **Core Analytics**
- **Real-time OBD-II Monitoring** - Live engine diagnostics and performance data
- **AI-Powered Driving Score** - Comprehensive 0-100 scoring system
- **Fuel Efficiency Tracking** - Compare against vehicle specifications
- **Safety Rating System** - Trend analysis and risk assessment
- **Environmental Impact** - CO₂ emissions and cost tracking

### 📊 **Advanced Insights**
- **Trip Analysis** - Detailed breakdowns with route mapping
- **Performance Trends** - Week-over-week comparisons
- **Driving Patterns** - Speed, acceleration, and braking analysis
- **Cost Optimization** - Fuel savings recommendations
- **Maintenance Alerts** - Proactive vehicle health monitoring

### 🔧 **Smart Features**
- **Personalized Recommendations** - AI-driven improvement suggestions
- **Hardware Integration** - VoltRide Module with OBD-II connectivity
- **Cloud Synchronization** - Salesforce-powered data management
- **Multi-device Support** - Responsive design for all platforms
- **Offline Capability** - Local data storage and sync

---

## 🛠️ Technology Stack

### **Frontend**
- **React 18.3.1** - Modern UI framework with hooks
- **TypeScript 5.5.3** - Type-safe development
- **Tailwind CSS 3.3.2** - Utility-first styling
- **React Router 6.8.1** - Client-side routing
- **Recharts 2.8.0** - Interactive data visualization
- **React Leaflet 4.2.1** - Interactive maps

### **Backend & Integration**
- **Salesforce API** - Enterprise data management
- **Netlify Functions** - Serverless API proxy
- **OBD-II Integration** - Real-time vehicle diagnostics
- **GPS Tracking** - Route and location services

### **Development Tools**
- **Vite 5.4.2** - Lightning-fast build tool
- **ESLint** - Code quality enforcement
- **TypeScript ESLint** - Type-aware linting
- **PostCSS & Autoprefixer** - CSS processing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Package manager
- **VoltRide Module** - Hardware device for vehicle integration
- **Salesforce Account** - For cloud data synchronization

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/voltride.git
   cd voltride
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   # Salesforce Configuration
   VITE_SALESFORCE_CLIENT_ID=your_client_id
   VITE_SALESFORCE_CLIENT_SECRET=your_client_secret
   VITE_SALESFORCE_USERNAME=your_username
   VITE_SALESFORCE_PASSWORD=your_password
   VITE_SALESFORCE_SECURITY_TOKEN=your_security_token
   VITE_SALESFORCE_INSTANCE_URL=https://your-instance.salesforce.com
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 🔌 Salesforce Integration

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/services/apexrest/voltride/tripInsights` | GET | Homepage analytics data |
| `/services/apexrest/voltride/tripList` | GET | All trips with pagination |
| `/services/apexrest/voltride/tripDetail/{id}` | GET | Individual trip details |
| `/services/apexrest/voltride/settings` | GET/POST | User settings management |
| `/services/apexrest/voltride/createcase` | POST | Support case creation |

### Data Structure

```json
{
  "currentWeekTripInsight": {
    "totalTrips": 8,
    "totalDistance": 156.4,
    "totalFuelUsed": 10.2,
    "avgSpeed": 44.5,
    "totalHarshAcceleration": 5,
    "totalHarshBraking": 3
  },
  "recentTrips": [
    {
      "tripId": "trip_001",
      "distance": 20.1,
      "duration": 45,
      "calculatedScore": 92,
      "route": [{"lat": 19.0760, "lng": 72.8777}]
    }
  ]
}
```

---

## 🔧 Hardware Requirements

### VoltRide Module Specifications

- **OBD-II Compatibility** - Works with vehicles manufactured after 1996
- **ESP32** - Microcontroller to handle reading and transmitting operation
- **GPS Integration** - High-precision location tracking
- **Cellular Connectivity** - 4G LTE for cloud synchronization
- **Battery Life** - 30+ days standby, 7 days active use
- **Operating Temperature** - -20°C to 70°C

### LED Status Indicators

| LED Color | Status | Description |
|-----------|--------|-------------|
| 🔴 Dim Red (1s intervals) | Connected | Normal operation |
| 🔴 Dim Red (Slow blink) | Warning | Internet connectivity issues |
| 💡 Bright Center | Loading | Device startup |
| 🔵 Blue Center | Connected | OBD-II Bluetooth paired |
| 🟢 Green Center | Ready | GPS lock achieved |

---

## 📊 Driving Score Calculation

### Score Components

| Component | Weight | Description |
|-----------|--------|-------------|
| **Safety** | 35% | Speed compliance, harsh events, consistency |
| **Efficiency** | 25% | Fuel consumption vs vehicle specs |
| **Smoothness** | 25% | Acceleration and braking patterns |
| **Environmental** | 15% | Idling time and emissions |

### Score Ranges

- **90-100** - Excellent Driver (Very safe and efficient)
- **80-89** - Good Driver (Minor improvements needed)
- **70-79** - Average Driver (Several areas for attention)
- **60-69** - Below Average (Significant improvement needed)
- **0-59** - Poor Driver (Major safety concerns)

---

## 📁 Project Structure

```
voltride/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and external services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper functions and utilities
├── public/                 # Static assets
├── netlify/
│   └── functions/          # Serverless API functions
├── docs/                   # Documentation files
└── README.md
```

---

## 🚀 Deployment

### Netlify Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   npm run netlify:deploy
   ```

3. **Environment Variables**
   - Configure all Salesforce credentials in Netlify dashboard
   - Ensure proper CORS settings in Salesforce

### Performance Optimization

- **Code Splitting** - Automatic chunking for faster loads
- **Image Optimization** - WebP format with fallbacks
- **Caching Strategy** - Service worker for offline capability
- **Bundle Analysis** - Regular monitoring of bundle size

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Quality

- **ESLint Configuration** - Enforces consistent code style
- **TypeScript Strict Mode** - Type safety throughout
- **Prettier Integration** - Automatic code formatting
- **Husky Git Hooks** - Pre-commit quality checks

---

## 🔧 Troubleshooting

### Common Issues

**VoltRide Module Not Connecting**
1. Ensure OBD-II reader is properly inserted
2. Turn off both devices, then restart in sequence
3. Check for GPS lock (green LED)

**Salesforce Authentication Errors**
1. Verify all environment variables are set
2. Check security token validity
3. Ensure IP restrictions allow your domain

**Data Not Syncing**
1. Check internet connectivity
2. Verify Salesforce API limits
3. Review browser console for errors

### Getting Help

- 📧 **Email Support**: support@voltride.com
- 💬 **In-App Support**: Use the contact form in settings
- 📖 **Documentation**: Check the built-in user guide
- 🐛 **Bug Reports**: Create an issue on GitHub

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Write comprehensive tests
- Maintain 80%+ code coverage
- Document all public APIs

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Salesforce** - For enterprise-grade cloud infrastructure
- **Netlify** - For seamless deployment and hosting
- **OBD-II Community** - For vehicle diagnostic standards

---

## 📞 Contact

**VoltRide Team**
- 🌐 Website: [voltride.com](https://voltride.com)
- 📧 Email: ayanghosh974@gmail.com
- 💼 LinkedIn: [Ayan Ghosh](https://www.linkedin.com/in/ayan-ghosh-4743841a1/)

---

<div align="center">

**Made with ❤️ by Ayan Ghosh**

[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Powered by Salesforce](https://img.shields.io/badge/Powered%20by-Salesforce-00A1E0?style=flat-square&logo=salesforce)](https://salesforce.com/)
[![Deployed on Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?style=flat-square&logo=netlify)](https://netlify.com/)

</div>