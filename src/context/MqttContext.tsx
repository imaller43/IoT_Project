import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';

export interface RoomData {
  temperature: number;
  humidity: number;
  lightDensity: number;
}

export interface SwitchStates {
  fan: boolean;
  interruptSoftware: boolean;
  interruptHardware: boolean; // physical switch (interrupt1)
  interruptTempOverride: boolean; // temperature override (interrupt2)
  light: boolean;
}

interface MqttContextType {
  client: MqttClient | null;
  isConnected: boolean;
  roomsData: Record<string, RoomData>;
  switchStates: SwitchStates;
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

  const [switchStates, setSwitchStates] = useState<SwitchStates>({
    fan: false,
    interruptSoftware: false,
    interruptHardware: false,
    interruptTempOverride: false,
    light: false,
  });

  // Track the previous hardware state to detect transitions
  const hwInterruptRef = useRef<boolean>(false);
  const hwInterrupt2Ref = useRef<boolean>(false);

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
      // Subscribe to switch states
      mqttClient.subscribe('sapura/bilik1/switch/+');
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
      } else if (topic.startsWith('sapura/bilik1/switch/')) {
        const switchType = topic.split('/').pop();
        const stateStr = message.toString();
        const state = (stateStr === '1');
        
        if (switchType === 'interrupt1' || switchType === 'interrupt2') {
          const hardwareState = (stateStr === '0'); // Reverse logic for interrupt

          let forceResetSoftware = false;

          if (switchType === 'interrupt1') {
            // If transitioning from ON to OFF (Override deactivated)
            if (hwInterruptRef.current === true && hardwareState === false) {
              forceResetSoftware = true;
            }
            hwInterruptRef.current = hardwareState;
          } else if (switchType === 'interrupt2') {
            if (hwInterrupt2Ref.current === true && hardwareState === false) {
              forceResetSoftware = true;
            }
            hwInterrupt2Ref.current = hardwareState;
          }

          if (forceResetSoftware) {
            // Also publish OFF to the software topic so Node-RED receives the reset
            if (mqttClient && mqttClient.connected) {
              mqttClient.publish('sapura/bilik1/switch/interrupt', '1', { retain: true }); // '1' is OFF for interrupt
            }
          }

          setSwitchStates(prev => ({
            ...prev,
            ...(switchType === 'interrupt1' ? { interruptHardware: hardwareState } : {}),
            ...(switchType === 'interrupt2' ? { interruptTempOverride: hardwareState } : {}),
            ...(forceResetSoftware ? { interruptSoftware: false } : {})
          }));
        } else {
          setSwitchStates(prev => ({
            ...prev,
            ...(switchType === 'fan' ? { fan: state } : {}),
            ...(switchType === 'interrupt' ? { interruptSoftware: stateStr === '0' } : {}),
            ...(switchType === 'light' ? { light: state } : {})
          }));
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
      client.publish(topic, payload, { retain: true });
    }
  };

  return (
    <MqttContext.Provider value={{
      client,
      isConnected,
      roomsData,
      switchStates,
      publishSwitch
    }}>
      {children}
    </MqttContext.Provider>
  );
};
