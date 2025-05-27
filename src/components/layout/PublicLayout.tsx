import { FC, ReactNode } from "react";
import PublicNavbar from "./PublicNavbar";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[rgba(255,255,255)]">
      <PublicNavbar />
      <main className="px-8 pt-22 pb-2 bg-[rgba(244,242,242)]" style={{ paddingTop: '80px' }}>
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
