import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NavLink.module.css';

const NavLink = ({ to, icon: Icon, text }) => {
  return (
    <Link to={to} className={styles.navLink}>
      <Icon className={styles.icon} />
      <span>{text}</span>
    </Link>
  );
};

export default NavLink;