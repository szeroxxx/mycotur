import React from 'react';
import { Search } from 'lucide-react';

const FilterBar: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      <div className="flex-1"></div>
      <div className="flex gap-2">
        <div className="relative">
          <select 
            className="w-full md:w-40 pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-orange-500"
            defaultValue=""
          >
            <option value="" disabled>Location</option>
            <option value="new-york">New York</option>
            <option value="london">London</option>
            <option value="tokyo">Tokyo</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        
        <div className="relative flex items-center">
          <select 
            className="w-full md:w-40 pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-orange-500"
            defaultValue=""
          >
            <option value="" disabled>Event Category</option>
            <option value="sports">Sports</option>
            <option value="music">Music</option>
            <option value="arts">Arts</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        
        <button className="bg-orange-500 p-2 rounded-md">
          <Search className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default FilterBar;