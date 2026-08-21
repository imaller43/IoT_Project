---
name: iot-dashboard-guidelines
description: Mandatory guidelines for UI, component design, and restrictions in IoT_Project development.
---

# 🚀 IoT Dashboard Guidelines

This skill is a specific rulebook for this project. Please follow the instructions below whenever writing or modifying code in this workspace.

## 1. Project Fundamentals
- **Frontend Framework**: React (with TypeScript) using Vite.
- **Database (Backend)**: InfluxDB (Historical Data & Time-Series Analysis) & MQTT Broker (Real-time Data).
- **Hardware & Middleware**: This project uses a **Raspberry Pi 4 Model B** acting with **Node-RED** as middleware to control and monitor GPIO status (switch state).
- **Authentication**: Clerk (Secure authentication without a custom backend server).
- **Multi-Room Support**: This dashboard supports monitoring for multiple rooms (e.g., Room 1, Room 2, Room 3) using a navigation tab component.

## 2. Theme & Colors (UI/UX)
- The project uses a **Dark Mode** (default) and **Soft Light Mode** system. A theme toggle button is placed on the Login page and main Dashboard.
- **DO NOT** use static/hardcoded colors (like `#000000`, `#ffffff` or `rgba(...)`) inside `.tsx` files (inline styles) unless absolutely necessary.
- **MUST** use CSS variables registered in `index.css` (e.g., `var(--bg-color)`, `var(--panel-bg)`, `var(--text-primary)`).
- The interface style should look premium, minimalist, and use glassmorphism effects.
- Icons must be obtained from the `lucide-react` library.

## 3. Routing, Authentication & Session
- Routing is managed in `main.tsx` using `react-router-dom`.
- User authentication is exclusively managed by `@clerk/clerk-react`.
- **Auto-Logout**: There is a security feature that automatically logs out users if the application is idle for 1 hour (via `useIdleTimeout`).
- The login box (Clerk Sign-In Box) on the `/login` page **must** use inverse theme logic: If the app theme is Light, the box must be Dark. If the app is Dark, the box must be Light (Default).
- The login box **must** also have a shadow behind it (box-shadow) by calling the CSS variable `var(--login-box-shadow)` in the `appearance` settings.
- **Must** place a glowing radial-gradient effect (aura) behind the login box via the `var(--login-aura)` variable so the interface looks premium and stands out.

## 4. Data Performance & Downsampling
- The InfluxDB database can return tens of thousands of data rows if the time range is too long, which will cause the browser to hang.
- **Must use `aggregateWindow`** in Flux queries for historical graphs (`fetchHistoricalData`) based on the time range:
  - `-30m` & `-1h` = `1m`
  - `-3h` = `2m`
  - `-6h` = `5m`
  - `-12h` = `10m`
  - `-24h` = `20m`
  - `-3d` = `1h`
  - `-7d` = `2h`
- This rule aims to ensure graph data always stays under 200 data points at any given time.

## 5. Component & Widget Development
- Chart and table widget development must automatically respond to theme changes (Light/Dark).
- Connection Status: Always display MQTT status (Connected/Disconnected) and DB status (Connected/Error) to the user.
- **Mobile Responsive**: Must ensure grid layouts (`top-grid`, `middle-grid`, `bottom-grid`, `switch-grid`) are responsive to screen size. Do not hardcode `grid-template-columns: repeat(3, 1fr)` without media queries as it will break the layout on mobile devices (even in desktop/tablet mode).
- Use `@media (max-width: 1024px)` to change the grid to `1fr` so it stacks vertically for small screens.
- Ensure the `header` or main `container` element always uses `width: 100%` so it doesn't shrink to the left side of the screen during horizontal scrolling (horizontal overflow).
- Maintain component design so it is always reusable.

## 6. MQTT & Smart Switch Logic (Hardware Override)
- **Decoupled Topics**: To avoid feedback loops and support hardware validation, switch control and status feedback are separated.
  - Dashboard publishes to: `sapura/bilik1/switch/interrupt`
  - Node-RED / Physical Switch publishes status to: `sapura/bilik1/switch/interrupt1`
  - Node-RED / Temperature Sensor publishes status to: `sapura/bilik1/switch/interrupt2`
- **Hardware Override**:
  - If the physical switch is pressed (ON), Node-RED will send an active status to `interrupt1`.
  - If the room temperature is high (>= 27°C), Node-RED will send an active status to `interrupt2`.
  - The dashboard will detect any of these statuses, turn on the UI button, and make it **DISABLED**.
  - It will display a warning "Override Active" (if `interrupt1`) or "Override Activated : High Temperature" (if `interrupt2`).
  - As long as any override is active, the web application cannot control the light.
  - When the override is released (OFF / Temperature returns to normal), the UI will automatically reset the software switch position to OFF, and sync the status back to Node-RED.

## 7. Project Taboos & Rules ⚠️
- **STRICTLY PROHIBITED** to hardcode any API Keys, Passwords, Tokens, or Credentials inside code files (.ts/.js/.tsx) pushed to GitHub. **MUST** use the `.env` file (e.g., `import.meta.env.VITE_API_KEY`).
- **Prohibited** to remove or expose configurations within `VITE_CLERK_PUBLISHABLE_KEY`.
- Always separate settings into `.env.development` (for test keys) and `.env.production` (for live keys). The `.env` file must be listed in `.gitignore`.
- **Warning Notifications (Hybrid Desktop-Mobile)**: This project uses Firebase Web Push for Desktop browsers, but officially uses a Telegram Bot for Smartphone (Mobile) users. DO NOT remove the `isMobile` check system in `NotificationBell.tsx` because Web Push is proven to cause various support issues on iOS/Apple.
- **Only modify the requested files**. Do not touch database logic, MQTT, or other components if the user only requests User Interface (UI) edits.
- **Service Worker File Management**: The `firebase-messaging-sw.js` file **MUST** remain inside the `src/` directory (not `public/`). This project uses `vite-plugin-pwa` with the `injectManifest` strategy, which automatically processes the file from the `src/` folder. Moving it to the `public/` folder will break the Web Push notification system.
- **English Only**: Ensure all code, documentation, and comments are written exclusively in English.
- **Coding Rules (Git)**: After every change is completed, the AI **must** push (commit & push) the code to GitHub using: `git add . ; git commit -m "..." ; git push`.
