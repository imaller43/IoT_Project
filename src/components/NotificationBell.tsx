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

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [showMobileModal, setShowMobileModal] = useState(false);

  // Publish token to MQTT
  useEffect(() => {
    if (fcmToken && client && isConnected) {
      client.publish('sapura/fcm/register', fcmToken, { retain: false });
    }
  }, [fcmToken, client, isConnected]);

  const toggleNotification = async () => {
    if (isMobile) {
      setShowMobileModal(true);
      return;
    }

    if (!isSupported) {
      alert("Pelayar (browser) ini tidak menyokong notifikasi Web Push. (Sila pastikan anda menggunakan HTTPS)");
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

  if (!isSupported && !isMobile) {
    return null; // Don't render on unsupported desktop
  }

  const isRegistered = isMobile ? false : !!fcmToken;

  return (
    <>
      <button
        onClick={toggleNotification}
        disabled={isProcessing}
        title={isMobile ? "Notifikasi Telegram" : (isRegistered ? "Matikan Notifikasi Suhu" : "Aktifkan Notifikasi Suhu")}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: isProcessing ? 'wait' : 'pointer',
          color: isMobile ? 'var(--text-primary)' : (isRegistered ? 'var(--primary-color)' : 'var(--text-secondary)'),
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          opacity: isProcessing ? 0.5 : 1,
          transition: 'color 0.2s ease'
        }}
      >
        {isRegistered || isMobile ? <Bell size={20} /> : <BellOff size={20} />}
      </button>

      {/* Mobile Telegram Modal */}
      {showMobileModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--panel-bg)',
            padding: '2rem',
            borderRadius: '16px',
            maxWidth: '90%',
            width: '400px',
            textAlign: 'center',
            border: '1px solid var(--panel-border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(34, 158, 217, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                <Bell size={32} color="#229ED9" />
              </div>
            </div>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.25rem' }}>
              Mobile Notifications 📱
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              For mobile devices, we use a <strong>Telegram Bot</strong> to ensure high-temperature alerts are delivered faster and more reliably than standard Web Push notifications.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowMobileModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--panel-border)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Close
              </button>
              <a 
                href="https://t.me/dashboardIoT_bot" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#229ED9',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  cursor: 'pointer'
                }}
              >
                Open Telegram
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
