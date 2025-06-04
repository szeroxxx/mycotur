import React, { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useSessionStorage } from "../../hooks/useSessionStorage";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { status } = useSession();
  const session = useSessionStorage();
  const [sidebarWidth, setSidebarWidth] = useState(256); // 64 * 4 = 256px for w-64
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSidebarWidthChange = (width: number) => {
    setSidebarWidth(width);
  };
  const publicRoutes = [
    "/login",
    "/admin/login",
    "/home",
    "/activity-map",
    "/event-calender",
    "/discover-organiser",
    "/about",
    "/activity-details",
    "/event-detail",
  ];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      router.pathname === route ||
      router.pathname.startsWith("/register/") ||
      router.pathname.startsWith("/discover-organiser/") ||
      router.pathname.startsWith("/activity-details/") ||
      router.pathname.startsWith("/event-detail/")
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[rgba(255,255,255)] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session && !isPublicRoute) {
    const isAdminRoute =
      router.pathname.startsWith("/admin") ||
      router.pathname.startsWith("/agents");
    router.push(isAdminRoute ? "/admin/login" : "/login");
    return null;
  }
  if (isPublicRoute) {
    return <>{children}</>;
  }
  return (
    <div className="min-h-screen bg-[rgba(255,255,255)]">
      <Sidebar onWidthChange={handleSidebarWidthChange} />

      <div
        className="min-h-screen transition-all duration-200 ease-in-out"
        style={{
          marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        }}
      >
        <main className="overflow-y-auto p-3 md:p-6 pt-16 md:pt-6 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
