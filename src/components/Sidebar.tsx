"use client";
import React, { useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { PageIcon, TableIcon, FileIcon, HorizontaLDots, ChevronDownIcon } from "../icons/index";

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
  const [open, setOpen] = useState(false);

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-1 ml-9">
      {items.map((item) => (
        <li key={item.name}>
          <Link
            to={item.path}
            className={`menu-dropdown-item ${
              isActive(item.path)
                ? "menu-dropdown-item-active"
                : "menu-dropdown-item-inactive"
            }`}
          >
            {item.name}
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
            !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
        >
          {isExpanded || isHovered || isMobileOpen ? (
            "Menu"
          ) : (
            <img src={HorizontaLDots} alt="menu" className="h-4 w-4" />
          )}
        </h2>

        {/* Dropdown group */}
        <DropdownGroup
          label="Examples"
          icon={PageIcon}
          isExpanded={isExpanded || isHovered || isMobileOpen}
        >
          {renderMenuItems(navItems)}
        </DropdownGroup>
      </nav>
    </aside>
  );
};

export default Sidebar;

type DropdownGroupProps = {
  label: string;
  icon: string;
  isExpanded: boolean;
  children: React.ReactNode;
};

function DropdownGroup({ label, icon, isExpanded, children }: DropdownGroupProps) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`menu-item group ${open ? "menu-item-active" : "menu-item-inactive"} ${
          !isExpanded ? "lg:justify-center" : "lg:justify-start"
        }`}
      >
        <span className={`${open ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
          <img src={icon} alt="" className="h-5 w-5" />
        </span>
        {isExpanded && <span className={`menu-item-text`}>{label}</span>}
        {isExpanded && (
          <img
            src={ChevronDownIcon}
            alt=""
            className={`ml-auto w-5 h-5 transition-transform duration-200 ${
              open ? "rotate-180 text-brand-500" : ""
            }`}
          />
        )}
      </button>
      {isExpanded && open && <div className="mt-2">{children}</div>}
    </div>
  );
}
