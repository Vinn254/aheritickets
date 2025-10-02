import Footer from "./components/footer";
import Register from "./pages/register";
import CustomerDashboard from "./pages/dashboard";
import CSRDashboard from "./pages/crsopen";
import TechnicianDashboard from "./pages/technicianassigned";
import ManageUsers from "./pages/manageusers";
import ContractorDashboard from "./pages/contractordashboard";
import CreateTicket from "./pages/createticket";
import Login from "./pages/login";
import Landing from "./pages/landing";
import TicketDetails from "./pages/ticketdetails";

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./context/authcontext";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import WhatsAppIcon from "./components/WhatsappWidget";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/navbar";
import Analytics from "./pages/analytics";
import { AnimatePresence, motion } from "framer-motion";

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
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const location = useLocation();
  // Force re-render when user context changes
  useEffect(() => {}, [user]);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
    setRole(localStorage.getItem("role"));
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.25
  };

  const handleLogin = (token, userRole) => {
  <div className="watermark-bg" />

    localStorage.setItem("token", token);
    localStorage.setItem("role", userRole);
    setIsAuthenticated(true);
    setRole(userRole);
    if (userRole === 'admin') {
      navigate('/manage-users');
    } else if (userRole === 'csr') {
      navigate('/dashboard/csr');
    } else if (userRole === 'technician') {
      navigate('/dashboard/technician');
    } else {
      navigate('/dashboard/customer');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setRole(null);
    navigate("/"); // Redirect to landing page
  };

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
        <Navbar onLogout={handleLogout} isAuthenticated={isAuthenticated} role={role} />
      )}

      {/* Main content area */}
      <div style={{ flex: 1, minHeight: 'calc(100vh - 64px - 70px)', width: '100vw', maxWidth: '100vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
           <Route
             path="/analytics"
             element={
               <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                 <ProtectedRoute allowedRole={["admin", "csr"]}>
                   <ErrorBoundary>
                     <Analytics />
                   </ErrorBoundary>
                 </ProtectedRoute>
               </motion.div>
             }
           />
           <Route path="/" element={
             <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
               <Landing />
             </motion.div>
           } />
           <Route path="/login" element={
             <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
               <Login onLogin={handleLogin} />
             </motion.div>
           } />
           <Route path="/register" element={
             <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
               <Register />
             </motion.div>
           } />
          <Route
            path="/dashboard"
            element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
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
              </motion.div>
            }
          />
          <Route
            path="/dashboard/customer"
            element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute allowedRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/dashboard/csr"
            element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute allowedRole="csr">
                  <CSRDashboard />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/dashboard/technician"
            element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute allowedRole="technician">
                  <TechnicianDashboard />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/dashboard/contractor"
            element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute allowedRole="contractor">
                  <ContractorDashboard />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/tickets/create"
            element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute allowedRole="customer">
                  <CreateTicket />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/manage-users"
            element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute allowedRole={["admin", "csr"]}>
                  <ManageUsers />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute allowedRole={["admin", "csr", "technician", "customer"]}>
                  <ErrorBoundary>
                    <TicketDetails />
                  </ErrorBoundary>
                </ProtectedRoute>
              </motion.div>
            }
          />
          {/* Redirect to dashboard if authenticated and tries to access unknown route */}
          {isAuthenticated && role && (
            <Route path="*" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <Navigate to={`/dashboard/${role}`} replace />
              </motion.div>
            } />
          )}
          {/* Otherwise, redirect to landing */}
          {!isAuthenticated && <Route path="*" element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <Navigate to="/" replace />
            </motion.div>
          } />}
        </Routes>
        </AnimatePresence>
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
