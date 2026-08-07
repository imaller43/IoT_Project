import axios from 'axios';
import { SensorData, MeanData } from '../types';

const API_BASE_URL = import.meta.env.VITE_INFLUX_URL as string;
const TOKEN = import.meta.env.VITE_INFLUX_TOKEN as string;
const ORG = import.meta.env.VITE_INFLUX_ORG as string;
const BUCKET = import.meta.env.VITE_INFLUX_BUCKET as string;

// Helper to execute Flux query and parse InfluxDB annotated CSV
const executeFluxQuery = async (fluxQuery: string): Promise<any[]> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/v2/query?org=${encodeURIComponent(ORG)}`,
      fluxQuery,
      {
        headers: {
          'Authorization': `Token ${TOKEN}`,
          'Content-Type': 'application/vnd.flux',
          'Accept': 'application/csv'
        },
      }
    );

    const csvData = response.data;
    const lines = csvData.split('\n');
    let headers: string[] = [];
    const results: any[] = [];

    for (const line of lines) {
      if (!line.trim() || line.startsWith('#')) {
        continue;
      }
      
      const columns = line.split(',');
      if (columns[1] === 'result' && columns[2] === 'table') {
        headers = columns;
      } else if (headers.length > 0 && columns.length === headers.length) {
        const rowData: any = {};
        for (let i = 0; i < headers.length; i++) {
          rowData[headers[i].trim()] = columns[i].trim();
        }
        results.push(rowData);
      }
    }
    return results;
  } catch (error) {
    console.error('Error executing Flux query:', error);
    throw error;
  }
};

// Helper to format RFC3339 time to DD/MM/YYYY HH:mm:ss
const formatTime = (isoString: string) => {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};

const getAggregateWindow = (timeRange: string) => {
  switch (timeRange) {
    case '-30m': return '1m';
    case '-1h': return '1m';
    case '-3h': return '2m';
    case '-6h': return '5m';
    case '-12h': return '10m';
    case '-24h': return '20m';
    case '-3d': return '1h';
    case '-7d': return '2h';
    default: return '10m';
  }
};

export const fetchHistoricalData = async (timeRange: string, measurement: string): Promise<{temperature: SensorData[], humidity: SensorData[], lightDensity: SensorData[]}> => {
  const aggWindow = getAggregateWindow(timeRange);
  const query = `
    from(bucket: "${BUCKET}")
      |> range(start: ${timeRange})
      |> filter(fn: (r) => r._measurement == "${measurement}")
      |> filter(fn: (r) => r._field == "temperature" or r._field == "humidity" or r._field == "light_density")
      |> aggregateWindow(every: ${aggWindow}, fn: mean, createEmpty: false)
      |> keep(columns: ["_time", "_value", "_field"])
  `;

  const rows = await executeFluxQuery(query);
  
  const temperature: SensorData[] = [];
  const humidity: SensorData[] = [];
  const lightDensity: SensorData[] = [];

  rows.forEach(row => {
    const dataObj = {
      time: formatTime(row._time),
      value: parseFloat(row._value)
    };
    
    if (row._field === 'temperature') temperature.push(dataObj);
    else if (row._field === 'humidity') humidity.push(dataObj);
    else if (row._field === 'light_density') lightDensity.push(dataObj);
  });

  return { temperature, humidity, lightDensity };
};

export const fetchMeanHourlyData = async (timeRange: string, measurement: string): Promise<MeanData[]> => {
  const query = `
    from(bucket: "${BUCKET}")
      |> range(start: ${timeRange})
      |> filter(fn: (r) => r._measurement == "${measurement}")
      |> filter(fn: (r) => r._field == "temperature" or r._field == "humidity" or r._field == "light_density")
      |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
      |> keep(columns: ["_time", "_value", "_field"])
  `;

  const rows = await executeFluxQuery(query);
  
  // Group by time
  const timeMap = new Map<string, any>();
  
  rows.forEach(row => {
    const t = formatTime(row._time);
    if (!timeMap.has(t)) {
      timeMap.set(t, { time: t, mean_temperature: 0, mean_humidity: 0, mean_ldr: 0 });
    }
    
    const entry = timeMap.get(t);
    const val = parseFloat(row._value);
    
    if (row._field === 'temperature') entry.mean_temperature = val;
    else if (row._field === 'humidity') entry.mean_humidity = val;
    else if (row._field === 'light_density') entry.mean_ldr = val;
  });

  // Sort chronologically (assuming map order might be off, but it usually follows insertion. Let's parse time to sort properly if needed, but since we map formatted strings, we can just return the values)
  return Array.from(timeMap.values()).sort((a, b) => {
    // DD/MM/YYYY HH:mm:ss to parsable format for sort
    const parseDate = (str: string) => {
      const [datePart, timePart] = str.split(' ');
      const [d, m, y] = datePart.split('/');
      return new Date(`${y}-${m}-${d}T${timePart}`).getTime();
    };
    return parseDate(a.time) - parseDate(b.time);
  });
};
