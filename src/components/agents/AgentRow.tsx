import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Agent } from '../../types/agent';

interface AgentRowProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export const AgentRow: React.FC<AgentRowProps> = ({
  agent,
  onEdit,
  onDelete
}) => {
  return (
    <tr className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">{agent.name}</td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">{agent.email}</td>
      <td className="py-4 px-6 whitespace-nowrap">
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
          agent.status === 'Active' 
            ? 'bg-[rgba(240,253,244)] text-[rgba(22,163,74)]' 
            : 'bg-[rgba(254,243,199)] text-[rgba(217,119,6)]'
        }`}>
          {agent.status}
        </span>
      </td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onEdit(agent)}
            className="text-[rgba(68,63,63)] hover:text-[#111827] transition-colors"
          >
            <FiEdit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(agent)}
            className="text-[rgba(68,63,63)] hover:text-[#111827] transition-colors"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};