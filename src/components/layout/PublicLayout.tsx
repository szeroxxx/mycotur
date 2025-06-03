import { FC, ReactNode } from "react";
import PublicNavbar from "./PublicNavbar";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgba(255,255,255)] to-[rgba(248,250,252)]">
      <PublicNavbar />
      <main 
        className="px-2 sm:px-4 md:px-8 pt-20 pb-2 bg-gradient-to-br from-[rgba(244,242,242)] to-[rgba(248,250,252)]" 
        style={{ paddingTop: '80px' }}
      >
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;