import React from "react";
import { Navigate } from "react-router-dom";
import { useFirebase } from "../context/Firebase";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useFirebase();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
