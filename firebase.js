import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAOj0nXCYgsL7HOxqPkliRa57W_cR_G1WA",
  authDomain: "imameapp-7e73f.firebaseapp.com",
  projectId: "imameapp-7e73f",
  storageBucket: "imameapp-7e73f.appspot.com",
  messagingSenderId: "10042514664",
  appId: "1:10042514664:android:7d75241d01341c538b3d5d"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
