import { useState, useCallback, useEffect } from "react";
import { Agent, Toast, PaginationInfo } from "../types/agent";
import axiosInstance from "../utils/axiosConfig";
const ITEMS_PER_PAGE = 10;

interface ApiAgentResponse {
  uuid: string;
  name: string;
  email: string;
  status: string;
}

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    pageSize: ITEMS_PER_PAGE,
    totalItems: 0,
  });
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  const fetchAgents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/user/agent");

      const fetchedAgents = response.data.map((agent: ApiAgentResponse) => ({
        id: agent.uuid,
        name: agent.name,
        email: agent.email,
        status: agent.status,
      }));

      setAgents(fetchedAgents);
      setPagination((prev) => ({
        ...prev,
        totalPages: Math.ceil(fetchedAgents.length / ITEMS_PER_PAGE),
        totalItems: fetchedAgents.length,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch agents";
      showToast("error", errorMessage);
      console.error("Error fetching agents:", error);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const createAgent = useCallback(
    async (agent: Omit<Agent, "id">) => {
      try {
        const requestData = {
          name: agent.name,
          email: agent.email,
          role: "agent",
        };
        const uuid = localStorage.getItem("userUuid");

        const response = await axiosInstance.post(
          "/api/user/register",
          requestData,
          {
            headers: {
              userid: uuid,
            },
          }
        );

        if (response.data && response.data.message === "User created") {
          await fetchAgents();
          showToast("success", "Agent added successfully");

          return {
            ...agent,
            id: response.data.id || Date.now().toString(),
          };
        } else {
          showToast("error", "Agent not get invited, please try again");
          return null;
        }
      } catch (error) {
        console.error("Error creating agent:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create agent";
        showToast("error", errorMessage);
        throw error;
      }
    },
    [showToast, fetchAgents]
  );

  const updateAgent = useCallback(
    async (agent: Agent) => {
      try {
        const response = await axiosInstance.put(
          `/api/user/${agent.id}`,
          agent
        );
        if (response.status === 200) {
          setAgents((prev) =>
            prev.map((item) => (item.id === agent.id ? agent : item))
          );
          showToast("success", "Agent updated successfully");
          return agent;
        }
      } catch (error) {
        console.error("Error updating agent:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update agent";
        showToast("error", errorMessage);
        throw error;
      }
    },
    [showToast]
  );

  const deleteAgent = useCallback(
    async (id: string) => {
      try {
        const response = await axiosInstance.delete(`/api/user/${id}`);

        if (response.status === 200 || response.status === 204) {
          await fetchAgents();
          showToast("success", "Agent deleted successfully");
        } else {
          showToast("error", "Failed to delete agent");
        }
      } catch (error) {
        console.error("Error deleting agent:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete agent";
        showToast("error", errorMessage);
        throw error;
      }
    },
    [showToast, fetchAgents]
  );

  const getFilteredAgents = useCallback(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        !searchTerm ||
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || agent.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [agents, searchTerm, statusFilter]);

  const getPaginatedAgents = useCallback(() => {
    const filtered = getFilteredAgents();
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;

    return filtered.slice(start, end);
  }, [getFilteredAgents, pagination.currentPage, pagination.pageSize]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
  }, []);

  return {
    agents: getPaginatedAgents(),
    isLoading,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(getFilteredAgents().length / ITEMS_PER_PAGE),
      totalItems: getFilteredAgents().length,
    },
    toast,
    searchTerm,
    statusFilter,
    setSearchTerm,
    setStatusFilter,
    setPage,
    createAgent,
    updateAgent,
    deleteAgent,
    showToast,
    refreshAgents: fetchAgents,
  };
};
