import React from 'react';
import { Agent } from '../../types/agent';
import { AgentRow } from './AgentRow';

interface AgentListProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export const AgentList: React.FC<AgentListProps> = ({
  agents,
  onEdit,
  onDelete
}) => {
  return (
    <div className="overflow-x-auto rounded-[16px]">
      <table className="min-w-full divide-y divide-[#F3F4F6]">
        <thead className="bg-[rgba(244,242,242)]">
          <tr>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Agent Name
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Email
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Status
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-[rgba(255,255,255)] divide-y divide-[#F3F4F6]">
          {agents.map((agent) => (
            <AgentRow
              key={agent.id}
              agent={agent}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};