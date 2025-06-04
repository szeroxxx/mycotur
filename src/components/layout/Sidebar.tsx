import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiCalendar,
  FiUsers,
  FiLogOut,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";
import { BsWindowStack } from "react-icons/bs";
import { TbLayoutSidebarRightExpand } from "react-icons/tb";
import { signOut, useSession } from "next-auth/react";

interface SidebarProps {
  onWidthChange?: (width: number) => void;
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  href,
  icon,
  text,
  isActive,
  isExpanded,
  onClick,
}) => {
  return (
    <Link href={href}>
      <div
        className={`flex items-center px-4 py-3 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
          isActive
            ? "bg-[rgba(255,255,255,1)] text-[rgba(123,48,12)] font-medium border border-[rgba(244,242,242,1)] shadow-sm shadow-[rgba(24,27,37,0.04)]"
            : "text-[rgba(100,92,90)] hover:bg-[#FFF5F1] hover:text-[#D45B20]"
        }`}
        onClick={onClick}
      >
        <div
          className={`transition-colors duration-200 ease-in-out ${
            isActive ? "text-[rgba(123,48,12)]" : "text-[rgba(100,92,90)]"
          }`}
        >
          {icon}
        </div>
        {isExpanded && (
          <span className="ml-3 transition-opacity duration-200 ease-in-out">
            {text}
          </span>
        )}
      </div>
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onWidthChange }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const path = router.pathname;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isAdmin = session?.user?.role === "admin";
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsExpanded(true);
        onWidthChange?.(0);
      } else {
        onWidthChange?.(isExpanded ? 256 : 80);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onWidthChange, isExpanded]);

  useEffect(() => {
    if (!isMobile) {
      onWidthChange?.(isExpanded ? 256 : 80);
    }
  }, [isExpanded, isMobile, onWidthChange]);

  const handleSignOut = async () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.clear();
    await signOut({ redirect: false });
    const loginPath = isAdmin ? "/admin/login" : "/login";
    router.push(loginPath);
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  if (isMobile) {
    return (
      <>
        {!isMobileMenuOpen && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="fixed top-4 left-4 md:hidden bg-[rgba(253,250,246)] p-2 rounded-lg shadow-lg border border-[#F3F4F6]"
          >
            <FiMenu size={24} />
          </button>
        )}

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div
          className={`fixed left-0 top-0 h-full w-64 bg-[rgba(253,250,246)] shadow-[2px_0_4px_rgba(0,0,0,0.05)] flex flex-col transition-transform duration-300 ease-in-out z-50 md:hidden ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6 flex items-center justify-between border-b border-[#F3F4F6]">
            <h1 className="text-xl font-bold themeTextColor">Mycotur</h1>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FFF5F1] transition-all duration-200 ease-in-out"
            >
              <FiX className="text-[rgba(127,118,115)]" size={20} />
            </button>
          </div>
          <div className="flex-1 px-4">
            <SidebarItem
              href="/dashboard"
              icon={<RxDashboard size={20} />}
              text="Dashboard"
              isActive={path === "/dashboard"}
              isExpanded={true}
              onClick={closeMobileMenu}
            />
            <SidebarItem
              href="/activities"
              icon={<BsWindowStack size={20} />}
              text="Activities"
              isActive={path.includes("/activities")}
              isExpanded={true}
              onClick={closeMobileMenu}
            />
            <SidebarItem
              href="/events"
              icon={<FiCalendar size={20} />}
              text="Events"
              isActive={path.includes("/events")}
              isExpanded={true}
              onClick={closeMobileMenu}
            />
            {isAdmin && (
              <SidebarItem
                href="/agents"
                icon={<FiUsers size={20} />}
                text="Agents"
                isActive={path.includes("/agents")}
                isExpanded={true}
                onClick={closeMobileMenu}
              />
            )}
            {!isAdmin && (
              <SidebarItem
                href="/profile"
                icon={<FiUser size={20} />}
                text="My Profile"
                isActive={path.includes("/profile")}
                isExpanded={true}
                onClick={closeMobileMenu}
              />
            )}
          </div>{" "}
          <div className="p-4 rounded-[15px] m-2 mt-auto border-t border-[#F3F4F6] bg-[rgba(255,255,255)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium themeTextColor truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-[14px] text-[rgba(100,92,90)] truncate">
                  {session?.user?.email || "user@example.com"}
                </p>
              </div>
              <button
                className="text-[#6B7280] hover:text-[#D45B20] transition-colors flex-shrink-0"
                onClick={handleSignOut}
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <div
      className={`hidden md:flex h-screen fixed top-0 left-0 z-30 ${
        isExpanded ? "w-64" : "w-20"
      } bg-[rgba(253,250,246)] shadow-[2px_0_4px_rgba(0,0,0,0.05)] flex-col transition-all duration-200 ease-in-out`}
    >
      <div className="p-6 flex items-center justify-between border-b border-[#F3F4F6]">
        <div className="flex items-center flex-1">
          <div
            className={`transition-opacity duration-200 ease-in-out ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            {isExpanded && (
              <h1 className="text-xl font-bold themeTextColor">Mycotur</h1>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FFF5F1] transition-all duration-200 ease-in-out"
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <TbLayoutSidebarRightExpand
            className={`text-[rgba(127,118,115)] transform transition-transform duration-200 ease-in-out ${
              isExpanded ? "" : "rotate-180"
            }`}
            size={20}
          />
        </button>
      </div>
      <div className="flex-1 px-4">
        <SidebarItem
          href="/dashboard"
          icon={<RxDashboard size={20} />}
          text="Dashboard"
          isActive={path === "/dashboard"}
          isExpanded={isExpanded}
        />
        <SidebarItem
          href="/activities"
          icon={<BsWindowStack size={20} />}
          text="Activities"
          isActive={path.includes("/activities")}
          isExpanded={isExpanded}
        />
        <SidebarItem
          href="/events"
          icon={<FiCalendar size={20} />}
          text="Events"
          isActive={path.includes("/events")}
          isExpanded={isExpanded}
        />
        {isAdmin && (
          <SidebarItem
            href="/agents"
            icon={<FiUsers size={20} />}
            text="Agents"
            isActive={path.includes("/agents")}
            isExpanded={isExpanded}
          />
        )}
        {!isAdmin && (
          <SidebarItem
            href="/profile"
            icon={<FiUser size={20} />}
            text="My Profile"
            isActive={path.includes("/profile")}
            isExpanded={isExpanded}
          />
        )}
      </div>{" "}
      <div className="p-4 rounded-[15px] m-2 mt-auto border-t border-[#F3F4F6] bg-[rgba(255,255,255)]">
        <div className="flex items-center justify-between gap-3">
          {isExpanded ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium themeTextColor truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-[14px] text-[rgba(100,92,90)] truncate">
                  {session?.user?.email || "user@example.com"}
                </p>
              </div>
              <button
                className="text-[#6B7280] hover:text-[#D45B20] transition-colors flex-shrink-0"
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
