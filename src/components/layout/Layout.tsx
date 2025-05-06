import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoginPage = router.pathname === '/login';

  if (status === 'loading') {
    return <div className="min-h-screen bg-[rgba(255,255,255)] flex items-center justify-center">Loading...</div>;
  }

  if (!session && !isLoginPage) {
    router.push('/login');
    return null;
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[rgba(255,255,255)]">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;