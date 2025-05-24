import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

const PublicNavbar = () => {
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  const navItems = [
    { path: "/home", label: "Home" },
    { path: "/activity-map", label: "Activities via map" },
    { path: "/event-calender", label: "Event via Calendar" },
    { path: "/discover-organiser", label: "Discover Organiser" },
    { path: "/about", label: "About us" },
  ];
  return (    
    <nav className="bg-[rgba(255,255,255)] shadow-md sticky top-0 z-[100]">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/home" className="flex items-center">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={156}
              height={70}
              style={{ marginLeft: 251 }}
            />
          </Link>
          {/* Navigation Links */}
          <div className="hidden md:flex items-center justify-center flex-1 ml-16">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors duration-200 px-4 ${
                  isActive(item.path)
                    ? "text-[rgba(229,114,0)] "
                    : "text-[rgba(22,21,37)] hover:text-[rgba(229,114,0)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {/* This empty div helps maintain equal spacing */}
          <div className="w-[156px]"></div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
