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
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[#111827]">{agent.name}</td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[#6B7280]">{agent.email}</td>
      <td className="py-4 px-6 whitespace-nowrap">
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
          agent.status === 'Active' 
            ? 'bg-[#ECFDF5] text-[#065F46]' 
            : 'bg-[#FEF3C7] text-[#92400E]'
        }`}>
          {agent.status}
        </span>
      </td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[#6B7280]">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onEdit(agent)}
            className="text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <FiEdit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(agent)}
            className="text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};