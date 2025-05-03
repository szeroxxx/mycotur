import { useState, useCallback } from 'react';
import { Agent, Toast, PaginationInfo } from '../types/agent';

const ITEMS_PER_PAGE = 10;

const initialAgents: Agent[] = [
  { id: '1', name: 'Jane Cooper', email: 'jane@example.com', status: 'Active' },
  { id: '2', name: 'Wade Warren', email: 'wade@example.com', status: 'Invited' },
  { id: '3', name: 'Esther Howard', email: 'esther@example.com', status: 'Active' },
  { id: '4', name: 'Cameron Williamson', email: 'cameron@example.com', status: 'Active' },
  { id: '5', name: 'Brooklyn Simmons', email: 'brooklyn@example.com', status: 'Active' },
  { id: '6', name: 'Leslie Alexander', email: 'leslie@example.com', status: 'Active' },
  { id: '7', name: 'Jenny Wilson', email: 'jenny@example.com', status: 'Active' },
  { id: '8', name: 'Guy Hawkins', email: 'guy@example.com', status: 'Active' },
  { id: '9', name: 'Robert Fox', email: 'robert@example.com', status: 'Active' },
  { id: '10', name: 'Jacob Jones', email: 'jacob@example.com', status: 'Active' }
];

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: Math.ceil(initialAgents.length / ITEMS_PER_PAGE),
    pageSize: ITEMS_PER_PAGE,
    totalItems: initialAgents.length
  });
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const createAgent = useCallback(async (agent: Omit<Agent, 'id'>) => {
    // API
    const newAgent = {
      ...agent,
      id: Date.now().toString()
    };
    setAgents(prev => [...prev, newAgent]);
    showToast('success', 'Agent added successfully');
    return newAgent;
  }, [showToast]);

  const updateAgent = useCallback(async (agent: Agent) => {
    // API
    setAgents(prev =>
      prev.map(item => item.id === agent.id ? agent : item)
    );
    showToast('success', 'Agent updated successfully');
    return agent;
  }, [showToast]);

  const deleteAgent = useCallback(async (id: string) => {
    // API
    setAgents(prev => prev.filter(agent => agent.id !== id));
    showToast('success', 'Agent deleted successfully');
  }, [showToast]);

  const getFilteredAgents = useCallback(() => {
    return agents.filter(agent => {
      const matchesSearch = !searchTerm || 
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
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }, []);

  return {
    agents: getPaginatedAgents(),
    pagination: {
      ...pagination,
      totalPages: Math.ceil(getFilteredAgents().length / ITEMS_PER_PAGE),
      totalItems: getFilteredAgents().length
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
    showToast
  };
};