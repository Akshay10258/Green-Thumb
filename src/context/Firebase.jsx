
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
  apiKey: "AIzaSyAs4SVJU4uF2whc6U7CmZgJUT1Lh7nNoXc",
  authDomain: "plantify-355b9.firebaseapp.com",
  projectId: "plantify-355b9",
  storageBucket: "plantify-355b9.firebasestorage.app",
  messagingSenderId: "908108892204",
  appId: "1:908108892204:web:0b5394ef5e7d15c9fee989",
  measurementId: "G-3QH8LP7BH1",
  databaseURL :"https://plantify-355b9-default-rtdb.asia-southeast1.firebasedatabase.app/"
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

