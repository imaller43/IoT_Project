import React, { useState, useEffect } from 'react';
import { messaging, getToken, VAPID_KEY } from '../firebase';
import { Bell, BellOff, Copy, Check } from 'lucide-react';

export const PushNotificationManager: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // If permission is already granted, we can automatically fetch the token
    if (Notification.permission === 'granted' && !fcmToken) {
      requestPermission();
    }
  }, []);

  const requestPermission = async () => {
    setIsRequesting(true);
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult === 'granted') {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token) {
          setFcmToken(token);
        } else {
          console.error('No registration token available. Request permission to generate one.');
        }
      }
    } catch (err) {
      console.error('An error occurred while retrieving token. ', err);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCopy = () => {
    if (fcmToken) {
      navigator.clipboard.writeText(fcmToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {permission === 'granted' ? <Bell size={20} color="var(--primary-color)" /> : <BellOff size={20} color="gray" />}
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

      {permission === 'granted' && fcmToken && (
        <div style={{ background: 'var(--bg-color)', padding: '0.75rem', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>FCM Token (Untuk digunakan di Node-RED):</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <code style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--text-primary)', background: 'var(--panel-bg)', padding: '0.25rem' }}>
              {fcmToken}
            </code>
            <button 
              onClick={handleCopy}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copied ? 'green' : 'var(--text-secondary)' }}
              title="Copy Token"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      )}

      {permission === 'denied' && (
        <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>Anda telah menghalang (block) notifikasi. Sila ubah tetapan pelayar (browser) anda.</span>
      )}
    </div>
  );
};
