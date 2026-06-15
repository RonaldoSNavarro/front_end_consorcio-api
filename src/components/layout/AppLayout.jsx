import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout = () => {
  return (
    <div className="app-container">
      <div className="glow-vector-1"></div>
      <div className="glow-vector-2"></div>
      
      <Sidebar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
