import React, { useState, useEffect } from 'react';
import { getMessagingInstance, getToken, VAPID_KEY } from '../firebase';
import { deleteToken } from 'firebase/messaging';
import { useMqtt } from '../context/MqttContext';
import { Bell, BellOff } from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const { client, isConnected } = useMqtt();
  
  const isSupported = 'Notification' in window;
  const [, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : 'denied'
  );
  
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check initial state
    if (isSupported && Notification.permission === 'granted') {
      const checkToken = async () => {
        try {
          const messaging = await getMessagingInstance();
          if (messaging) {
            const wantsNotifications = localStorage.getItem('wants_notifications') !== 'false';
            if (wantsNotifications) {
              const token = await getToken(messaging, { vapidKey: VAPID_KEY });
              if (token) setFcmToken(token);
            }
          }
        } catch (err) {
          console.error("Error checking token on mount:", err);
        }
      };
      checkToken();
    }
  }, [isSupported]);

  // Publish token to MQTT
  useEffect(() => {
    if (fcmToken && client && isConnected) {
      client.publish('sapura/fcm/register', fcmToken, { retain: false });
    }
  }, [fcmToken, client, isConnected]);

  const toggleNotification = async () => {
    if (!isSupported) {
      alert("Pelayar (browser) ini tidak menyokong notifikasi Web Push.");
      return;
    }

    setIsProcessing(true);
    try {
      const messaging = await getMessagingInstance();
      if (!messaging) {
        alert("Sistem notifikasi gagal dimulakan.");
        setIsProcessing(false);
        return;
      }

      if (fcmToken) {
        // TURN OFF
        const deleted = await deleteToken(messaging);
        if (deleted) {
          const oldToken = fcmToken;
          setFcmToken(null);
          localStorage.setItem('wants_notifications', 'false');
          // Tell Node-RED to unregister
          if (client && isConnected) {
            client.publish('sapura/fcm/unregister', oldToken, { retain: false });
          }
        }
      } else {
        // TURN ON
        const permissionResult = await Notification.requestPermission();
        setPermission(permissionResult);
        
        if (permissionResult === 'granted') {
          const token = await getToken(messaging, { vapidKey: VAPID_KEY });
          if (token) {
            setFcmToken(token);
            localStorage.setItem('wants_notifications', 'true');
          }
        } else {
          alert("Anda telah menyekat notifikasi. Sila ubah tetapan pelayar anda.");
        }
      }
    } catch (err) {
      console.error('An error occurred during notification toggle:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  const isRegistered = !!fcmToken;

  return (
    <button
      onClick={toggleNotification}
      disabled={isProcessing}
      title={isRegistered ? "Matikan Notifikasi Suhu" : "Aktifkan Notifikasi Suhu"}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: isProcessing ? 'wait' : 'pointer',
        color: isRegistered ? 'var(--primary-color)' : 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        opacity: isProcessing ? 0.5 : 1,
        transition: 'color 0.2s ease'
      }}
    >
      {isRegistered ? <Bell size={20} /> : <BellOff size={20} />}
    </button>
  );
};
