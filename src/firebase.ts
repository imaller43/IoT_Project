import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAFB9FVcOUWx2X5SXyIxQJ_eqKecbSQ7Vs",
  authDomain: "iotdashboard-45e86.firebaseapp.com",
  projectId: "iotdashboard-45e86",
  storageBucket: "iotdashboard-45e86.firebasestorage.app",
  messagingSenderId: "72552641629",
  appId: "1:72552641629:web:2f83baa0642db987c749b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const VAPID_KEY = "BF8VGx4Aa8QKZ4yUMHgsNMQy4o6M4GRpwZonsgEeLkjOSe4twoW0DwV_uyRfr7GHnzU5Gbi30rYASE2q439V8AQ";

export { app, getToken, onMessage };
