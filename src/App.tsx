import { useEffect, useState } from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Activity, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useMqtt } from './context/MqttContext';

// Components
import RoomDashboard from './components/RoomDashboard';

const TIME_RANGES = [
  { label: 'Past 30m', value: '-30m' },
  { label: 'Past 1h', value: '-1h' },
  { label: 'Past 3h', value: '-3h' },
  { label: 'Past 6h', value: '-6h' },
  { label: 'Past 12h', value: '-12h' },
  { label: 'Past 24h', value: '-24h' },
  { label: 'Past 7d', value: '-7d' }
];

function App() {
  const { isConnected, roomsData } = useMqtt();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'room1' | 'room2' | 'room3'>('room1');
  const [timeRange, setTimeRange] = useState<string>('-1h');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  
  // Real-time Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
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
                  <span style={{
                    marginLeft: '0.5rem',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: isDbConnected === true ? 'rgba(16, 185, 129, 0.1)' : isDbConnected === false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                    color: isDbConnected === true ? '#10b981' : isDbConnected === false ? '#ef4444' : '#9ca3af',
                    border: `1px solid ${isDbConnected === true ? 'rgba(16, 185, 129, 0.3)' : isDbConnected === false ? 'rgba(239, 68, 68, 0.3)' : 'rgba(156, 163, 175, 0.3)'}`
                  }}>
                    {isDbConnected === true ? 'DB Connected' : isDbConnected === false ? 'DB Error' : 'Connecting DB...'}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', fontWeight: 500 }}>
                  <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span>|</span>
                  <span>{currentTime.toLocaleTimeString('en-US')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="custom-dropdown-container">
                  <button 
                    className={`custom-dropdown-button ${isDropdownOpen ? 'open' : ''}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} />
                      {TIME_RANGES.find(r => r.value === timeRange)?.label || 'Past 1h'}
                    </div>
                    {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div className="dropdown-overlay" onClick={() => setIsDropdownOpen(false)}></div>
                      <div className="custom-dropdown-menu">
                        {TIME_RANGES.map(range => (
                          <div
                            key={range.value}
                            className={`custom-dropdown-item ${timeRange === range.value ? 'active' : ''}`}
                            onClick={() => {
                              setTimeRange(range.value);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {range.label}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
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

          <div className="tab-transition">
            {activeTab === 'room1' && (
              <RoomDashboard 
                key="room1-dash"
                roomId="room1" 
                measurement="Bilik_1" 
                temperature={roomsData['Bilik_1']?.temperature || 0}
                humidity={roomsData['Bilik_1']?.humidity || 0}
                lightDensity={roomsData['Bilik_1']?.lightDensity || 0}
                timeRange={timeRange}
                hasSwitches={true}
                onDbStatusChange={setIsDbConnected}
              />
            )}
            {activeTab === 'room2' && (
              <RoomDashboard 
                key="room2-dash"
                roomId="room2" 
                measurement="Bilik_2" 
                temperature={roomsData['Bilik_2']?.temperature || 0}
                humidity={roomsData['Bilik_2']?.humidity || 0}
                lightDensity={roomsData['Bilik_2']?.lightDensity || 0}
                timeRange={timeRange}
                hasSwitches={false}
                onDbStatusChange={setIsDbConnected}
              />
            )}
            {activeTab === 'room3' && (
              <RoomDashboard 
                key="room3-dash"
                roomId="room3" 
                measurement="Bilik_3" 
                temperature={roomsData['Bilik_3']?.temperature || 0}
                humidity={roomsData['Bilik_3']?.humidity || 0}
                lightDensity={roomsData['Bilik_3']?.lightDensity || 0}
                timeRange={timeRange}
                hasSwitches={false}
                onDbStatusChange={setIsDbConnected}
              />
            )}
          </div>
        </div>
  );
}

export default App;
