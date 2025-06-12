import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

const PublicNavbar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => router.pathname === path;
  
  const navItems = [
    { path: "/home", label: "Inicio", external: true, url: "https://avilamycotour.es/" },
    { path: "/mapa", label: "Catálogo de Actividades", external: false, url: "" },
    { path: "/calendario-eventos", label: "Eventos programados", external: false, url: "" },
    { path: "/organizadores", label: "Descubre a los organizadores", external: false, url: "" },
    { path: "/about", label: "Sobre nosotros", external: true, url: "https://avilamycotour.es/about-us" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  const handleExternalLink = (url: string) => {
    window.location.href = url;
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 bg-white shadow-md border-b border-gray-100"
        style={{
          zIndex: 9000,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
        }}
      >
        <nav className="w-full">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <div className="flex-shrink-0">
                <button 
                  onClick={() => handleExternalLink("https://mycotour.webflow.io/")}
                  className="flex items-center cursor-pointer"
                >
                  <Image
                    src="/logo.jpg"
                    alt="Logo"
                    width={156}
                    height={70}
                    className="w-auto h-12 lg:h-16"
                  />
                </button>
              </div>

              <div className="hidden xl:flex items-center justify-center flex-1 mx-8">
                <div className="flex items-center space-x-2 2xl:space-x-6">
                  {navItems.map((item) => {
                    if (item.external) {
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleExternalLink(item.url)}
                          className={`text-xs 2xl:text-sm font-medium transition-colors duration-200 px-2 2xl:px-4 cursor-pointer whitespace-nowrap ${
                            isActive(item.path)
                              ? "text-[rgba(229,114,0)]"
                              : "text-[rgba(22,21,37)] hover:text-[rgba(229,114,0)]"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    } else {
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={`text-xs 2xl:text-sm font-medium transition-colors duration-200 px-2 2xl:px-4 whitespace-nowrap ${
                            isActive(item.path)
                              ? "text-[rgba(229,114,0)]"
                              : "text-[rgba(22,21,37)] hover:text-[rgba(229,114,0)]"
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    }
                  })}
                </div>
              </div>

              <div className="hidden xl:block flex-shrink-0 w-[156px]"></div>
              <button
                onClick={toggleMobileMenu}
                className="xl:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
                aria-label="Toggle mobile menu"
              >
                <span
                  className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${
                    isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                ></span>
                <span
                  className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-white z-[10000] xl:hidden"
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="flex items-center justify-between px-4 h-20 border-b border-gray-100">
            <button 
              onClick={() => {
                handleExternalLink("https://mycotour.webflow.io/");
                closeMobileMenu();
              }}
              className="flex items-center cursor-pointer"
            >
              <Image
                src="/logo.jpg"
                alt="Logo"
                width={120}
                height={54}
              />
            </button>
            <button
              onClick={closeMobileMenu}
              className="w-8 h-8 flex items-center justify-center"
              aria-label="Close mobile menu"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="px-4 py-8">
            {navItems.map((item) => {
              if (item.external) {
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      handleExternalLink(item.url);
                      closeMobileMenu();
                    }}
                    className={`block py-4 text-lg font-medium transition-colors duration-200 w-full text-left cursor-pointer ${
                      isActive(item.path)
                        ? "text-[rgba(229,114,0)]"
                        : "text-[rgba(22,21,37)] hover:text-[rgba(229,114,0)]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              } else {
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={closeMobileMenu}
                    className={`block py-4 text-lg font-medium transition-colors duration-200 ${
                      isActive(item.path)
                        ? "text-[rgba(229,114,0)]"
                        : "text-[rgba(22,21,37)] hover:text-[rgba(229,114,0)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default PublicNavbar;