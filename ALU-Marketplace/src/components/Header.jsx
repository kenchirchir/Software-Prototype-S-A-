// src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = AuthService.isAuthenticated();
  
  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };
  
  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">ALU Marketplace</Link>
        
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Products</Link></li>
            
            {isAuthenticated ? (
              <>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/orders">Orders</Link></li>
                <li>
                  <a href="#" onClick={handleLogout}>Logout</a>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;