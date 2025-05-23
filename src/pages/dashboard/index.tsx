import React, { useState, useEffect } from "react";
import Head from "next/head";
import { FiUsers, FiFileText, FiCalendar } from "react-icons/fi";
import { BsWindowStack } from "react-icons/bs";
import { LuMousePointerClick } from "react-icons/lu";
import axiosInstance from "@/utils/axiosConfig";
import axios from "axios";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

interface DashboardData {
  totalAgents: number;
  totalForms: string;
  totalActivities: number;
  totalClicks: string;
  totalEvents: number;
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
      <p className="text-2xl font-medium themeTextColor">{value}</p>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalAgents: 0,
    totalForms: "N/A",
    totalActivities: 0,
    totalClicks: "N/A",
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
         const uuid = localStorage.getItem("userUuid");
        const response = await axiosInstance.get("/api/dashboard", {
            headers: {
              userid: uuid,
            },
          });
        setDashboardData((prevData) => ({
          ...prevData,
          totalAgents: response.data.totalAgents,
          totalActivities: response.data.totalActivities,
          totalEvents: response.data.totalEvents,
        }));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        let errorMessage = "Failed to fetch dashboard data";

        if (axios.isAxiosError(error)) {
          errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Error connecting to server";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        Error: {error}
      </div>
    );
  }

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
          value={dashboardData.totalEvents || "0"}
          icon={<FiCalendar size={20} />}
        />
      </div>
    </>
  );
};

export default Dashboard;
