import React, { useState, useEffect, useContext, Suspense, lazy } from "react";
import { AuthContext } from "./context/authcontext";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import WhatsAppIcon from "./components/WhatsappWidget";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/navbar";
// Removed AnimatePresence and motion for performance

// Lazy load components
const Footer = lazy(() => import("./components/footer"));
const Register = lazy(() => import("./pages/register"));
const CustomerDashboard = lazy(() => import("./pages/dashboard"));
const CSRDashboard = lazy(() => import("./pages/crsopen"));
const TechnicianDashboard = lazy(() => import("./pages/technicianassigned"));
const ManageUsers = lazy(() => import("./pages/manageusers"));
const ContractorDashboard = lazy(() => import("./pages/contractordashboard"));
const CreateTicket = lazy(() => import("./pages/createticket"));
const Login = lazy(() => import("./pages/login"));
const Landing = lazy(() => import("./pages/landing"));
const TicketDetails = lazy(() => import("./pages/ticketdetails"));
const Analytics = lazy(() => import("./pages/analytics"));
const NetworkManagement = lazy(() => import("./pages/networkmanagement"));
const Inventory = lazy(() => import("./pages/inventory"));

import './watermark.css';

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRole) {
    if (Array.isArray(allowedRole)) {
      if (!allowedRole.includes(role)) return <Navigate to={`/dashboard/${role}`} replace />;
    } else {
      if (role !== allowedRole) return <Navigate to={`/dashboard/${role}`} replace />;
    }
  }
  return children;
}



function App() {
  const navigate = useNavigate();

  const { user, token } = useContext(AuthContext);
  const location = useLocation();
  const isAuthenticated = !!token;
  const role = user?.role;



  return (
    <div style={{
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      width: '100vw',
      display: "flex",
      flexDirection: "column",
      overflowX: 'hidden',
      minWidth: '100vw',
      background: 'linear-gradient(135deg, #eafff3 0%, #f7fff7 100%)',
    }}>
      <div className="watermark-bg" />

      {/* Navbar always visible after login, on all pages except landing, login, register */}
      {isAuthenticated && !['/', '/login', '/register'].includes(location.pathname) && (
        <Navbar isAuthenticated={isAuthenticated} role={role} />
      )}

      {/* Main content area */}
      <div style={{ flex: 1, minHeight: 'calc(100vh - 64px - 70px)', width: '100vw', maxWidth: '100vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
           <Route
             path="/analytics"
             element={
               <ProtectedRoute allowedRole={["admin", "csr"]}>
                 <ErrorBoundary>
                   <Analytics />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route
             path="/network"
             element={
               <ProtectedRoute allowedRole={["admin", "technician"]}>
                 <ErrorBoundary>
                   <NetworkManagement />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route
             path="/inventory"
             element={
               <ProtectedRoute allowedRole={["admin", "technician"]}>
                 <ErrorBoundary>
                   <Inventory />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route path="/" element={<Landing />} />
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ErrorBoundary>
                {isAuthenticated && role === 'admin' ? (
                  <ManageUsers />
                ) : isAuthenticated && role === 'customer' ? (
                  <Navigate to="/dashboard/customer" replace />
                ) : isAuthenticated && role === 'csr' ? (
                  <Navigate to="/dashboard/csr" replace />
                ) : isAuthenticated && role === 'technician' ? (
                  <Navigate to="/dashboard/technician" replace />
                ) : <Navigate to="/login" replace />}
              </ErrorBoundary>
            }
          />
          <Route
            path="/dashboard/customer"
            element={
              
                <ProtectedRoute allowedRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              
            }
          />
          <Route
            path="/dashboard/csr"
            element={
              
                <ProtectedRoute allowedRole="csr">
                  <CSRDashboard />
                </ProtectedRoute>
              
            }
          />
          <Route
            path="/dashboard/technician"
            element={
              
                <ProtectedRoute allowedRole="technician">
                  <TechnicianDashboard />
                </ProtectedRoute>
              
            }
          />
          <Route
            path="/dashboard/contractor"
            element={
              
                <ProtectedRoute allowedRole="contractor">
                  <ContractorDashboard />
                </ProtectedRoute>
              
            }
          />
          <Route
            path="/tickets/create"
            element={
              
                <ProtectedRoute allowedRole="customer">
                  <CreateTicket />
                </ProtectedRoute>
              
            }
          />
          <Route
            path="/manage-users"
            element={
              
                <ProtectedRoute allowedRole={["admin", "csr"]}>
                  <ManageUsers />
                </ProtectedRoute>
              
            }
          />
          <Route
            path="/tickets/:id"
            element={
              
                <ProtectedRoute allowedRole={["admin", "csr", "technician", "customer"]}>
                  <ErrorBoundary>
                    <TicketDetails />
                  </ErrorBoundary>
                </ProtectedRoute>
              
            }
          />
          {/* Redirect to dashboard if authenticated and tries to access unknown route */}
          {isAuthenticated && role && (
            <Route path="*" element={
              
                <Navigate to={`/dashboard/${role}`} replace />
              
            } />
          )}
          {/* Otherwise, redirect to landing */}
          {!isAuthenticated && <Route path="*" element={
            
              <Navigate to="/" replace />
            
          } />}
            </Routes>
        </Suspense>
        {/* WhatsApp Icon visible for any authenticated user, on all pages */}
        {isAuthenticated && (
          <ErrorBoundary>
            <WhatsAppIcon />
          </ErrorBoundary>
        )}
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
