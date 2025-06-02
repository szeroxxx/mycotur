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
    <tr className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] scrollbar-hide">
      <td className="py-4 px-6 text-sm text-[rgba(68,63,63)] max-w-xs">{activity.title}</td>
      <td className="py-4 px-6 text-sm text-[rgba(68,63,63)] max-w-xs">{activity.category}</td>
      <td className="py-4 px-6 text-sm text-[rgba(68,63,63)] max-w-md">
        <div className="truncate" title={activity.location}>
          {activity.location}
        </div>
      </td>
      <td className="py-4 px-6 text-sm text-[rgba(68,63,63)] whitespace-nowrap w-24">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onEdit(activity)}
            className="cursor-pointer text-[rgba(68,63,63)] hover:text-[#111827] transition-colors"
            title="Edit"
          >
            <FiEdit2 size={16} />
          </button>
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(activity)}
              className="cursor-pointer text-[rgba(68,63,63)] hover:text-[#111827] transition-colors"
              title="Duplicate"
            >
              <FiCopy size={16} />
            </button>
          )}
          <button
            onClick={() => onDelete(activity)}
            className="cursor-pointer text-[rgba(68,63,63)] hover:text-[#111827] transition-colors"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};