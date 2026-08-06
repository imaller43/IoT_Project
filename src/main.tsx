import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MqttProvider } from './context/MqttContext.tsx'
import { ClerkProvider, SignIn, SignedIn, SignedOut } from '@clerk/clerk-react'
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
              backgroundColor: '#0f172a',
              backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <Activity size={40} color="#a5b4fc" />
                <h1 style={{ color: '#a5b4fc', fontSize: '2.5rem', fontWeight: 'bold', margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Sensor Value Dashboard</h1>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-60px',
                  background: 'radial-gradient(circle, rgba(168, 85, 247, 0.85) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 80%)',
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
