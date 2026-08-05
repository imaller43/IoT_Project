import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import mqtt, { MqttClient } from 'mqtt';


interface MqttContextType {
  client: MqttClient | null;
  isConnected: boolean;
  temperature: number;
  humidity: number;
  lightDensity: number;
  publishSwitch: (topic: string, state: boolean) => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (!context) {
    throw new Error('useMqtt must be used within a MqttProvider');
  }
  return context;
};

interface MqttProviderProps {
  children: ReactNode;
}

export const MqttProvider: React.FC<MqttProviderProps> = ({ children }) => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Real-time values
  const [temperature, setTemperature] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const [lightDensity, setLightDensity] = useState<number>(0);

  useEffect(() => {
    const mqttUrl = `ws://${window.location.host}/mqtt`;
    const mqttClient = mqtt.connect(mqttUrl, {
      username: 'Dashboard',
      password: '123456789',
      clientId: 'IoT_Dashboard'
    });

    setClient(mqttClient);

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT Broker successfully!');
      setIsConnected(true);
      mqttClient.subscribe('sapura/bilik1/data');
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Connection Error:', err);
      setIsConnected(false);
    });

    mqttClient.on('close', () => setIsConnected(false));
    mqttClient.on('offline', () => setIsConnected(false));

    mqttClient.on('message', (topic, message) => {
      if (topic === 'sapura/bilik1/data') {
        try {
          const jsonObj = JSON.parse(message.toString());
          if (jsonObj.temperature !== undefined) setTemperature(parseFloat(jsonObj.temperature));
          if (jsonObj.humidity !== undefined) setHumidity(parseFloat(jsonObj.humidity));
          if (jsonObj.light_density !== undefined) setLightDensity(parseFloat(jsonObj.light_density));
          else if (jsonObj.ldr !== undefined) setLightDensity(parseFloat(jsonObj.ldr));
        } catch (e) {
          console.error("Failed to parse MQTT JSON payload", e);
        }
      }
    });

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  const publishSwitch = (topic: string, state: boolean) => {
    if (client && client.connected) {
      // Assuming interrupt is active low (0 for on, 1 for off) and others are active high.
      const payload = topic.includes('interrupt') ? (state ? '0' : '1') : (state ? '1' : '0');
      client.publish(topic, payload);
    }
  };

  return (
    <MqttContext.Provider value={{
      client,
      isConnected,
      temperature,
      humidity,
      lightDensity,
      publishSwitch
    }}>
      {children}
    </MqttContext.Provider>
  );
};
