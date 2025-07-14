import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LeadsList from './pages/LeadsList';
import PropertiesList from './pages/PropertiesList';
import DealsList from './pages/DealsList';
import DealDetails from './pages/DealDetails';
import EditDeal from './pages/EditDeal';
import ActivitiesList from './pages/ActivitiesList';
import NotificationsList from './pages/NotificationsList';
import UsersList from './pages/UsersList';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivateRoute from './components/PrivateRoute';
import AddLead from './pages/AddLead';
import EditLead from './pages/EditLead';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import Favorites from './pages/Favorites';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Auth.css';
import LeadDetails from './pages/LeadDetails';
import LeadRecommendations from './components/LeadRecommendations';
import PropertyDetails from './pages/PropertyDetails';
import AddDeal from './pages/AddDeal';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname.match(/^\/(login|register|forgot-password|reset-password)/);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!isAuthPage && <Sidebar />}
      <div style={{ 
        marginLeft: isAuthPage ? '0' : '250px',
        padding: '20px',
        width: '100%',
        backgroundColor: '#f5f5f5'
      }}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/leads" element={<PrivateRoute><LeadsList /></PrivateRoute>} />
          <Route path="/leads/add" element={<PrivateRoute><AddLead /></PrivateRoute>} />
          <Route path="/leads/edit/:id" element={<PrivateRoute><EditLead /></PrivateRoute>} />
          <Route path="/leads/:id" element={<LeadDetails />} />
          <Route path="/leads/:id/recommendations" element={<LeadRecommendations />} />
          <Route path="/properties" element={<PrivateRoute><PropertiesList /></PrivateRoute>} />
          <Route path="/properties/add" element={<PrivateRoute><AddProperty /></PrivateRoute>} />
          <Route path="/properties/edit/:id" element={<PrivateRoute><EditProperty /></PrivateRoute>} />
          <Route path="/properties/:id" element={<PrivateRoute><PropertyDetails /></PrivateRoute>} />
          <Route path="/deals" element={<PrivateRoute><DealsList /></PrivateRoute>} />
          <Route path="/deals/:id" element={<PrivateRoute><DealDetails /></PrivateRoute>} />
          <Route path="/deals/edit/:id" element={<PrivateRoute><EditDeal /></PrivateRoute>} />
          <Route path="/deals/new" element={<PrivateRoute><AddDeal /></PrivateRoute>} />
          <Route path="/activities" element={<PrivateRoute><ActivitiesList /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><NotificationsList /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><UsersList /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
