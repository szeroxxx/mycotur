import React, { useState } from "react";
import Head from "next/head";
import { Agent } from "../../types/agent";
import { AgentList } from "../../components/agents/AgentList";
import { AgentForm } from "../../components/agents/AgentForm";
import { DeleteModal } from "../../components/agents/DeleteModal";
import { Pagination } from "../../components/pagination/Pagination";
import { useAgents } from "../../hooks/useAgents";
import { FiPlus } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import { CircleCheck } from 'lucide-react';
const emptyAgent: Agent = {
  id: "",
  name: "",
  email: "",
  status: "Active",
};

const AgentsPage: React.FC = () => {
  const {
    agents,
    pagination,
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
  } = useAgents();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (selectedAgent) {
      setSelectedAgent((prev) => ({
        ...prev!,
        [name]: value,
      }));
    }
  };

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const handleDelete = (agent: Agent) => {
    setAgentToDelete(agent);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    try {
      if (selectedAgent.id) {
        await updateAgent(selectedAgent);
      } else {
        await createAgent(selectedAgent);
      }
      setIsModalOpen(false);
      setSelectedAgent(null);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to save agent"
      );
    }
  };

  const confirmDelete = async () => {
    if (agentToDelete) {
      try {
        await deleteAgent(agentToDelete.id);
        setIsDeleteModalOpen(false);
        setAgentToDelete(null);
      } catch (err) {
        showToast(
          "error",
          err instanceof Error ? err.message : "Failed to delete agent"
        );
      }
    }
  };

  const openAddModal = () => {
    setSelectedAgent({ ...emptyAgent });
    setIsModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>Agents | Mycotur</title>
      </Head>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-[12px] text-[rgba(255,255,255)] ${
            toast.type === "success" ? "bg-[rgba(22,163,74)]" : "bg-[rgba(179,38,30)]"
          } flex items-center`}
        >
          <CircleCheck className="mr-2" />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="p-4">
        <div className="mb-3 flex justify-between items-center">
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="relative ">
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgba(142,133,129)]" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-[rgba(199,195,193)] shadow-sm shadow-[rgba(24,27,37,0.04)] text-[rgba(142,133,129)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[rgba(194,91,52)] focus:border-[rgba(194,91,52)]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 px-4 py-2  text-[rgba(142,133,129)] border border-[rgba(199,195,193)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Invited">Invited</option>
            </select>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 bg-[rgba(194,91,52)] hover:bg-[#C44D16] text-[rgba(255,255,255)] rounded-lg text-sm font-medium transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Agent
          </button>
        </div>

        <div className="bg-[rgba(255,255,255)] rounded-[16px] border border-[rgba(226,225,223)] flex flex-col">
          <div className="flex-grow overflow-hidden">
            <AgentList
              agents={agents}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
          {agents.length > 0 && (
            <div className="border-t border-[rgba(226,225,223)] bg-white rounded-b-[16px]">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-[rgba(255,255,255)] rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#111827]">
                {selectedAgent?.id ? "Edit Agent" : "Add Agent"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedAgent(null);
                }}
                className="text-[#6B7280] hover:text-[#111827]"
              >
                ✕
              </button>
            </div>
            <AgentForm
              agent={selectedAgent!}
              onSubmit={handleSubmit}
              onChange={handleInputChange}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedAgent(null);
              }}
            />
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAgentToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default AgentsPage;
