import React from "react";
import Image from "next/image";
import { Agent } from "../../types/agent";
import { AgentRow } from "./AgentRow";

interface AgentListProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export const AgentList: React.FC<AgentListProps> = ({
  agents,
  onEdit,
  onDelete,
}) => {
  if (agents.length === 0) {
    return (
      <div className="bg-[rgba(255,255,255)] rounded-[16px] p-8 text-center">
        {" "}
        <Image
          src="/file.svg"
          alt="No Agents"
          width={80}
          height={80}
          className="mx-auto mb-4 opacity-50"
        />
        <h3 className="text-lg font-medium text-[rgba(68,63,63)] mb-2">
          No Agents Found
        </h3>
        <p className="text-sm text-[rgba(100,92,90)]">
          {" "}
          There are no agents added yet. Click the &quot;Add Agent&quot; button
          to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-[16px] max-h-[calc(100vh-220px)]">
      <div className="overflow-x-auto scrollbar-hide rounded-[16px]">
        <div className="inline-block min-w-full rounded-[16px]">
          <div className="overflow-hidden rounded-[16px]">
            <table className="min-w-full divide-y divide-[#F3F4F6] rounded-[16px] overflow-hidden">
              <thead className="bg-[rgba(244,242,242)] sticky top-0 z-10">
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
        </div>
      </div>
    </div>
  );
};
