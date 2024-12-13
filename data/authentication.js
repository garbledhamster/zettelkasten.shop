  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCWSWj1zGd85SswT8FRBTHmlOFemBIbVdI",
    authDomain: "zettelkasten-shop.firebaseapp.com",
    projectId: "zettelkasten-shop",
    storageBucket: "zettelkasten-shop.firebasestorage.app",
    messagingSenderId: "671757800099",
    appId: "1:671757800099:web:c8a81ec0ade00765452516",
    measurementId: "G-VPBMF42BKN"
  };
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const pastelColors = ["#AEC6CF", "#F9D5E5", "#FDFD96", "#FFD1DC", "#77DD77", "#CDB7F6"];

export async function registerWithEmail(email, password) {
    try {
        const uc = await createUserWithEmailAndPassword(auth, email, password);
        const u = uc.user;
        const rc = pastelColors[Math.floor(Math.random() * pastelColors.length)];
        await setDoc(doc(db, "users", u.uid), { avatarColor: rc });
        return u;
    } catch (error) {
        console.error("Registration Error:", error.message);
        throw error;
    }
}

export async function loginWithEmail(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Login Error:", error.message);
        throw error;
    }
}

const provider = new GoogleAuthProvider();
export async function signInWithGooglePopup() {
    try {
        const r = await signInWithPopup(auth, provider);
        const u = r.user;
        const ur = doc(db, "users", u.uid);
        const us = await getDoc(ur);
        if (!us.exists()) {
            const rc = pastelColors[Math.floor(Math.random() * pastelColors.length)];
            await setDoc(ur, { avatarColor: rc });
        }
        return u;
    } catch (error) {
        console.error("Google Sign-In Error:", error.message);
        throw error;
    }
}

export async function signOutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Sign-Out Error:", error.message);
        throw error;
    }
}

export function onAuthChange(callback) {
    onAuthStateChanged(auth, callback);
}

export async function getUserData(uid) {
    try {
        const ur = doc(db, "users", uid);
        const us = await getDoc(ur);
        return us.exists() ? us.data() : null;
    } catch (error) {
        console.error("Get User Data Error:", error.message);
        throw error;
    }
}

export function getCurrentUser() {
    return auth.currentUser;
}

export async function placeOrder(cart) {
    const u = getCurrentUser();
    if (!u) throw new Error("Not logged in");
    try {
        await addDoc(collection(db, 'orders'), {
            userId: u.uid,
            cart: cart,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Place Order Error:", error.message);
        throw error;
    }
}
