import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminNav.module.css';

const AdminNav = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={styles.adminNav}>
      <div className={styles.navHeader}>
        <div className={styles.logoSection}>
          <span className={styles.logo}>🚀</span>
          <div>
            <h2 className={styles.title}>AURAX LIVE</h2>
            <p className={styles.subtitle}>Admin Dashboard</p>
          </div>
        </div>
      </div>

      <nav className={styles.navLinks}>
        <NavLink 
          to="/admin/campaigns" 
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}>📊</span>
          <span>Campaign Curator</span>
        </NavLink>

        <NavLink 
          to="/admin/brand-intelligence" 
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}>🧠</span>
          <span>Brand Intelligence</span>
        </NavLink>

        <NavLink 
          to="/admin/creators" 
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}>👥</span>
          <span>Creator Review</span>
        </NavLink>
      </nav>

      <div className={styles.navFooter}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {currentUser?.name?.charAt(0) || currentUser?.email?.charAt(0) || 'A'}
          </div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{currentUser?.name || 'Admin'}</p>
            <p className={styles.userEmail}>{currentUser?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNav;
