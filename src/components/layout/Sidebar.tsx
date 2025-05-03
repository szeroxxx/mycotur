import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHome, FiActivity, FiCalendar, FiUsers, FiLogOut, FiChevronLeft } from 'react-icons/fi';
import { TbLayoutSidebarRightExpand } from "react-icons/tb";

import { signOut, useSession } from 'next-auth/react';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  isExpanded: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon, text, isActive, isExpanded }) => {
  return (
    <Link href={href}>
      <div className={`flex items-center px-4 py-3 my-1 rounded-lg cursor-pointer transition-colors ${
        isActive 
          ? 'bg-[rgba(255,255,255,1)]  text-[#D45B20] font-medium' 
          : 'text-[#6B7280] hover:bg-[#FFF5F1] hover:text-[#D45B20]'
      }`}>
        <div className={`${isActive ? 'text-[#D45B20]' : 'text-[#6B7280]'}`}>{icon}</div>
        {isExpanded && <span className="ml-3">{text}</span>}
      </div>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const path = router.pathname;
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <div className={`h-screen ${isExpanded ? 'w-64' : 'w-20'} bg-[#fdfaf6] shadow-[2px_0_4px_rgba(0,0,0,0.05)] flex flex-col transition-all duration-300`}>
      <div className="p-6 flex items-center justify-between border-b border-[#F3F4F6]">
        <div className="flex items-center flex-1">
          {isExpanded && <h1 className="text-xl font-bold text-[#111827]">Mycotur</h1>}
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FFF5F1] transition-all"
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <TbLayoutSidebarRightExpand 
            className={`text-black transform transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'} `}
            size={20}
          />
        </button>
      </div>
      
      <div className="flex-1 px-4">
        <SidebarItem 
          href="/dashboard" 
          icon={<FiHome size={20} />} 
          text="Dashboard" 
          isActive={path === '/dashboard'}
          isExpanded={isExpanded}
        />
        <SidebarItem 
          href="/activities" 
          icon={<FiActivity size={20} />} 
          text="Activities" 
          isActive={path.includes('/activities')}
          isExpanded={isExpanded}
        />
        <SidebarItem 
          href="/events" 
          icon={<FiCalendar size={20} />} 
          text="Events" 
          isActive={path.includes('/events')}
          isExpanded={isExpanded}
        />
        <SidebarItem 
          href="/agents" 
          icon={<FiUsers size={20} />} 
          text="Agents" 
          isActive={path.includes('/agents')}
          isExpanded={isExpanded}
        />
      </div>
      
      <div className="p-4 mb-2 mt-auto border-t border-[#F3F4F6] bg-[rgba(255,255,255,1)]">
        <div className="flex items-center justify-between">
          {isExpanded ? (
            <>
              <div>
                <p className="text-sm font-medium text-[#111827]">{session?.user?.name || 'Matt Henry'}</p>
                <p className="text-xs text-[#6B7280]">{session?.user?.email || 'matt@example.com'}</p>
              </div>
              <button 
                className="text-[#6B7280] hover:text-[#D45B20] transition-colors"
                onClick={handleSignOut}
              >
                <FiLogOut size={20} />
              </button>
            </>
          ) : (
            <button 
              className="text-[#6B7280] hover:text-[#D45B20] transition-colors mx-auto"
              onClick={handleSignOut}
            >
              <FiLogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;