importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAFB9FVcOUWx2X5SXyIxQJ_eqKecbSQ7Vs",
  authDomain: "iotdashboard-45e86.firebaseapp.com",
  projectId: "iotdashboard-45e86",
  storageBucket: "iotdashboard-45e86.firebasestorage.app",
  messagingSenderId: "72552641629",
  appId: "1:72552641629:web:2f83baa0642db987c749b4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.png',
    requireInteraction: false // Memastikan OS tidak memaksa noti kekal di skrin
  };

  // Paparkan notifikasi
  self.registration.showNotification(notificationTitle, notificationOptions).then(() => {
    // Paksa notifikasi ditutup selepas 3.5 saat (3500ms)
    setTimeout(() => {
      self.registration.getNotifications().then(notifications => {
        notifications.forEach(notification => notification.close());
      });
    }, 3500);
  });
});
