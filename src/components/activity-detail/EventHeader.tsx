import React from 'react';

interface EventHeaderProps {
  title: string;
}

const EventHeader: React.FC<EventHeaderProps> = ({ title }) => {
  return (
    <div>
      <div className=" mx-auto px-4 py-4">
        <h1 className="text-2xl font-semibold text-[rgba(68,63,63)]">{title}</h1>
      </div>
    </div>
  );
};

export default EventHeader;
