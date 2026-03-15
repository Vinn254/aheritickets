import React, { useState, useEffect, useContext, Suspense, lazy } from "react";
import { AuthContext } from "./context/authcontext";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import WhatsAppIcon from "./components/WhatsappWidget";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import { ROLES, ROLE_PERMISSIONS, hasPermission, PATH_TO_RESOURCE } from "./utils/permissions";

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
const Quotations = lazy(() => import("./pages/quotations"));
const Invoices = lazy(() => import("./pages/invoices"));
const RequestInstallation = lazy(() => import("./pages/requestinstallation"));
const ManageInstallationRequests = lazy(() => import("./pages/manageinstallationrequests"));
const TechnicianInstallations = lazy(() => import("./pages/technicianinstallations"));
const Reports = lazy(() => import("./pages/reports"));
const Planning = lazy(() => import("./pages/planning"));
const Customers = lazy(() => import("./pages/customers"));
const ForgotPassword = lazy(() => import("./pages/forgotpassword"));
const ResetPassword = lazy(() => import("./pages/resetpassword"));

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
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { user, token } = useContext(AuthContext);
  const location = useLocation();
  const isAuthenticated = !!token;
  const role = user?.role;

  // Handle responsive sidebar
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get dashboard path based on role
  const getDashboardPath = () => {
    switch(role) {
      case ROLES.ADMIN:
      case ROLES.SUPER_ADMIN:
      case ROLES.HR:
        return '/manage-users';
      case ROLES.CRS:
        return '/dashboard/csr';
      case ROLES.TECHNICIAN:
        return '/dashboard/technician';
      case ROLES.CUSTOMER:
        return '/dashboard/customer';
      case ROLES.CONTRACTOR:
        return '/dashboard/contractor';
      default:
        return '/dashboard';
    }
  };

  return (
    <div style={{
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      width: '100%',
      display: "flex",
      flexDirection: "column",
      overflowX: 'visible',
      background: `
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 40px,
          rgba(45, 122, 62, 0.08) 40px,
          rgba(45, 122, 62, 0.08) 42px,
          transparent 42px,
          transparent 80px,
          rgba(45, 122, 62, 0.05) 80px,
          rgba(45, 122, 62, 0.05) 82px
        ),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 40px,
          rgba(45, 122, 62, 0.08) 40px,
          rgba(45, 122, 62, 0.08) 42px,
          transparent 42px,
          transparent 80px,
          rgba(45, 122, 62, 0.05) 80px,
          rgba(45, 122, 62, 0.05) 82px
        ),
        linear-gradient(135deg, #e8f5e9 0%, #f0f7f0 50%, #e8f5e9 100%)
      `,
    }}>
      <div className="watermark-bg" />

      {/* Navbar always visible after login, on all pages except landing, login, register */}
      {isAuthenticated && !['/', '/login', '/register'].includes(location.pathname) && (
        <Navbar isAuthenticated={isAuthenticated} role={role} showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      )}

      {/* Main content area */}
      <div style={{
        flex: 1,
        minHeight: 'calc(100vh - 64px - 70px)',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Sidebar for authenticated users */}
        {isAuthenticated && !['/', '/login', '/register'].includes(location.pathname) && (
          <div style={{
            position: windowWidth < 768 ? 'fixed' : 'relative',
            left: 0,
            top: 64,
            height: windowWidth < 768 ? 'calc(100vh - 64px)' : '100%',
            zIndex: windowWidth < 768 ? 999 : 'auto',
            backgroundColor: windowWidth < 768 ? 'rgba(0,0,0,0.5)' : 'transparent',
            display: showSidebar ? 'flex' : 'none',
            width: windowWidth < 768 ? '100%' : 'auto'
          }}>
            <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
          </div>
        )}

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          overflowX: 'visible',
          overflowY: 'auto'
        }}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
           <Route
             path="/analytics"
             element={
               <ProtectedRoute allowedRole={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.CSR]}>
                 <ErrorBoundary>
                   <Analytics />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route
             path="/network"
             element={
               <ProtectedRoute allowedRole={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECHNICIAN]}>
                 <ErrorBoundary>
                   <NetworkManagement />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route
             path="/inventory"
             element={
               <ProtectedRoute allowedRole={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECHNICIAN]}>
                 <ErrorBoundary>
                   <Inventory />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route
             path="/quotations"
             element={
               <ProtectedRoute allowedRole={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CSR, ROLES.CUSTOMER]}>
                 <ErrorBoundary>
                   <Quotations />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route
             path="/invoices"
             element={
               <ProtectedRoute allowedRole={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.CSR]}>
                 <ErrorBoundary>
                   <Invoices />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route
             path="/request-installation"
             element={
               <ProtectedRoute allowedRole={ROLES.CUSTOMER}>
                 <ErrorBoundary>
                   <RequestInstallation />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route
             path="/manage-installation-requests"
             element={
               <ProtectedRoute allowedRole={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CSR]}>
                 <ErrorBoundary>
                   <ManageInstallationRequests />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route
             path="/my-installations"
             element={
               <ProtectedRoute allowedRole={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.CONTRACTOR]}>
                 <ErrorBoundary>
                   <TechnicianInstallations />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route
             path="/reports"
             element={
               <ProtectedRoute allowedRole={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.CSR]}>
                 <ErrorBoundary>
                   <Reports />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route
             path="/installations"
             element={
               <Navigate to={role === ROLES.TECHNICIAN || role === ROLES.CONTRACTOR ? '/my-installations' : '/manage-installation-requests'} replace />
             }
           />
           <Route
             path="/planning"
             element={
               <ProtectedRoute allowedRole={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CSR, ROLES.TECHNICIAN]}>
                 <ErrorBoundary>
                   <Planning />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route path="/" element={<Landing />} />
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
           <Route path="/forgot-password" element={<ForgotPassword />} />
           <Route path="/reset-password/:token" element={<ResetPassword />} />
           <Route
             path="/dashboard"
             element={
               <ErrorBoundary>
                 {isAuthenticated && (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN || role === ROLES.HR) ? (
                   <Navigate to="/manage-users" replace />
                 ) : isAuthenticated && role === ROLES.CUSTOMER ? (
                   <Navigate to="/dashboard/customer" replace />
                 ) : isAuthenticated && role === ROLES.CSR ? (
                   <Navigate to="/dashboard/csr" replace />
                 ) : isAuthenticated && role === ROLES.TECHNICIAN ? (
                   <Navigate to="/dashboard/technician" replace />
                 ) : isAuthenticated && role === ROLES.CONTRACTOR ? (
                   <Navigate to="/dashboard/contractor" replace />
                 ) : <Navigate to="/login" replace />}
               </ErrorBoundary>
             }
           />
           <Route
             path="/dashboard/customer"
             element={
               <ProtectedRoute allowedRole={ROLES.CUSTOMER}>
                 <CustomerDashboard />
               </ProtectedRoute>
             }
           />
           <Route
             path="/dashboard/csr"
             element={
               <ProtectedRoute allowedRole={[ROLES.CSR, ROLES.HR, ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                 <CSRDashboard />
               </ProtectedRoute>
             }
           />
           <Route
             path="/dashboard/technician"
             element={
               <ProtectedRoute allowedRole={[ROLES.TECHNICIAN, ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                 <TechnicianDashboard />
               </ProtectedRoute>
             }
           />
           <Route
             path="/dashboard/contractor"
             element={
               <ProtectedRoute allowedRole={ROLES.CONTRACTOR}>
                 <ContractorDashboard />
               </ProtectedRoute>
             }
           />
           <Route
             path="/tickets/create"
             element={
               <ProtectedRoute allowedRole={ROLES.CUSTOMER}>
                 <CreateTicket />
               </ProtectedRoute>
             }
           />
           <Route
             path="/manage-users"
             element={
               <ProtectedRoute allowedRole={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR]}>
                 <ManageUsers />
               </ProtectedRoute>
             }
           />
           <Route
             path="/customers"
             element={
               <ProtectedRoute allowedRole={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CSR, ROLES.TECHNICIAN]}>
                 <ErrorBoundary>
                   <Customers />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           <Route
             path="/tickets/:id"
             element={
               <ProtectedRoute allowedRole={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CSR, ROLES.TECHNICIAN, ROLES.CUSTOMER]}>
                 <ErrorBoundary>
                   <TicketDetails />
                 </ErrorBoundary>
               </ProtectedRoute>
             }
           />
           {/* Redirect to dashboard if authenticated and tries to access unknown route */}
           {isAuthenticated && role && (
             <Route path="*" element={
               <Navigate to={getDashboardPath()} replace />
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
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
