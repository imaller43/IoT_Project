import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import mqtt, { MqttClient } from 'mqtt';


interface MqttContextType {
  client: MqttClient | null;
  isConnected: boolean;
  temperature: number;
  humidity: number;
  lightDensity: number;
  publishSwitch: (switchId: number, state: boolean) => void;
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
      mqttClient.subscribe('sapura/project/dht11/temperature');
      mqttClient.subscribe('sapura/project/dht11/humidity');
      mqttClient.subscribe('sapura/project/ldr');
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Connection Error:', err);
      setIsConnected(false);
    });

    mqttClient.on('close', () => setIsConnected(false));
    mqttClient.on('offline', () => setIsConnected(false));

    mqttClient.on('message', (topic, message) => {
      const msgStr = message.toString();
      let val = parseFloat(msgStr);

      if (isNaN(val)) {
        try {
          const jsonObj = JSON.parse(msgStr);
          val = parseFloat(jsonObj.value ?? jsonObj.val ?? jsonObj.temperature ?? jsonObj.humidity ?? jsonObj.ldr);
        } catch (e) {}
      }

      if (isNaN(val)) return;

      if (topic === 'sapura/project/dht11/temperature') {
        setTemperature(val);
      } else if (topic === 'sapura/project/dht11/humidity') {
        setHumidity(val);
      } else if (topic === 'sapura/project/ldr') {
        setLightDensity(val);
      }
    });

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  const publishSwitch = (switchId: number, state: boolean) => {
    if (client && client.connected) {
      const topic = switchId === 1 ? 'sapura/project/switch/fan' : 'sapura/project/switch/interrupt';
      const payload = switchId === 2 ? (state ? '0' : '1') : (state ? '1' : '0');
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
