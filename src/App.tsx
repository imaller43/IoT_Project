import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react';
import { Activity } from 'lucide-react';
import { useMqtt } from './context/MqttContext';

// Components
import RoomDashboard from './components/RoomDashboard';

function App() {
  const { isConnected, roomsData } = useMqtt();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'room1' | 'room2' | 'room3'>('room1');
  
  // Real-time Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  return (
    <>
      <SignedOut>
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
            <h1 style={{ color: '#a5b4fc', fontSize: '2.5rem', fontWeight: 'bold', margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Sensor Value</h1>
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
              <SignIn />
            </div>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="dashboard-container">
          <div className="dashboard-header" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Activity size={28} color="#a5b4fc" />
                  <h1 className="dashboard-title">Sensor Value</h1>
                  <span style={{
                    marginLeft: '1rem',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: isConnected ? '#10b981' : '#ef4444',
                    border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}>
                    {isConnected ? 'MQTT Connected' : 'MQTT Disconnected'}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', fontWeight: 500 }}>
                  <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span>|</span>
                  <span>{currentTime.toLocaleTimeString('en-US')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: { width: 36, height: 36 } } }} />
              </div>
            </div>
            
            {/* Browser Tabs */}
            <div className="browser-tabs">
              <button 
                className={`browser-tab ${activeTab === 'room1' ? 'active' : ''}`}
                onClick={() => setActiveTab('room1')}
              >
                ROOM 1
              </button>
              <button 
                className={`browser-tab ${activeTab === 'room2' ? 'active' : ''}`}
                onClick={() => setActiveTab('room2')}
              >
                ROOM 2
              </button>
              <button 
                className={`browser-tab ${activeTab === 'room3' ? 'active' : ''}`}
                onClick={() => setActiveTab('room3')}
              >
                ROOM 3
              </button>
            </div>
          </div>

          {activeTab === 'room1' && (
            <RoomDashboard 
              roomId="room1" 
              measurement="Bilik_1" 
              temperature={roomsData['Bilik_1']?.temperature || 0}
              humidity={roomsData['Bilik_1']?.humidity || 0}
              lightDensity={roomsData['Bilik_1']?.lightDensity || 0}
              hasSwitches={true}
            />
          )}
          {activeTab === 'room2' && (
            <RoomDashboard 
              roomId="room2" 
              measurement="Bilik_2" 
              temperature={roomsData['Bilik_2']?.temperature || 0}
              humidity={roomsData['Bilik_2']?.humidity || 0}
              lightDensity={roomsData['Bilik_2']?.lightDensity || 0}
              hasSwitches={false}
            />
          )}
          {activeTab === 'room3' && (
            <RoomDashboard 
              roomId="room3" 
              measurement="Bilik_3" 
              temperature={roomsData['Bilik_3']?.temperature || 0}
              humidity={roomsData['Bilik_3']?.humidity || 0}
              lightDensity={roomsData['Bilik_3']?.lightDensity || 0}
              hasSwitches={false}
            />
          )}
        </div>
      </SignedIn>
    </>
  );
}

export default App;
