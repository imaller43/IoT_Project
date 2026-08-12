import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MqttProvider } from './context/MqttContext.tsx'
import { ClerkProvider, SignIn, SignedIn, SignedOut } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { Activity, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { registerSW } from 'virtual:pwa-register'

if ('serviceWorker' in navigator) {
  // Initializes the Vite PWA dev server middleware
  registerSW({ immediate: true })
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

function ClerkWithRoutes() {
  const navigate = useNavigate();
  
  // Theme State lifted to parent
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      afterSignOutUrl="/login"
      appearance={{ 
        baseTheme: theme === 'light' ? dark : undefined,
        elements: {
          card: {
            boxShadow: 'var(--login-box-shadow)'
          }
        }
      }}
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
              {/* Theme Toggle for Login Page */}
              <div style={{ position: 'absolute', top: '1rem', right: '1.5rem' }}>
                <button 
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', padding: '8px' }}
                >
                  {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <Activity size={40} color={theme === 'light' ? '#3b82f6' : '#a5b4fc'} />
                <h1 style={{ color: theme === 'light' ? '#1e293b' : '#a5b4fc', fontSize: '2.5rem', fontWeight: 'bold', margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>IoT Dashboard</h1>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-120px',
                  background: 'var(--login-aura)',
                  filter: 'blur(50px)',
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
                <App theme={theme} setTheme={setTheme} />
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
