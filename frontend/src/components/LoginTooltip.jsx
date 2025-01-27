import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginTooltip = ({ message }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] animate-fade-in">
      <div className="bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
        <p className="mb-1">{message}</p>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/login');
          }}
          className="text-blue-400 hover:text-blue-300 text-xs font-medium"
        >
          Click to login
        </button>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
      </div>
    </div>
  );
};

export default LoginTooltip;
