import React, { useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { Activity, Users, Clock, TrendingUp } from 'lucide-react';

const ViewAnalytics = ({ analytics }) => {
  const timeRangeData = {
    labels: analytics.stats?.timeRange?.map(day => day._id) || [],
    datasets: [
      {
        label: 'Total Views',
        data: analytics.stats?.timeRange?.map(day => day.views) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Unique Views',
        data: analytics.stats?.timeRange?.map(day => day.uniqueViews) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
      }
    ]
  };

  const deviceData = {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [{
      data: [
        analytics.stats?.devices?.desktop || 0,
        analytics.stats?.devices?.mobile || 0,
        analytics.stats?.devices?.tablet || 0
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.6)',
        'rgba(16, 185, 129, 0.6)',
        'rgba(249, 115, 22, 0.6)'
      ]
    }]
  };

  return (
    <div className="space-y-8 mt-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-2xl font-bold">{(analytics.stats?.total?.totalViews || 0).toLocaleString()}</p>
            </div>
            <Activity className="text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Unique: {(analytics.stats?.total?.uniqueViews || 0).toLocaleString()}
          </p>
        </div>
        {/* Add more stat cards */}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Views Over Time</h3>
          <Line 
            data={timeRangeData}
            options={{
              responsive: true,
              interaction: { intersect: false },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Device Distribution</h3>
          <Doughnut 
            data={deviceData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' }
              }
            }}
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Engagement Rate</p>
            <p className="text-2xl font-bold">{analytics.stats?.engagementRate || '0'}%</p>
          </div>
          {/* Add more metrics */}
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
