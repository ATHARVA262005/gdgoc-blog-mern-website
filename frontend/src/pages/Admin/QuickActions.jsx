import React from 'react';
import { PenTool, Users, Settings, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();
  
  const actions = [
    { icon: PenTool, label: 'New Post', path: '/admin/new-blog', color: 'bg-blue-500' },
    { icon: FileText, label: 'All Posts', path: '/admin/posts', color: 'bg-green-500' },
    { icon: Users, label: 'Manage Users', path: '/admin/users', color: 'bg-purple-500' },
    { icon: Settings, label: 'Settings', path: '/admin/settings', color: 'bg-gray-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => navigate(action.path)}
          className="p-4 rounded-xl bg-white border hover:shadow-md transition-shadow"
        >
          <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
            <action.icon size={20} className="text-white" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">{action.label}</h3>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
