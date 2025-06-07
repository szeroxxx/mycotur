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
  totalForms: number;
  totalActivities: number;
  totalClicks: number;
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
    totalForms: 0,
    totalActivities: 0,
    totalClicks: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAgent, setIsAgent] = useState(false);
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
          totalForms: response.data.totalrsvp,
          totalAgents: response.data.totalAgents,
          totalActivities: response.data.totalActivities,
          totalEvents: response.data.totalEvents,
          totalClicks: response.data.totalClicks,
        }));
      } catch (error) {
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
    const userData = localStorage.getItem("userData");
    if (!userData) return;
    const parsedUserData = JSON.parse(userData);
    setIsAgent(parsedUserData.role === "agent");

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        Cargando...
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {!isAgent && (
          <StatCard
            title="Total de agentes"
            value={dashboardData.totalAgents}
            icon={<FiUsers size={20} />}
          />
        )}
        <StatCard
          title="Total de formularios enviados"
          value={dashboardData.totalForms}
          icon={<FiFileText size={20} />}
        />
        <StatCard
          title="Total de actividades"
          value={dashboardData.totalActivities}
          icon={<BsWindowStack size={20} />}
        />
        <StatCard
          title="Total de clics en contacto"
          value={dashboardData.totalClicks}
          icon={<LuMousePointerClick size={20} />}
        />
        <StatCard
          title="Total de eventos"
          value={dashboardData.totalEvents || "0"}
          icon={<FiCalendar size={20} />}
        />
      </div>
    </>
  );
};

export default Dashboard;
