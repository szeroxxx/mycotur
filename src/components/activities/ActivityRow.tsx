import React from 'react';
import { FiEdit2, FiTrash2, FiCopy } from 'react-icons/fi';
import { Activity } from '../../types/activity';

interface ActivityRowProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onDuplicate?: (activity: Activity) => void;
}

export const ActivityRow: React.FC<ActivityRowProps> = ({ 
  activity, 
  onEdit, 
  onDelete,
  onDuplicate 
}) => {
  return (
    <tr className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">{activity.title}</td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">{activity.category}</td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">{activity.location}</td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onEdit(activity)}
            className="text-[rgba(68,63,63)] hover:text-[#111827] transition-colors"
          >
            <FiEdit2 size={16} />
          </button>
          {onDuplicate && (
            <button 
              onClick={() => onDuplicate(activity)}
              className="text-[rgba(68,63,63)] hover:text-[#111827] transition-colors"
            >
              <FiCopy size={16} />
            </button>
          )}
          <button 
            onClick={() => onDelete(activity)}
            className="text-[rgba(68,63,63)] hover:text-[#111827] transition-colors"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};