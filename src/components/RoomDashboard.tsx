import React, { useEffect, useState, useMemo } from 'react';
import { fetchHistoricalData, fetchMeanHourlyData } from '../services/api';
import { SensorData, MeanData } from '../types';
import GaugeWidget from './GaugeWidget';
import DataTableWidget from './DataTableWidget';
import ChartWidget from './ChartWidget';
import SwitchControl from './SwitchControl';
import { PushNotificationManager } from './PushNotificationManager';

interface RoomDashboardProps {
  roomId: string;
  measurement: string;
  temperature: number;
  humidity: number;
  lightDensity: number;
  timeRange: string;
  hasSwitches?: boolean;
  onDbStatusChange?: (status: boolean) => void;
}

const RoomDashboard: React.FC<RoomDashboardProps> = ({
  measurement,
  temperature,
  humidity,
  lightDensity,
  timeRange,
  hasSwitches = false,
  onDbStatusChange
}) => {
  // InfluxDB states
  const [temperatureHistory, setTemperatureHistory] = useState<SensorData[]>([]);
  const [humidityHistory, setHumidityHistory] = useState<SensorData[]>([]);
  const [lightDensityHistory, setLightDensityHistory] = useState<SensorData[]>([]);
  const [meanData, setMeanData] = useState<MeanData[]>([]);
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (onDbStatusChange && isDbConnected !== null) {
      onDbStatusChange(isDbConnected);
    }
  }, [isDbConnected, onDbStatusChange]);

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {hasSwitches && (
          <div className="switches-container">
            <SwitchControl />
          </div>
        )}
        <PushNotificationManager />
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
        <div style={{ gridColumn: '1 / -1' }}>
          <ChartWidget
            title="Mean Hourly Data"
            data={meanData}
            xAxisKey="time"
            series={[
              { dataKey: 'mean_humidity', name: 'Mean Humidity (%)', color: '#3b82f6' },
              { dataKey: 'mean_temperature', name: 'Mean Temp (°C)', color: '#10b981' },
              { dataKey: 'mean_ldr', name: 'Mean Light (LPD)', color: '#f59e0b' }
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default RoomDashboard;
