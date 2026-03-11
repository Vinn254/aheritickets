// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authcontext';
import Landing from './pages/landing';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import CreateTicket from './pages/createticket';
import MyTickets from './pages/mytickets';
import TicketDetails from './pages/ticketdetails';
import CSROpen from './pages/crsopen';
import TechAssigned from './pages/technicianassigned';
import ManageUsers from './pages/manageusers';
import WhatsAppWidget from './components/WhatsappWidget';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets/create" element={<CreateTicket />} />
        <Route path="/tickets" element={<MyTickets />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
        <Route path="/csr/open" element={<CSROpen />} />
        <Route path="/tech/assigned" element={<TechAssigned />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        {/* fallback */}
        <Route path="*" element={<Landing />} />
      </Routes>
      <WhatsAppWidget />
    </AuthProvider>
  </BrowserRouter>
);
