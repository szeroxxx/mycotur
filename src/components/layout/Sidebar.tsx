import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiCalendar, FiUsers, FiLogOut, FiUser } from 'react-icons/fi';
import { RxDashboard } from "react-icons/rx";
import { BsWindowStack } from "react-icons/bs";
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
      <div className={`flex items-center px-4 py-3 my-1 rounded-lg cursor-pointer  ${
        isActive 
          ? 'bg-[rgba(255,255,255,1)] text-[rgba(123,48,12)] font-medium border border-[rgba(244,242,242,1)] shadow-sm shadow-[rgba(24,27,37,0.04)]' 
          : 'text-[rgba(100,92,90)] hover:bg-[#FFF5F1] hover:text-[#D45B20]'
      }`}>
        <div className={`transition-colors duration-200 ease-in-out ${isActive ? 'text-[rgba(123,48,12)]' : 'text-[rgba(100,92,90)]'}`}>{icon}</div>
        {isExpanded && <span className="ml-3 transition-opacity duration-200 ease-in-out">{text}</span>}
      </div>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const path = router.pathname;
  const [isExpanded, setIsExpanded] = useState(true);
  const isAdmin = session?.user?.role === 'admin';

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <div className={`h-screen ${isExpanded ? 'w-64' : 'w-20'} bg-[rgba(253,250,246)] shadow-[2px_0_4px_rgba(0,0,0,0.05)] flex flex-col transition-all duration-200 ease-in-out`}>
      <div className="p-6 flex items-center justify-between border-b border-[#F3F4F6]">
        <div className="flex items-center flex-1">
          <div className={`transition-opacity duration-200 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            {isExpanded && <h1 className="text-xl font-bold themeTextColor">Mycotur</h1>}
          </div>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FFF5F1] transition-all duration-200 ease-in-out"
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <TbLayoutSidebarRightExpand 
            className={`text-[rgba(127,118,115)] transform transition-transform duration-200 ease-in-out ${isExpanded ? '' : 'rotate-180'}`}
            size={20}
          />
        </button>
      </div>
      
      <div className="flex-1 px-4">
        <SidebarItem 
          href="/dashboard" 
          icon={<RxDashboard size={20} />} 
          text="Dashboard" 
          isActive={path === '/dashboard'}
          isExpanded={isExpanded}
        />
        <SidebarItem 
          href="/activities" 
          icon={<BsWindowStack size={20} />} 
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
        {isAdmin && (
          <SidebarItem 
            href="/agents" 
            icon={<FiUsers size={20} />} 
            text="Agents" 
            isActive={path.includes('/agents')}
            isExpanded={isExpanded}
          />
        )}
        {!isAdmin && (
          <SidebarItem 
            href="/profile" 
            icon={<FiUser size={20} />} 
            text="My Profile" 
            isActive={path.includes('/profile')}
            isExpanded={isExpanded}
          />
        )}
      </div>
      
      <div className="p-4 rounded-[15px] m-2 mt-auto border-t border-[#F3F4F6] bg-[rgba(255,255,255)]">
        <div className="flex items-center justify-between">
          {isExpanded ? (
            <>
              <div>
                <p className="text-[12px] font-medium themeTextColor">{session?.user?.name || 'User'}</p>
                <p className="text-[14px] text-[rgba(100,92,90)]">{session?.user?.email || 'user@example.com'}</p>
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