import { FC, ReactNode } from "react";
import PublicNavbar from "./PublicNavbar";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[rgba(255,255,255)] overflow-hidden ">
      <PublicNavbar />
      <main className="container mx-auto px-4 overflow-x-hidden overflow-y-auto scrollbar-hide pt-2 pb-2">
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
