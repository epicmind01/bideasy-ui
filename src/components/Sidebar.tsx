"use client";
import React, { useEffect, useRef, useState,useCallback } from "react";
import {Link,useLocation} from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  UserIcon,
  GroupIcon,
  FileIcon,
  PieChartIcon,
  ListIcon
} from "../icons/index";

type NavItem = {
  name: string;
  icon: string; // svg imported as URL string in Vite
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: GroupIcon,
    name: "Supplier Lifecycle",
    subItems: [
               { name: "Supplier Approvals", path: "/supplierApprovals", pro: false }, 
               { name: "Supplier Management", path: "/inventoryValuation", pro: false }
              ],
  },
  {
    icon: BoxCubeIcon,
    name: "PROCUREMENT",
    subItems: [
               { name: "RFQ", path: "/salesQuantityForecast", pro: false }, 
               { name: "AUCTION", path: "/auction", pro: false },
               { name: "RA Bills", path: "/stockReplenishmentForecast", pro: false },
              ],
  },
  {
    icon: FileIcon,
    name: "ORDER MANAGE",
    subItems: [
               { name: "PR", path: "/salesQuantityForecast", pro: false }, 
               { name: "PO", path: "/cashFlowForecast", pro: false },
               { name: "GRN", path: "/stockReplenishmentForecast", pro: false },
               { name: "ASN", path: "/stockReplenishmentForecast", pro: false },
               { name: "INVOICE Management", path: "/stockReplenishmentForecast", pro: false },
              ],
  },
  {
    icon: FileIcon,
    name: "CONTRACT MANAGE",
    subItems: [
               { name: "ARC", path: "/stockReplenishmentForecast", pro: false },
               { name: "CONTRACTS", path: "/stockReplenishmentForecast", pro: false },
              ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: PieChartIcon,
    name: "Reports",
    path: "/reports",
  },
  {
    icon: ListIcon,
    name: "Master",
    path: "/master",
  },
  
];

const Sidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = useLocation().pathname;

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                <img src={nav.icon} alt="" className="h-5 w-5" />
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <img
                  src={ChevronDownIcon}
                  alt=""
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  <img src={nav.icon as string} alt="" className="h-5 w-5" />
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
   const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname,isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-4.5  flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden ml-1 "
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
<button
  className="relative z-50 flex h-11 mb-0 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-blue-100 p-2.5 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none border border-violet-200/50 backdrop-blur-sm group"
  aria-label="Toggle Menu"
>
  <svg
    viewBox="0 0 100 100"
    className="h-7 w-7 text-blue-600 transition-all duration-500 ease-out"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Liquid morphing lines */}
    <rect
      className="origin-center transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] rotate-45 translate-y-[22px] scale-110"
      y="20"
      width="100"
      height="6"
      rx="8"
      fill="url(#gradient1)"
    />
    <rect
      className="origin-center transition-all duration-500 ease-out opacity-0 scale-0 rotate-180"
      y="47"
      width="100"
      height="6"
      rx="8"
      fill="url(#gradient2)"
    />
    <rect
      className="origin-center transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] -rotate-45 -translate-y-[22px] scale-110"
      y="74"
      width="100"
      height="6"
      rx="8"
      fill="url(#gradient3)"
    />
    
    {/* Beautiful gradients */}
    <defs>
      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
  </svg>
  
  {/* Floating orbs for magical effect */}
  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
    <div className="absolute top-2 right-2 h-1 w-1 bg-pink-400 rounded-full opacity-0 transition-all duration-1000 group-hover:opacity-100 group-hover:animate-bounce" />
    <div className="absolute bottom-1 left-2 h-0.5 w-0.5 bg-violet-400 rounded-full opacity-0 transition-all duration-1200 delay-200 group-hover:opacity-100 group-hover:animate-ping" />
  </div>
</button>


          )}
        </Link>
      </div>
      <div className="flex mt-15 flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Dashboard"
                ) : (
                  <img src={HorizontaLDots} alt="menu" className="h-4 w-4" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <img src={HorizontaLDots} alt="menu" className="h-4 w-4" />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
         {/* #TODO {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */} 
         
      </div>
    </aside>
  );
};

export default Sidebar;