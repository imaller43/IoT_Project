import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react';
import { Activity, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useMqtt } from './context/MqttContext';
import { fetchHistoricalData, fetchMeanHourlyData } from './services/api';
import { SensorData, MeanData } from './types';

// Components
import GaugeWidget from './components/GaugeWidget';
import DataTableWidget from './components/DataTableWidget';
import ChartWidget from './components/ChartWidget';
import SwitchControl from './components/SwitchControl';

const TIME_RANGES = [
  { label: 'Past 1h', value: '-1h' },
  { label: 'Past 3h', value: '-3h' },
  { label: 'Past 6h', value: '-6h' },
  { label: 'Past 12h', value: '-12h' },
  { label: 'Past 24h', value: '-24h' },
  { label: 'Past 2d', value: '-2d' },
  { label: 'Past 7d', value: '-7d' },
  { label: 'Past 30d', value: '-30d' }
];

function App() {
  const { isConnected, temperature, humidity, lightDensity } = useMqtt();

  const [timeRange, setTimeRange] = useState<string>('-1h');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // InfluxDB states
  const [temperatureHistory, setTemperatureHistory] = useState<SensorData[]>([]);
  const [humidityHistory, setHumidityHistory] = useState<SensorData[]>([]);
  const [lightDensityHistory, setLightDensityHistory] = useState<SensorData[]>([]);
  const [meanData, setMeanData] = useState<MeanData[]>([]);
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let rawInterval: NodeJS.Timeout;
    let meanInterval: NodeJS.Timeout;

    const getHistorical = async () => {
      try {
        const data = await fetchHistoricalData(timeRange);
        setTemperatureHistory(data.temperature);
        setHumidityHistory(data.humidity);
        setLightDensityHistory(data.lightDensity);
        setIsDbConnected(true);
      } catch (e) {
        setIsDbConnected(false);
      }
    };

    const getMean = async () => {
      try {
        const data = await fetchMeanHourlyData(timeRange);
        setMeanData(data);
      } catch (e) {
        // Handled by getHistorical
      }
    };

    // Initial fetch
    getHistorical();
    getMean();

    // 1 minute interval for historical data
    rawInterval = setInterval(getHistorical, 60 * 1000);
    // 1 hour interval for mean data
    meanInterval = setInterval(getMean, 60 * 60 * 1000);

    return () => {
      clearInterval(rawInterval);
      clearInterval(meanInterval);
    };
  }, [timeRange]);

  // Combine temperature and humidity for the combined chart
  // Group by time if they don't exactly match index, but assuming they are recorded simultaneously:
  const combinedTempHumData = temperatureHistory.map((t) => {
    const hum = humidityHistory.find(h => h.time === t.time);
    return {
      time: t.time,
      temperature: t.value,
      humidity: hum ? hum.value : 0
    };
  });

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
              inset: '-40px', 
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)',
              filter: 'blur(25px)',
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
          <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
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

      {/* Switches for GPIO control */}
      <div className="switches-container">
        <SwitchControl />
      </div>

      {/* Top Grid: Gauges */}
      <div className="top-grid">
        <GaugeWidget
          title="Humidity"
          value={humidity}
          minValue={0}
          maxValue={100}
          unit="%"
          colors={['#f97316', '#7dd3fc']}
        />
        <GaugeWidget
          title="Temperature"
          value={temperature}
          minValue={0}
          maxValue={40}
          unit="°C"
          colors={['#22c55e', '#ef4444']}
          colorThreshold={28}
        />
        <GaugeWidget
          title="Light Density"
          value={lightDensity}
          minValue={0}
          maxValue={3000}
          unit="LPD"
          colors={['#ffffff', '#000000']}
        />
      </div>

      {/* Middle Grid: Data Tables */}
      <div className="middle-grid">
        <DataTableWidget title="Humidity" data={humidityHistory} valueLabel="%" colorHighlight="#3b82f6" />
        <DataTableWidget title="Temperature" data={temperatureHistory} valueLabel="°C" colorHighlight="#10b981" />
        <DataTableWidget title="Light Density" data={lightDensityHistory} valueLabel="LPD" colorHighlight="#f59e0b" />
      </div>

      {/* Bottom Grid: Charts */}
      <div className="bottom-grid">
        <ChartWidget
          title="Humidity & Temperature"
          data={combinedTempHumData}
          xAxisKey="time"
          series={[
            { dataKey: 'humidity', color: '#3b82f6', name: 'Humidity' },
            { dataKey: 'temperature', color: '#10b981', name: 'Temperature' }
          ]}
        />
        <ChartWidget
          title="Light Density"
          data={lightDensityHistory}
          xAxisKey="time"
          series={[
            { dataKey: 'value', color: '#f59e0b', name: 'Light Density' }
          ]}
        />
      </div>

      {/* API Data Chart */}
      <div className="bottom-grid" style={{ gridTemplateColumns: '1fr' }}>
        <ChartWidget
          title="Mean Hourly Data"
          data={meanData}
          xAxisKey="time"
          series={[
            { dataKey: 'mean_humidity', color: '#3b82f6', name: 'Mean Humidity' },
            { dataKey: 'mean_temperature', color: '#10b981', name: 'Mean Temp' },
            { dataKey: 'mean_ldr', color: '#f59e0b', name: 'Mean LDR' }
          ]}
        />
      </div>
    </div>
    </SignedIn>
    </>
  );
}

export default App;
