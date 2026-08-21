# 🌐 IoT Dashboard

A modern, responsive, and real-time Internet of Things (IoT) dashboard built with React, Vite, and TypeScript. This dashboard is designed to monitor and control various rooms, interfacing with hardware via Node-RED and MQTT, while storing historical data in InfluxDB.

## 🚀 Features

- **Real-Time Monitoring**: Live sensor data visualization (Temperature, Humidity, Light Density) via MQTT.
- **Multi-Room Support**: Easily navigate and monitor multiple rooms (e.g., Room 1, Room 2, Room 3).
- **Hardware Override Logic**: Smart switch system that respects physical switch toggles and temperature thresholds, temporarily disabling web controls when hardware overrides are active.
- **Historical Data**: Downsampled and optimized time-series charts powered by InfluxDB, preventing browser freeze on large data queries.
- **Authentication & Security**: Secure user authentication provided by Clerk, complete with a 1-hour inactivity auto-logout feature.
- **Premium UI/UX**: Custom Dark (default) and Light themes featuring glassmorphism, glowing radial gradients, and responsive grid layouts.
- **Hybrid Notifications**: Firebase Web Push for desktop browsers, paired with Telegram Bot support for mobile devices.

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Custom CSS Variables (Dark/Light mode support), `lucide-react` icons
- **State/Routing**: `react-router-dom`, Context API
- **Authentication**: `@clerk/clerk-react`
- **Charts/Gauges**: `recharts`, `react-gauge-component`
- **Backend & Middleware**: InfluxDB (Time-Series), MQTT Broker, Node-RED, Raspberry Pi 4 Model B
- **PWA/Service Worker**: `vite-plugin-pwa`, Firebase (`firebase-messaging-sw.js` in `src/`)

## 📦 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- An MQTT Broker (e.g., Mosquitto)
- InfluxDB Instance
- Clerk Account (for authentication)
- Firebase Project (for Web Push notifications)

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment Variables:
   Create `.env.development` and `.env.production` files in the root directory. You will need to add your Clerk Publishable Key, Firebase credentials, MQTT broker URL, and InfluxDB details.
   
   *Example:*
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

To build the application for production, run:
```bash
npm run build
```
This will compile the TypeScript code and generate static files in the `dist` directory.

## 📏 Development Guidelines

- **English Only**: All code, documentation, and comments must be written in English.
- **UI/UX**: Always use CSS variables (`var(--bg-color)`, etc.) instead of hardcoded colors.
- **Grid Responsiveness**: Ensure grid layouts use media queries (`max-width: 1024px`) to stack vertically on smaller screens.
- **Service Workers**: Leave `firebase-messaging-sw.js` in the `src/` directory. `vite-plugin-pwa` handles its injection.
- **Auto-Commit**: All AI modifications will be automatically committed and pushed to the repository.

## 📝 License

This project is private and proprietary.
