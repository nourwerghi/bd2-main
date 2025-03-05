import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import styles from './AuthButtons.module.css';

const AuthButtons = () => {
  return (
    <>
      <Link to="/login" className={styles.authButton}>
        <LogIn className={styles.icon} />
        <span>Login</span>
      </Link>
      <Link to="/register" className={styles.authButton}>
        <UserPlus className={styles.icon} />
        <span>Register</span>
      </Link>
    </>
  );
};

export default AuthButtons;