import React, { useState } from "react";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";
import signinImage from "../assets/signin.jpg"; // Import the image

const RegisterPage = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      setErrorMessage("All fields are required!");
      return;
    }

    try {
      await firebase.registerUser(email, password, fullName);
      navigate("/login");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-start justify-start bg-cover bg-center p-0 parallax"
      style={{ backgroundImage: `url(${signinImage})` }} // Set the background image
    >
      <div className="p-8 rounded-lg shadow-lg w-full max-w-md font-smooch lg:ml-20 md:ml-20">
        {/* Apply typing animation to GREEN THUMB */}
        <h1 className="text-8xl font-bold mb-6 text-spotify-green">
          <span className="block overflow-hidden whitespace-nowrap animate-typing">
            GREEN
          </span>
          <span className="block overflow-hidden whitespace-nowrap animate-typingDelay">
            THUMB
          </span>
        </h1>
        <p className="mb-6 font-mono text-sm text-white">
          At Greenthumb, we’re here to support gardeners with easy-to-use tools for moisture control, disease detection, and a community of plant enthusiasts. Together, we can help your crops thrive and your farm flourish.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 font-semibold rounded-full"
              placeholder="Enter email"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-full"
              placeholder="Password"
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-full"
              placeholder="Enter full name"
              required
            />
          </div>
          {errorMessage && <p className="text-red-500 text-lg mb-4">{errorMessage}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 text-xl font-medium rounded-full transition-transform duration-200 hover:scale-95 hover:bg-green-600"
          >
            SIGN UP
          </button>
        </form>
        <p className="mt-4 text-white text-xl ">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-500 hover:underline"
          >
            Login
          </button>
        </p>
        <button
          onClick={() => {
            firebase.signinWithGoogle()
              .then(() => navigate("/home"))
              .catch((error) => console.error("Error signing in:", error));
          }}
          className="w-full mt-4 bg-red-500 text-white text-xl py-2 font-medium rounded-full transition-transform duration-200 hover:scale-95 hover:bg-red-600 hidden"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;