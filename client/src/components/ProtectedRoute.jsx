import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ role = "user" }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userRole = res.data.role;

        if (userRole === role) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        setIsAuthorized(false);
      }
    };

    verifyToken();
  }, [token, role]);

  if (isAuthorized === null) return null;

  if (!isAuthorized) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
