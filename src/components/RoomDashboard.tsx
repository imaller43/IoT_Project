import React, { useEffect, useState, useMemo } from 'react';
import { fetchHistoricalData, fetchMeanHourlyData } from '../services/api';
import { SensorData, MeanData } from '../types';
import GaugeWidget from './GaugeWidget';
import DataTableWidget from './DataTableWidget';
import ChartWidget from './ChartWidget';
import SwitchControl from './SwitchControl';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface RoomDashboardProps {
  roomId: string;
  measurement: string;
  temperature: number;
  humidity: number;
  lightDensity: number;
  hasSwitches?: boolean;
}

const TIME_RANGES = [
  { label: 'Past 1h', value: '-1h' },
  { label: 'Past 6h', value: '-6h' },
  { label: 'Past 12h', value: '-12h' },
  { label: 'Past 24h', value: '-24h' },
  { label: 'Past 7d', value: '-7d' }
];

const RoomDashboard: React.FC<RoomDashboardProps> = ({
  roomId,
  measurement,
  temperature,
  humidity,
  lightDensity,
  hasSwitches = false
}) => {
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
        const data = await fetchHistoricalData(timeRange, measurement);
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
        const data = await fetchMeanHourlyData(timeRange, measurement);
        setMeanData(data);
      } catch (e) {
        setIsDbConnected(false);
      }
    };

    getHistorical();
    getMean();

    rawInterval = setInterval(getHistorical, 60000);
    meanInterval = setInterval(getMean, 5 * 60000);

    return () => {
      clearInterval(rawInterval);
      clearInterval(meanInterval);
    };
  }, [timeRange, measurement]);

  // Combine temperature and humidity for the chart
  const combinedTempHumData = useMemo(() => {
    const tempMap = new Map(temperatureHistory.map(d => [d.time, d.value]));
    return humidityHistory.map(h => ({
      time: h.time,
      humidity: h.value,
      temperature: tempMap.get(h.time) || null
    }));
  }, [temperatureHistory, humidityHistory]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
        <div className="custom-dropdown-container" style={{ zIndex: 40 }}>
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
      </div>

      {hasSwitches && (
        <div className="switches-container">
          <SwitchControl />
        </div>
      )}

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
            { dataKey: 'humidity', name: 'Humidity (%)', color: '#3b82f6' },
            { dataKey: 'temperature', name: 'Temperature (°C)', color: '#10b981' }
          ]}
        />
        <ChartWidget
          title="Light Density"
          data={lightDensityHistory}
          xAxisKey="time"
          series={[
            { dataKey: 'value', name: 'Light (LPD)', color: '#f59e0b' }
          ]}
        />
        <ChartWidget
          title="Mean Hourly Data"
          data={meanData}
          xAxisKey="time"
          series={[
            { dataKey: 'mean_humidity', name: 'Mean Humidity (%)', color: '#8b5cf6' },
            { dataKey: 'mean_temperature', name: 'Mean Temp (°C)', color: '#ec4899' },
            { dataKey: 'mean_ldr', name: 'Mean Light (LPD)', color: '#eab308' }
          ]}
        />
      </div>
    </>
  );
};

export default RoomDashboard;
