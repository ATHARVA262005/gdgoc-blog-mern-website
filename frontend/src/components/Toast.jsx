import React from 'react';
import { X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        <span>{message}</span>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
