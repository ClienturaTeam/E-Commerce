import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  ConfirmationResult,
} from "firebase/auth";

// Firebase configuration from Environment Variables or Fallback Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoConfigKeyForFirebaseKartlyApp2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kartly-ecommerce-prod.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kartly-ecommerce-prod",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kartly-ecommerce-prod.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "987654321012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:987654321012:web:a1b2c3d4e5f6g7h8",
};

// Initialize Firebase App instance safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Initialize reCAPTCHA Verifier for Phone OTP Auth
 */
export function setupRecaptcha(containerId: string = "recaptcha-container"): RecaptchaVerifier {
  if (typeof window === "undefined") {
    throw new Error("reCAPTCHA can only be initialized in browser environment");
  }

  // Clear existing window recaptcha instance if present
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch {
      // ignore clear error
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved
    },
    "expired-callback": () => {
      console.warn("reCAPTCHA expired. Please try sending OTP again.");
    },
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Trigger Phone OTP Verification using Firebase
 */
export async function sendPhoneOtp(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  // Ensure phone number includes country code (+91 for India default)
  let formattedPhone = phoneNumber.trim();
  if (!formattedPhone.startsWith("+")) {
    formattedPhone = `+91${formattedPhone.replace(/\D/g, "")}`;
  }

  return await signInWithPhoneNumber(auth, formattedPhone, verifier);
}

/**
 * Confirm 6-Digit OTP Code
 */
export async function confirmOtpCode(
  confirmationResult: ConfirmationResult,
  otpCode: string
) {
  return await confirmationResult.confirm(otpCode);
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return {
    uid: user.uid,
    name: user.displayName || "Google User",
    email: user.email || "",
    phone: user.phoneNumber || "",
    avatar: user.photoURL || "",
  };
}

/**
 * Sign Out from Firebase
 */
export async function logoutFromFirebase() {
  return await firebaseSignOut(auth);
}

/**
 * Listen to Auth State Changes
 */
export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
