import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { FiUsers, FiCalendar, FiActivity, FiMap, FiFile, FiPhone } from 'react-icons/fi';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#6B7280]">{title}</h3>
        <div className="text-[#9CA3AF]">{icon}</div>
      </div>
      <p className="text-2xl font-semibold text-[#111827]">{value}</p>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    totalAgents: '0',
    totalForms: '0', 
    totalActivities: '0',
    totalClicks: '0',
    totalEvents: '0'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // const response = await fetch('your-api-endpoint');
        // const data = await response.json();
        // setDashboardData({
        //   totalAgents: data.totalAgents,
        //   totalForms: data.totalForms,
        //   totalActivities: data.totalActivities, 
        //   totalClicks: data.totalClicks,
        //   totalEvents: data.totalEvents
        // });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <Head>
        <title>Dashboard | Mycotur</title>
      </Head>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatCard
          title="Total Agents"
          value={dashboardData.totalAgents}
          icon={<FiUsers size={20} />}
        />
        <StatCard
          title="Total Number of Form submission"
          value={dashboardData.totalForms}
          icon={<FiFile size={20} />}
        />
        <StatCard
          title="Total Activities"
          value={dashboardData.totalActivities}
          icon={<FiActivity size={20} />}
        />
        <StatCard
          title="Total Clicks on contact"
          value={dashboardData.totalClicks}
          icon={<FiPhone size={20} />}
        />
        <StatCard
          title="Total Events"
          value={dashboardData.totalEvents}
          icon={<FiCalendar size={20} />}
        />
      </div>
    </>
  );
};

export default Dashboard;
