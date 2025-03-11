import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../context/Firebase";
import signinImage from "../assets/signin.jpg";

const LoginPage = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Logging in a user");

    try {
      const result = await firebase.signinUserWithEmailAndPass(email, password);
      console.log("Login successful!", result);
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error.message);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-start justify-start bg-cover bg-center p-0 font-smooch  "
      style={{ backgroundImage: `url(${signinImage})` }} // Set the background image
    >
      <div className=" p-8 rounded-lg shadow-lg w-full max-w-md lg:ml-20 md:ml-20">
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
          At Greenthumb, we’re here to support farmers with easy-to-use tools for moisture control, disease detection, and a community of plant enthusiasts. Together, we can help your crops thrive and your farm flourish.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            {/* <label className="block text-sm font-medium mb-2" htmlFor="email">
              Email
            </label> */}
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
            {/* <label className="block text-sm font-medium mb-2" htmlFor="password">
              Password
            </label> */}
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 font-semibold rounded-full"
              placeholder="Password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 text-xl font-medium rounded-full transition-transform duration-200 hover:scale-95 hover:bg-green-600"
          >
            LOGIN
          </button>
        </form>
        <p className="mt-4 text-white text-xl">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-green-500 hover:underline"
          >
            Sign up
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

export default LoginPage;