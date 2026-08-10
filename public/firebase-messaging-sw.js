importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBy0JiVVER3CaZ5R4I1QYSaI4B8z6rZXlE",
  authDomain: "iotdashboard-667f6.firebaseapp.com",
  projectId: "iotdashboard-667f6",
  storageBucket: "iotdashboard-667f6.firebasestorage.app",
  messagingSenderId: "582199250692",
  appId: "1:582199250692:web:c6bb42c9bc342d2beb0a51"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
