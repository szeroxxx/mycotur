import React from 'react';
import { Activity } from '../../types/activity';
import { ActivityRow } from './ActivityRow';

interface ActivityListProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onDuplicate?: (activity: Activity) => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  return (
    <div className="overflow-hidden rounded-[16px]">
      <table className="min-w-full divide-y divide-[#F3F4F6]">
        <thead className="bg-[rgba(244,242,242)]">
          <tr>
            <th scope="col" className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Title
            </th>
            <th scope="col" className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[rgba(255,255,255)] divide-y divide-[#F3F4F6]">
          {activities.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};