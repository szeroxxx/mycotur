import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useSessionStorage } from '../../hooks/useSessionStorage';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { status } = useSession();
  const session = useSessionStorage();
    const publicRoutes = [
    '/login',
    '/admin/login',
    '/home',
    '/activity-map',
    '/event-calender',
    '/discover-organiser',
    '/about',
    '/activity-details',
    '/event-detail'
  ];
  const isPublicRoute = publicRoutes.some(route => 
    router.pathname === route || 
    router.pathname.startsWith('/register/') ||
    router.pathname.startsWith('/discover-organiser/') ||
    router.pathname.startsWith('/activity-details/') ||
    router.pathname.startsWith('/event-detail/')
  );

  if (status === 'loading') {
    return <div className="min-h-screen bg-[rgba(255,255,255)] flex items-center justify-center">Loading...</div>;
  }

  if (!session && !isPublicRoute) {
    const isAdminRoute = router.pathname.startsWith('/admin') || router.pathname.startsWith('/agents');
    router.push(isAdminRoute ? '/admin/login' : '/login');
    return null;
  }
  if (isPublicRoute) {
    return <>{children}</>;
  }  
  return (
    <div className="fixed inset-0 flex bg-[rgba(255,255,255)] isolate">
      <div className="h-full z-50 relative">
        <Sidebar />
      </div>
      <div className="flex-1 h-full relative">
        <main className="h-full overflow-y-auto p-6 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;