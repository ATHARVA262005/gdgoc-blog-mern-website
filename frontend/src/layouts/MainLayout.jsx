import React from 'react';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-0 md:ml-64 pb-16 md:pb-0">
        <div className="container mx-auto px-4 py-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
