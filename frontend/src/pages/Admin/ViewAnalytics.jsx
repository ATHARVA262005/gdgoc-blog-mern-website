import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Users, Clock, TrendingUp } from 'lucide-react';

const ViewAnalytics = ({ analytics }) => {
  return (
    <div className="mt-8 space-y-8">
      {/* Views by Post Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Views by Post</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.viewsByPost}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Last 30 Days Trend */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Views Trend (Last 30 Days)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.last30Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ analytics }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div>
      {showAnalytics ? (
        <ViewAnalytics analytics={analytics} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          <div className="bg-white p-6 rounded-lg shadow cursor-pointer" onClick={() => setShowAnalytics(true)}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500">Total Views</p>
                <h3 className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</h3>
              </div>
              <Activity className="text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500">Monthly Growth</p>
                <h3 className="text-2xl font-bold">{analytics.viewsGrowth}</h3>
              </div>
              <TrendingUp className="text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500">Unique Visitors</p>
                <h3 className="text-2xl font-bold">{analytics.uniqueViews?.toLocaleString() || 0}</h3>
              </div>
              <Users className="text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500">Avg. Time</p>
                <h3 className="text-2xl font-bold">2m 30s</h3>
              </div>
              <Clock className="text-orange-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
