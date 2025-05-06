import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  FiUsers,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import { BsWindowStack } from "react-icons/bs";
import { LuMousePointerClick } from "react-icons/lu";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-[rgba(255,255,255)] p-4 rounded-lg border border-[rgba(199,195,193)] shadow-sm shadow-[rgba(24,27,37,0.04)]">
      <div className="flex items-center gap-2 mb-2">
        <div className="themeTextColor border border-[rgba(199,195,193)] shadow-sm shadow-[rgba(24,27,37,0.04)] p-1.5 rounded-[8px]">
          {icon}
        </div>
        <p className="text-sm font-normal themeTextColor">{title}</p>
      </div>
      <p className="text-2xl font-medium text-gray-800">{value}</p>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    totalAgents: "100",
    totalForms: "100",
    totalActivities: "500",
    totalClicks: "500",
    totalEvents: "500",
  });

  useEffect(() => {
    // You can fetch real data here if needed
  }, []);

  return (
    <>
      <Head>
        <title>Dashboard | Mycotur</title>
      </Head>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        <StatCard
          title="Total Agents"
          value={dashboardData.totalAgents}
          icon={<FiUsers size={20} />}
        />
        <StatCard
          title="Total Number of Form submission"
          value={dashboardData.totalForms}
          icon={<FiFileText size={20} />}
        />
        <StatCard
          title="Total Activities"
          value={dashboardData.totalActivities}
          icon={<BsWindowStack size={20} />}
        />
        <StatCard
          title="Total Clicks on contact"
          value={dashboardData.totalClicks}
          icon={<LuMousePointerClick size={20} />}
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
