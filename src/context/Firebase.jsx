
import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";
import { setDoc, doc,getFirestore } from "firebase/firestore";

const FirebaseContext = createContext(null);

const firebaseConfig = {
  apiKey: "AIzaSyDzuGjpAEYPH_c79NJzExMkFzMzXc7B8aU",
  authDomain: "greenthumb-3c42c.firebaseapp.com",
  databaseURL: "https://greenthumb-3c42c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "greenthumb-3c42c",
  storageBucket: "greenthumb-3c42c.firebasestorage.app",
  messagingSenderId: "149057776174",
  appId: "1:149057776174:web:34989a3cf5d1da90a6cdbf",
  measurementId: "G-SNM1TFGJRV"
};

export const useFirebase = () => useContext(FirebaseContext);

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const firestore=getFirestore(firebaseApp);


// const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);


export const FirebaseProvider = (props) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (user) => {
      console.log("User", user);
      setUser(user);
    });
  }, []);

  const signupUserWithEmailAndPassword = (email, password) => {
    return createUserWithEmailAndPassword(firebaseAuth, email, password);
  };

  const signinUserWithEmailAndPass = (email, password) => {
    return signInWithEmailAndPassword(firebaseAuth, email, password);
  };

  const signinWithGoogle = () => {
    return signInWithPopup(firebaseAuth, googleProvider);
  };

  const registerUser = async (email, password, fullName) => {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user; // Get the newly created user
  
      // Store user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        createdAt: new Date()
      });
  
      console.log("User registered and stored in Firestore!");
    } catch (error) {
      console.error("Error registering user:", error.message);
    }
  };

  
  //  const registerUser = async (email, password) => {
  //   try {
  //     const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  //     const user = userCredential.user;

  //     // Optionally, add more user data to Firestore
  //     await firestore.collection("users").doc(user.uid).set({
  //       email: user.email,
  //       createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  //     });

  //     console.log("User registered successfully", user);
  //   } catch (error) {
  //     console.error("Error registering user", error.message);
  //     throw error;
  //   }
  // };



  const currentUser = firebaseAuth.currentUser;
  const isLoggedIn = user ? true : false;

  return (
    <FirebaseContext.Provider
      value={{
        signupUserWithEmailAndPassword,
        signinUserWithEmailAndPass,
        signinWithGoogle,
        registerUser,
        
        currentUser,
        isLoggedIn
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};

export {db};

