import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import mqtt, { MqttClient } from 'mqtt';

export interface RoomData {
  temperature: number;
  humidity: number;
  lightDensity: number;
}

interface MqttContextType {
  client: MqttClient | null;
  isConnected: boolean;
  roomsData: Record<string, RoomData>;
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

  // Store data for all rooms
  const [roomsData, setRoomsData] = useState<Record<string, RoomData>>({
    'Bilik_1': { temperature: 0, humidity: 0, lightDensity: 0 },
    'Bilik_2': { temperature: 0, humidity: 0, lightDensity: 0 },
    'Bilik_3': { temperature: 0, humidity: 0, lightDensity: 0 },
  });

  useEffect(() => {
    const mqttUrl = import.meta.env.VITE_MQTT_URL;
    const mqttUsername = import.meta.env.VITE_MQTT_USER;
    const mqttPassword = import.meta.env.VITE_MQTT_PASSWORD;

    const mqttClient = mqtt.connect(mqttUrl, {
      username: mqttUsername,
      password: mqttPassword,
      clientId: 'IoT_Dashboard_' + Math.random().toString(16).substring(2, 8),
      keepalive: 30, // Good for Cloudflare WebSockets
    });

    setClient(mqttClient);

    mqttClient.on('connect', () => {
      setIsConnected(true);
      mqttClient.subscribe('sapura/bilik1/data');
      mqttClient.subscribe('sapura/bilik2/data');
      mqttClient.subscribe('sapura/bilik3/data');
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Connection Error:', err);
      setIsConnected(false);
    });

    mqttClient.on('close', () => setIsConnected(false));
    mqttClient.on('offline', () => setIsConnected(false));

    mqttClient.on('message', (topic, message) => {
      let roomId = '';
      if (topic === 'sapura/bilik1/data') roomId = 'Bilik_1';
      else if (topic === 'sapura/bilik2/data') roomId = 'Bilik_2';
      else if (topic === 'sapura/bilik3/data') roomId = 'Bilik_3';

      if (roomId) {
        try {
          const jsonObj = JSON.parse(message.toString());
          setRoomsData(prev => {
            const currentRoom = prev[roomId];
            return {
              ...prev,
              [roomId]: {
                temperature: jsonObj.temperature !== undefined ? parseFloat(jsonObj.temperature) : currentRoom.temperature,
                humidity: jsonObj.humidity !== undefined ? parseFloat(jsonObj.humidity) : currentRoom.humidity,
                lightDensity: jsonObj.light_density !== undefined ? parseFloat(jsonObj.light_density) : (jsonObj.ldr !== undefined ? parseFloat(jsonObj.ldr) : currentRoom.lightDensity)
              }
            };
          });
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
      const payload = topic.includes('interrupt') ? (state ? '0' : '1') : (state ? '1' : '0');
      client.publish(topic, payload);
    }
  };

  return (
    <MqttContext.Provider value={{
      client,
      isConnected,
      roomsData,
      publishSwitch
    }}>
      {children}
    </MqttContext.Provider>
  );
};
