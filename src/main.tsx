import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MqttProvider } from './context/MqttContext.tsx'
import { ClerkProvider, SignIn, SignedIn, SignedOut } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { Activity } from 'lucide-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

function ClerkWithRoutes() {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      afterSignOutUrl="/login"
      appearance={{ baseTheme: dark }}
    >
      <MqttProvider>
        <Routes>
          <Route path="/login/*" element={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              width: '100vw',
              backgroundColor: 'var(--login-bg-solid)',
              backgroundImage: 'var(--login-bg-gradient)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <Activity size={40} color="#a5b4fc" />
                <h1 style={{ color: '#a5b4fc', fontSize: '2.5rem', fontWeight: 'bold', margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>IoT Dashboard</h1>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-60px',
                  background: 'radial-gradient(circle, var(--glass-blur-bg) 0%, transparent 80%)',
                  filter: 'blur(30px)',
                  zIndex: 0
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <SignIn routing="path" path="/login" />
                </div>
              </div>
            </div>
          } />

          <Route path="/*" element={
            <>
              <SignedIn>
                <App />
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          } />
        </Routes>
      </MqttProvider>
    </ClerkProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ClerkWithRoutes />
  </BrowserRouter>
)
