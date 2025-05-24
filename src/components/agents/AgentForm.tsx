import React from 'react';
import { Agent } from '../../types/agent';

const RequiredIndicator = () => (
  <span className="text-[rgba(220,38,38,1)]">*</span>
);

interface AgentFormProps {
  agent: Partial<Agent>;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCancel: () => void;
}

export const AgentForm: React.FC<AgentFormProps> = ({
  agent,
  onSubmit,
  onChange,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Agent Name <RequiredIndicator />
        </label>
        <input
          type="text"
          name="name"
          value={agent.name || ''}
          onChange={onChange}
          placeholder="Eg. John Fisher"
          className="w-full px-4 py-2 text-black border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Email <RequiredIndicator />
        </label>
        <input
          type="email"
          name="email"
          value={agent.email || ''}
          onChange={onChange}
          placeholder="john@example.com"
          className="w-full px-4 py-2 text-black border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-lg text-sm font-medium transition-colors"
        >
          {agent.id ? 'Update' : 'Send Invite'}
        </button>
      </div>
    </form>
  );
};