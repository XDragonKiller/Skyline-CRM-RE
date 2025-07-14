import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Sidebar.css';

const Sidebar = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  let userData = null;

  if (token) {
    try {
      userData = jwtDecode(token);
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  }

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  if (!token) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>SkyLine CRM</h2>
        <div className="user-greeting">
          Hello, {userData?.full_name?.toUpperCase() || 'User'}
        </div>
      </div>
      <nav>
        <ul>
          <li className={location.pathname === '/dashboard' ? 'active' : ''}>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li className={location.pathname === '/leads' ? 'active' : ''}>
            <Link to="/leads">Leads</Link>
          </li>
          <li className={location.pathname === '/properties' ? 'active' : ''}>
            <Link to="/properties">Properties</Link>
          </li>
          <li className={location.pathname === '/deals' ? 'active' : ''}>
            <Link to="/deals">Deals</Link>
          </li>
          {userData?.role === "admin" && (
            <>
              <li className={location.pathname === '/activities' ? 'active' : ''}>
                <Link to="/activities">Activities</Link>
              </li>
              <li className={location.pathname === '/users' ? 'active' : ''}>
                <Link to="/users">Users</Link>
              </li>
            </>
          )}
          <li className={location.pathname === '/notifications' ? 'active' : ''}>
            <Link to="/notifications">Notifications</Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
