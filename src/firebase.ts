import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBy0JiVVER3CaZ5R4I1QYSaI4B8z6rZXlE",
  authDomain: "iotdashboard-667f6.firebaseapp.com",
  projectId: "iotdashboard-667f6",
  storageBucket: "iotdashboard-667f6.firebasestorage.app",
  messagingSenderId: "582199250692",
  appId: "1:582199250692:web:c6bb42c9bc342d2beb0a51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const VAPID_KEY = "BMnTCGCXNBZd_fFIkymU6CNhK6-tAEKNtpcA2IGJQZ7cR5kjZAJMcQut1iH6Ie_n5dVBJZX_z7NDAsbeUBDrIWg";

export { app, getToken, onMessage };
