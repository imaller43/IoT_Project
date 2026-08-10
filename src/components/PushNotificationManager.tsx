import React, { useState, useEffect } from 'react';
import { messaging, getToken, VAPID_KEY } from '../firebase';
import { useMqtt } from '../context/MqttContext';
import { Bell, BellOff, BellRing } from 'lucide-react';

export const PushNotificationManager: React.FC = () => {
  const { client, isConnected } = useMqtt();
  const isSupported = 'Notification' in window;
  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : 'denied'
  );
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // If permission is already granted, automatically fetch the token and register
    if (isSupported && Notification.permission === 'granted' && !fcmToken) {
      requestPermission();
    }
  }, []);

  // When we have both token and MQTT connection, auto-register
  useEffect(() => {
    if (fcmToken && client && isConnected) {
      registerToken(fcmToken);
    }
  }, [fcmToken, client, isConnected]);

  const registerToken = (token: string) => {
    if (client && client.connected) {
      // Hantar FCM Token ke Node-RED melalui MQTT
      client.publish('sapura/fcm/register', token, { retain: false });
      setIsRegistered(true);
    }
  };

  const requestPermission = async () => {
    setIsRequesting(true);
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult === 'granted') {
        if (!messaging) {
          console.error('Messaging is not supported or not initialized.');
          return;
        }
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token) {
          setFcmToken(token);
        } else {
          console.error('No registration token available.');
        }
      }
    } catch (err) {
      console.error('An error occurred while retrieving token. ', err);
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BellOff size={20} color="gray" />
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Notifikasi Suhu Tinggi</h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>
          ⚠️ Pelayar (browser) ini tidak menyokong notifikasi, atau anda tidak mengakses dari sambungan yang selamat (HTTPS).
        </span>
      </div>
    );
  }

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isRegistered ? (
            <BellRing size={20} color="var(--primary-color)" />
          ) : permission === 'granted' ? (
            <Bell size={20} color="var(--primary-color)" />
          ) : (
            <BellOff size={20} color="gray" />
          )}
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Notifikasi Suhu Tinggi</h3>
        </div>
        {permission !== 'granted' && (
          <button
            onClick={requestPermission}
            disabled={isRequesting}
            style={{ padding: '0.5rem 1rem', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isRequesting ? 'Memproses...' : 'Aktifkan'}
          </button>
        )}
      </div>

      {isRegistered && (
        <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>
          ✅ Notifikasi aktif. Anda akan dimaklumkan jika suhu melebihi 27°C.
        </span>
      )}

      {permission === 'granted' && !isRegistered && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Sedang mendaftar peranti anda...
        </span>
      )}

      {permission === 'denied' && (
        <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>
          Anda telah menghalang (block) notifikasi. Sila ubah tetapan pelayar (browser) anda.
        </span>
      )}
    </div>
  );
};
