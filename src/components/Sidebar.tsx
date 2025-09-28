"use client";
import React, { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { PageIcon, TableIcon, FileIcon, HorizontaLDots } from "../icons/index";

type NavItem = {
  name: string;
  icon: string; // svg imported as URL string in Vite
  path: string;
};

const navItems: NavItem[] = [
  { icon: PageIcon, name: "Form", path: "/form" },
  { icon: TableIcon, name: "Table", path: "/table" },
  { icon: FileIcon, name: "Detail", path: "/detail" },
];

const Sidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = useLocation().pathname;

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.name}>
          <Link
            to={item.path}
            className={`menu-item group ${
              isActive(item.path) ? "menu-item-active" : "menu-item-inactive"
            }`}
          >
            <span
              className={`${
                isActive(item.path)
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              }`}
            >
              <img src={item.icon} alt="" className="h-5 w-5" />
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className={`menu-item-text`}>{item.name}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

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
      <nav className="flex flex-col">
        <h2
          className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
            !isExpanded && !isHovered
              ? "lg:justify-center"
              : "justify-start"
          }`}
        >
          {isExpanded || isHovered || isMobileOpen ? (
            "Menu"
          ) : (
            <img src={HorizontaLDots} alt="menu" className="h-4 w-4" />
          )}
        </h2>
        {renderMenuItems(navItems)}
      </nav>
    </aside>
  );
};

export default Sidebar;
