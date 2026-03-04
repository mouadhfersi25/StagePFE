import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Register from "../pages/auth/Register/Register";
import Login from "../pages/auth/Login/Login";
import Verify from "../pages/auth/Verify/Verify";
import ForgotPassword from "../pages/auth/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword/ResetPassword";
import Dashboard from "../pages/dashboard/Dashboard";
import UserProfile from "../pages/dashboard/UserProfile";
import DashboardLayout from "../components/layout/DashboardLayout";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import AdminProfile from "../pages/admin/profile/AdminProfile";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } />
        <Route path="/verify" element={<Verify />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/profile" element={
          <AdminRoute>
            <AdminProfile />
          </AdminRoute>
        } />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
