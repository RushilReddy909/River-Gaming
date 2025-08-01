import React from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import Sidebar from "./components/AppSidebar";

const App = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute allowed={["user", "admin"]}>
            {" "}
            <Sidebar role={"user"} />{" "}
          </ProtectedRoute>
        }
      >
        <Route path="/:streamId?" element={<HomePage />} />
      </Route>
      <Route
        element={
          <ProtectedRoute allowed={["admin"]}>
            <Sidebar role={"admin"} />{" "}
          </ProtectedRoute>
        }
      >
        <Route path="/admin/:streamId?" element={<AdminPage />} />
      </Route>
      <Route path={"/login"} element={<LoginPage />} />
      <Route path={"/register"} element={<RegisterPage />} />
    </Routes>
  );
};

export default App;
